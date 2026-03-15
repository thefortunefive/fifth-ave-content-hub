import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Cloudflare Worker environment bindings
export interface Env {
  NOCODB_TOKEN: string
  PERPLEXITY_API_KEY?: string
  OPENAI_API_KEY?: string
  FAL_API_KEY?: string
  NOCODB_BASE_URL?: string
}

const app = new Hono<{ Bindings: Env }>()

// Bridge process.env → c.env for Node.js standalone mode.
// On Cloudflare Workers, c.env is populated automatically; on Node.js it is not.
// This must be the FIRST middleware so every route handler sees the env vars.
if (typeof process !== 'undefined' && process.env) {
  app.use('*', async (c, next) => {
    const envKeys = ['NOCODB_TOKEN', 'NOCODB_BASE_URL', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'FAL_API_KEY'] as const
    for (const key of envKeys) {
      if (process.env[key] && !(c.env as any)[key]) {
        ;(c.env as any)[key] = process.env[key]
      }
    }
    await next()
  })
}

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any
  timestamp: number
  etag?: string
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
const cache = new Map<string, CacheEntry>()

function getCached(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  
  // Return data even if expired - we'll refresh in background
  return entry.data
}

function setCached(key: string, data: any, etag?: string): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    etag
  })
}

function isCacheValid(key: string): boolean {
  const entry = cache.get(key)
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

// Retry configuration for rate limiting
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const res = await fetch(url, options)
    
    // If rate limited, retry with exponential backoff
    if (res.status === 429 && retries > 0) {
      const delay = INITIAL_RETRY_DELAY * (MAX_RETRIES - retries + 1)
      console.log(`Rate limited (429). Retrying in ${delay}ms... (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(url, options, retries - 1)
    }
    
    return res
  } catch (err) {
    if (retries > 0) {
      const delay = INITIAL_RETRY_DELAY * (MAX_RETRIES - retries + 1)
      console.log(`Fetch failed. Retrying in ${delay}ms... (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw err
  }
}

app.use('/api/*', cors())

// Environment configuration - use env vars with fallbacks for local dev
const DEFAULT_NOCODB_BASE_URL = 'http://31.220.49.162:8080'
const KIEAI_API_KEY = (typeof process !== 'undefined' && process.env && process.env.KIEAI_API_KEY) ||
                      'cf2a50987a92a698e89d5efeb80cde82'

// Reference images for 5th Ave Angel
const REFERENCE_IMAGES = {
  face: 'https://iili.io/fM9hV6B.png',
  outfit: 'https://iili.io/fM99P3l.png',
  logo: 'https://iili.io/fEiEfUB.png'
}

// API: Get all bases (with pagination support and caching)
app.get('/api/bases', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!token) return c.json({ error: 'Missing NocoDB token' }, 401)
  
  // Check cache first
  const cacheKey = `bases:${token.substring(0, 10)}`
  const cachedData = getCached(cacheKey)
  const cacheValid = isCacheValid(cacheKey)
  
  // If we have valid cached data, return it immediately
  if (cachedData && cacheValid) {
    console.log('Returning cached bases data')
    return c.json(cachedData)
  }
  
  // If we have stale cached data and request fails, we'll return the stale data
  try {
    // NocoDB API for listing bases
    // VPS NocoDB - FifthAveAI Mode
    const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
    const url = nocodbBaseUrl + '/api/v2/meta/bases'
    
    const res = await fetchWithRetry(url, {
      headers: { 'xc-token': token }
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('NocoDB API error:', res.status, errorText)
      
      // If we have cached data, return it as fallback (even if stale)
      if (cachedData) {
        console.log('Returning stale cached data due to API error')
        return c.json({ 
          ...cachedData, 
          _cached: true, 
          _cacheStale: true,
          _error: `NocoDB API error: ${res.status}. Showing cached data.`
        })
      }
      
      // Return user-friendly error message
      let userMessage = `NocoDB API error: ${res.status}`
      if (res.status === 429) {
        userMessage = 'NocoDB rate limit exceeded. Please wait a moment and try again.'
      } else if (res.status === 401 || res.status === 403) {
        userMessage = 'Invalid or expired NocoDB token. Please check your token and try again.'
      }
      
      return c.json({ error: userMessage, details: errorText }, res.status)
    }
    
    const data = await res.json()

    // Transform NocoDB response to match expected format
    // NocoDB VPS returns { list: [...], pageInfo: {...} } with fields: id, title
    let bases = data.list || data.bases || []
    if (!Array.isArray(bases)) {
      bases = []
    }
    
    // Map NocoDB format to frontend expected format (id, name)
    const mappedBases = bases.map((b: any) => ({
      id: b.id,
      name: b.title || b.name || 'Unnamed Base'
    }))
    
    const result = { bases: mappedBases }
    
    // Cache the result
    setCached(cacheKey, result)
    console.log(`Total bases fetched and cached: ${bases.length}`)
    
    return c.json(result)
  } catch (err: any) {
    console.error('Error fetching bases:', err)
    
    // Return cached data as fallback if available
    if (cachedData) {
      console.log('Returning stale cached data due to error')
      return c.json({ 
        ...cachedData, 
        _cached: true, 
        _cacheStale: true,
        _error: `Network error: ${err.message}. Showing cached data.`
      })
    }
    
    return c.json({ error: err.message || 'Failed to fetch bases' }, 500)
  }
})

// API: Get tables for a base (with caching)
app.get('/api/bases/:baseId/tables', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!token) return c.json({ error: 'Missing NocoDB token' }, 401)

  const baseId = c.req.param('baseId')
  
  // Check cache first
  const cacheKey = `tables:${baseId}:${token.substring(0, 10)}`
  const cachedData = getCached(cacheKey)
  const cacheValid = isCacheValid(cacheKey)
  
  // If we have valid cached data, return it immediately
  if (cachedData && cacheValid) {
    console.log(`Returning cached tables for base ${baseId}`)
    return c.json(cachedData)
  }
  
  console.log(`Fetching tables for base: ${baseId}, token present: ${token ? 'yes' : 'no'}, token prefix: ${token.substring(0, 10)}...`)

  try {
    const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
    const res = await fetchWithRetry(nocodbBaseUrl + `/api/v2/meta/bases/${baseId}/tables`, {
      headers: { 'xc-token': token }
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('NocoDB tables API error:', res.status, errorText)

      // If we have cached data, return it as fallback (even if stale)
      if (cachedData) {
        console.log('Returning stale cached tables due to API error')
        return c.json({
          ...cachedData,
          _cached: true,
          _cacheStale: true,
          _error: `NocoDB API error: ${res.status}. Showing cached data.`
        })
      }
      
      // Return user-friendly error message
      let userMessage = `NocoDB API error: ${res.status}`
      if (res.status === 429) {
        userMessage = 'NocoDB rate limit exceeded. Please wait a moment and try again.'
      } else if (res.status === 401 || res.status === 403) {
        userMessage = 'Invalid or expired NocoDB token. Please check your token and try again.'
      } else if (res.status === 404) {
        userMessage = 'Base not found. Please check if you have access to this base.'
      }
      
      return c.json({ error: userMessage, details: errorText }, res.status)
    }
    
    const data = await res.json()
    
    // NocoDB VPS returns { list: [...] } with fields: id, title, columns
    // Map to frontend expected format: id, name, fields
    const tables = (data.list || []).map((t: any) => ({
      id: t.id,
      name: t.title || t.table_name || t.name || 'Unnamed Table',
      fields: t.columns || t.fields || []
    }))
    const result = { tables }
    
    // Cache the result
    setCached(cacheKey, result)
    console.log(`Fetched and cached ${result.tables.length} tables for base ${baseId}`)
    
    return c.json(result)
  } catch (err: any) {
    console.error('Error fetching tables:', err)
    
    // Return cached data as fallback if available
    if (cachedData) {
      console.log('Returning stale cached tables due to error')
      return c.json({ 
        ...cachedData, 
        _cached: true, 
        _cacheStale: true,
        _error: `Network error: ${err.message}. Showing cached data.`
      })
    }
    
    return c.json({ error: err.message || 'Failed to fetch tables' }, 500)
  }
})

// API: Get records from NocoDB (with dynamic table)
app.get('/api/records', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!token) return c.json({ error: 'Missing NocoDB token' }, 401)

  const tableId = c.req.query('tableId')
  const filter = c.req.query('filter') || ''

  if (!tableId) return c.json({ error: 'Missing tableId' }, 400)

  // NocoDB API for listing records
  const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
  let url = nocodbBaseUrl + `/api/v2/tables/${tableId}/records`
  if (filter && filter !== 'all') {
    // NocoDB uses different filter syntax - for now, fetch all and filter client-side
    // or use NocoDB's where parameter: url += `?where=(Status,eq,${filter})`
  }

  const res = await fetch(url, {
    headers: { 'xc-token': token }
  })

  const data = await res.json()

  // Transform NocoDB response to match Airtable-style format for frontend compatibility
  // NocoDB returns { list: [...], pageInfo: {...} }
  if (data.list && Array.isArray(data.list)) {
    return c.json({
      records: data.list.map((record: any) => ({
        id: record.Id || record.id,
        fields: record
      })),
      offset: data.pageInfo?.isLastPage ? null : (data.pageInfo?.page + 1)
    })
  }

  return c.json(data)
})

// API: Get single record (with dynamic table)
app.get('/api/records/:id', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!token) return c.json({ error: 'Missing NocoDB token' }, 401)

  const tableId = c.req.query('tableId')
  const id = c.req.param('id')

  if (!tableId) return c.json({ error: 'Missing tableId' }, 400)

  // NocoDB API for single record
  const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
  const res = await fetch(nocodbBaseUrl + `/api/v2/tables/${tableId}/records/${id}`, {
    headers: { 'xc-token': token }
  })

  const data = await res.json()

  // Transform to Airtable-style format
  if (data && !data.error) {
    return c.json({
      id: data.Id || data.id,
      fields: data
    })
  }

  return c.json(data)
})

// API: Update record (with dynamic table)
app.patch('/api/records/:id', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!token) return c.json({ error: 'Missing NocoDB token' }, 401)

  const tableId = c.req.query('tableId')
  const id = c.req.param('id')
  const body = await c.req.json()

  if (!tableId) return c.json({ error: 'Missing tableId' }, 400)

  // NocoDB expects the Id field in the body
  const nocoBody = {
    Id: id,
    ...body
  }

  const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
  const res = await fetch(nocodbBaseUrl + `/api/v2/tables/${tableId}/records`, {
    method: 'PATCH',
    headers: {
      'xc-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nocoBody)
  })

  const data = await res.json()

  // Transform to Airtable-style response
  if (data && !data.error) {
    return c.json({
      id: data.Id || id,
      fields: data
    })
  }

  return c.json(data)
})

// API: Generate image prompt with GPT-4o
app.post('/api/generate-prompt', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    return c.json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .dev.vars' }, 500)
  }

  const { headline, category, aspectRatio } = await c.req.json()
  if (!headline) {
    return c.json({ error: 'Headline is required' }, 400)
  }

  const systemPrompt = `You create one high-quality image prompt for a Fifth Ave AI news visual. Each image must look like a frame from a different documentary or news film — never repeat the same composition, camera angle, or scene type across articles.

FOR EACH PROMPT, YOU MUST SPECIFY ALL 6 OF THESE ELEMENTS:

1. SUBJECT — What the camera sees. Pick ONE and NEVER default to office workers at desks: a single symbolic object in extreme close-up (cracked employee badge, robotic hand holding a pen, empty revolving door, server rack with one blinking light), OR an environmental wide shot with NO people (abandoned trading floor, fully automated warehouse, empty corporate campus parking lot at dawn, robot-staffed assembly line), OR one human figure in a decisive moment (security guard watching a drone replace patrol, engineer unplugging a server, worker carrying a box past a robot arm), OR a dramatic contrast scene (vintage typewriter next to holographic display, human hand reaching toward a robot hand, half-demolished office with AI screens glowing), OR aerial bird's eye perspective (drone view of an automated port, overhead shot of one occupied desk in an empty floor of cubicles).

2. CAMERA — Specify lens and angle. Rotate between: 24mm wide establishing shot, 50mm eye-level documentary, 85mm shallow depth portrait, 200mm telephoto compression, overhead drone shot, extreme macro close-up.

3. LIGHTING — Specify direction and quality. Rotate between: cold fluorescent from above, warm golden hour side light, single harsh spotlight in darkness, blue-tinted monitor glow, overcast flat documentary light, dramatic rim light with dark background.

4. COLOR PALETTE — Specify 2-3 dominant colors. Examples: steel blue and amber, clinical white and red accent, dark teal and warm orange, monochrome silver, deep purple and neon green.

5. TEXTURE DETAIL — One micro-detail that grounds the image in reality: condensation on glass, dust particles in a light beam, scratches on a metal surface, fingerprints on a screen, frayed cable.

6. COMPOSITION — Specify framing: rule of thirds with subject at left intersection, centered symmetry, diagonal leading lines, foreground blur with sharp background, frame-within-a-frame.

ABSOLUTE PROHIBITIONS: no readable text, no company names, no logos, no signage, no labels, no numbers, no watermarks, no headline text, no Fifth Ave AI text, no generic blonde-woman presenter, no default professional woman, no Angel avatar unless requested, no busy office scenes with multiple people at computers, no people packing boxes, no groups of employees at desks.

Deliver the final prompt as a single paragraph under 120 words. Cinematic, photorealistic, editorial quality. 16:9.

Return ONLY valid JSON: {"image_prompt":"<final prompt>"}`

  const userMsg = `Generate an image prompt for this news headline:\n\n"${headline}"\n\nCategory: ${category || 'general news'}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMsg }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('OpenAI API error:', res.status, errText)
      return c.json({ error: `OpenAI API error: ${res.status}` }, res.status)
    }

    const data: any = await res.json()
    const prompt = data.choices?.[0]?.message?.content?.trim() || ''
    return c.json({ prompt })
  } catch (err: any) {
    console.error('Generate prompt error:', err)
    return c.json({ error: err.message || 'Failed to generate prompt' }, 500)
  }
})

// API: Re-enrich a record from its source URL using GPT-4o
// POST /api/re-enrich  body: { sourceUrl, recordId, tableId, baseId }
app.post('/api/re-enrich', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    return c.json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .dev.vars' }, 500)
  }
  const nocoToken = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  if (!nocoToken) return c.json({ error: 'Missing NocoDB token' }, 401)

  const { sourceUrl, recordId, tableId } = await c.req.json()
  if (!sourceUrl) return c.json({ error: 'sourceUrl is required' }, 400)
  if (!recordId)  return c.json({ error: 'recordId is required' }, 400)
  if (!tableId)   return c.json({ error: 'tableId is required' }, 400)

  // ── STEP 1: fetch article HTML ──────────────────────────────────────
  console.log('[re-enrich] fetching source URL:', sourceUrl)
  let articleText = ''
  try {
    const articleRes = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FifthAveBot/1.0)' }
    })
    if (!articleRes.ok) {
      return c.json({ error: `Failed to fetch source URL: HTTP ${articleRes.status}` }, 502)
    }
    const html = await articleRes.text()

    // Extract main text — prefer <article>, fall back to <body>
    // Strip all HTML tags and collapse whitespace
    const extractText = (tag: string): string => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i')
      const m = html.match(re)
      return m ? m[1] : ''
    }
    let raw = extractText('article') || extractText('main') || extractText('body') || html
    // Remove scripts, styles, and nav noise before stripping tags
    raw = raw.replace(/<(script|style|nav|header|footer|aside)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // Strip all remaining HTML tags
    raw = raw.replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    raw = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    articleText = raw.replace(/\s+/g, ' ').trim().slice(0, 12000) // cap at 12k chars for GPT context
    console.log('[re-enrich] extracted article text length:', articleText.length)
  } catch (fetchErr: any) {
    console.error('[re-enrich] fetch error:', fetchErr)
    return c.json({ error: `Failed to fetch article: ${fetchErr.message}` }, 502)
  }

  if (articleText.length < 100) {
    return c.json({ error: 'Could not extract meaningful article text from that URL (too short or paywalled)' }, 422)
  }

  // ── STEP 2: GPT-4o enrichment ───────────────────────────────────────
  const systemPrompt = `You are a news editor for Fifth Ave AI, an AI news brand covering how AI is transforming jobs and industries. Given the full text of a news article, generate the following fields in JSON format:
{
  "sourceHeadline": "original article headline",
  "rewrittenHeadline": "a punchy rewritten headline under 10 words",
  "body": "a 150-word summary written for professionals worried about AI replacing their jobs",
  "caption": "a 2-sentence social media caption with a hook and a question",
  "whyItMatters": "a 2-sentence explanation of why this matters for the average worker",
  "category": "one of [tech, ready, shift, adapt]"
}
Be specific — mention the company name, number of jobs affected, and the AI angle. No generic fluff. Respond with raw JSON only — no markdown, no code fences, no extra text.`

  const userMsg = `Here is the article text to enrich:\n\n${articleText}`

  console.log('[re-enrich] calling GPT-4o...')
  let enriched: {
    sourceHeadline?: string
    rewrittenHeadline?: string
    body?: string
    caption?: string
    whyItMatters?: string
    category?: string
  } = {}

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMsg }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!gptRes.ok) {
      const errText = await gptRes.text()
      console.error('[re-enrich] GPT error:', gptRes.status, errText)
      return c.json({ error: `OpenAI error: ${gptRes.status}` }, 500)
    }

    const gptData: any = await gptRes.json()
    const raw = gptData.choices?.[0]?.message?.content?.trim() || '{}'
    console.log('[re-enrich] GPT raw response:', raw)
    enriched = JSON.parse(raw)
  } catch (gptErr: any) {
    console.error('[re-enrich] GPT exception:', gptErr)
    return c.json({ error: `GPT-4o failed: ${gptErr.message}` }, 500)
  }

  // ── STEP 3: PATCH NocoDB with the enriched fields ───────────────────
  // Map camelCase GPT keys → exact NocoDB column names (with spaces)
  const nocoFields: Record<string, string> = {
    sourceHeadline:    'sourceHeadline',
    rewrittenHeadline: 'Rewritten Headline',
    body:              'Body',
    caption:           'Caption',
    whyItMatters:      'Why It Matters',
    category:          'category'
  }
  const patchBody: Record<string, string> = { Id: String(recordId) }
  for (const [gptKey, nocoKey] of Object.entries(nocoFields)) {
    const val = (enriched as any)[gptKey]
    if (val) patchBody[nocoKey] = String(val)
  }

  console.log('[re-enrich] PATCHing NocoDB record', recordId, 'with fields:', Object.keys(patchBody))
  const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
  const patchRes = await fetch(`${nocodbBaseUrl}/api/v2/tables/${tableId}/records`, {
    method: 'PATCH',
    headers: { 'xc-token': nocoToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(patchBody)
  })

  const patchData: any = await patchRes.json()
  if (patchData?.error) {
    console.error('[re-enrich] NocoDB PATCH error:', patchData.error)
    return c.json({ error: `NocoDB update failed: ${patchData.error}` }, 500)
  }

  console.log('[re-enrich] success for record', recordId)
  // Return the enriched fields using the same NocoDB names the frontend already understands
  return c.json({
    ok: true,
    fields: {
      Headline:           enriched.sourceHeadline || '',
      'Rewritten Headline': enriched.rewrittenHeadline || '',
      Body:               enriched.body || '',
      Caption:            enriched.caption || '',
      'Why It Matters':   enriched.whyItMatters || '',
      category:           enriched.category || ''
    }
  })
})

// API: Generate image with KieAI
app.post('/api/generate-image', async (c) => {
  const { prompt, imageUrls, aspectRatio } = await c.req.json()
  
  // Per KieAI docs, the parameter is "image_size" not "aspect_ratio"
  // Valid values: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
  const requestBody = {
    model: 'google/nano-banana',
    input: {
      prompt,
      image_urls: imageUrls || [REFERENCE_IMAGES.face, REFERENCE_IMAGES.outfit, REFERENCE_IMAGES.logo],
      image_size: aspectRatio || '16:9',  // This is the correct parameter name
      output_format: 'png'
    }
  }
  
  console.log('KieAI Nano Banana Request:', JSON.stringify(requestBody, null, 2))
  
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIEAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  return c.json(await res.json())
})

// API: Generate image with fal.ai Flux (queue-based)
app.post('/api/generate-image-fal', async (c) => {
  const falKey = c.env.FAL_API_KEY
  if (!falKey) {
    return c.json({ error: 'FAL_API_KEY not configured. Add FAL_API_KEY to .dev.vars' }, 500)
  }

  const { prompt, aspectRatio } = await c.req.json()
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400)
  }

  // Map aspect ratio to fal.ai image_size enum
  const sizeMap: Record<string, string> = {
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_16_9',
    '1:1': 'square_hd'
  }
  const imageSize = sizeMap[aspectRatio] || 'landscape_16_9'

  try {
    // Submit to fal.ai queue
    const submitRes = await fetch('https://queue.fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'png'
      })
    })

    if (!submitRes.ok) {
      const errText = await submitRes.text()
      console.error('fal.ai submit error:', submitRes.status, errText)
      return c.json({ error: `fal.ai error: ${submitRes.status}` }, submitRes.status as any)
    }

    const submitData = await submitRes.json() as { request_id: string; status_url: string; response_url: string }
    console.log('[fal-submit] request_id:', submitData.request_id,
      'status_url:', submitData.status_url,
      'response_url:', submitData.response_url)

    return c.json({
      requestId:   submitData.request_id,
      statusUrl:   submitData.status_url,
      responseUrl: submitData.response_url
    })
  } catch (err: any) {
    console.error('fal.ai submit exception:', err)
    return c.json({ error: err.message || 'Failed to submit to fal.ai' }, 500)
  }
})

// API: Check fal.ai request status
// Expects query params: ?statusUrl=...&responseUrl=...
// (passed through from the submit response so we use the exact URLs fal.ai gave us)
app.get('/api/fal-status/:requestId', async (c) => {
  const falKey = c.env.FAL_API_KEY
  if (!falKey) {
    return c.json({ error: 'FAL_API_KEY not configured' }, 500)
  }

  const requestId = c.req.param('requestId')

  // Use the exact URLs returned by fal.ai at submit time.
  // Fall back to the canonical queue URL pattern if not supplied.
  const statusUrl = c.req.query('statusUrl') ||
    `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}/status`
  const responseUrl = c.req.query('responseUrl') ||
    `https://queue.fal.run/fal-ai/flux/dev/requests/${requestId}/response`

  const authHeader = { 'Authorization': `Key ${falKey}` }

  try {
    // ── STEP 1: poll status (must be GET) ─────────────────────────────
    console.log('[fal-status] GET', statusUrl)
    const statusRes = await fetch(statusUrl, { method: 'GET', headers: authHeader })
    const statusRaw = await statusRes.text()
    console.log('[fal-status] status HTTP', statusRes.status, '| body:', statusRaw)

    if (!statusRes.ok) {
      return c.json({ error: `fal.ai status error: ${statusRes.status}`, raw: statusRaw }, 500)
    }

    let statusData: { status?: string; state?: string } = {}
    try {
      statusData = JSON.parse(statusRaw)
    } catch (parseErr) {
      console.error('[fal-status] failed to parse status JSON:', parseErr)
      return c.json({ error: 'Invalid JSON from fal.ai status endpoint', raw: statusRaw }, 500)
    }

    // fal.ai returns status as "IN_QUEUE", "IN_PROGRESS", or "COMPLETED"
    const status = statusData.status || statusData.state || 'IN_QUEUE'
    console.log('[fal-status] normalised status:', status)

    if (status !== 'COMPLETED') {
      // Still queued or running — return clean status only
      return c.json({ status })
    }

    // ── STEP 2: fetch result from response_url (GET, /response suffix) ─
    console.log('[fal-status] COMPLETED — GET', responseUrl)
    const resultRes = await fetch(responseUrl, { method: 'GET', headers: authHeader })
    const resultRaw = await resultRes.text()
    console.log('[fal-status] result HTTP', resultRes.status, '| body:', resultRaw)

    if (!resultRes.ok) {
      return c.json({ error: `fal.ai result error: ${resultRes.status}`, raw: resultRaw }, 500)
    }

    let resultData: { images?: Array<{ url: string; width: number; height: number }> } = {}
    try {
      resultData = JSON.parse(resultRaw)
    } catch (parseErr) {
      console.error('[fal-status] failed to parse result JSON:', parseErr)
      return c.json({ error: 'Invalid JSON from fal.ai result endpoint', raw: resultRaw }, 500)
    }

    const images = resultData.images || []
    if (images.length === 0) {
      console.error('[fal-status] COMPLETED but no images in result:', resultRaw)
      return c.json({ error: 'fal.ai completed but returned no images' }, 500)
    }

    console.log('[fal-status] imageUrl:', images[0].url)
    return c.json({ status: 'COMPLETED', imageUrl: images[0].url })

  } catch (err: any) {
    console.error('[fal-status] exception:', err)
    return c.json({ error: err.message || 'Failed to check fal.ai status' }, 500)
  }
})

// Pre-made mask URLs for text banner area (black = edit area at bottom, white = preserve)
const MASK_URLS = {
  '16:9': 'https://iili.io/fk9ypqB.png',  // 15% bottom banner
  '9:16': 'https://iili.io/fk9yy0P.png',  // 12% bottom banner
  '1:1': 'https://iili.io/fkH99g1.png'    // 14% bottom banner
}

// API: Generate image with Ideogram character-edit (for text overlay - uses mask to preserve image)
app.post('/api/generate-image-ideogram', async (c) => {
  const { prompt, imageUrl, aspectRatio } = await c.req.json()
  
  // Get the appropriate mask for this aspect ratio
  const maskUrl = MASK_URLS[aspectRatio] || MASK_URLS['16:9']
  
  const requestBody = {
    model: 'ideogram/character-edit',
    input: {
      prompt,
      image_url: imageUrl,      // The base image to add text to
      mask_url: maskUrl,        // Mask: black area at bottom = where text goes
      rendering_speed: 'BALANCED',
      style: 'AUTO',
      expand_prompt: false,     // Don't expand - we want exact text
      num_images: '1'
    }
  }
  
  console.log('Ideogram character-edit Request (text overlay):', JSON.stringify(requestBody, null, 2))
  
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIEAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  return c.json(await res.json())
})

// API: Check KieAI task status
app.get('/api/task-status/:taskId', async (c) => {
  const taskId = c.req.param('taskId')
  
  const res = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    headers: { 'Authorization': `Bearer ${KIEAI_API_KEY}` }
  })
  return c.json(await res.json())
})

// API: Upload image to freeimage.host
app.post('/api/upload-image', async (c) => {
  const { base64Image } = await c.req.json()
  
  const formData = new FormData()
  formData.append('key', '6d207e02198a847aa98d0a2a901485a5')
  formData.append('action', 'upload')
  formData.append('source', base64Image)
  formData.append('format', 'json')
  
  const res = await fetch('https://freeimage.host/api/1/upload', {
    method: 'POST',
    body: formData
  })
  return c.json(await res.json())
})

// API: Proxy image to base64 (avoids CORS issues)
app.post('/api/proxy-image', async (c) => {
  try {
    const { imageUrl } = await c.req.json()
    
    if (!imageUrl) {
      return c.json({ error: 'Missing imageUrl' }, 400)
    }
    
    // Fetch the image
    const res = await fetch(imageUrl)
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch image: ' + res.status }, 500)
    }
    
    // Get as array buffer and convert to base64
    const arrayBuffer = await res.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    const base64 = btoa(binary)
    
    // Get content type
    const contentType = res.headers.get('content-type') || 'image/png'
    
    return c.json({ 
      success: true, 
      base64: base64,
      contentType: contentType,
      dataUrl: 'data:' + contentType + ';base64,' + base64
    })
  } catch (err) {
    return c.json({ error: 'Proxy error: ' + err.message }, 500)
  }
})

// ============================================
// NocoDB PROXY: Serve attachments/images over HTTPS
// ============================================

// Proxy any NocoDB file/attachment request
// Usage: /api/nocodb-proxy/download/2026/03/12/.../file.jpg
// This proxies to: http://31.220.49.162:8080/download/2026/03/12/.../file.jpg
app.get('/api/nocodb-proxy/*', async (c) => {
  const token = c.req.header('xc-token') || c.env.NOCODB_TOKEN
  const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
  
  // Get the path after /api/nocodb-proxy/
  const path = c.req.path.replace('/api/nocodb-proxy/', '')
  
  if (!path) {
    return c.json({ error: 'Missing path' }, 400)
  }
  
  // Construct the full NocoDB URL
  const nocodbUrl = nocodbBaseUrl + '/' + path
  
  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['xc-token'] = token
    }
    
    const res = await fetch(nocodbUrl, { headers })
    
    if (!res.ok) {
      return c.json({ error: 'Failed to fetch from NocoDB: ' + res.status }, res.status)
    }
    
    // Get the response body as an array buffer
    const arrayBuffer = await res.arrayBuffer()
    
    // Get content type from response or default to octet-stream
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    
    // Return the proxied response with proper content type
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  } catch (err) {
    return c.json({ error: 'Proxy error: ' + (err as Error).message }, 500)
  }
})

// ============================================
// BROWSER EXTENSION: Save to Pipeline
// ============================================

// Table routing configuration for the browser extension
// ============================================
// BRAND MODE CONFIGURATION: FifthAveAI (Production)
// ============================================
const BRAND_CONFIG = {
  // Current active brand mode - can be switched between FifthAveAI and FifthAveCrypto
  currentMode: 'FifthAveAI',
  
  // VPS NocoDB connection - use DEFAULT_NOCODB_BASE_URL or env var at runtime
  vpsNocoDB: {
    get baseUrl() { return DEFAULT_NOCODB_BASE_URL },
    projectId: 'prs1ubx2662cbv6'
  },
  
  // Brand-specific configurations
  brands: {
    FifthAveAI: {
      baseId: 'prs1ubx2662cbv6',  // VPS project ID
      tableId: 'm5fb56hy2px2fuv',   // Articles table
      tableName: 'Articles',
      fieldMap: {
        url: 'URL',
        title: 'Title',
        notes: 'Summary',
        platforms: 'Platforms',
        status: 'Status',
        statusValue: 'Needs Review'
      }
    },
    FifthAveCrypto: {
      // Reserved for future crypto mode - currently same as AI mode for structure
      baseId: 'prs1ubx2662cbv6',
      tableId: 'm5fb56hy2px2fuv',
      tableName: 'Articles',
      fieldMap: {
        url: 'URL',
        title: 'Title',
        notes: 'Summary',
        platforms: 'Platforms',
        status: 'Status',
        statusValue: 'Needs Review'
      }
    }
  }
}

// Legacy EXTENSION_ROUTES - maintained for backward compatibility
// These will be deprecated in favor of BRAND_CONFIG
const EXTENSION_ROUTES = {
  crypto: {
    baseId: 'prs1ubx2662cbv6',
    tableId: 'm5fb56hy2px2fuv',
    fieldMap: {
      url: 'URL',
      title: 'Title',
      notes: 'Summary',
      platforms: 'Platforms',
      status: 'Status',
      statusValue: 'Needs Review'
    }
  },
  ai: {
    baseId: 'prs1ubx2662cbv6',
    tableId: 'm5fb56hy2px2fuv',
    fieldMap: {
      url: 'URL',
      title: 'Title',
      notes: 'Summary',
      platforms: 'Platforms',
      status: 'Status',
      statusValue: 'Needs Review'
    }
  },
  general: {
    baseId: 'prs1ubx2662cbv6',
    tableId: 'm5fb56hy2px2fuv',
    fieldMap: {
      url: 'URL',
      title: 'Title',
      notes: 'Summary',
      platforms: 'Platforms',
      status: 'Status',
      statusValue: 'Needs Review'
    }
  }
}

// Valid socialChannels options for the 5th Ave tables
const VALID_SOCIAL_CHANNELS = ['Twitter', 'LinkedIn', 'Blog', 'Instagram', 'Facebook', 'Avatar']

// NocoDB token for extension saves
const EXTENSION_NOCODB_TOKEN = 'htjKEaVOkCm8QoJgzxYQ4iA1SL8SX_ZRQbVSSi_7'

// ============================================
// INSTANT PROCESSING: n8n Webhook Triggers
// ============================================

// n8n webhook URLs for instant pickup processing
const N8N_WEBHOOKS: Record<string, string> = {
  crypto: 'https://fifthaveai.app.n8n.cloud/webhook/crypto-pickup',
  ai: 'https://fifthaveai.app.n8n.cloud/webhook/ai-pickup'
}

// Trigger the n8n pickup workflow immediately via webhook
// Sends record data directly so n8n can process without re-fetching from NocoDB
async function triggerInstantPickup(topic: string, recordId: string, recordData: {
  sourceURL: string
  sourceHeadline: string
  sourceSummary: string
}): Promise<void> {
  const webhookUrl = N8N_WEBHOOKS[topic]
  if (!webhookUrl) return
  
  try {
    // Wait 2 seconds for NocoDB to fully index the new record
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log(`[Instant Pickup] Triggering ${topic} webhook for record ${recordId}`)
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId,
        sourceURL: recordData.sourceURL,
        sourceHeadline: recordData.sourceHeadline,
        sourceSummary: recordData.sourceSummary,
        topic,
        triggeredAt: new Date().toISOString()
      })
    })
    console.log(`[Instant Pickup] Webhook response: ${res.status}`)
  } catch (err: any) {
    console.error(`[Instant Pickup] Webhook error:`, err.message)
  }
}

// API: Save URL from browser extension — with INSTANT n8n webhook processing
app.post('/api/save', async (c) => {
  try {
    const { url, title, notes, platforms, topic } = await c.req.json()
    
    if (!url) {
      return c.json({ success: false, error: 'URL is required' }, 400)
    }
    
    // Get NocoDB token and base URL from environment or use defaults
    const nocodbToken = c.env?.NOCODB_TOKEN || EXTENSION_NOCODB_TOKEN
    const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
    
    // Determine routing based on topic (default to 'general')
    const selectedTopic = topic || 'general'
    const route = EXTENSION_ROUTES[selectedTopic]
    
    if (!route) {
      return c.json({ success: false, error: 'Invalid topic. Use: crypto, ai, or general' }, 400)
    }
    
    const fm = route.fieldMap
    
    // Build the fields object based on the field mapping
    const fields: Record<string, any> = {}
    fields[fm.url] = url
    fields[fm.title] = title || ''
    fields[fm.status] = fm.statusValue
    
    if (notes) {
      fields[fm.notes] = notes
    }
    
    // Map platforms - validate for 5th Ave tables
    if (platforms && platforms.length > 0) {
      if (selectedTopic === 'crypto' || selectedTopic === 'ai') {
        // Filter to valid socialChannels options only
        const validPlatforms = platforms.filter((p: string) => VALID_SOCIAL_CHANNELS.includes(p))
        if (validPlatforms.length > 0) {
          fields[fm.platforms] = validPlatforms
        }
      } else {
        fields[fm.platforms] = platforms
      }
    }
    
    // For General Pipeline, add Created Date
    if (selectedTopic === 'general') {
      fields['Created Date'] = new Date().toISOString()
    }
    
    // Create the record in NocoDB
    // NocoDB uses tableId only, no baseId in record URLs
    // NocoDB expects flat fields, not wrapped in { fields: {...} }
    const res = await fetch(`${nocodbBaseUrl}/api/v2/tables/${route.tableId}/records`, {
      method: 'POST',
      headers: {
        'xc-token': nocodbToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fields)
    })
    
    const data: any = await res.json()
    
    if (data.error) {
      console.error('NocoDB error:', data.error)
      const errorMsg = typeof data.error === 'string' ? data.error : (data.error.message || 'NocoDB error')
      return c.json({ success: false, error: errorMsg }, 500)
    }
    
    // Transform NocoDB response to match expected format
    // NocoDB returns flat record with Id field
    const transformedData = {
      id: data.Id,
      fields: data
    }
    
    // ===== INSTANT PROCESSING via n8n Webhook =====
    // For crypto/ai topics, immediately trigger the n8n pickup workflow
    // The workflow uses Perplexity + OpenAI credentials already stored in n8n
    let processingStarted = false
    
    if ((selectedTopic === 'crypto' || selectedTopic === 'ai') && data.id) {
      processingStarted = true
      
      // Fire the webhook in the background - don't block the response
      const webhookPromise = triggerInstantPickup(selectedTopic, data.id, {
        sourceURL: url,
        sourceHeadline: title || '',
        sourceSummary: notes || ''
      })
      
      if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
        c.executionCtx.waitUntil(webhookPromise)
      } else {
        webhookPromise.catch(err => console.error('[Instant Pickup] Background error:', err))
      }
    }
    
    return c.json({ 
      success: true, 
      record: transformedData,
      topic: selectedTopic,
      table: selectedTopic === 'general' ? 'Content Pipeline' : (selectedTopic === 'crypto' ? 'Social Posts' : 'Social Posts - AI'),
      processing: processingStarted ? 'started' : 'not_applicable'
    })
  } catch (err: any) {
    console.error('Save error:', err)
    return c.json({ success: false, error: err.message || 'Server error' }, 500)
  }
})

// API: Check processing status of a record (poll from extension)
app.get('/api/process-status/:recordId', async (c) => {
  try {
    const recordId = c.req.param('recordId')
    const topic = c.req.query('topic') || 'crypto'
    const route = EXTENSION_ROUTES[topic]
    
    if (!route) {
      return c.json({ error: 'Invalid topic' }, 400)
    }
    
    // Get NocoDB token and base URL from environment or use defaults
    const nocodbToken = c.env?.NOCODB_TOKEN || EXTENSION_NOCODB_TOKEN
    const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
    
    // Fetch the record from NocoDB to check if it's been enriched
    // NocoDB uses tableId only, no baseId in record URLs
    const res = await fetch(`${nocodbBaseUrl}/api/v2/tables/${route.tableId}/records/${recordId}`, {
      headers: { 'xc-token': nocodbToken }
    })
    
    const data: any = await res.json()
    // NocoDB returns flat fields, not nested under 'fields'
    const fields = data || {}
    
    // Check which fields have been populated
    const hasResearch = !!(fields.sourceSummary && fields.sourceSummary.length > 50)
    const hasImagePrompt = !!(fields.imagePrompt && fields.imagePrompt.length > 10)
    const hasSocialContent = !!(fields['Twitter Copy'] && fields['Twitter Copy'].length > 5)
    
    let status = 'processing'
    if (hasResearch && hasImagePrompt && hasSocialContent) {
      status = 'complete'
    } else if (hasResearch) {
      status = 'generating_content'
    }
    
    return c.json({
      recordId,
      status,
      fields: {
        hasResearch,
        hasImagePrompt,
        hasSocialContent,
        rewrittenHeadline: fields.rewrittenHeadline || null
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// API: Manually trigger processing for an existing record via n8n webhook
app.post('/api/process', async (c) => {
  try {
    const { recordId, topic } = await c.req.json()
    
    if (!recordId || !topic) {
      return c.json({ error: 'recordId and topic are required' }, 400)
    }
    
    if (topic === 'general') {
      return c.json({ error: 'Processing only available for crypto/ai topics' }, 400)
    }
    
    const route = EXTENSION_ROUTES[topic]
    if (!route) {
      return c.json({ error: 'Invalid topic' }, 400)
    }
    
    // Get NocoDB token and base URL from environment or use defaults
    const nocodbToken = c.env?.NOCODB_TOKEN || EXTENSION_NOCODB_TOKEN
    const nocodbBaseUrl = c.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE_URL
    
    // Fetch the record from NocoDB to get current data
    // NocoDB uses tableId only, no baseId in record URLs
    const nocodbRes = await fetch(`${nocodbBaseUrl}/api/v2/tables/${route.tableId}/records/${recordId}`, {
      headers: { 'xc-token': nocodbToken }
    })
    const record: any = await nocodbRes.json()
    // NocoDB returns flat fields, not nested under 'fields'
    const fields = record || {}
    
    // Trigger the n8n webhook with record data
    await triggerInstantPickup(topic, recordId, {
      sourceURL: fields.sourceURL || '',
      sourceHeadline: fields.sourceHeadline || '',
      sourceSummary: fields.sourceSummary || ''
    })
    
    return c.json({ success: true, status: 'processing_started', recordId })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// API: Get available topics for the extension
app.get('/api/topics', (c) => {
  return c.json({
    topics: [
      { id: 'crypto', label: '🪙 Crypto News', description: 'Save to 5th Ave Crypto pipeline' },
      { id: 'ai', label: '🤖 AI News', description: 'Save to 5th Ave AI pipeline' },
      { id: 'general', label: '📋 General Pipeline', description: 'Save to Content Pipeline' }
    ]
  })
})

// API: Generate image prompt from headline/summary using GPT-4o
app.post('/api/generate-image-prompt', async (c) => {
  try {
    const apiKey = (c.env as any).OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to environment.' }, 500)
    }

    const body = await c.req.json()
    const { sourceHeadline, sourceSummary, category, whyItMatters } = body

    if (!sourceHeadline) {
      return c.json({ error: 'sourceHeadline is required' }, 400)
    }

    const systemPrompt = `You create one high-quality image prompt for a Fifth Ave AI news visual. Each image must look like a frame from a different documentary or news film — never repeat the same composition, camera angle, or scene type across articles.

FOR EACH PROMPT, YOU MUST SPECIFY ALL 6 OF THESE ELEMENTS:

1. SUBJECT — What the camera sees. Pick ONE and NEVER default to office workers at desks: a single symbolic object in extreme close-up (cracked employee badge, robotic hand holding a pen, empty revolving door, server rack with one blinking light), OR an environmental wide shot with NO people (abandoned trading floor, fully automated warehouse, empty corporate campus parking lot at dawn, robot-staffed assembly line), OR one human figure in a decisive moment (security guard watching a drone replace patrol, engineer unplugging a server, worker carrying a box past a robot arm), OR a dramatic contrast scene (vintage typewriter next to holographic display, human hand reaching toward a robot hand, half-demolished office with AI screens glowing), OR aerial bird's eye perspective (drone view of an automated port, overhead shot of one occupied desk in an empty floor of cubicles).

2. CAMERA — Specify lens and angle. Rotate between: 24mm wide establishing shot, 50mm eye-level documentary, 85mm shallow depth portrait, 200mm telephoto compression, overhead drone shot, extreme macro close-up.

3. LIGHTING — Specify direction and quality. Rotate between: cold fluorescent from above, warm golden hour side light, single harsh spotlight in darkness, blue-tinted monitor glow, overcast flat documentary light, dramatic rim light with dark background.

4. COLOR PALETTE — Specify 2-3 dominant colors. Examples: steel blue and amber, clinical white and red accent, dark teal and warm orange, monochrome silver, deep purple and neon green.

5. TEXTURE DETAIL — One micro-detail that grounds the image in reality: condensation on glass, dust particles in a light beam, scratches on a metal surface, fingerprints on a screen, frayed cable.

6. COMPOSITION — Specify framing: rule of thirds with subject at left intersection, centered symmetry, diagonal leading lines, foreground blur with sharp background, frame-within-a-frame.

ABSOLUTE PROHIBITIONS: no readable text, no company names, no logos, no signage, no labels, no numbers, no watermarks, no headline text, no Fifth Ave AI text, no generic blonde-woman presenter, no default professional woman, no Angel avatar unless requested, no busy office scenes with multiple people at computers, no people packing boxes, no groups of employees at desks.

Deliver the final prompt as a single paragraph under 120 words. Cinematic, photorealistic, editorial quality. 16:9.

Return ONLY valid JSON: {"image_prompt":"<final prompt>"}`

    let userMessage = `Headline: ${sourceHeadline}`
    if (sourceSummary) userMessage += `\nSummary: ${sourceSummary}`
    if (category) userMessage += `\nCategory: ${category}`
    if (whyItMatters) userMessage += `\nWhy It Matters: ${whyItMatters}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI API error:', response.status, errText)
      return c.json({ error: `OpenAI API error: ${response.status}` }, response.status as any)
    }

    const data = await response.json() as any
    const prompt = data.choices?.[0]?.message?.content?.trim()

    if (!prompt) {
      return c.json({ error: 'No prompt generated from OpenAI response' }, 500)
    }

    return c.json({ prompt })
  } catch (err: any) {
    console.error('generate-image-prompt error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// ============================================
// COMBINED DASHBOARD
// ============================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5th Ave Content Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { 
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
    }
    .glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glass-hover:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    /* Reference Slots */
    .ref-slot {
      width: 100%;
      aspect-ratio: 1;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .ref-slot:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .ref-slot.has-image { border-style: solid; border-color: rgba(255, 255, 255, 0.3); }
    .ref-slot.active { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    .ref-slot.drag-over { border-color: #f59e0b; background: rgba(245, 158, 11, 0.2); transform: scale(1.02); }
    .ref-slot img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
    
    .toggle-btn {
      position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; transition: all 0.2s;
    }
    .toggle-btn.enabled { background: #10b981; color: white; }
    .toggle-btn.disabled { background: rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.5); }
    
    .clear-btn {
      position: absolute; top: 4px; left: 4px; width: 24px; height: 24px;
      border-radius: 50%; background: rgba(239, 68, 68, 0.8); color: white;
      display: none; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; font-size: 10px;
    }
    .ref-slot:hover .clear-btn { display: flex; }
    
    .order-badge {
      position: absolute; bottom: 4px; left: 4px;
      background: rgba(0, 0, 0, 0.7); color: #f59e0b;
      font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;
    }
    
    /* History Items - Large 200px */
    .history-item {
      width: 200px; height: 200px; border-radius: 12px; overflow: hidden;
      cursor: grab; transition: all 0.2s; border: 3px solid transparent;
      flex-shrink: 0;
    }
    .history-item:hover { border-color: #f59e0b; transform: scale(1.02); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); }
    .history-item img { width: 100%; height: 100%; object-fit: cover; }
    
    /* History Row Container */
    .history-row {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);
    }
    .history-row::-webkit-scrollbar { height: 6px; }
    .history-row::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
    .history-row::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
    
    /* Aspect Buttons */
    .aspect-btn {
      padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent; color: rgba(255, 255, 255, 0.7); cursor: pointer; transition: all 0.2s;
    }
    .aspect-btn:hover { border-color: rgba(255, 255, 255, 0.4); color: white; }
    .aspect-btn.active { background: #f59e0b; border-color: #f59e0b; color: black; font-weight: 600; }
    
    /* Generate Button */
    .generate-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: black; font-weight: 600; padding: 12px 32px; border-radius: 12px;
      border: none; cursor: pointer; transition: all 0.3s; font-size: 16px;
    }
    .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); }
    .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    /* Preview Area - MAXIMIZED */
    .preview-area {
      min-height: 400px; border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
    }
    .preview-area img { max-width: 100%; max-height: 600px; border-radius: 12px; cursor: grab; }
    
    /* Generation History - Single Row, Large Images */
    .history-row {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);
    }
    .history-row::-webkit-scrollbar { height: 8px; }
    .history-row::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
    .history-row::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 4px; }
    
    .history-item {
      flex-shrink: 0;
      width: 200px;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.3);
    }
    .history-item:hover {
      border-color: #f59e0b;
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
    }
    .history-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preview-area.drag-source img { opacity: 0.5; }
    
    /* Content Review Section */
    .section-divider {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 24px 0;
      position: relative;
    }
    .section-divider::after {
      content: 'CONTENT REVIEW';
      position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
      background: #1a1a2e; padding: 0 16px; font-size: 12px; color: #f59e0b;
      letter-spacing: 2px; font-weight: 600;
    }
    
    .sidebar { max-height: 400px; overflow-y: auto; }
    .record-item { transition: all 0.2s; }
    .record-item:hover { background: rgba(255, 255, 255, 0.05); }
    .record-item.active { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; }
    
    /* Record cards for horizontal scroll */
    .record-card { transition: all 0.2s; }
    .record-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
    /* Card image container: always fixed height, never collapses */
    .card-img-container {
      width: 100%;
      height: 144px;       /* h-36 = 9rem = 144px */
      min-height: 144px;
      border-radius: 8px;
      overflow: hidden;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
    }
    .card-img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    /* Placeholder shown when image is absent or fails to load */
    .card-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .status-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
    .status-needs-approval { background: #F59E0B; color: #000; }
    .status-approved { background: #10B981; color: #fff; }
    .status-declined { background: #EF4444; color: #fff; }
    .status-posted { background: #3B82F6; color: #fff; }
    .status-ready { background: #8B5CF6; color: #fff; }
    .status-draft { background: #6B7280; color: #fff; }
    .status-done { background: #10B981; color: #fff; }
    .status-pending { background: #F59E0B; color: #000; }
    
    .copy-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; }
    
    /* Image Drop Zones - Larger */
    .image-drop-zone {
      min-height: 200px; border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px; transition: all 0.3s; display: flex;
      align-items: center; justify-content: center; position: relative;
    }
    .image-drop-zone:hover { border-color: rgba(255, 255, 255, 0.4); }
    .image-drop-zone.drag-over { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); transform: scale(1.02); }
    .image-drop-zone.has-image { border-style: solid; border-color: rgba(255, 255, 255, 0.2); cursor: pointer; }
    .image-drop-zone.has-image:hover { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
    .image-drop-zone.has-image::after {
      content: '🔍 Click to view';
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .image-drop-zone.has-image:hover::after { opacity: 1; }
    .image-drop-zone img { max-width: 100%; max-height: 200px; border-radius: 8px; }
    
    /* Remove image button */
    .remove-image-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      background: rgba(239, 68, 68, 0.9);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s, background 0.2s;
      z-index: 10;
    }
    .remove-image-btn:hover {
      background: rgba(220, 38, 38, 1);
      transform: scale(1.1);
    }
    .image-drop-zone.has-image:hover .remove-image-btn {
      opacity: 1;
    }
    
    /* Tabs - Larger for Social Content */
    .tab-btn { 
      padding: 12px 20px; 
      transition: all 0.2s; 
      border-bottom: 3px solid transparent;
      border-radius: 8px 8px 0 0;
      background: rgba(255, 255, 255, 0.02);
    }
    .tab-btn:hover { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .tab-btn.tab-active { 
      border-bottom-color: #f59e0b; 
      color: #f59e0b; 
      background: rgba(245, 158, 11, 0.15);
      font-weight: 600;
    }
    
    /* Auto-save indicator */
    .save-indicator {
      position: fixed; top: 80px; right: 20px; background: #10b981;
      color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px;
      opacity: 0; transition: opacity 0.3s; z-index: 100;
    }
    .save-indicator.show { opacity: 1; }
    
    /* Selectors */
    .base-selector {
      background: #000000;
      border: 1px solid #8b5cf6;
      color: #ffffff;
    }
    .base-selector option {
      background: #000000;
      color: #ffffff;
    }
    .base-selector:focus {
      border-color: #a78bfa;
      outline: none;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
    }
    .table-selector {
      background: #000000;
      border: 1px solid #f59e0b;
      color: #ffffff;
    }
    .table-selector option {
      background: #000000;
      color: #ffffff;
    }
    .table-selector:focus {
      border-color: #fbbf24;
      outline: none;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
    }
    
    /* Calendar Styles */
    .calendar-day {
      min-height: 100px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 4px;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
    }
    .calendar-day:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .calendar-day.other-month {
      opacity: 0.4;
    }
    .calendar-day.today {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }
    .calendar-day.drag-over {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.2);
      transform: scale(1.02);
    }
    .calendar-day-number {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      padding: 2px 6px;
    }
    .calendar-day.today .calendar-day-number {
      color: #f59e0b;
    }
    .calendar-day-posts {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      padding: 2px;
      max-height: 70px;
      overflow: hidden;
    }
    .calendar-post-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.2s;
    }
    .calendar-post-thumb:hover {
      transform: scale(1.1);
      border-color: #f59e0b;
      z-index: 10;
    }
    .calendar-post-more {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9ca3af;
    }
    
    /* Ready to Schedule Queue Items */
    .schedule-queue-item {
      flex-shrink: 0;
      width: 120px;
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 8px;
      padding: 8px;
      cursor: grab;
      transition: all 0.2s;
    }
    .schedule-queue-item:hover {
      border-color: #a855f7;
      transform: translateY(-2px);
    }
    .schedule-queue-item.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
    .schedule-queue-item img {
      width: 100%;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .schedule-queue-item-title {
      font-size: 10px;
      color: #d1d5db;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Dynamic field container */
    .dynamic-field {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .dynamic-field label {
      display: block;
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .dynamic-field input, .dynamic-field textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 8px;
      color: white;
      font-size: 14px;
    }
    .dynamic-field input:focus, .dynamic-field textarea:focus {
      outline: none;
      border-color: #f59e0b;
    }
    
    /* Loading spinner */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #f59e0b;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Image Lightbox Modal - FULL SCREEN */
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      padding: 20px;
    }
    .lightbox-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .lightbox-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .lightbox-content img {
      max-width: 98vw;
      max-height: calc(100vh - 100px);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    }
    .lightbox-close {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }
    .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    .lightbox-actions {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      padding: 12px 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .lightbox-actions button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .lightbox-actions button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .lightbox-actions button.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: #10b981;
    }
    .lightbox-actions button.primary:hover {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }
    
    /* Lightbox Zoom Container */
    .lightbox-zoom-container {
      width: 100%;
      height: calc(100vh - 160px);
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-in;
      position: relative;
    }
    .lightbox-zoom-container.zoomed {
      cursor: grab;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .lightbox-zoom-container.zoomed:active {
      cursor: grabbing;
    }
    .lightbox-zoom-container img {
      transition: transform 0.2s ease;
      transform-origin: center center;
    }
    
    /* Zoom Controls */
    .lightbox-zoom-controls {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      padding: 8px 16px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1001;
    }
    .lightbox-zoom-controls button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-zoom-controls button:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .lightbox-zoom-controls span {
      color: #f59e0b;
      font-weight: 600;
      font-size: 14px;
      min-width: 50px;
      text-align: center;
    }
    
    /* Zoom Hint */
    .lightbox-hint {
      position: fixed;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      z-index: 1001;
    }
  </style>
</head>
<body class="text-gray-100">
  <!-- Header -->
  <header class="glass px-6 py-3 flex items-center justify-between sticky top-0 z-50">
    <div class="flex items-center gap-4">
      <img src="https://iili.io/fEiEfUB.png" alt="Logo" class="w-10 h-10">
      <h1 class="text-xl font-bold">5th Ave Content Hub</h1>
    </div>
    <div class="flex items-center gap-4">
      <span id="topicIndicator" class="text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">
        <i class="fab fa-bitcoin mr-1"></i>Crypto Mode
      </span>
      <span id="connectionStatus" class="text-sm text-green-400">
        <i class="fas fa-check-circle mr-1"></i>Connected
      </span>
    </div>
  </header>

  <!-- Image Lightbox Modal with Zoom -->
  <div id="lightboxOverlay" class="lightbox-overlay" onclick="closeLightbox(event)">
    <div class="lightbox-content" onclick="event.stopPropagation()">
      <button class="lightbox-close" onclick="closeLightbox()">
        <i class="fas fa-times"></i>
      </button>
      
      <!-- Zoom Container -->
      <div id="lightboxZoomContainer" class="lightbox-zoom-container" 
           onclick="toggleLightboxZoom(event)"
           onwheel="handleLightboxWheel(event)">
        <img id="lightboxImage" src="" alt="Full size image" draggable="false">
      </div>
      
      <!-- Zoom Controls -->
      <div class="lightbox-zoom-controls">
        <button onclick="event.stopPropagation(); lightboxZoomOut()" title="Zoom Out">
          <i class="fas fa-search-minus"></i>
        </button>
        <span id="lightboxZoomLevel">100%</span>
        <button onclick="event.stopPropagation(); lightboxZoomIn()" title="Zoom In">
          <i class="fas fa-search-plus"></i>
        </button>
        <button onclick="event.stopPropagation(); lightboxZoomReset()" title="Reset Zoom">
          <i class="fas fa-expand"></i>
        </button>
      </div>
      
      <div class="lightbox-hint">
        <i class="fas fa-mouse-pointer mr-1"></i>Click to zoom • Scroll to zoom • Drag to pan
      </div>
      
      <div class="lightbox-actions">
        <button onclick="lightboxSaveToArticle()" class="primary" style="background: linear-gradient(135deg, #3b82f6, #06b6d4);">
          <i class="fas fa-cloud-upload-alt mr-2"></i>Save to Article
        </button>
        <button onclick="lightboxUseImage()">
          <i class="fas fa-check-circle mr-2"></i>Use in Content
        </button>
        <button onclick="lightboxDownload()">
          <i class="fas fa-download mr-2"></i>Download
        </button>
        <button onclick="lightboxCopyUrl()">
          <i class="fas fa-link mr-2"></i>Copy URL
        </button>
      </div>
    </div>
  </div>

  <div id="saveIndicator" class="save-indicator">
    <i class="fas fa-check mr-2"></i>Saved
  </div>

  <div class="p-4 max-w-[1400px] mx-auto">
    
    <!-- ============================================ -->
    <!-- SINGLE COLUMN STACKED LAYOUT -->
    <!-- ============================================ -->
    
    <!-- 1. Reference Library (Collapsible) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between cursor-pointer" onclick="toggleReferenceLibrary()">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-layer-group text-amber-500"></i>
          Reference Library
          <span id="refLibraryCount" class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">0 active</span>
        </h2>
        <div class="flex items-center gap-3">
          <div id="processingOrder" class="text-xs text-amber-500 font-mono hidden md:block"></div>
          <i id="refLibraryToggle" class="fas fa-chevron-down text-gray-400 transition-transform" style="transform: rotate(180deg)"></i>
        </div>
      </div>
      <div id="referenceLibraryContent" class="mt-4">
        <p class="text-xs text-gray-400 mb-4">Each reference type has 3 size variants (16:9, 9:16, 1:1) for aspect-ratio-specific generation.</p>
        <div id="referenceGridExpanded" class="space-y-4"></div>
      </div>
    </div>

    <!-- 2. Generated Image Preview (LARGE - Full Width) -->
    <div class="glass rounded-2xl p-6 mb-4">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <i class="fas fa-image text-amber-500"></i>
        Generated Image
        <span class="text-xs text-gray-400 ml-2">(drag to content images below)</span>
      </h3>
      <div id="previewArea" class="preview-area"
           style="min-height: 500px;"
           draggable="false"
           ondragstart="handlePreviewDragStart(event)"
           ondragend="handlePreviewDragEnd(event)">
        <div class="text-center text-gray-500">
          <i class="fas fa-image text-6xl mb-4"></i>
          <p class="text-lg">Your generated image will appear here</p>
        </div>
      </div>
      <div id="previewActions" class="mt-4 hidden">
        <div class="grid grid-cols-4 gap-3 mb-3">
          <button onclick="useImageInContent()" class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg py-3 text-sm font-semibold transition-all">
            <i class="fas fa-check-circle mr-2"></i>Use This
            <span id="useImageRatio" class="text-xs opacity-75 ml-1">(16:9)</span>
          </button>
          <button id="createAllSizesBtn" onclick="createAllSizes()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-3 text-sm font-semibold transition-all">
            <i class="fas fa-clone mr-2"></i>All Sizes
          </button>
          <button onclick="downloadImage()" class="glass glass-hover rounded-lg py-3 text-sm">
            <i class="fas fa-download mr-2"></i>Download
          </button>
          <button onclick="copyImageUrl()" class="glass glass-hover rounded-lg py-3 text-sm">
            <i class="fas fa-link mr-2"></i>Copy URL
          </button>
        </div>
        <div id="createAllSizesStatus" class="hidden p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
          <div class="flex items-center gap-2 text-sm text-purple-300">
            <i class="fas fa-spinner fa-spin"></i>
            <span id="createAllSizesText">Creating sizes...</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div id="size16x9Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>16:9</div>
            <div id="size9x16Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>9:16</div>
            <div id="size1x1Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>1:1</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Image Prompt + Aspect Ratio + Generate (Side by Side) -->
    <div class="grid grid-cols-12 gap-4 mb-4">
      <!-- Image Prompt -->
      <div class="col-span-8">
        <div class="glass rounded-2xl p-4 h-full">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <i class="fas fa-wand-magic-sparkles text-amber-500"></i>
              Image Prompt
            </h2>
            <div class="flex items-center gap-3">
              <button id="generatePromptBtn" onclick="generateAIPrompt()" class="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                <i class="fas fa-robot"></i>
                <span>Generate Prompt</span>
              </button>
              <span id="charCount" class="text-xs text-gray-400">0 chars</span>
            </div>
          </div>
          <textarea 
            id="promptInput" 
            rows="3" 
            placeholder="Describe the image you want to generate..."
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-amber-500 transition-colors"
          ></textarea>
          
          <!-- Add Headline Text Toggle (Inline) -->
          <div class="mt-3 flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
            <label class="text-sm text-blue-300 flex items-center gap-2">
              <i class="fas fa-font"></i>
              Add Headline Text
            </label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="addHeadlineText" class="sr-only peer" onchange="onHeadlineToggleChange()">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div id="headlineInputContainer" class="hidden mt-2">
            <input type="text" id="shortHeadline" 
                   class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-white"
                   placeholder="e.g., Bitcoin Dominance Strengthens"
                   oninput="updatePromptWithHeadline()">
          </div>
        </div>
      </div>
      
      <!-- Aspect Ratio & Generate -->
      <div class="col-span-4">
        <div class="glass rounded-2xl p-4 h-full flex flex-col">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <i class="fas fa-crop text-amber-500"></i>
            Aspect Ratio
          </h3>
          <div class="flex gap-2 mb-4">
            <button class="aspect-btn active flex-1 text-center" data-ratio="16:9" onclick="setAspectRatio('16:9')">
              <i class="fas fa-desktop mr-1"></i>16:9
            </button>
            <button class="aspect-btn flex-1 text-center" data-ratio="9:16" onclick="setAspectRatio('9:16')">
              <i class="fas fa-mobile-alt mr-1"></i>9:16
            </button>
            <button class="aspect-btn flex-1 text-center" data-ratio="1:1" onclick="setAspectRatio('1:1')">
              <i class="fas fa-square mr-1"></i>1:1
            </button>
          </div>
          <div id="imageModelLabel" class="text-sm text-center mb-2">
            <label class="flex items-center justify-center gap-2">
              <i class="fas fa-microchip text-amber-400"></i>
              <span class="text-gray-400">Model:</span>
              <select id="imageModelSelect" class="bg-gray-800 border border-amber-500/30 rounded-lg px-2 py-1 text-amber-400 font-semibold text-sm focus:outline-none focus:border-amber-500 cursor-pointer">
                <option value="nano-banana">nano-banana (KieAI)</option>
                <option value="flux">flux (fal.ai)</option>
              </select>
            </label>
          </div>
          <button id="generateBtn" onclick="generateImage()" class="generate-btn w-full mt-auto">
            <i class="fas fa-sparkles mr-2"></i>Generate Image
          </button>
          <div id="generationStatus" class="mt-3 text-center text-sm text-gray-400 hidden">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            <span id="statusText">Generating...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Content Images (Full Width) -->
    <div id="contentImagesSection" class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-images text-amber-500"></i>
          Content Images
          <span class="text-xs text-gray-400 ml-2">(drag files, URLs, or history images • click to view)</span>
        </h3>
        <div class="flex items-center gap-3">
          <!-- Resize dropdown -->
          <div class="relative">
            <button id="resizeDropdownBtn" onclick="toggleResizeDropdown()" 
                    class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
              <i class="fas fa-expand-arrows-alt"></i>
              Resize to All
              <i class="fas fa-chevron-down text-xs"></i>
            </button>
            <div id="resizeDropdown" class="hidden absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div class="p-2">
                <p class="text-xs text-gray-400 px-3 py-2">Choose resize method:</p>
                <button onclick="resizeToAllSizes('ai')" class="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <i class="fas fa-magic text-purple-400"></i>
                  <div>
                    <div class="font-medium">AI Regenerate (Flux Klein 9B)</div>
                    <div class="text-xs text-gray-400">Best quality, uses Flux Klein 9B via fal.ai</div>
                  </div>
                </button>
                <button onclick="resizeToAllSizes('crop')" class="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <i class="fas fa-crop-alt text-green-400"></i>
                  <div>
                    <div class="font-medium">Smart Crop</div>
                    <div class="text-xs text-gray-400">Fast, free, center-crops to fit ratio</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <button id="saveImagesToNocoDBBtn" onclick="saveImagesToNocoDB()" 
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
            <i class="fas fa-cloud-upload-alt"></i>
            Save to NocoDB
          </button>
        </div>
      </div>
      <div id="saveImagesStatus" class="hidden mb-4 p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
        <div class="flex items-center gap-2 text-sm text-blue-300">
          <i class="fas fa-spinner fa-spin"></i>
          <span id="saveImagesText">Saving images...</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            16:9 <span class="text-xs text-gray-500">(YouTube/Twitter)</span>
            <button onclick="event.stopPropagation(); document.getElementById('fileInput16x9').click()" class="ml-auto text-xs text-gray-500 hover:text-amber-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput16x9" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '16:9')">
          <div id="image16x9" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '16:9')"
               onclick="openContentImage('16:9')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-purple-500"></span>
            9:16 <span class="text-xs text-gray-500">(TikTok/Reels)</span>
            <button onclick="event.stopPropagation(); document.getElementById('fileInput9x16').click()" class="ml-auto text-xs text-gray-500 hover:text-purple-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput9x16" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '9:16')">
          <div id="image9x16" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '9:16')"
               onclick="openContentImage('9:16')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            1:1 <span class="text-xs text-gray-500">(Instagram/FB)</span>
            <button onclick="event.stopPropagation(); document.getElementById('fileInput1x1').click()" class="ml-auto text-xs text-gray-500 hover:text-green-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput1x1" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '1:1')">
          <div id="image1x1" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '1:1')"
               onclick="openContentImage('1:1')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
      </div>
      
      <!-- Resize status -->
      <div id="resizeStatus" class="hidden mt-4 p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
        <div class="flex items-center gap-2 text-sm text-purple-300">
          <i class="fas fa-spinner fa-spin"></i>
          <span id="resizeStatusText">Resizing images...</span>
        </div>
      </div>
    </div>

    <!-- 5. Generation History (Full Width, Single Row, Large Images) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-history text-amber-500"></i>
          Generation History
        </h2>
        <button id="saveAllHistoryBtn" onclick="saveAllHistoryToArticle()" 
                class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
          <i class="fas fa-cloud-upload-alt"></i>
          Save All to Article
        </button>
      </div>
      <p class="text-xs text-gray-400 mb-3">Click to view full size • Drag to content images</p>
      <div id="historyGrid" class="history-row">
        <div class="text-center text-gray-500 w-full py-12">
          <i class="fas fa-clock text-4xl mb-3"></i>
          <p class="text-sm">No images generated yet</p>
        </div>
      </div>
    </div>

    <!-- 6. NocoDB Records (Full Width) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <i class="fas fa-database text-amber-500"></i>
        NocoDB Records
      </h2>
      
      <!-- Selectors Row -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <!-- Base Selector -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-server mr-1"></i>Base
          </label>
          <select id="baseSelector" onchange="onBaseChange()" 
            class="w-full base-selector rounded-lg px-3 py-2 text-sm font-medium">
            <option value="">Loading bases...</option>
          </select>
        </div>
        
        <!-- Table Selector -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-table mr-1"></i>Table
          </label>
          <select id="tableSelector" onchange="onTableChange()" 
            class="w-full table-selector rounded-lg px-3 py-2 text-sm font-medium">
            <option value="">Select a base first</option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div id="statusFilterContainer">
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-filter mr-1"></i>Filter
          </label>
          <select id="statusFilter" onchange="loadRecords()" 
            class="w-full bg-black border border-green-500 rounded-lg px-3 py-2 text-sm text-white">
            <option value="all" class="bg-black text-white">All Records</option>
          </select>
        </div>
      </div>
      
      <!-- Debug Panel (hidden by default, toggle with button) -->
      <div class="mb-4">
        <button onclick="toggleDebugPanel()" class="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
          <i class="fas fa-bug"></i> Toggle Debug Info
        </button>
        <div id="debugPanel" class="hidden mt-2 p-3 bg-gray-900 rounded-lg text-xs font-mono text-gray-400 overflow-auto max-h-48">
          <div id="debugContent">Debug info will appear here...</div>
        </div>
      </div>
      
      <!-- Records Grid (Horizontal scroll, larger cards) -->
      <div id="recordsList" class="flex gap-4 overflow-x-auto pb-4" style="scrollbar-width: thin; scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);">
        <p class="text-gray-500 text-sm p-4 text-center w-full">Select a base and table</p>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- SECTION DIVIDER -->
    <!-- ============================================ -->
    <div class="section-divider mt-6"></div>

    <!-- ============================================ -->
    <!-- CONTENT REVIEW SECTION -->
    <!-- ============================================ -->
    <div class="mt-6">
      <div id="noSelection" class="glass rounded-2xl p-12 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <i class="fas fa-inbox text-5xl mb-4"></i>
          <p>Select a record from the sidebar to review</p>
        </div>
      </div>

      <div id="recordDetail" class="hidden">

        <!-- RECORD OVERVIEW: always visible on select -->
        <div class="glass rounded-2xl mb-4 overflow-hidden">
          <!-- Data mismatch warning banner (shown when DB record has mixed-article content) -->
          <div id="detailMismatchBanner" class="hidden px-4 py-2 bg-orange-500/20 border-b border-orange-500/40 flex items-center gap-2 text-xs text-orange-300">
            <i class="fas fa-exclamation-triangle text-orange-400"></i>
            <span>⚠️ Data mismatch detected: some fields in this record (Caption, Rewritten Headline, or platform copy) appear to belong to a different article. This is a data integrity issue in the database — the AI pipeline may have written fields from the wrong source article. The display is correct; the underlying data needs to be regenerated.</span>
          </div>
          <!-- Header bar: nav arrows + title + status + approve/decline -->
          <div class="p-4 border-b border-white/10">
            <div class="flex items-start justify-between gap-3">
              <!-- Prev/Next navigation -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="navigateRecord(-1)" title="Previous record" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500 flex items-center justify-center transition-all text-gray-400 hover:text-amber-400">
                  <i class="fas fa-chevron-left text-sm"></i>
                </button>
                <span id="recordPosition" class="text-xs text-gray-500 font-mono min-w-[3rem] text-center">– / –</span>
                <button onclick="navigateRecord(1)" title="Next record" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500 flex items-center justify-center transition-all text-gray-400 hover:text-amber-400">
                  <i class="fas fa-chevron-right text-sm"></i>
                </button>
              </div>
              <div class="flex-1 min-w-0">
                <h2 id="detailTitle" class="text-xl font-bold leading-snug mb-1">Headline</h2>
                <span id="detailStatus" class="status-badge status-needs-approval hidden">Status</span>
              </div>
              <div id="actionButtons" class="flex gap-2 flex-shrink-0">
                <button onclick="approveRecord()" class="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded font-medium text-sm whitespace-nowrap">
                  <i class="fas fa-check mr-1"></i>Approve
                </button>
                <button onclick="declineRecord()" class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded font-medium text-sm whitespace-nowrap">
                  <i class="fas fa-times mr-1"></i>Decline
                </button>
                <button id="reEnrichBtn" onclick="reEnrichRecord()" class="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded font-medium text-sm whitespace-nowrap">
                  <i class="fas fa-sync-alt mr-1"></i>Re-Enrich
                </button>
              </div>
              <!-- Re-Enrich status message (shown below the button row) -->
              <div id="reEnrichStatus" class="hidden w-full mt-2 text-xs px-1"></div>
            </div>
          </div>

          <!-- Image + meta row -->
          <div class="flex gap-4 p-4 border-b border-white/10">
            <!-- Post image -->
            <div id="detailImageWrap" class="flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
              <img id="detailThumb" src="" alt="" class="w-full h-full object-cover hidden"
                   onerror="this.classList.add('hidden'); document.getElementById('detailThumbFallback').classList.remove('hidden');">
              <div id="detailThumbFallback" class="text-center">
                <i class="fas fa-image text-gray-600 text-2xl"></i>
              </div>
            </div>
            <!-- Key meta fields -->
            <div class="flex-1 min-w-0 flex flex-col gap-2">
              <div id="detailLeadWrap" class="hidden">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Lead</p>
                <p id="detailLead" class="text-sm text-gray-200 leading-snug"></p>
              </div>
              <div id="detailCaptionWrap" class="hidden">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Caption</p>
                <p id="detailCaption" class="text-sm text-gray-200 leading-snug"></p>
              </div>
              <div id="detailRewrittenWrap" class="hidden">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Rewritten Headline</p>
                <p id="detailRewritten" class="text-sm text-amber-300 font-medium leading-snug"></p>
              </div>
            </div>
          </div>

          <!-- Why It Matters + Source row -->
          <div class="p-4 flex flex-col gap-3">
            <div id="detailWhyWrap" class="hidden">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Why It Matters</p>
              <p id="detailWhy" class="text-sm text-gray-300 leading-relaxed"></p>
            </div>
            <div id="detailSourceWrap" class="hidden">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</p>
              <p id="detailSource" class="text-sm text-blue-400 break-all"></p>
            </div>
          </div>

          <!-- hidden containers kept for backward compatibility with other code -->
          <span id="detailTitlePreview" class="hidden"></span>
          <span id="detailSubtitle" class="hidden"></span>
          <div id="dynamicFieldsContainer" class="hidden"></div>
          <div id="recordDetailsContent"></div>
        </div>

        <!-- IMAGE PROMPT SECTION in Content Review -->
        <div class="glass rounded-2xl mb-4 overflow-hidden">
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold flex items-center gap-2">
                <i class="fas fa-wand-magic-sparkles text-purple-400"></i>
                Image Prompt
              </h3>
              <div class="flex items-center gap-3">
                <button id="reviewGeneratePromptBtn" onclick="generateAIImagePrompt()" class="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <i class="fas fa-robot"></i>
                  <span>Generate Prompt</span>
                </button>
                <span id="reviewPromptStatus" class="text-xs text-gray-500 hidden"></span>
              </div>
            </div>
            <textarea
              id="reviewImagePrompt"
              rows="4"
              placeholder="Click Generate Prompt to create an image prompt from this headline..."
              class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 resize-y focus:outline-none focus:border-purple-500 transition-colors"
            ></textarea>
          </div>
        </div>

        <!-- SOCIAL CONTENT SECTION - always shown for Articles -->
        <div id="socialContentSection" class="glass rounded-2xl overflow-hidden">
          <!-- Collapsible Header -->
          <div class="p-4 cursor-pointer flex items-center justify-between border-b border-white/10" onclick="toggleSocialContent()">
            <div class="flex items-center gap-3">
              <i class="fas fa-share-alt text-amber-500"></i>
              <h3 class="font-semibold">Platform Content</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">Auto-saves on edit</span>
              <button onclick="event.stopPropagation(); expandSocialContent()" title="Expand to full screen" class="text-gray-400 hover:text-amber-500 transition-colors">
                <i class="fas fa-expand"></i>
              </button>
              <i id="socialContentToggle" class="fas fa-chevron-up text-gray-400 transition-transform"></i>
            </div>
          </div>
          
          <!-- Collapsible Content -->
          <div id="socialContentBody" class="p-6">
          
          <!-- Tabs - Larger -->
          <div class="flex border-b border-white/10 mb-6 overflow-x-auto gap-1">
            <button onclick="showTab('twitter')" class="tab-btn tab-active px-4 py-3 text-base whitespace-nowrap" data-tab="twitter">
              <i class="fab fa-twitter mr-2"></i>Twitter/X
            </button>
            <button onclick="showTab('threads')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="threads">
              <i class="fab fa-threads mr-2"></i>Threads
            </button>
            <button onclick="showTab('bluesky')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="bluesky">
              <i class="fas fa-cloud mr-2"></i>Bluesky
            </button>
            <button onclick="showTab('linkedin')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="linkedin">
              <i class="fab fa-linkedin mr-2"></i>LinkedIn
            </button>
            <button onclick="showTab('facebook')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="facebook">
              <i class="fab fa-facebook mr-2"></i>Facebook
            </button>
            <button onclick="showTab('instagram')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="instagram">
              <i class="fab fa-instagram mr-2"></i>Instagram
            </button>
            <button onclick="showTab('blog')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="blog">
              <i class="fas fa-blog mr-2"></i>Blog
            </button>
            <button onclick="showTab('script')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="script">
              <i class="fas fa-video mr-2"></i>Script
            </button>
          </div>
          
          <div id="tabContent">
            <div id="tab-twitter" class="tab-panel">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">Max 280 characters | <span id="twitterCount" class="text-amber-500 font-semibold">0</span>/280</span>
                <button onclick="copyContent('twitter')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentTwitter" data-field="Twitter Copy" rows="8" maxlength="280"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field fococus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 200px;"
                oninput="document.getElementById('twitterCount').textContent = this.value.length"></textarea>
            </div>
            <div id="tab-threads" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">100-150 words recommended</span>
                <button onclick="copyContent('threads')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentThreads" data-field="Threads Copy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-bluesky" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">Max 300 characters | <span id="blueskyCount" class="text-amber-500 font-semibold">0</span>/300</span>
                <button onclick="copyContent('bluesky')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentBluesky" data-field="Bluesky Copy" rows="8" maxlength="300"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 200px;"
                oninput="document.getElementById('blueskyCount').textContent = this.value.length"></textarea>
            </div>
            <div id="tab-linkedin" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">150-200 words, professional tone</span>
                <button onclick="copyContent('linkedin')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentLinkedin" data-field="LinkedIn Copy" rows="15"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 350px;"></textarea>
            </div>
            <div id="tab-facebook" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">100-150 words</span>
                <button onclick="copyContent('facebook')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentFacebook" data-field="Facebook Copy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-instagram" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">80-125 words with hashtags</span>
                <button onclick="copyContent('instagram')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentInstagram" data-field="Instagram Copy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-blog" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">400-600 words</span>
                <button onclick="copyContent('blog')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentBlog" data-field="Blog Copy" rows="20"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 450px;"></textarea>
            </div>
            <div id="tab-script" class="tab-panel hidden">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-500">30-45 second video script</span>
                <button onclick="copyContent('script')" class="text-xs text-amber-500 hover:text-amber-400">
                  <i class="fas fa-copy mr-1"></i>Copy
                </button>
              </div>
              <textarea id="contentScript" data-field="Short Script" rows="5"
                class="w-full bg-white/5 border border-white/10 rounded p-2 text-sm resize-y editable-field"></textarea>
            </div>
          </div>
          </div><!-- End socialContentBody -->
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CONTENT CALENDAR SECTION -->
    <!-- ============================================ -->
    <div class="glass rounded-2xl p-4 mb-4 mt-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-calendar-alt text-amber-500"></i>
          Content Calendar
        </h2>
        <div class="flex items-center gap-2">
          <button onclick="prevMonth()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span id="calendarMonthYear" class="text-lg font-semibold min-w-[160px] text-center">January 2026</span>
          <button onclick="nextMonth()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button onclick="goToToday()" class="ml-2 px-3 py-1 text-sm bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
            Today
          </button>
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="calendar-container">
        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div class="text-center text-xs text-gray-500 font-semibold py-2">SUN</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">MON</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">TUE</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">WED</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">THU</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">FRI</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">SAT</div>
        </div>
        <!-- Calendar Days -->
        <div id="calendarGrid" class="grid grid-cols-7 gap-1">
          <!-- Days will be rendered here -->
        </div>
      </div>
      
      <!-- Ready to Schedule Queue -->
      <div class="mt-4 pt-4 border-t border-white/10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <i class="fas fa-clock text-purple-400"></i>
            Ready to Schedule
            <span id="readyToScheduleCount" class="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">0</span>
          </h3>
          <span class="text-xs text-gray-500">Drag to calendar to schedule</span>
        </div>
        <div id="readyToScheduleQueue" class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width: thin; scrollbar-color: #a855f7 rgba(255, 255, 255, 0.1);">
          <p class="text-gray-500 text-sm p-4 text-center w-full">No posts ready to schedule</p>
        </div>
      </div>
    </div>
    
    <!-- Schedule Modal -->
    <div id="scheduleModal" class="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center p-4">
      <div class="glass rounded-2xl p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Schedule Post</h3>
          <button onclick="closeScheduleModal()" class="text-gray-400 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div id="scheduleModalContent">
          <!-- Content will be rendered here -->
        </div>
      </div>
    </div>

  </div>

  <input type="file" id="fileInput" accept="image/*" class="hidden" onchange="handleFileUpload(event)">
  <!-- ratioFileInput removed - now using unified fileInput for all reference uploads -->

  <script>
    // ========================================
    // CONFIGURATION
    // ========================================
    const NOCODB_TOKEN = '${(c.env || {}).NOCODB_TOKEN || EXTENSION_NOCODB_TOKEN}';

    // Card image error handler - called from onerror attribute
    // Replaces broken img with a clean placeholder while preserving container height
    function handleCardImgError(imgEl) {
      var container = imgEl.parentNode;
      if (!container) return;
      var placeholder = document.createElement('div');
      placeholder.className = 'card-img-placeholder';
      placeholder.innerHTML = '<i class="fas fa-image text-gray-600 text-2xl"></i><span class="text-xs text-gray-600" style="margin-top:4px">No preview</span>';
      container.style.border = '1px solid rgba(255,255,255,0.05)';
      container.replaceChild(placeholder, imgEl);
    }
    
    const referenceCategories = [
      { id: 'face', name: 'Face', icon: 'fa-user-circle', default: 'https://iili.io/fM9hV6B.png', order: 1 },
      { id: 'outfit', name: 'Outfit', icon: 'fa-tshirt', default: '', order: 2 },
      { id: 'background', name: 'Background', icon: 'fa-image', default: '', order: 3 },
      { id: 'logo', name: 'Logo', icon: 'fa-crown', default: 'https://iili.io/fEiEfUB.png', order: 4 },
      { id: 'props', name: 'Props', icon: 'fa-cube', default: '', order: 5 },
      { id: 'custom', name: 'Custom', icon: 'fa-magic', default: '', order: 6 },
      { id: 'pose', name: 'Pose', icon: 'fa-walking', default: '', order: 7 },
      { id: 'mood', name: 'Mood', icon: 'fa-palette', default: '', order: 8 }
    ];

    // Fields to skip/handle specially
    const SKIP_FIELDS = ['Status', 'ID', 'Record ID', 'Generate Image', 'goToArticle', 'Start date', 'Date Posted', 'Date Created', 'datePosted', 'Calculation', 'Created', 'Last Modified'];
    const SOCIAL_FIELDS = ['Twitter Copy', 'Threads Copy', 'Bluesky Copy', 'LinkedIn Copy', 'Facebook Copy', 'Instagram Copy', 'Blog Copy', 'Short Script'];
    const IMAGE_FIELD_TYPES = ['multipleAttachments', 'singleAttachment'];

    // Category-based image prompt settings for Angel
    const CATEGORY_SETTINGS = {
      'crypto_regulation': {
        setting: 'standing confidently outside a courthouse or government building with classical columns',
        mood: 'professional and authoritative',
        outfit: 'tailored navy blue power suit with subtle gold accessories',
        lighting: 'bright daylight with dramatic shadows from the columns'
      },
      'bitcoin_adoption': {
        setting: 'in a modern retail environment with Bitcoin ATM or crypto payment terminal visible',
        mood: 'approachable and optimistic',
        outfit: 'smart casual blazer over a stylish top with designer jeans',
        lighting: 'warm inviting retail lighting'
      },
      'macro_market': {
        setting: 'at a sleek trading desk with multiple monitors showing charts and market data',
        mood: 'analytical and focused',
        outfit: 'sophisticated business attire with a modern edge',
        lighting: 'cool blue ambient light from monitors mixed with soft office lighting'
      },
      'self_banking': {
        setting: 'in a cozy but modern home office with laptop and smartphone showing crypto apps',
        mood: 'empowering and relatable',
        outfit: 'elevated casual wear - cashmere sweater or elegant loungewear',
        lighting: 'warm natural light from a window'
      },
      'infra_dev': {
        setting: 'in an elegant executive office with floor-to-ceiling windows overlooking a city skyline, subtle tech elements like a sleek laptop and tablet on a mahogany desk',
        mood: 'sophisticated and visionary',
        outfit: 'Ralph Lauren classic business attire - tailored blazer in navy or camel, crisp white blouse, elegant gold jewelry, polished and timeless American luxury style',
        lighting: 'warm golden hour sunlight streaming through windows with soft ambient office lighting'
      },
      'default': {
        setting: 'in a professional studio setting with subtle crypto-themed background elements',
        mood: 'confident and educational',
        outfit: 'stylish professional attire that commands attention',
        lighting: 'professional studio lighting with subtle amber accents'
      }
    };

    // AI-specific category settings for image generation
    const CATEGORY_SETTINGS_AI = {
      'ai_models': {
        setting: 'in a sleek, futuristic tech lab with holographic AI model visualizations and neural network diagrams floating around her',
        mood: 'innovative and cutting-edge',
        outfit: 'modern tech-chic blazer with clean lines, paired with a minimalist smart watch and subtle LED-accent accessories',
        lighting: 'cool blue and purple ambient lighting with holographic reflections'
      },
      'ai_regulation': {
        setting: 'in a sophisticated government hearing room or policy think tank with AI ethics guidelines displayed on screens behind her',
        mood: 'authoritative and thoughtful',
        outfit: 'tailored power suit in deep charcoal with a statement brooch, projecting authority and intelligence',
        lighting: 'formal bright lighting with warm accents from wooden paneling'
      },
      'ai_workplace': {
        setting: 'in a modern open-plan office where humans and AI assistants collaborate, with productivity dashboards and AI tools visible on screens',
        mood: 'empowering and forward-thinking',
        outfit: 'smart business casual - elegant knit top with tailored pants, balancing approachability and professionalism',
        lighting: 'natural daylight from large windows mixed with modern office LED lighting'
      },
      'ai_research': {
        setting: 'in a cutting-edge research facility with whiteboards full of equations, brain-computer interface prototypes, and scientific visualization screens',
        mood: 'intellectually curious and pioneering',
        outfit: 'stylish lab coat over a designer turtleneck, with smart glasses perched elegantly',
        lighting: 'clean white lab lighting with occasional blue laser accents'
      },
      'ai_products': {
        setting: 'at a sleek product launch event or demo stage with the latest AI-powered devices and apps displayed around her',
        mood: 'excited and consumer-friendly',
        outfit: 'trendy tech founder look - elevated casual with statement sneakers and a designer crossbody',
        lighting: 'dramatic stage lighting with spotlights and warm product display glow'
      },
      'ai_ethics': {
        setting: 'in a contemplative setting balancing nature and technology - perhaps a glass-walled meditation room overlooking a city with subtle digital elements',
        mood: 'reflective and balanced',
        outfit: 'flowing elegant blouse with structured pants, balancing softness with strength',
        lighting: 'golden hour natural light mixed with soft digital screen ambiance'
      },
      'ai_robotics': {
        setting: 'in an advanced robotics lab with humanoid robots and robotic arms, standing confidently among the machines as a human guide',
        mood: 'bold and futuristic',
        outfit: 'sleek futuristic athleisure with metallic accents, projecting a sci-fi editorial vibe',
        lighting: 'industrial lighting with neon accents and metallic reflections from robot surfaces'
      },
      'default': {
        setting: 'in a professional studio setting with subtle AI and technology-themed background elements like circuit patterns and neural network visualizations',
        mood: 'confident and educational',
        outfit: 'stylish professional attire that commands attention with modern tech-inspired accessories',
        lighting: 'professional studio lighting with cool blue and purple accents'
      }
    };

    // Get category settings based on current topic
    function getCategorySettings(category) {
      if (currentTopic === 'ai') {
        return CATEGORY_SETTINGS_AI[category] || CATEGORY_SETTINGS_AI['default'];
      }
      return CATEGORY_SETTINGS[category] || CATEGORY_SETTINGS['default'];
    }

    // Generate image prompt based on headline and category
    // Local fallback prompt — used only when no saved ImagePrompt exists
    // and the GPT-4o API hasn't been called yet. Provides a basic placeholder
    // based on the headline. Click "Generate Prompt" for a context-aware prompt.
    function generateImagePrompt(headline, category) {
      return 'Click "Generate Prompt" for an AI-generated image prompt for: ' + headline;
    }

    // Generate image prompt using GPT-4o API
    async function generateAIPrompt() {
      // Delegate to the unified context-aware prompt generator
      // This ensures both buttons produce the same article-specific prompt
      return generateAIImagePrompt();
    }
    
    // Generate image prompt via GPT-4o using /api/generate-image-prompt
    async function generateAIImagePrompt() {
      if (!currentRecord) {
        alert('Select a record first');
        return;
      }
      const f = currentRecord.fields || {};
      const sourceHeadline = f.Headline || f.sourceHeadline || f.Title || '';
      const sourceSummary = f.Lead || f.Body || f.Summary || '';
      const category = f.category || (currentTopic === 'ai' ? 'AI/technology' : 'crypto');
      const whyItMatters = f['Why It Matters'] || f.whyItMatters || '';

      if (!sourceHeadline) {
        alert('No headline found on selected record');
        return;
      }

      const btn = document.getElementById('reviewGeneratePromptBtn');
      const textarea = document.getElementById('reviewImagePrompt');
      const statusEl = document.getElementById('reviewPromptStatus');
      const origHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      statusEl.textContent = 'Generating prompt...';
      statusEl.classList.remove('hidden');

      // Also disable and show spinner on the top Generate Prompt button
      const topBtn = document.getElementById('generatePromptBtn');
      var topOrigHTML = topBtn ? topBtn.innerHTML : '';
      if (topBtn) { topBtn.disabled = true; topBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'; }

      try {
        const res = await fetch('/api/generate-image-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceHeadline, sourceSummary, category, whyItMatters })
        });
        const data = await res.json();
        if (data.error) {
          textarea.value = 'Error: ' + data.error;
          statusEl.textContent = 'Error';
          return;
        }
        // Update BOTH prompt areas with the same context-aware prompt
        textarea.value = data.prompt;
        statusEl.textContent = data.prompt.length + ' chars';
        const mainPromptInput = document.getElementById('promptInput');
        if (mainPromptInput) {
          mainPromptInput.value = data.prompt;
          document.getElementById('charCount').textContent = data.prompt.length + ' characters';
        }
      } catch (err) {
        console.error('Generate image prompt error:', err);
        textarea.value = 'Error: ' + err.message;
        statusEl.textContent = 'Failed';
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
        if (topBtn) { topBtn.disabled = false; topBtn.innerHTML = topOrigHTML; }
      }
    }

    // Navigate to previous/next record
    function navigateRecord(direction) {
      if (!allRecords.length || !currentRecordId) return;
      const currentIndex = allRecords.indexOf(currentRecordId);
      if (currentIndex === -1) return;
      const newIndex = currentIndex + direction;
      if (newIndex < 0 || newIndex >= allRecords.length) return;
      const newId = allRecords[newIndex];
      // Find and click the corresponding card to trigger selectRecord with proper highlighting
      const cards = document.querySelectorAll('.record-card');
      if (cards[newIndex]) {
        cards[newIndex].click();
        // Scroll the card into view
        cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        // Fallback: call selectRecord directly
        selectRecord(newId);
      }
    }

    // Toggle headline input visibility and regenerate prompt
    function onHeadlineToggleChange() {
      const isChecked = document.getElementById('addHeadlineText').checked;
      const container = document.getElementById('headlineInputContainer');
      container.classList.toggle('hidden', !isChecked);
      
      // Auto-enable logo reference for current ratio when headline is on
      if (isChecked && references['logo']) {
        const ratio = currentAspectRatio;
        if (references['logo'][ratio]) {
          references['logo'][ratio].enabled = true;
        }
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
      
      // Regenerate prompt if we have a current record
      if (currentRecord) {
        const f = currentRecord.fields || {};
        const headline = f.sourceHeadline || f.Title || f.Headline || '';
        const category = f.category || 'default';
        if (headline) {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }
      }
    }
    
    // Update prompt when headline text is edited
    function updatePromptWithHeadline() {
      if (currentRecord) {
        const f = currentRecord.fields || {};
        const headline = f.sourceHeadline || f.Title || f.Headline || '';
        const category = f.category || 'default';
        if (headline) {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }
      }
    }
    
    // Create shortened headline from full headline
    function createShortHeadline(fullHeadline) {
      if (!fullHeadline) return '';
      // Cut at common break words to create shorter version
      const shortened = fullHeadline.split(/\\s+(as|after|while|amid|following|despite|because|when|where|how|why)\\s+/i)[0].trim();
      // Limit length
      if (shortened.length > 60) {
        return shortened.substring(0, 57) + '...';
      }
      return shortened;
    }
    
    // Format headline text for different aspect ratios
    function formatHeadlineForRatio(headline, ratio) {
      if (!headline) return '';
      
      const words = headline.trim().split(/\s+/);
      
      if (ratio === '16:9') {
        // Wide format - can fit more words per line (8-10 words)
        // If short enough, keep as single line
        if (words.length <= 8) {
          return headline;
        }
        // Otherwise split into 2 lines
        const midpoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midpoint).join(' ');
        const line2 = words.slice(midpoint).join(' ');
        return line1 + '\\n' + line2;
        
      } else if (ratio === '9:16') {
        // Narrow vertical format - only 3-4 words per line
        const lines = [];
        const wordsPerLine = 3;
        for (let i = 0; i < words.length; i += wordsPerLine) {
          lines.push(words.slice(i, i + wordsPerLine).join(' '));
        }
        return lines.join('\\n');
        
      } else if (ratio === '1:1') {
        // Square format - 4-5 words per line
        const lines = [];
        const wordsPerLine = 4;
        for (let i = 0; i < words.length; i += wordsPerLine) {
          lines.push(words.slice(i, i + wordsPerLine).join(' '));
        }
        return lines.join('\\n');
      }
      
      return headline;
    }
    
    // Extract visual concepts from headline (no text rendering)
    function extractVisualContext(headline) {
      const h = headline.toLowerCase();
      let context = [];
      
      if (currentTopic === 'ai') {
        // AI-specific visual context
        if (h.includes('gpt') || h.includes('chatgpt') || h.includes('openai')) context.push('conversational AI interface elements with chat bubbles');
        if (h.includes('claude') || h.includes('anthropic')) context.push('clean, thoughtful AI interface design');
        if (h.includes('gemini') || h.includes('google')) context.push('colorful AI visualization with Google-inspired palette');
        if (h.includes('llm') || h.includes('language model') || h.includes('foundation model')) context.push('neural network visualization with interconnected nodes');
        if (h.includes('robot') || h.includes('humanoid')) context.push('sleek robotic elements and mechanical components');
        if (h.includes('autonomous') || h.includes('self-driving')) context.push('futuristic autonomous vehicle or drone imagery');
        if (h.includes('image') || h.includes('video') || h.includes('generat')) context.push('creative AI-generated visual art elements');
        if (h.includes('chip') || h.includes('nvidia') || h.includes('gpu') || h.includes('hardware')) context.push('advanced computing hardware with glowing circuits');
        if (h.includes('regulation') || h.includes('govern') || h.includes('policy') || h.includes('law') || h.includes('ban')) context.push('formal policy/government setting with tech elements');
        if (h.includes('safety') || h.includes('alignment') || h.includes('ethics') || h.includes('bias')) context.push('balanced harmony between technology and human values');
        if (h.includes('job') || h.includes('work') || h.includes('employ') || h.includes('replac')) context.push('workplace transformation with human-AI collaboration');
        if (h.includes('education') || h.includes('learn') || h.includes('school') || h.includes('student')) context.push('modern classroom with AI-enhanced learning tools');
        if (h.includes('healthcare') || h.includes('medical') || h.includes('drug') || h.includes('diagnos')) context.push('medical AI interface with health data visualizations');
        if (h.includes('agent') || h.includes('automat')) context.push('AI agent workflow with interconnected automated processes');
        if (h.includes('open source') || h.includes('meta') || h.includes('llama')) context.push('community-driven open technology collaboration');
        if (h.includes('startup') || h.includes('funding') || h.includes('billion') || h.includes('invest')) context.push('dynamic tech startup energy with growth indicators');
        if (h.includes('breakthrough') || h.includes('discover') || h.includes('research')) context.push('scientific discovery atmosphere with eureka moment energy');
        
        return context.length > 0 ? context.join(', ') : 'general artificial intelligence and technology innovation theme';
      }
      
      // Crypto-specific visual context (original)
      if (h.includes('bitcoin') || h.includes('btc')) context.push('Bitcoin imagery like gold coins or subtle orange accents');
      if (h.includes('ethereum') || h.includes('eth')) context.push('Ethereum-inspired purple/blue color accents');
      if (h.includes('crypto')) context.push('cryptocurrency visual elements');
      
      // Market/financial
      if (h.includes('price') || h.includes('market') || h.includes('surge') || h.includes('rally')) context.push('upward trending visual energy');
      if (h.includes('crash') || h.includes('drop') || h.includes('fall')) context.push('dramatic serious mood');
      if (h.includes('bull') || h.includes('bullish')) context.push('confident optimistic energy');
      if (h.includes('bear') || h.includes('bearish')) context.push('cautious analytical mood');
      
      // Regulation/government
      if (h.includes('regulation') || h.includes('sec') || h.includes('government') || h.includes('law')) context.push('formal authoritative setting');
      if (h.includes('ban') || h.includes('restrict')) context.push('serious concerned expression');
      if (h.includes('approve') || h.includes('legal')) context.push('positive professional atmosphere');
      
      // Adoption/mainstream
      if (h.includes('adopt') || h.includes('accept') || h.includes('payment')) context.push('mainstream everyday setting');
      if (h.includes('bank') || h.includes('institution')) context.push('corporate financial environment');
      
      // Technology
      if (h.includes('network') || h.includes('upgrade') || h.includes('launch')) context.push('tech-forward innovative feel');
      if (h.includes('hack') || h.includes('security') || h.includes('breach')) context.push('serious cybersecurity atmosphere');
      
      // Return combined context or default
      return context.length > 0 ? context.join(', ') : 'general cryptocurrency and financial education theme';
    }

    // ========================================
    // STATE
    // ========================================
    let bases = [];
    let currentBase = null;
    let tables = [];
    let currentTable = null;
    let tableFields = [];
    // Each category now has per-size images: { face: { '16:9': {url, enabled}, '9:16': {url, enabled}, '1:1': {url, enabled} }, ... }
    let references = {};
    let currentAspectRatio = '16:9';
    let generationHistory = [];
    let currentUploadSlot = null; // Format: 'categoryId-ratio' e.g., 'face-16:9'
    let lastGeneratedUrl = null;
    let lastGeneratedRatio = '16:9';
    let currentRecordId = null;
    let currentRecord = null;
    let allRecords = [];  // Tracks all loaded record IDs for prev/next navigation
    let saveTimeout = null;
    let contentImages = { '16:9': null, '9:16': null, '1:1': null };
    let expandedCategories = {}; // Track which categories are expanded
    let currentTopic = 'crypto'; // 'crypto' or 'ai' - auto-detected from table name

    // ========================================
    // INITIALIZATION
    // ========================================
    async function init() {
      // Load bases
      await loadBases();
      
      // Load saved references (new per-size format)
      const saved = localStorage.getItem('imageGenReferencesV2');
      if (saved) {
        references = JSON.parse(saved);
      } else {
        // Try to migrate from old format
        const oldSaved = localStorage.getItem('imageGenReferences');
        if (oldSaved) {
          const oldRefs = JSON.parse(oldSaved);
          // Migrate old single-image format to new per-size format
          referenceCategories.forEach(cat => {
            const oldRef = oldRefs[cat.id];
            references[cat.id] = {
              '16:9': { url: (oldRef || {}).url || cat.default || '', enabled: (oldRef || {}).enabled || (cat.default ? true : false) },
              '9:16': { url: '', enabled: false },
              '1:1': { url: '', enabled: false }
            };
          });
        } else {
          // Initialize with defaults
          referenceCategories.forEach(cat => {
            references[cat.id] = {
              '16:9': { url: cat.default || '', enabled: cat.default ? true : false },
              '9:16': { url: '', enabled: false },
              '1:1': { url: '', enabled: false }
            };
          });
        }
        saveReferences(); // Save in new format
      }

      // Load history
      const savedHistory = localStorage.getItem('imageGenHistory');
      if (savedHistory) {
        generationHistory = JSON.parse(savedHistory);
      }
      
      // Initialize expanded state - Face, Outfit, Background, Logo expanded by default
      const defaultExpanded = ['face', 'outfit', 'background', 'logo'];
      referenceCategories.forEach(cat => {
        expandedCategories[cat.id] = defaultExpanded.includes(cat.id);
      });

      renderReferenceGridExpanded();
      renderHistory();
      updateActiveCount();
      setupPromptCounter();
      
      // Initialize calendar with empty state
      renderCalendar();
    }

    // ========================================
    // BASE & TABLE LOADING
    // ========================================
    async function loadBases() {
      const selector = document.getElementById('baseSelector');
      selector.innerHTML = '<option value="">Loading bases...</option>';
      
      try {
        const res = await fetch('/api/bases', {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'API error'));
        }
        
        // Check if we're using cached data
        const isCached = data._cached;
        const cacheStale = data._cacheStale;
        const cacheError = data._error;
        
        bases = data.bases || [];
        console.log('Loaded ' + bases.length + ' bases' + (isCached ? ' (from cache)' : '') + ':', bases.map(b => b.name));
        
        // Show subtle indicator if using cached/stale data
        if (isCached && cacheStale) {
          console.warn('Using stale cached bases data:', cacheError);
          updateDebugPanel({ warning: 'Using cached data (API temporarily unavailable)', bases: bases.length });
        }
        
        if (bases.length === 0) {
          selector.innerHTML = '<option value="">No bases found</option>';
          return;
        }
        
        // Sort alphabetically
        bases.sort((a, b) => a.name.localeCompare(b.name));
        
        // Build dropdown with all bases
        const optionsHtml = bases.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
        selector.innerHTML = '<option value="">-- Select a Base --</option>' + optionsHtml;
        
        // Default to FifthAveAI VPS base (Articles table project) if available
        const defaultBase = bases.find(b => b.id === 'prs1ubx2662cbv6');
        if (defaultBase) {
          console.log('Defaulting to FifthAveAI VPS base:', defaultBase.id);
          selector.value = defaultBase.id;
          await onBaseChange();
        } else if (bases.length > 0) {
          // Fallback to first available base
          selector.value = bases[0].id;
          await onBaseChange();
        }
      } catch (err) {
        selector.innerHTML = '<option value="">Unable to load bases</option>';
        console.error('Failed to load bases:', err);
        updateDebugPanel('Error: ' + err.message);
        
        // Elegant inline error for bases too
        const errorDiv = document.createElement('div');
        errorDiv.id = 'baseLoadError';
        errorDiv.className = 'mt-3 p-4 rounded-xl border border-amber-500/30 bg-amber-900/20 backdrop-blur-sm';
        const isRateLimit = err.message && err.message.includes('429');
        const messageText = isRateLimit ? 'Allow a brief pause, then refresh the page.' : 'Please refresh to reconnect.';
        errorDiv.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-crown" style="color:#fbbf24;font-size:14px"></i></div><div><p style="font-size:14px;font-weight:500;color:#fcd34d;margin-bottom:4px">Connection Interrupted</p><p style="font-size:12px;color:rgba(252,211,77,0.8);line-height:1.5">The NocoDB connection is momentarily crowded. ' + messageText + '</p></div></div>';
        
        const container = selector.closest('.glass') || selector.parentElement;
        const existingError = document.getElementById('baseLoadError');
        if (existingError) existingError.remove();
        if (container) container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
          errorDiv.style.opacity = '0';
          errorDiv.style.transition = 'opacity 0.5s ease';
          setTimeout(() => errorDiv.remove(), 500);
        }, 8000);
      }
    }
    
    // Debug panel functions
    function toggleDebugPanel() {
      const panel = document.getElementById('debugPanel');
      panel.classList.toggle('hidden');
    }
    
    function updateDebugPanel(content) {
      const debugContent = document.getElementById('debugContent');
      if (typeof content === 'object') {
        debugContent.innerHTML = '<pre>' + JSON.stringify(content, null, 2) + '</pre>';
      } else {
        debugContent.innerHTML = content;
      }
    }

    async function onBaseChange() {
      const baseId = document.getElementById('baseSelector').value;
      const tableSelector = document.getElementById('tableSelector');
      
      if (!baseId) {
        currentBase = null;
        tables = [];
        tableSelector.innerHTML = '<option value="">Select a base first</option>';
        document.getElementById('recordsList').innerHTML = '<p class="text-gray-500 text-sm p-4 text-center">Select a base and table</p>';
        return;
      }
      
      currentBase = bases.find(b => b.id === baseId);
      console.log('Base changed to:', (currentBase || {}).name || 'Unknown', 'ID:', baseId);
      
      tableSelector.innerHTML = '<option value="">Loading tables...</option>';
      
      try {
        const res = await fetch(\`/api/bases/\${baseId}/tables\`, {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'API error loading tables'));
        }
        
        // Check if we're using cached data
        const tablesCached = data._cached;
        const tablesCacheStale = data._cacheStale;
        
        tables = data.tables || [];
        console.log('Loaded ' + tables.length + ' tables' + (tablesCached ? ' (from cache)' : '') + ' for base ' + ((currentBase || {}).name || 'Unknown') + ':', tables.map(t => t.name));
        
        // Show debug info if using cached/stale data
        if (tablesCached && tablesCacheStale) {
          console.warn('Using stale cached tables data:', data._error);
        }
        
        if (tables.length === 0) {
          tableSelector.innerHTML = '<option value="">No tables found</option>';
          return;
        }
        
        tableSelector.innerHTML = '<option value="">-- Select a Table --</option>' +
          tables.map(t => '<option value="' + t.id + '">' + t.name + '</option>').join('');

        // Auto-select "APR" table if available, otherwise select first table
        const aprTable = tables.find(t => t.name === 'APR');
        if (aprTable) {
          console.log('Auto-selecting APR table:', aprTable.id);
          tableSelector.value = aprTable.id;
        } else {
          console.log('APR table not found, selecting first table:', tables[0].name);
          tableSelector.value = tables[0].id;
        }
        await onTableChange();
      } catch (err) {
        tableSelector.innerHTML = '<option value="">Unable to load tables</option>';
        console.error('Failed to load tables:', err);
        
        // Elegant inline error instead of ugly alert
        const errorDiv = document.createElement('div');
        errorDiv.id = 'tableLoadError';
        errorDiv.className = 'mt-3 p-4 rounded-xl border border-red-500/30 bg-red-900/20 backdrop-blur-sm';
        const isRateLimit = err.message && err.message.includes('429');
        const messageText = isRateLimit ? 'Please wait a moment, then select your base again.' : 'Please refresh and try again.';
        errorDiv.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-gem" style="color:#f87171;font-size:14px"></i></div><div><p style="font-size:14px;font-weight:500;color:#fca5a5;margin-bottom:4px">A Momentary Pause</p><p style="font-size:12px;color:rgba(252,165,165,0.8);line-height:1.5">The NocoDB rate limit has been reached. ' + messageText + '</p></div></div>';
        
        // Insert after the table selector container
        const container = tableSelector.closest('.glass') || tableSelector.parentElement;
        const existingError = document.getElementById('tableLoadError');
        if (existingError) existingError.remove();
        if (container) container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          errorDiv.style.opacity = '0';
          errorDiv.style.transition = 'opacity 0.5s ease';
          setTimeout(() => errorDiv.remove(), 500);
        }, 8000);
      }
    }

    async function onTableChange() {
      const tableId = document.getElementById('tableSelector').value;
      
      if (!tableId) {
        currentTable = null;
        tableFields = [];
        document.getElementById('recordsList').innerHTML = '<p class="text-gray-500 text-sm p-4 text-center">Select a table</p>';
        return;
      }
      
      currentTable = tables.find(t => t.id === tableId);
      console.log('onTableChange - selected tableId:', tableId, 'found table:', (currentTable || {}).name, 'id:', (currentTable || {}).id);
      tableFields = (currentTable || {}).fields || [];
      
      currentRecordId = null;
      currentRecord = null;
      
      // Reset detail view
      document.getElementById('noSelection').classList.remove('hidden');
      document.getElementById('recordDetail').classList.add('hidden');
      
      updateUIForTable();
      await loadRecords();
    }

    function updateUIForTable() {
      if (!currentTable) return;
      
      // Check if table has Status field
      const hasStatus = tableFields.some(f => f.name === 'Status');
      const statusContainer = document.getElementById('statusFilterContainer');
      const actionButtons = document.getElementById('actionButtons');
      
      if (hasStatus) {
        statusContainer.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        
        // Populate status filter with actual options
        const statusField = tableFields.find(f => f.name === 'Status');
        const statusSelect = document.getElementById('statusFilter');
        let options = '<option value="all" class="bg-black text-white">All Records</option>';
        
        if (((statusField || {}).options || {}).choices) {
          statusField.options.choices.forEach(choice => {
            options += \`<option value="\${choice.name}" class="bg-black text-white">\${choice.name}</option>\`;
          });
        } else {
          // Default options
          options += \`
            <option value="Needs Approval" class="bg-black text-white">Needs Approval</option>
            <option value="Approved" class="bg-black text-white">Approved</option>
            <option value="Declined" class="bg-black text-white">Declined</option>
            <option value="Posted" class="bg-black text-white">Posted</option>
          \`;
        }
        statusSelect.innerHTML = options;
      } else {
        statusContainer.classList.add('hidden');
        actionButtons.classList.add('hidden');
      }
      
      // Check for social content fields
      const hasSocialFields = tableFields.some(f => SOCIAL_FIELDS.includes(f.name));
      const socialSection = document.getElementById('socialContentSection');
      socialSection.classList.toggle('hidden', !hasSocialFields);
      
      // Auto-detect topic from table name
      const tableName = ((currentTable || {}).name || '').toLowerCase();
      if (tableName.includes('ai') || tableName.includes('artificial intelligence')) {
        currentTopic = 'ai';
      } else {
        currentTopic = 'crypto';
      }
      
      // Update topic indicator in header
      const topicIndicator = document.getElementById('topicIndicator');
      if (topicIndicator) {
        if (currentTopic === 'ai') {
          topicIndicator.innerHTML = '<i class=\"fas fa-robot mr-1\"></i>AI Mode';
          topicIndicator.className = 'text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium';
        } else {
          topicIndicator.innerHTML = '<i class=\"fab fa-bitcoin mr-1\"></i>Crypto Mode';
          topicIndicator.className = 'text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium';
        }
      }
    }

    // ========================================
    // RECORDS
    // ========================================
    async function loadRecords() {
      console.log('loadRecords called - currentBase:', (currentBase || {}).id, 'currentTable:', (currentTable || {}).id);
      if (!currentBase || !currentTable) {
        console.log('loadRecords early return - missing base or table');
        return;
      }
      
      const recordsList = document.getElementById('recordsList');
      recordsList.innerHTML = '<div class="p-4 text-center"><div class="loading-spinner mx-auto"></div></div>';
      
      const hasStatus = tableFields.some(f => f.name === 'Status');
      const filter = hasStatus ? document.getElementById('statusFilter').value : 'all';
      
      try {
        const url = \`/api/records?baseId=\${currentBase.id}&tableId=\${currentTable.id}&filter=\${encodeURIComponent(filter)}\`;
        console.log('Fetching records from:', url);
        const res = await fetch(url, {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        console.log('Records API response status:', res.status);
        const data = await res.json();
        console.log('Records data received:', data.records ? data.records.length + ' records' : 'no records', 'error:', data.error);

        if (data.error) {
          const errorMsg = typeof data.error === 'string' ? data.error : (data.error.message || 'Error loading records');
          recordsList.innerHTML = '<p class="text-red-500 text-sm p-4">' + errorMsg + '</p>';
          return;
        }
        
        const records = data.records || [];
        allRecords = records.map(r => r.id || (r.fields || {}).Id);
        console.log('Processing', records.length, 'records for rendering');
        
        // Detect available fields from first record (if available)
        const sampleFields = records.length > 0 ? Object.keys(records[0].fields || {}) : [];
        console.log('Available fields from records:', sampleFields);
        
        // Find title field - prioritize Headline (NocoDB field name), then fall back to other options
        // First check table schema, then fall back to checking record fields directly
        const titleFieldPriority = ['Headline', 'Title', 'Name', 'Topic', 'Keyword', 'Subject'];
        let titleField = null;
        
        // Try to find from table schema first
        for (const fieldName of titleFieldPriority) {
          if (tableFields.find(f => f.name === fieldName)) {
            titleField = fieldName;
            break;
          }
        }
        
        // If not found in schema, check actual record fields
        if (!titleField) {
          for (const fieldName of titleFieldPriority) {
            if (sampleFields.includes(fieldName)) {
              titleField = fieldName;
              break;
            }
          }
        }
        
        // Fallback to first available text-like field from records
        if (!titleField && sampleFields.length > 0) {
          const textLikeFields = sampleFields.filter(f => 
            !f.toLowerCase().includes('url') && 
            !f.toLowerCase().includes('link') &&
            !f.toLowerCase().includes('id') &&
            !f.toLowerCase().includes('date')
          );
          titleField = textLikeFields[0];
        }
        
        console.log('Selected titleField:', titleField, 'tableFields count:', tableFields.length, 'sampleFields:', sampleFields.length);

        // Find image attachment field - check table schema first, then record fields
        const foundImageField = tableFields.find(f => IMAGE_FIELD_TYPES.includes(f.type) && f.name.includes('Image'));
        let imageAttachmentField = foundImageField ? foundImageField.name : null;
        
        // If not in schema, check if 'Post Image Preview' exists in record fields
        if (!imageAttachmentField && sampleFields.includes('Post Image Preview')) {
          imageAttachmentField = 'Post Image Preview';
        }
        
        console.log('Image field detection:', { imageAttachmentField, hasPostImagePreview: sampleFields.includes('Post Image Preview'), hasPostImage: sampleFields.includes('Post Image') });

        const NOCODB_PROXY_BASE = '/api/nocodb-proxy/';

        // Helper to validate image URL - avoids regex with // which can be parsed as comment
        const isValidImageUrl = (url) => typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/api/')) && url.length > 12;

        // Convert a NocoDB path to a proxied URL (relative, same origin)
        const toProxyUrl = (path) => {
          if (!path) return null;
          // Remove leading slash if present
          const cleanPath = path.startsWith('/') ? path.substring(1) : path;
          return NOCODB_PROXY_BASE + cleanPath;
        };

        // Robust image URL extraction from attachment objects
        const extractImageUrl = (attachmentField) => {
          if (!attachmentField || !Array.isArray(attachmentField) || attachmentField.length === 0) {
            return null;
          }
          const img = attachmentField[0];
          if (!img || typeof img !== 'object') return null;

          // Priority order for URL extraction from attachment object:
          // 1. Direct url/signedUrl at top level
          // 2. Nested thumbnails object
          // 3. Any other URL-like property
          // Note: Using traditional property access for browser compatibility (no optional chaining)
          const thumbnails = img.thumbnails || {};
          const possibleUrls = [
            img.url,
            img.signedUrl,
            img.signedURL,
            toProxyUrl(img.path),
            toProxyUrl(img.signedPath),
            (thumbnails.large || {}).url,
            toProxyUrl((thumbnails.large || {}).signedPath),
            (thumbnails.small || {}).url,
            toProxyUrl((thumbnails.small || {}).signedPath),
            (thumbnails.full || {}).url,
            (thumbnails.card_cover || {}).url,
            toProxyUrl((thumbnails.card_cover || {}).signedPath),
            img.thumbnail
          ];

          for (const url of possibleUrls) {
            if (isValidImageUrl(url)) {
              return url;
            }
          }
          return null;
        };

        const html = records.map(r => {
          const status = r.fields.Status || '';
          const statusClass = status.replace(/\\s+/g, '-').toLowerCase();
          const title = r.fields[titleField] || r.fields.Headline || 'No headline';
          const displayTitle = typeof title === 'string' ? title : JSON.stringify(title);

          let thumbUrl = '';

          // Fallback chain: Post Image Preview (attachment) -> Post Image (URL) -> legacy imageURL -> placeholder
          if (imageAttachmentField) {
            thumbUrl = extractImageUrl(r.fields[imageAttachmentField]) || '';
          }

          // Fallback 1: Post Image field (direct URL)
          if (!isValidImageUrl(thumbUrl) && isValidImageUrl(r.fields['Post Image'])) {
            thumbUrl = r.fields['Post Image'];
          }

          // Fallback 2: legacy imageURL field
          if (!isValidImageUrl(thumbUrl) && isValidImageUrl(r.fields.imageURL)) {
            thumbUrl = r.fields.imageURL;
          }

          // Build image block: always render a fixed-height container (never collapses)
          // onerror replaces only the <img> with a placeholder div inside the container
          // so the container h-36 is preserved in all cases.
          const imgBlock = thumbUrl
            ? \`<div class="card-img-container">
                <img src="\${thumbUrl}"
                     alt="\${escapeHtml(displayTitle.substring(0, 40))}"
                     onerror="handleCardImgError(this)">
               </div>\`
            : \`<div class="card-img-container" style="border:1px solid rgba(255,255,255,0.05)">
                <div class="card-img-placeholder">
                  <i class="fas fa-image text-gray-600 text-2xl"></i>
                  <span class="text-xs text-gray-600">No image</span>
                </div>
               </div>\`;

          return \`
            <div class="record-card flex-shrink-0 w-64 p-3 rounded-xl cursor-pointer border border-white/10 hover:border-amber-500 transition-all \${currentRecordId === r.id ? 'border-amber-500 bg-amber-500/10' : 'bg-white/5'}" 
                 onclick="selectRecord('\${r.id}', event)">
              <div class="flex flex-col gap-2">
                \${imgBlock}
                <div class="min-w-0">
                  <p class="text-sm font-medium line-clamp-2 mb-1">\${escapeHtml(displayTitle.substring(0, 80))}</p>
                  \${status ? \`<span class="status-badge status-\${statusClass}">\${status}</span>\` : ''}
                </div>
              </div>
            </div>
          \`;
        }).join('');
        
        // Count images vs placeholders for debugging
        const withImages = records.filter(r => {
            const hasPreview = extractImageUrl(r.fields['Post Image Preview']);
            const hasPostImage = isValidImageUrl(r.fields['Post Image']);
            const hasLegacy = isValidImageUrl(r.fields.imageURL);
            return hasPreview || hasPostImage || hasLegacy;
          }).length;
        const withPlaceholders = records.length - withImages;
        console.log('Rendering summary: ' + withImages + ' with images, ' + withPlaceholders + ' with placeholders, total ' + records.length);
        
        console.log('Generated HTML length:', html.length, 'first 200 chars:', html.substring(0, 200));
        recordsList.innerHTML = html || '<p class="text-gray-500 text-sm p-4 text-center">No records found</p>';
        console.log('Records rendered to DOM, recordsList innerHTML length:', recordsList.innerHTML.length);

        // Also load calendar posts
        loadCalendarPosts();
      } catch (err) {
        recordsList.innerHTML = '<p class="text-red-500 text-sm p-4">Failed to load records</p>';
        console.error('Failed to load records:', err);
      }
    }

    async function selectRecord(id, event) {
      currentRecordId = id;
      
      // Highlight selected card
      document.querySelectorAll('.record-card').forEach(el => {
        el.classList.remove('border-amber-500', 'bg-amber-500/10');
        el.classList.add('border-white/10', 'bg-white/5');
      });
      if (event && event.currentTarget) {
        event.currentTarget.classList.remove('border-white/10', 'bg-white/5');
        event.currentTarget.classList.add('border-amber-500', 'bg-amber-500/10');
      }

      // ── CLEAR STALE STATE before fetching new record ─────────────
      // Wipe all detail fields immediately so previous record content
      // never bleeds through while the new record is loading.
      document.getElementById('detailTitle').textContent = '';
      document.getElementById('detailStatus').classList.add('hidden');
      document.getElementById('detailThumb').src = '';
      document.getElementById('detailThumb').classList.add('hidden');
      document.getElementById('detailThumbFallback').classList.remove('hidden');
      document.getElementById('detailLeadWrap').classList.add('hidden');
      document.getElementById('detailCaptionWrap').classList.add('hidden');
      document.getElementById('detailRewrittenWrap').classList.add('hidden');
      document.getElementById('detailWhyWrap').classList.add('hidden');
      document.getElementById('detailSourceWrap').classList.add('hidden');
      document.getElementById('detailMismatchBanner').classList.add('hidden');
      document.getElementById('contentTwitter').value  = '';
      document.getElementById('contentThreads').value  = '';
      document.getElementById('contentBluesky').value  = '';
      document.getElementById('contentLinkedin').value = '';
      document.getElementById('contentFacebook').value = '';
      document.getElementById('contentInstagram').value= '';
      document.getElementById('contentBlog').value     = '';
      document.getElementById('contentScript').value   = '';
      document.getElementById('reviewImagePrompt').value = '';
      var reviewStatusClear = document.getElementById('reviewPromptStatus');
      if (reviewStatusClear) { reviewStatusClear.classList.add('hidden'); reviewStatusClear.textContent = ''; }
      document.getElementById('twitterCount').textContent  = '0';
      document.getElementById('blueskyCount').textContent  = '0';
      
      try {
        const res = await fetch(\`/api/records/\${id}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        currentRecord = await res.json();
        const f = currentRecord.fields || {};

        document.getElementById('noSelection').classList.add('hidden');
        document.getElementById('recordDetail').classList.remove('hidden');

        // ── NAVIGATION POSITION ───────────────────────────────────
        const posIdx = allRecords.indexOf(currentRecordId);
        const posEl = document.getElementById('recordPosition');
        if (posEl && posIdx !== -1) {
          posEl.textContent = (posIdx + 1) + ' / ' + allRecords.length;
        }

        // ── REVIEW IMAGE PROMPT ───────────────────────────────────
        const reviewPromptEl = document.getElementById('reviewImagePrompt');
        const reviewStatusEl = document.getElementById('reviewPromptStatus');
        if (reviewPromptEl) {
          reviewPromptEl.value = f.ImagePrompt || f.imagePrompt || '';
          if (reviewStatusEl) {
            reviewStatusEl.textContent = (f.ImagePrompt || f.imagePrompt) ? (f.ImagePrompt || f.imagePrompt).length + ' chars' : '';
            reviewStatusEl.classList.toggle('hidden', !(f.ImagePrompt || f.imagePrompt));
          }
        }

        // ── STATUS ──────────────────────────────────────────────────
        const status = f.Status || '';
        const statusEl = document.getElementById('detailStatus');
        if (status) {
          statusEl.textContent = status;
          statusEl.className = 'status-badge status-' + status.replace(/\\s+/g, '-').toLowerCase() + ' ml-2 inline-block';
          statusEl.classList.remove('hidden');
        } else {
          statusEl.classList.add('hidden');
        }

        // ── HEADLINE ─────────────────────────────────────────────────
        const headline = f.Headline || f.Title || f.Name || 'No headline';
        document.getElementById('detailTitle').textContent = headline;
        // legacy compat
        document.getElementById('detailTitlePreview').textContent = headline.length > 60 ? headline.substring(0, 60) + '...' : headline;

        // ── THUMBNAIL ────────────────────────────────────────────────
        // Priority: Post Image Preview attachment → Post Image URL → hide
        var detailThumb = document.getElementById('detailThumb');
        var detailFallback = document.getElementById('detailThumbFallback');
        var detailToProxyUrl = function(path) {
          if (!path) return '';
          var cleanPath = path.startsWith('/') ? path.substring(1) : path;
          return '/api/nocodb-proxy/' + cleanPath;
        };
        var thumbUrl = '';
        if (f['Post Image Preview'] && Array.isArray(f['Post Image Preview']) && f['Post Image Preview'].length > 0) {
          var att = f['Post Image Preview'][0];
          var thumbnails = att.thumbnails || {};
          thumbUrl = att.url || att.signedUrl || 
            (att.signedPath ? detailToProxyUrl(att.signedPath) : '') ||
            (att.path ? detailToProxyUrl(att.path) : '') ||
            (thumbnails.large || {}).url || 
            ((thumbnails.large || {}).signedPath ? detailToProxyUrl((thumbnails.large || {}).signedPath) : '') ||
            (thumbnails.full || {}).url || 
            (thumbnails.card_cover || {}).url || 
            '';
        }
        if (!thumbUrl && f['Post Image'] && f['Post Image'].startsWith('http')) {
          thumbUrl = f['Post Image'];
        }
        if (thumbUrl) {
          detailThumb.src = thumbUrl;
          detailThumb.classList.remove('hidden');
          detailFallback.classList.add('hidden');
        } else {
          detailThumb.src = '';
          detailThumb.classList.add('hidden');
          detailFallback.classList.remove('hidden');
        }

        // ── LEAD ─────────────────────────────────────────────────────
        var leadWrap = document.getElementById('detailLeadWrap');
        if (f.Lead) {
          document.getElementById('detailLead').textContent = f.Lead;
          leadWrap.classList.remove('hidden');
        } else {
          leadWrap.classList.add('hidden');
        }

        // ── CAPTION ──────────────────────────────────────────────────
        var captionWrap = document.getElementById('detailCaptionWrap');
        if (f.Caption) {
          document.getElementById('detailCaption').textContent = f.Caption;
          captionWrap.classList.remove('hidden');
        } else {
          captionWrap.classList.add('hidden');
        }

        // ── REWRITTEN HEADLINE ────────────────────────────────────────
        var rewrittenWrap = document.getElementById('detailRewrittenWrap');
        if (f['Rewritten Headline']) {
          document.getElementById('detailRewritten').textContent = f['Rewritten Headline'];
          rewrittenWrap.classList.remove('hidden');
        } else {
          rewrittenWrap.classList.add('hidden');
        }

        // ── WHY IT MATTERS ───────────────────────────────────────────
        var whyWrap = document.getElementById('detailWhyWrap');
        if (f['Why It Matters']) {
          document.getElementById('detailWhy').textContent = f['Why It Matters'];
          whyWrap.classList.remove('hidden');
        } else {
          whyWrap.classList.add('hidden');
        }

        // ── SOURCE ───────────────────────────────────────────────────
        var sourceWrap = document.getElementById('detailSourceWrap');
        if (f.Source) {
          document.getElementById('detailSource').textContent = f.Source;
          sourceWrap.classList.remove('hidden');
        } else {
          sourceWrap.classList.add('hidden');
        }

        // ── DATA MISMATCH DETECTION ───────────────────────────────────
        // Detect when Caption or Rewritten Headline belongs to a different article.
        // Strategy: extract the first meaningful non-generic words from the Headline
        // (e.g., company names like "Block", "Microsoft") and verify they appear in
        // Caption and/or Rewritten Headline. If none do, flag as a mismatch.
        var mismatchBanner = document.getElementById('detailMismatchBanner');
        var captionText = (f.Caption || '').toLowerCase();
        var rewrittenText = (f['Rewritten Headline'] || '').toLowerCase();
        var twitterText = (f['Twitter Copy'] || '').toLowerCase();
        // Generic words that appear in almost all layoff/tech headlines — not useful for matching
        var stopWords = {what:1,means:1,your:1,their:1,this:1,that:1,with:1,from:1,have:1,will:1,
          could:1,would:1,should:1,jobs:1,half:1,next:1,about:1,after:1,into:1,more:1,just:1,
          when:1,they:1,make:1,here:1,work:1,workers:1,staff:1,layoffs:1,workforce:1,
          employees:1,company:1,roles:1,team:1,automation:1,future:1,amid:1,cuts:1,lays:1,
          cutting:1,slashes:1,slash:1,focus:1,boost:1,boost:1,shift:1,toward:1,embrace:1};
        var allHeadlineWords = (headline || '').toLowerCase().split(/[^a-z0-9]+/);
        // Named words: 4+ chars, not in stop list, not starting with 'ai'
        var namedWords = allHeadlineWords.filter(function(w) {
          return w.length >= 4 && !stopWords[w] && w.indexOf('ai') !== 0;
        });
        // Use the first 2 named words (usually the company/topic entity)
        var keyWords = namedWords.slice(0, 2);
        var hasContent = captionText.length > 30 || rewrittenText.length > 10 || twitterText.length > 10;
        var captionHasKeyword = keyWords.some(function(w) { return captionText.indexOf(w) >= 0; });
        var rewrittenHasKeyword = keyWords.some(function(w) { return rewrittenText.indexOf(w) >= 0; });
        var isMismatch = keyWords.length >= 1 && hasContent && !captionHasKeyword && !rewrittenHasKeyword;
        if (isMismatch) {
          mismatchBanner.classList.remove('hidden');
        } else {
          mismatchBanner.classList.add('hidden');
        }

        // ── APPROVAL BUTTONS ─────────────────────────────────────────
        // Show for statuses that need a decision
        var actionButtons = document.getElementById('actionButtons');
        var reviewStatuses = ['ready', 'needs review', 'needs-review', 'pending', 'draft'];
        if (reviewStatuses.includes((status || '').toLowerCase())) {
          actionButtons.classList.remove('hidden');
        } else {
          actionButtons.classList.add('hidden');
        }

        // ── PLATFORM CONTENT (real NocoDB field names) ───────────────
        // NocoDB uses spaces in field names: "Twitter Copy", "Blog Copy" etc.
        document.getElementById('contentTwitter').value  = f['Twitter Copy']   || '';
        document.getElementById('contentThreads').value  = f['Threads Copy']   || '';
        document.getElementById('contentBluesky').value  = f['Bluesky Copy']   || '';
        document.getElementById('contentLinkedin').value = f['LinkedIn Copy']  || '';
        document.getElementById('contentFacebook').value = f['Facebook Copy']  || '';
        document.getElementById('contentInstagram').value= f['Instagram Copy'] || '';
        document.getElementById('contentBlog').value     = f['Blog Copy']      || '';
        document.getElementById('contentScript').value   = f['Short Script']   || '';

        document.getElementById('twitterCount').textContent  = (f['Twitter Copy']  || '').length;
        document.getElementById('blueskyCount').textContent  = (f['Bluesky Copy']  || '').length;

        // ── SOCIAL SECTION always visible for Articles ───────────────
        document.getElementById('socialContentSection').classList.remove('hidden');
        // Ensure body is open on fresh select
        var socialBody = document.getElementById('socialContentBody');
        socialBody.classList.remove('hidden');
        document.getElementById('socialContentToggle').style.transform = 'rotate(0deg)';
        // Reset to twitter tab on new record
        showTab('twitter');

        // ── IMAGE GENERATION PANEL (keep existing behaviour) ─────────
        // Set Image Model dropdown from record
        var modelSelect = document.getElementById('imageModelSelect');
        var recordModel = f['Image Model'] || 'nano-banana';
        if (modelSelect) {
          // Normalize: if value contains 'flux', select flux; otherwise nano-banana
          modelSelect.value = recordModel.toLowerCase().indexOf('flux') !== -1 ? 'flux' : 'nano-banana';
        }

        if (thumbUrl) {
          setContentImage('16:9', thumbUrl);
        } else if (f.imageURL) {
          setContentImage('16:9', f.imageURL);
        } else {
          clearContentImage('16:9');
        }
        clearContentImage('9:16');
        clearContentImage('1:1');

        // ── AUTO PROMPT ──────────────────────────────────────────────
        // Use the record's saved ImagePrompt if available (context-aware),
        // otherwise fall back to the template-based prompt
        const category = f.category || 'default';
        const shortHeadlineInput = document.getElementById('shortHeadline');
        if (shortHeadlineInput) shortHeadlineInput.value = createShortHeadline(headline);
        const savedImagePrompt = f.ImagePrompt || f.imagePrompt || '';
        if (savedImagePrompt) {
          document.getElementById('promptInput').value = savedImagePrompt;
          document.getElementById('charCount').textContent = savedImagePrompt.length + ' characters';
        } else if (headline && headline !== 'Untitled') {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }

        setupAutoSave();
      } catch (err) {
        console.error('Failed to select record:', err);
      }
    }

    function renderDynamicFields(fields) {
      const container = document.getElementById('dynamicFieldsContainer');
      
      // Get fields to render (excluding special ones)
      const fieldsToRender = tableFields.filter(f => 
        !SKIP_FIELDS.includes(f.name) && 
        !SOCIAL_FIELDS.includes(f.name) &&
        !IMAGE_FIELD_TYPES.includes(f.type)
      );
      
      let html = '<div class="grid grid-cols-2 gap-4">';
      
      fieldsToRender.forEach(field => {
        const value = fields[field.name];
        const displayValue = value === undefined || value === null ? '' : 
                            typeof value === 'object' ? JSON.stringify(value) : value;
        const isLongText = field.type === 'multilineText' || (typeof displayValue === 'string' && displayValue.length > 100);
        const isUrl = field.type === 'url' || field.name.toLowerCase().includes('url');
        
        html += \`
          <div class="dynamic-field \${isLongText ? 'col-span-2' : ''}">
            <label>\${field.name}</label>
            \${isLongText ? 
              \`<textarea data-field="\${field.name}" rows="4" class="editable-field">\${escapeHtml(String(displayValue))}</textarea>\` :
              isUrl ?
              \`<div class="flex gap-2">
                <input type="text" data-field="\${field.name}" value="\${escapeHtml(String(displayValue))}" class="editable-field flex-1">
                \${displayValue ? \`<a href="\${displayValue}" target="_blank" class="px-3 py-2 bg-amber-500/20 rounded text-amber-500 hover:bg-amber-500/30"><i class="fas fa-external-link-alt"></i></a>\` : ''}
              </div>\` :
              \`<input type="text" data-field="\${field.name}" value="\${escapeHtml(String(displayValue))}" class="editable-field">\`
            }
          </div>
        \`;
      });
      
      html += '</div>';
      container.innerHTML = html;
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========================================
    // REFERENCE LIBRARY WITH PER-SIZE IMAGES
    // ========================================
    function renderReferenceGridExpanded() {
      const container = document.getElementById('referenceGridExpanded');
      const ratios = ['16:9', '9:16', '1:1'];
      const ratioColors = {
        '16:9': { border: 'amber', bg: 'amber', text: 'amber' },
        '9:16': { border: 'purple', bg: 'purple', text: 'purple' },
        '1:1': { border: 'green', bg: 'green', text: 'green' }
      };
      
      container.innerHTML = referenceCategories.map(cat => {
        const catRefs = references[cat.id] || {};
        const isExpanded = expandedCategories[cat.id];
        
        // Count how many sizes have images
        const imageCount = ratios.filter(r => (catRefs[r] || {}).url).length;
        const activeCount = ratios.filter(r => (catRefs[r] || {}).url && (catRefs[r] || {}).enabled).length;
        
        return \`
          <div class="category-section rounded-xl border border-white/10 overflow-hidden">
            <!-- Category Header -->
            <div 
              class="flex items-center justify-between p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
              onclick="toggleCategoryExpand('\${cat.id}')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <i class="fas \${cat.icon} text-amber-500"></i>
                </div>
                <div>
                  <span class="font-medium text-sm">\${cat.name}</span>
                  <p class="text-xs text-gray-500">\${imageCount}/3 sizes • \${activeCount} active</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  \${ratios.map(r => {
                    const ref = catRefs[r] || {};
                    const hasImg = ref.url;
                    const isActive = hasImg && ref.enabled;
                    const colors = ratioColors[r];
                    return \`<div class="w-2 h-2 rounded-full \${isActive ? 'bg-' + colors.bg + '-500' : hasImg ? 'bg-' + colors.bg + '-500/30' : 'bg-gray-600'}"></div>\`;
                  }).join('')}
                </div>
                <i class="fas fa-chevron-\${isExpanded ? 'up' : 'down'} text-gray-500 text-xs ml-2"></i>
              </div>
            </div>
            
            <!-- Per-Size Subsections (Collapsible) -->
            <div class="size-subsections \${isExpanded ? '' : 'hidden'} p-3 bg-black/20 border-t border-white/5">
              <div class="grid grid-cols-3 gap-2">
                \${ratios.map(ratio => {
                  const ref = catRefs[ratio] || { url: '', enabled: false };
                  const hasImage = ref.url && ref.url.length > 0;
                  const isEnabled = ref.enabled && hasImage;
                  const colors = ratioColors[ratio];
                  const slotId = cat.id + '-' + ratio;
                  
                  return \`
                    <div class="size-slot-container">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-\${colors.text}-400">\${ratio}</span>
                        \${hasImage ? \`
                          <button 
                            class="w-4 h-4 rounded text-xs flex items-center justify-center transition-all \${isEnabled ? 'bg-green-500/30 text-green-400' : 'bg-gray-600/30 text-gray-500'}"
                            onclick="event.stopPropagation(); toggleSizeReference('\${cat.id}', '\${ratio}')"
                            title="\${isEnabled ? 'Disable' : 'Enable'} this reference"
                          >
                            <i class="fas fa-\${isEnabled ? 'check' : 'times'} text-[8px]"></i>
                          </button>
                        \` : ''}
                      </div>
                      <div 
                        class="size-ref-slot rounded-lg border-2 border-dashed border-\${colors.border}-500/30 bg-\${colors.bg}-500/5 hover:border-\${colors.border}-500/50 hover:bg-\${colors.bg}-500/10 transition-all cursor-pointer flex items-center justify-center relative overflow-hidden \${hasImage ? 'has-image' : ''}"
                        style="aspect-ratio: \${ratio === '16:9' ? '16/9' : ratio === '9:16' ? '9/16' : '1/1'}; min-height: \${ratio === '9:16' ? '80px' : '50px'}; max-height: \${ratio === '9:16' ? '100px' : '70px'};"
                        id="slot-\${slotId}"
                        onclick="handleSizeSlotClick('\${cat.id}', '\${ratio}')"
                        ondragover="handleSizeRefDragOver(event)"
                        ondragleave="handleSizeRefDragLeave(event)"
                        ondrop="handleSizeRefDrop(event, '\${cat.id}', '\${ratio}')"
                      >
                        \${hasImage ? \`
                          <img src="\${ref.url}" alt="\${cat.name} \${ratio}" class="w-full h-full object-cover rounded-md">
                          <button class="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center transition-all" 
                                  onclick="event.stopPropagation(); clearSizeSlot('\${cat.id}', '\${ratio}')">
                            <i class="fas fa-times"></i>
                          </button>
                        \` : \`
                          <div class="text-center text-gray-500">
                            <i class="fas fa-plus text-xs"></i>
                          </div>
                        \`}
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }
    
    function toggleCategoryExpand(categoryId) {
      expandedCategories[categoryId] = !expandedCategories[categoryId];
      renderReferenceGridExpanded();
    }

    function handleSizeSlotClick(categoryId, ratio) {
      currentUploadSlot = categoryId + '-' + ratio;
      document.getElementById('fileInput').click();
    }

    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file || !currentUploadSlot) return;
      
      // Parse the slot ID: 'categoryId-ratio'
      const parts = currentUploadSlot.split('-');
      const ratio = parts.pop(); // Get the ratio (last part after splitting)
      const categoryId = parts.join('-'); // Rejoin in case category has dashes

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const slot = document.getElementById('slot-' + currentUploadSlot);
        slot.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-spinner fa-spin text-lg text-amber-500"></i></div>';
        
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: base64 })
          });
          const data = await res.json();
          
          if (data.image && data.image.url) {
            if (!references[categoryId]) {
              references[categoryId] = { '16:9': { url: '', enabled: false }, '9:16': { url: '', enabled: false }, '1:1': { url: '', enabled: false } };
            }
            references[categoryId][ratio] = { url: data.image.url, enabled: true };
            saveReferences();
            renderReferenceGridExpanded();
            updateActiveCount();
          } else {
            throw new Error('Upload failed');
          }
        } catch (err) {
          alert('Failed to upload: ' + err.message);
          renderReferenceGridExpanded();
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }

    function toggleSizeReference(categoryId, ratio) {
      if (((references[categoryId] || {})[ratio] || {}).url) {
        references[categoryId][ratio].enabled = !references[categoryId][ratio].enabled;
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function clearSizeSlot(categoryId, ratio) {
      if (references[categoryId]) {
        references[categoryId][ratio] = { url: '', enabled: false };
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function handleSizeRefDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('border-white', 'bg-white/20');
    }

    function handleSizeRefDragLeave(event) {
      event.currentTarget.classList.remove('border-white', 'bg-white/20');
    }

    function handleSizeRefDrop(event, categoryId, ratio) {
      event.preventDefault();
      event.currentTarget.classList.remove('border-white', 'bg-white/20');
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (imageUrl) {
        if (!references[categoryId]) {
          references[categoryId] = { '16:9': { url: '', enabled: false }, '9:16': { url: '', enabled: false }, '1:1': { url: '', enabled: false } };
        }
        references[categoryId][ratio] = { url: imageUrl, enabled: true };
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function saveReferences() {
      localStorage.setItem('imageGenReferencesV2', JSON.stringify(references));
    }

    function updateActiveCount() {
      const activeRefs = [];
      referenceCategories.forEach(cat => {
        const catRefs = references[cat.id];
        if (catRefs) {
          ['16:9', '9:16', '1:1'].forEach(ratio => {
            if ((catRefs[ratio] || {}).url && (catRefs[ratio] || {}).enabled) {
              activeRefs.push(cat.name + ' (' + ratio + ')');
            }
          });
        }
      });
      
      document.getElementById('processingOrder').textContent = 
        activeRefs.length > 0 ? activeRefs.join(', ') : 'No references active';
      
      // Update the count badge in header
      const countEl = document.getElementById('refLibraryCount');
      if (countEl) {
        countEl.textContent = activeRefs.length + ' active';
      }
    }

    // Legacy function for backward compatibility
    function renderReferenceGrid() {
      renderReferenceGridExpanded();
    }
    
    // Legacy ratio reference functions (kept for backward compatibility)
    function renderRatioReferences() {
      // No longer needed - integrated into renderReferenceGridExpanded
    }

    // ========================================
    // IMAGE GENERATION
    // ========================================
    function setAspectRatio(ratio) {
      currentAspectRatio = ratio;
      document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ratio === ratio);
      });
    }

    function setupPromptCounter() {
      const textarea = document.getElementById('promptInput');
      const counter = document.getElementById('charCount');
      const updateCount = () => { counter.textContent = textarea.value.length + ' characters'; };
      textarea.addEventListener('input', updateCount);
      updateCount();
    }

    function clearPrompt() {
      document.getElementById('promptInput').value = '';
      document.getElementById('charCount').textContent = '0 characters';
    }

    async function generateImage() {
      const prompt = document.getElementById('promptInput').value.trim();
      if (!prompt) { alert('Please enter a prompt'); return; }

      const ratioToGenerate = currentAspectRatio;

      // Detect image model from dropdown selector
      var modelSelectEl = document.getElementById('imageModelSelect');
      var imageModel = modelSelectEl ? modelSelectEl.value : 'nano-banana';
      console.log('Image model for generation:', imageModel);

      var useFlux = imageModel.indexOf('flux') !== -1;

      // For nano-banana: collect reference images (required)
      let activeRefs = [];
      if (!useFlux) {
        // Collect all enabled references for the CURRENT aspect ratio
        referenceCategories.forEach(cat => {
          const catRefs = references[cat.id];
          if (catRefs && (catRefs[ratioToGenerate] || {}).url && (catRefs[ratioToGenerate] || {}).enabled) {
            activeRefs.push(catRefs[ratioToGenerate].url);
          }
        });
        
        console.log(ratioToGenerate + ' MODE: Found ' + activeRefs.length + ' active references for this size');
        
        // If no references for this ratio, try to use a fallback
        if (activeRefs.length === 0) {
          const priorityOrder = ['face', 'custom', 'pose', 'outfit', 'background', 'props', 'mood', 'logo'];
          for (const catId of priorityOrder) {
            const catRefs = references[catId];
            if (catRefs) {
              if ((catRefs[ratioToGenerate] || {}).url) {
                activeRefs.push(catRefs[ratioToGenerate].url);
                console.log('Using ' + catId + ' reference for ' + ratioToGenerate);
                break;
              }
              for (const r of ['16:9', '9:16', '1:1']) {
                if ((catRefs[r] || {}).url && (catRefs[r] || {}).enabled) {
                  activeRefs.push(catRefs[r].url);
                  console.log('FALLBACK: Using ' + catId + ' (' + r + ') reference for ' + ratioToGenerate + ' output');
                  break;
                }
              }
              if (activeRefs.length > 0) break;
            }
          }
        }
        
        if (activeRefs.length === 0) {
          console.log('No reference images found for ' + ratioToGenerate + ' — proceeding with prompt only');
        }
        
        console.log('Active references for ' + ratioToGenerate + ':', activeRefs.length, activeRefs);
      }

      const btn = document.getElementById('generateBtn');
      const status = document.getElementById('generationStatus');
      
      // Check if we're doing two-step generation (with headline)
      const addHeadlineTextEl = document.getElementById('addHeadlineText');
      const addHeadlineText = addHeadlineTextEl ? addHeadlineTextEl.checked : false;
      const shortHeadlineEl = document.getElementById('shortHeadline');
      const shortHeadlineVal = shortHeadlineEl && shortHeadlineEl.value ? shortHeadlineEl.value.trim() : '';
      const shortHeadline = shortHeadlineVal;
      const isTwoStep = addHeadlineText && shortHeadline;
      
      btn.disabled = true;
      var modelLabel = useFlux ? 'Flux' : 'Nano Banana';
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating ' + ratioToGenerate + '...';
      status.classList.remove('hidden');
      
      if (isTwoStep) {
        document.getElementById('statusText').textContent = 'Step 1: Creating base image with ' + modelLabel + '...';
      } else {
        document.getElementById('statusText').textContent = 'Creating ' + ratioToGenerate + ' image with ' + modelLabel + '...';
      }

      console.log('Generating image with aspect ratio:', ratioToGenerate, 'model:', imageModel);
      console.log('Two-step mode (with headline):', isTwoStep);

      try {
        if (useFlux) {
          // ── FLUX path (fal.ai) ──────────────────────────────────────────
          const createRes = await fetch('/api/generate-image-fal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, aspectRatio: ratioToGenerate })
          });
          const createData = await createRes.json();
          console.log('fal.ai submit response:', createData);

          if (createData.error) throw new Error(createData.error);

          const requestId   = createData.requestId;
          const statusUrl   = createData.statusUrl   || '';
          const responseUrl = createData.responseUrl || '';
          document.getElementById('statusText').textContent = 'Processing with Flux...';

          // Build the poll URL — pass statusUrl and responseUrl so the server
          // uses the exact URLs fal.ai returned, avoiding any URL reconstruction.
          function buildPollUrl(rid, sUrl, rUrl) {
            var u = '/api/fal-status/' + encodeURIComponent(rid);
            var params = [];
            if (sUrl) params.push('statusUrl='   + encodeURIComponent(sUrl));
            if (rUrl) params.push('responseUrl=' + encodeURIComponent(rUrl));
            return params.length ? u + '?' + params.join('&') : u;
          }

          let attempts = 0;
          while (attempts < 90) {
            await new Promise(r => setTimeout(r, 2000));
            const pollUrl = buildPollUrl(requestId, statusUrl, responseUrl);
            const statusRes = await fetch(pollUrl);
            const statusData = await statusRes.json();
            console.log('[fal poll] attempt', attempts + 1, 'url:', pollUrl, 'response:', statusData);

            if (statusData.error) {
              throw new Error(statusData.error);
            }

            if (statusData.status === 'COMPLETED') {
              if (statusData.imageUrl) {
                const imageUrl = statusData.imageUrl;
                await showGeneratedImage(imageUrl, ratioToGenerate);
                addToHistory(lastGeneratedUrl, prompt);
                await autoSaveImageToNocoDB(imageUrl);
              } else {
                throw new Error('Flux completed but returned no image URL');
              }
              break;
            }

            attempts++;
            var progressLabel = isTwoStep ? 'Step 1: Processing with Flux' : 'Processing with Flux';
            var statusNote = statusData.status === 'IN_QUEUE' ? ' (queued)' : statusData.status === 'IN_PROGRESS' ? ' (in progress)' : '';
            document.getElementById('statusText').textContent = progressLabel + statusNote + '... (' + (attempts * 2) + 's)';
          }
          if (attempts >= 90) throw new Error('Flux generation timed out');

        } else {
          // ── NANO-BANANA path (KieAI) — existing flow unchanged ──────────
          const createRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, imageUrls: activeRefs, aspectRatio: ratioToGenerate })
          });
          const createData = await createRes.json();

          console.log('Create response:', createData);

          if (createData.code !== 200) throw new Error(createData.msg || 'Failed to create task');

          const taskId = createData.data.taskId;
          if (isTwoStep) {
            document.getElementById('statusText').textContent = 'Step 1: Processing base image...';
          } else {
            document.getElementById('statusText').textContent = 'Processing ' + ratioToGenerate + '...';
          }

          let attempts = 0;
          while (attempts < 60) {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await fetch('/api/task-status/' + taskId);
            const statusData = await statusRes.json();

            if ((statusData.data || {}).state === 'success') {
              const resultJson = JSON.parse(statusData.data.resultJson);
              const imageUrl = resultJson.resultUrls[0];
              await showGeneratedImage(imageUrl, ratioToGenerate);
              addToHistory(lastGeneratedUrl, prompt);
              await autoSaveImageToNocoDB(imageUrl);
              break;
            } else if ((statusData.data || {}).state === 'failed') {
              throw new Error(statusData.data.failMsg || 'Generation failed');
            }
            attempts++;
            if (isTwoStep) {
              document.getElementById('statusText').textContent = \`Step 1: Processing base image... (\${attempts * 2}s)\`;
            } else {
              document.getElementById('statusText').textContent = \`Processing \${ratioToGenerate}... (\${attempts * 2}s)\`;
            }
          }
          if (attempts >= 60) throw new Error('Generation timed out');
        }
      } catch (err) {
        console.error('Image generation error:', err);
        document.getElementById('statusText').textContent = 'Error: ' + err.message;
        status.classList.remove('hidden');
        // Keep status visible for errors (don't hide in finally)
        setTimeout(() => { status.classList.add('hidden'); }, 8000);
        alert('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>Generate Image';
        status.classList.add('hidden');
      }
    }

    async function showGeneratedImage(url, ratio) {
      const finalRatio = ratio || currentAspectRatio;
      
      // Check if we need to add text overlay
      const addHeadlineTextEl = document.getElementById('addHeadlineText');
      const addHeadlineText = addHeadlineTextEl ? addHeadlineTextEl.checked : false;
      const shortHeadlineEl = document.getElementById('shortHeadline');
      const shortHeadline = shortHeadlineEl && shortHeadlineEl.value ? shortHeadlineEl.value.trim() : '';
      
      let finalUrl = url;
      
      if (addHeadlineText && shortHeadline) {
        // Step 2: Add text banner overlay using canvas (reliable, template-based)
        // Logo watermark is already in the image from Nano Banana (top-right)
        document.getElementById('statusText').textContent = 'Step 2: Adding headline banner...';
        try {
          finalUrl = await addTextOverlayWithZImage(url, shortHeadline, finalRatio);
        } catch (err) {
          console.error('Error adding text overlay:', err);
          // Fall back to original image if overlay fails
          finalUrl = url;
        }
      }
      
      lastGeneratedUrl = finalUrl;
      lastGeneratedRatio = finalRatio;
      const previewArea = document.getElementById('previewArea');
      previewArea.innerHTML = \`<img src="\${finalUrl}" alt="Generated" draggable="true" 
        ondragstart="handleGeneratedDragStart(event, '\${finalUrl}')">\`;
      document.getElementById('previewActions').classList.remove('hidden');
      document.getElementById('useImageRatio').textContent = '(' + lastGeneratedRatio + ')';
    }
    
    // Use the generated image in the Content Images section
    function useImageInContent() {
      if (!lastGeneratedUrl) {
        alert('No image to use. Generate an image first.');
        return;
      }
      
      const ratio = lastGeneratedRatio;
      setContentImage(ratio, lastGeneratedUrl);
      
      // Scroll to the content images section
      document.getElementById('contentImagesSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // ========================================
    // CREATE ALL SIZES - Use approved image as reference to regenerate for other aspect ratios
    // ========================================
    async function createAllSizes() {
      if (!lastGeneratedUrl) {
        alert('No image to use as reference. Generate and approve a 16:9 image first.');
        return;
      }
      
      const btn = document.getElementById('createAllSizesBtn');
      const statusDiv = document.getElementById('createAllSizesStatus');
      const statusText = document.getElementById('createAllSizesText');
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating All Sizes...';
      statusDiv.classList.remove('hidden');
      
      // Reset status indicators
      document.getElementById('size16x9Status').innerHTML = '<i class="fas fa-check mr-1"></i>16:9';
      document.getElementById('size16x9Status').className = 'text-green-400';
      document.getElementById('size9x16Status').innerHTML = '<i class="fas fa-clock mr-1"></i>9:16';
      document.getElementById('size9x16Status').className = 'text-gray-500';
      document.getElementById('size1x1Status').innerHTML = '<i class="fas fa-clock mr-1"></i>1:1';
      document.getElementById('size1x1Status').className = 'text-gray-500';
      
      try {
        // Use the approved 16:9 image for the 16:9 slot
        setContentImage('16:9', lastGeneratedUrl);
        
        // Build a recomposition prompt using the approved image as reference
        const basePrompt = 'Recreate this exact same scene, person, outfit, and lighting in a different aspect ratio. Keep EVERYTHING identical - same woman, same pose, same expression, same clothing, same background, same mood. Only adjust the framing/composition to fit the new aspect ratio. Do NOT change any details.';
        
        // Generate 9:16 and 1:1 using the approved image as reference
        const sizesToGenerate = [
          { ratio: '9:16', statusId: 'size9x16Status' },
          { ratio: '1:1', statusId: 'size1x1Status' }
        ];
        
        for (const size of sizesToGenerate) {
          // Update status
          document.getElementById(size.statusId).innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>' + size.ratio;
          document.getElementById(size.statusId).className = 'text-amber-400';
          statusText.textContent = 'Cropping to ' + size.ratio + '...';
          
          // Crop the 16:9 image to the target ratio (Nano Banana ignores aspect ratio with references)
          const generatedUrl = await cropImageToRatio(referenceUrl, size.ratio);
          
          // Check if headline text should be added
          const addHeadlineTextEl = document.getElementById('addHeadlineText');
          const addHeadlineText = addHeadlineTextEl ? addHeadlineTextEl.checked : false;
          const shortHeadlineEl = document.getElementById('shortHeadline');
          const shortHeadline = shortHeadlineEl && shortHeadlineEl.value ? shortHeadlineEl.value.trim() : '';
          
          let finalUrl = generatedUrl;
          if (addHeadlineText && shortHeadline) {
            statusText.textContent = 'Adding text to ' + size.ratio + '...';
            try {
              finalUrl = await addTextOverlayWithZImage(generatedUrl, shortHeadline, size.ratio);
            } catch (err) {
              console.error('Error adding text overlay:', err);
              finalUrl = generatedUrl;
            }
          }
          
          // Set in content images (with X button)
          setContentImage(size.ratio, finalUrl);
          
          // Add to history
          addToHistory(finalUrl, 'Recomposed from 16:9 to ' + size.ratio);
          
          // Mark as done
          document.getElementById(size.statusId).innerHTML = '<i class="fas fa-check mr-1"></i>' + size.ratio;
          document.getElementById(size.statusId).className = 'text-green-400';
        }
        
        statusText.textContent = 'All sizes generated! Saving to NocoDB...';
        
        // Auto-save to NocoDB if a record is selected
        if (currentRecordId && currentBase && currentTable) {
          await saveImagesToNocoDB();
        }
        
        showSaveIndicator();
        
        // Scroll to content images
        document.getElementById('contentImagesSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide status after a moment
        setTimeout(() => {
          statusDiv.classList.add('hidden');
        }, 3000);
        
      } catch (err) {
        console.error('Error creating sizes:', err);
        alert('Error creating sizes: ' + err.message);
        statusText.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-clone mr-2"></i>Generate All Sizes';
      }
    }
    
    // Generate image for a specific ratio using a reference image
    async function generateImageForRatio(referenceImageUrl, prompt, targetRatio) {
      // Create the generation request
      const createRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          imageUrls: [referenceImageUrl], // Use approved image as the reference
          aspectRatio: targetRatio 
        })
      });
      const createData = await createRes.json();
      
      if (createData.code !== 200) {
        throw new Error(createData.msg || 'Failed to create task for ' + targetRatio);
      }
      
      const taskId = createData.data.taskId;
      
      // Poll for completion
      let attempts = 0;
      while (attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch('/api/task-status/' + taskId);
        const statusData = await statusRes.json();
        
        if ((statusData.data || {}).state === 'success') {
          const resultJson = JSON.parse(statusData.data.resultJson);
          return resultJson.resultUrls[0];
        } else if ((statusData.data || {}).state === 'failed') {
          throw new Error(statusData.data.failMsg || 'Generation failed for ' + targetRatio);
        }
        attempts++;
      }
      
      throw new Error('Generation timed out for ' + targetRatio);
    }
    
    // Generate image for a specific ratio using fal.ai Flux Klein 9B
    async function generateImageForRatioFal(targetRatio) {
      // Read the current image prompt from the review textarea, fallback to main prompt
      const reviewPromptEl = document.getElementById('reviewImagePrompt');
      const mainPromptEl = document.getElementById('imagePrompt');
      const prompt = (reviewPromptEl && reviewPromptEl.value.trim())
        ? reviewPromptEl.value.trim()
        : (mainPromptEl ? mainPromptEl.value.trim() : '');

      if (!prompt) {
        throw new Error('No image prompt found — generate a prompt first before resizing.');
      }

      console.log('[generateImageForRatioFal] Submitting to fal.ai for ratio:', targetRatio, 'prompt:', prompt.slice(0, 80) + '…');

      // Submit to fal.ai via existing backend endpoint
      const submitRes = await fetch('/api/generate-image-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: targetRatio })
      });
      const submitData = await submitRes.json();

      if (submitData.error) {
        throw new Error(submitData.error);
      }

      const { requestId, statusUrl, responseUrl } = submitData;
      console.log('[generateImageForRatioFal] requestId:', requestId, 'statusUrl:', statusUrl);

      // Build poll URL with encoded statusUrl / responseUrl
      const pollBase = '/api/fal-status/' + encodeURIComponent(requestId);
      const params = new URLSearchParams();
      if (statusUrl) params.set('statusUrl', statusUrl);
      if (responseUrl) params.set('responseUrl', responseUrl);
      const pollUrl = pollBase + '?' + params.toString();

      // Poll until COMPLETED (up to 90 attempts × 2 s = 3 min)
      let attempts = 0;
      while (attempts < 90) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(pollUrl);
        const statusData = await statusRes.json();

        console.log('[generateImageForRatioFal] attempt', attempts + 1, 'status:', statusData.status);

        if (statusData.error) {
          throw new Error(statusData.error);
        }

        if (statusData.status === 'COMPLETED') {
          if (!statusData.imageUrl) {
            throw new Error('Generation completed but no imageUrl returned for ' + targetRatio);
          }
          console.log('[generateImageForRatioFal] COMPLETED imageUrl:', statusData.imageUrl);
          return statusData.imageUrl;
        }

        attempts++;
      }

      throw new Error('fal.ai generation timed out for ' + targetRatio);
    }

    // Load image from URL (uses server-side proxy to avoid CORS)
    async function loadImage(url) {
      // Use server-side proxy to fetch image and convert to base64
      const proxyRes = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      });
      
      const proxyData = await proxyRes.json();
      
      if (proxyData.error) {
        throw new Error(proxyData.error);
      }
      
      // Create image from data URL (no CORS issues with data URLs)
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = proxyData.dataUrl;
      });
    }
    
    // Crop image to a specific aspect ratio and upload
    async function cropImageToRatio(imageUrl, targetRatio) {
      console.log('Cropping image to ratio:', targetRatio);
      
      // Load the source image
      const img = await loadImage(imageUrl);
      
      // Calculate target dimensions based on ratio
      // Keep the shorter dimension and crop the longer one
      let targetWidth, targetHeight;
      
      if (targetRatio === '9:16') {
        // Portrait - vertical (9:16)
        // From 16:9 source, we need to crop significantly
        // Use the full height and calculate width
        targetHeight = img.height;
        targetWidth = Math.floor(targetHeight * (9/16));
      } else if (targetRatio === '1:1') {
        // Square (1:1)
        // Use the smaller dimension for both
        const minDim = Math.min(img.width, img.height);
        targetWidth = minDim;
        targetHeight = minDim;
      } else {
        // Default to 16:9 (landscape)
        targetWidth = img.width;
        targetHeight = Math.floor(img.width * (9/16));
      }
      
      console.log('Crop dimensions:', { sourceW: img.width, sourceH: img.height, targetW: targetWidth, targetH: targetHeight });
      
      // Crop the image
      const blob = await cropToAspectRatio(img, targetWidth, targetHeight);
      
      // Upload and return the URL
      const uploadedUrl = await uploadCroppedImage(blob);
      console.log('Cropped image uploaded:', uploadedUrl);
      
      return uploadedUrl;
    }
    
    // Add text overlay to image using canvas (reliable text rendering with template-based sizing)
    // Logo is now added in the Nano Banana step as a reference image watermark
    async function addTextOverlayWithZImage(imageUrl, headline, ratio) {
      console.log('Adding text overlay via canvas template system for ratio:', ratio);
      // Use the improved canvas overlay directly (Ideogram was unreliable)
      return await addTextOverlayWithCanvas(imageUrl, headline, ratio);
    }
    
    // Add logo to image in bottom-right corner (after GPT adds text)
    async function addLogoToImage(imageUrl, ratio) {
      try {
        const img = await loadImage(imageUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Calculate banner area (bottom 12-15% based on ratio)
        let bannerHeightPercent = 0.15;
        if (ratio === '9:16') bannerHeightPercent = 0.12;
        else if (ratio === '1:1') bannerHeightPercent = 0.14;
        
        const bannerHeight = canvas.height * bannerHeightPercent;
        const bannerY = canvas.height - bannerHeight;
        const padding = canvas.width * 0.03;
        
        // Load and draw logo in bottom-right of banner
        const logoUrl = 'https://iili.io/fEiEfUB.png';
        const logoImg = await loadImage(logoUrl);
        const logoSize = Math.min(bannerHeight * 0.7, canvas.width * 0.08);
        const logoX = canvas.width - padding - logoSize;
        const logoY = bannerY + (bannerHeight - logoSize) / 2;
        
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        
        // Upload the final image
        return new Promise((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            try {
              const uploadedUrl = await uploadCroppedImage(blob);
              resolve(uploadedUrl);
            } catch (err) {
              console.error('Failed to upload logo image:', err);
              resolve(imageUrl); // Return original if upload fails
            }
          }, 'image/png', 0.95);
        });
      } catch (err) {
        console.error('Failed to add logo:', err);
        return imageUrl; // Return original if logo add fails
      }
    }
    
    // Add text overlay to image using canvas with template-based sizing
    // Logo is placed in the TOP-RIGHT via Nano Banana reference image
    // Banner is at the BOTTOM with text only (no logo in banner)
    async function addTextOverlayWithCanvas(imageUrl, headline, ratio) {
      console.log('Canvas text overlay - ratio:', ratio, 'headline:', headline);
      
      // Load the original image
      const img = await loadImage(imageUrl);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image (which should already have logo watermark from Nano Banana)
      ctx.drawImage(img, 0, 0);
      
      // TEMPLATE-BASED SIZING for consistent results across all images
      // These values are based on standard output dimensions:
      // 16:9 = 1920x1080, 9:16 = 1080x1920, 1:1 = 1080x1080
      
      let bannerHeightPercent, fontSize, lineHeight, padding, maxTextWidth;
      
      if (ratio === '16:9') {
        // Wide landscape (1920x1080 standard)
        bannerHeightPercent = 0.14; // ~150px on 1080p
        fontSize = Math.max(36, Math.floor(canvas.height * 0.042)); // ~45px on 1080p
        lineHeight = fontSize * 1.35;
        padding = Math.floor(canvas.width * 0.025); // ~48px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      } else if (ratio === '9:16') {
        // Tall portrait (1080x1920 standard)
        bannerHeightPercent = 0.10; // ~192px on 1920p height
        fontSize = Math.max(28, Math.floor(canvas.width * 0.042)); // ~45px on 1080 width
        lineHeight = fontSize * 1.30;
        padding = Math.floor(canvas.width * 0.04); // ~43px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      } else { // 1:1
        // Square (1080x1080 standard)
        bannerHeightPercent = 0.13; // ~140px on 1080p
        fontSize = Math.max(32, Math.floor(canvas.width * 0.040)); // ~43px on 1080p
        lineHeight = fontSize * 1.32;
        padding = Math.floor(canvas.width * 0.035); // ~38px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      }
      
      // Set font for text measurement
      const fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
      
      // Word wrap the headline based on actual measured width
      const words = headline.split(/\\s+/);
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxTextWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word too long - just use it
            lines.push(word);
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      console.log('Text wrapped into', lines.length, 'lines:', lines);
      
      // Calculate banner height - expand if needed for multiple lines
      const minBannerHeight = canvas.height * bannerHeightPercent;
      const textBlockHeight = lines.length * lineHeight;
      const verticalPadding = padding * 1.5; // More padding top/bottom
      const neededHeight = textBlockHeight + (verticalPadding * 2);
      const bannerHeight = Math.max(minBannerHeight, neededHeight);
      const bannerY = canvas.height - bannerHeight;
      
      // Draw semi-transparent dark banner (no gradient, clean look)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, bannerY, canvas.width, bannerHeight);
      
      // Optional: Add subtle top border for polish
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'; // Gold accent
      ctx.fillRect(0, bannerY, canvas.width, 3);
      
      // Draw text - centered vertically in banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
      ctx.textBaseline = 'middle';
      
      const totalTextHeight = lines.length * lineHeight;
      const textStartY = bannerY + (bannerHeight - totalTextHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        const y = textStartY + (index * lineHeight);
        ctx.fillText(line, padding, y);
      });
      
      // NO LOGO in banner - logo is in top-right of the main image (from Nano Banana)
      
      // Convert canvas to blob and upload
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            const uploadedUrl = await uploadCroppedImage(blob);
            console.log('Canvas text overlay uploaded:', uploadedUrl);
            resolve(uploadedUrl);
          } catch (err) {
            console.error('Failed to upload canvas overlay:', err);
            reject(err);
          }
        }, 'image/png', 0.95);
      });
    }
    
    // Crop image to target aspect ratio (center crop)
    function cropToAspectRatio(img, targetWidth, targetHeight) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const sourceRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (sourceRatio > targetRatio) {
          // Source is wider - crop sides
          sourceHeight = img.height;
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Source is taller - crop top/bottom
          sourceWidth = img.width;
          sourceHeight = img.width / targetRatio;
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    }
    
    // Upload cropped image to get a URL
    async function uploadCroppedImage(blob) {
      // Convert blob to base64
      const base64 = await blobToBase64(blob);
      
      // Upload using existing API
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64 })
      });
      
      const data = await res.json();
      
      if (data.image && data.image.url) {
        return data.image.url;
      } else {
        throw new Error('Upload failed');
      }
    }
    
    // Convert blob to base64 (without data URL prefix)
    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    // Open content image in lightbox
    function openContentImage(ratio) {
      const url = contentImages[ratio];
      if (url) {
        openLightbox(url);
      }
    }

    function handleGeneratedDragStart(event, url) {
      event.dataTransfer.setData('text/plain', url);
      event.currentTarget.parentElement.classList.add('drag-source');
    }

    function handlePreviewDragEnd(event) {
      document.getElementById('previewArea').classList.remove('drag-source');
    }

    function addToHistory(url, prompt) {
      // Store the record ID, base ID, and table ID with each image
      generationHistory.unshift({
        url,
        prompt,
        timestamp: Date.now(),
        recordId: currentRecordId || null,
        baseId: (currentBase || {}).id || null,
        tableId: (currentTable || {}).id || null,
        articleTitle: ((currentRecord || {}).fields || {}).sourceHeadline || ((currentRecord || {}).fields || {}).Title || 'Unknown'
      });
      if (generationHistory.length > 20) generationHistory.pop();
      localStorage.setItem('imageGenHistory', JSON.stringify(generationHistory));
      renderHistory();
    }
    
    // ========================================
    // BUILD NOCODB ATTACHMENT OBJECT
    // NocoDB Attachment columns require an array of objects, not a plain URL string.
    // Sending a plain string causes ERR_INVALID_ATTACHMENT_JSON.
    // ========================================
    function buildAttachmentPayload(imageUrl) {
      var lower = (imageUrl || '').toLowerCase().split('?')[0]; // strip query string for ext check
      var isJpeg = lower.endsWith('.jpg') || lower.endsWith('.jpeg');
      var mimetype = isJpeg ? 'image/jpeg' : 'image/png';
      // Extract filename from URL path, fall back to a sensible default
      var pathPart = imageUrl.split('?')[0];
      var title = pathPart.substring(pathPart.lastIndexOf('/') + 1) || 'generated-image.png';
      // Ensure the title has an extension
      if (title.indexOf('.') === -1) {
        title = title + (isJpeg ? '.jpg' : '.png');
      }
      return [{ url: imageUrl, title: title, mimetype: mimetype }];
    }

    // ========================================
    // REFRESH RECORD THUMBNAIL AFTER SAVE
    // Re-fetches the current record from NocoDB and updates the thumbnail
    // in the Content Review section so the new image displays immediately.
    // ========================================
    async function refreshRecordThumbnail() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      try {
        const res = await fetch(
          \`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`,
          { headers: { 'xc-token': NOCODB_TOKEN } }
        );
        const freshRecord = await res.json();
        if (!freshRecord || !freshRecord.fields) return;

        // Update the global record cache so subsequent reads are fresh
        currentRecord = freshRecord;
        const f = freshRecord.fields;

        // Log exact field names so we can verify the column name in production
        console.log('[refreshRecordThumbnail] field keys from NocoDB:', Object.keys(f));
        console.log('[refreshRecordThumbnail] "Post Image Preview" value:', f['Post Image Preview']);

        // Re-render thumbnail — Post Image Preview is an Attachment array
        var detailThumb = document.getElementById('detailThumb');
        var detailFallback = document.getElementById('detailThumbFallback');
        var toProxyUrl = function(path) {
          if (!path) return '';
          var cleanPath = path.startsWith('/') ? path.substring(1) : path;
          return '/api/nocodb-proxy/' + cleanPath;
        };

        var thumbUrl = '';
        if (f['Post Image Preview'] && Array.isArray(f['Post Image Preview']) && f['Post Image Preview'].length > 0) {
          var att = f['Post Image Preview'][0];
          var thumbnails = att.thumbnails || {};
          // Prefer signedUrl if present (NocoDB may return signed URLs for private storage)
          thumbUrl = att.signedUrl || att.url ||
            (att.signedPath ? toProxyUrl(att.signedPath) : '') ||
            (att.path ? toProxyUrl(att.path) : '') ||
            (thumbnails.large || {}).signedUrl ||
            (thumbnails.large || {}).url ||
            ((thumbnails.large || {}).signedPath ? toProxyUrl((thumbnails.large || {}).signedPath) : '') ||
            (thumbnails.full || {}).signedUrl ||
            (thumbnails.full || {}).url ||
            (thumbnails.card_cover || {}).url ||
            '';
        }
        if (!thumbUrl && f['Post Image'] && f['Post Image'].startsWith('http')) {
          thumbUrl = f['Post Image'];
        }

        if (thumbUrl) {
          detailThumb.src = thumbUrl;
          detailThumb.classList.remove('hidden');
          detailFallback.classList.add('hidden');
          // Also refresh the 16:9 content image slot so it shows the saved image
          setContentImage('16:9', thumbUrl);
          console.log('[refreshRecordThumbnail] thumbnail updated to:', thumbUrl);
        } else {
          console.log('[refreshRecordThumbnail] no image URL found after re-fetch; fields present:', Object.keys(f));
        }
      } catch (err) {
        console.error('[refreshRecordThumbnail] failed to re-fetch record:', err);
      }
    }

    // ========================================
    // AUTO-SAVE IMAGE TO NOCODB
    // ========================================
    async function autoSaveImageToNocoDB(imageUrl) {
      // Only save if we have a current record selected
      if (!currentRecordId || !currentBase || !currentTable) {
        console.log('No record selected - skipping auto-save to NocoDB');
        return;
      }
      
      try {
        // Post Image Preview is an Attachment column — must send an array of objects
        const attachmentPayload = buildAttachmentPayload(imageUrl);
        console.log('[NocoDB save] PATCHing "Post Image Preview" with attachment payload:', JSON.stringify(attachmentPayload));
        
        // Save to NocoDB
        const res = await fetch('/api/records/' + currentRecordId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 'Post Image Preview': attachmentPayload })
        });
        
        const result = await res.json();
        console.log('[NocoDB save] PATCH response:', result);
        
        if (result.error) {
          console.error('[NocoDB save] error:', result.error);
          return;
        }
        
        // Update local record cache as an attachment array
        if (currentRecord && currentRecord.fields) {
          currentRecord.fields['Post Image Preview'] = attachmentPayload;
        }
        
        console.log('✓ Image URL saved to NocoDB "Post Image Preview" field');
        showSaveIndicator();

        // Re-fetch the current record from NocoDB and re-render the thumbnail
        // so the new image appears immediately in the Content Review section.
        await refreshRecordThumbnail();
        
      } catch (err) {
        console.error('Auto-save to NocoDB failed:', err);
      }
    }
    
    // Save a specific image from history to current NocoDB record
    async function saveHistoryImageToNocoDB(imageUrl) {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select an article first before saving images.');
        return;
      }
      
      await autoSaveImageToNocoDB(imageUrl);
      alert('Image saved to current article!');
    }
    
    // Save ALL history images to their CORRECT articles (based on stored record IDs)
    async function saveAllHistoryToArticle() {
      if (generationHistory.length === 0) {
        alert('No images in history to save.');
        return;
      }
      
      const btn = document.getElementById('saveAllHistoryBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      try {
        // Group images by their record ID
        const imagesByRecord = {};
        let unassignedCount = 0;
        
        generationHistory.forEach(item => {
          if (item.recordId && item.baseId && item.tableId) {
            const key = item.recordId;
            if (!imagesByRecord[key]) {
              imagesByRecord[key] = {
                recordId: item.recordId,
                baseId: item.baseId,
                tableId: item.tableId,
                articleTitle: item.articleTitle,
                images: []
              };
            }
            imagesByRecord[key].images.push({ url: item.url });
          } else {
            unassignedCount++;
          }
        });
        
        const recordKeys = Object.keys(imagesByRecord);
        
        if (recordKeys.length === 0) {
          alert("No images have article assignments. Images generated before this update don't have article tracking. Please generate new images with an article selected.");
          return;
        }
        
        console.log('Saving images to ' + recordKeys.length + ' different articles');
        
        let savedCount = 0;
        let errorCount = 0;
        
        // Save to each article
        for (const key of recordKeys) {
          const record = imagesByRecord[key];
          
          try {
            // Save only the first image URL to the correct NocoDB field: 'Post Image Preview'
            const imageUrl = (record.images[0] || {}).url || '';
            if (!imageUrl) {
              console.log('No image URL for record: ' + record.articleTitle);
              continue;
            }
            
            // Post Image Preview is an Attachment column — must send an array of objects
            const attachmentPayload = buildAttachmentPayload(imageUrl);
            console.log('[NocoDB save] PATCHing "Post Image Preview" for article:', record.articleTitle, '- payload:', JSON.stringify(attachmentPayload));
            // Save to NocoDB
            const res = await fetch('/api/records/' + record.recordId + '?baseId=' + record.baseId + '&tableId=' + record.tableId, {
              method: 'PATCH',
              headers: {
                'xc-token': NOCODB_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 'Post Image Preview': attachmentPayload })
            });
            
            const result = await res.json();
            console.log('[NocoDB save] PATCH response for', record.articleTitle, ':', result);
            
            if (result.error) {
              console.error('Error saving to ' + record.articleTitle + ':', result.error);
              errorCount++;
            } else {
              console.log('✓ Saved to "Post Image Preview" for: ' + record.articleTitle);
              savedCount++;
            }
          } catch (err) {
            console.error('Error saving to ' + record.articleTitle + ':', err);
            errorCount++;
          }
        }
        
        showSaveIndicator();
        
        let message = '✓ Saved ' + savedCount + ' images to ' + recordKeys.length + ' articles!';
        if (unassignedCount > 0) {
          message += '\\n\\n' + unassignedCount + ' images had no article assignment (generated before tracking was added).';
        }
        if (errorCount > 0) {
          message += '\\n\\n' + errorCount + ' articles had errors.';
        }
        alert(message);
        
      } catch (err) {
        console.error('Save all history failed:', err);
        alert('Error saving images: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save All';
      }
    }

    function renderHistory() {
      const grid = document.getElementById('historyGrid');
      if (generationHistory.length === 0) {
        grid.innerHTML = '<div class="text-center text-gray-500 w-full py-12"><i class="fas fa-clock text-3xl mb-2"></i><p class="text-sm">No images yet</p></div>';
        return;
      }
      // Show only the 4 most recent images in a single row
      const recentItems = generationHistory.slice(0, 4);
      grid.innerHTML = recentItems.map((item, i) => {
        const hasArticle = item.recordId;
        const shortTitle = item.articleTitle ? (item.articleTitle.length > 15 ? item.articleTitle.substring(0, 15) + '...' : item.articleTitle) : '';
        return \`
          <div class="history-item relative" draggable="true")" 
            onclick="openLightbox('\${item.url}')"
            title="\${item.articleTitle || 'No article assigned'}">
            <img src="\${item.url}" alt="History \${i + 1}">
            \${hasArticle ? '<div class="absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-green-400 px-2 py-1.5 truncate"><i class="fas fa-link mr-1"></i>' + shortTitle + '</div>' : '<div class="absolute bottom-0 left-0 right-0 bg-red-900/80 text-xs text-red-300 px-2 py-1.5"><i class="fas fa-unlink mr-1"></i>No article</div>'}
          </div>
        \`;
      }).join('');
    }
    
    // Toggle Reference Library visibility
    function toggleReferenceLibrary() {
      const content = document.getElementById('referenceLibraryContent');
      const toggle = document.getElementById('refLibraryToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(0deg)';
      }
    }
    
    // Toggle Record Details (collapsible section)
    function toggleRecordDetails() {
      const content = document.getElementById('recordDetailsContent');
      const toggle = document.getElementById('recordDetailsToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(0deg)';
      }
    }
    
    // Toggle Social Media Content (collapsible section)
    function toggleSocialContent() {
      const content = document.getElementById('socialContentBody');
      const toggle = document.getElementById('socialContentToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(0deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(180deg)';
      }
    }
    
    // Expand Social Content to full-screen modal
    function expandSocialContent() {
      const socialSection = document.getElementById('socialContentSection');
      const overlay = document.getElementById('socialExpandOverlay');
      
      if (!overlay) {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.id = 'socialExpandOverlay';
        newOverlay.className = 'fixed inset-0 z-50 bg-black/95 hidden';
        newOverlay.innerHTML = \`
          <div class="h-full flex flex-col p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-amber-500">
                <i class="fas fa-share-alt mr-2"></i>Social Media Content
              </h3>
              <button onclick="collapseSocialContent()" class="text-gray-400 hover:text-white text-2xl">
                <i class="fas fa-compress-alt"></i>
              </button>
            </div>
            <div id="expandedTabsContainer" class="flex border-b border-white/10 mb-4 overflow-x-auto gap-1"></div>
            <div id="expandedTextarea" class="flex-1 flex flex-col">
              <textarea id="expandedContent" 
                class="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-lg resize-none focus:border-amber-500 focus:outline-none"
                placeholder="Select a tab to edit..."></textarea>
            </div>
          </div>
        \`;
        document.body.appendChild(newOverlay);
      }
      
      // Copy tabs to expanded view
      const expandedTabs = document.getElementById('expandedTabsContainer');
      const activeTabEl = document.querySelector('.tab-btn.tab-active');
      const activeTab = (activeTabEl ? activeTabEl.dataset.tab : null) || 'twitter';
      expandedTabs.innerHTML = ['twitter', 'threads', 'bluesky', 'linkedin', 'facebook', 'instagram', 'blog', 'script']
        .map(tab => \`<button onclick="switchExpandedTab('\${tab}')" class="tab-btn \${tab === activeTab ? 'tab-active' : ''} px-4 py-3 text-base whitespace-nowrap" data-expanded-tab="\${tab}">
          <i class="\${getTabIcon(tab)} mr-2"></i>\${getTabLabel(tab)}
        </button>\`).join('');
      
      // Sync current content
      const currentTextarea = document.getElementById(\`content\${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}\`);
      document.getElementById('expandedContent').value = (currentTextarea ? currentTextarea.value : null) || '';
      document.getElementById('expandedContent').dataset.currentTab = activeTab;
      
      document.getElementById('socialExpandOverlay').classList.remove('hidden');
    }
    
    function collapseSocialContent() {
      // Save content back to original textarea
      const expandedContent = document.getElementById('expandedContent');
      const currentTab = expandedContent.dataset.currentTab;
      if (currentTab) {
        const originalTextarea = document.getElementById(\`content\${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}\`);
        if (originalTextarea) {
          originalTextarea.value = expandedContent.value;
          // Trigger auto-save
          originalTextarea.dispatchEvent(new Event('change'));
        }
      }
      document.getElementById('socialExpandOverlay').classList.add('hidden');
    }
    
    function switchExpandedTab(tab) {
      const expandedContent = document.getElementById('expandedContent');
      const previousTab = expandedContent.dataset.currentTab;
      
      // Save content from previous tab
      if (previousTab) {
        const prevTextarea = document.getElementById(\`content\${previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}\`);
        if (prevTextarea) {
          prevTextarea.value = expandedContent.value;
        }
      }
      
      // Load new tab content
      const newTextarea = document.getElementById(\`content\${tab.charAt(0).toUpperCase() + tab.slice(1)}\`);
      expandedContent.value = (newTextarea ? newTextarea.value : null) || '';
      expandedContent.dataset.currentTab = tab;
      
      // Update tab styling
      document.querySelectorAll('[data-expanded-tab]').forEach(btn => {
        btn.classList.toggle('tab-active', btn.dataset.expandedTab === tab);
      });
    }
    
    function getTabIcon(tab) {
      const icons = {
        twitter: 'fab fa-twitter',
        threads: 'fab fa-threads',
        bluesky: 'fas fa-cloud',
        linkedin: 'fab fa-linkedin',
        facebook: 'fab fa-facebook',
        instagram: 'fab fa-instagram',
        blog: 'fas fa-blog',
        script: 'fas fa-video'
      };
      return icons[tab] || 'fas fa-file';
    }
    
    function getTabLabel(tab) {
      const labels = {
        twitter: 'Twitter/X',
        threads: 'Threads',
        bluesky: 'Bluesky',
        linkedin: 'LinkedIn',
        facebook: 'Facebook',
        instagram: 'Instagram',
        blog: 'Blog',
        script: 'Script'
      };
      return labels[tab] || tab;
    }

    function handleHistoryDragStart(event, url) {
      event.dataTransfer.setData('text/plain', url);
    }
    
    // ========================================
    // LIGHTBOX FUNCTIONS WITH ZOOM
    // ========================================
    let currentLightboxUrl = null;
    let lightboxZoom = 1;
    let lightboxIsDragging = false;
    let lightboxDragStart = { x: 0, y: 0 };
    let lightboxScrollStart = { x: 0, y: 0 };
    
    function openLightbox(url) {
      currentLightboxUrl = url;
      lightboxZoom = 1;
      document.getElementById('lightboxImage').src = url;
      document.getElementById('lightboxOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
      updateLightboxZoom();
      
      // Reset container scroll
      const container = document.getElementById('lightboxZoomContainer');
      container.scrollTop = 0;
      container.scrollLeft = 0;
      container.classList.remove('zoomed');
    }
    
    function closeLightbox(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('lightboxOverlay').classList.remove('active');
      document.body.style.overflow = '';
      currentLightboxUrl = null;
      lightboxZoom = 1;
    }
    
    function updateLightboxZoom() {
      const img = document.getElementById('lightboxImage');
      const container = document.getElementById('lightboxZoomContainer');
      const zoomLabel = document.getElementById('lightboxZoomLevel');
      
      img.style.transform = 'scale(' + lightboxZoom + ')';
      zoomLabel.textContent = Math.round(lightboxZoom * 100) + '%';
      
      if (lightboxZoom > 1) {
        container.classList.add('zoomed');
        img.style.transformOrigin = 'top left';
      } else {
        container.classList.remove('zoomed');
        img.style.transformOrigin = 'center center';
      }
    }
    
    function lightboxZoomIn() {
      lightboxZoom = Math.min(lightboxZoom + 0.5, 5);
      updateLightboxZoom();
    }
    
    function lightboxZoomOut() {
      lightboxZoom = Math.max(lightboxZoom - 0.5, 0.5);
      updateLightboxZoom();
    }
    
    function lightboxZoomReset() {
      lightboxZoom = 1;
      updateLightboxZoom();
      const container = document.getElementById('lightboxZoomContainer');
      container.scrollTop = 0;
      container.scrollLeft = 0;
    }
    
    function toggleLightboxZoom(event) {
      event.stopPropagation();
      
      // If zoomed in, zoom out. If zoomed out, zoom in to 2x
      if (lightboxZoom > 1) {
        lightboxZoom = 1;
      } else {
        lightboxZoom = 2.5;
      }
      updateLightboxZoom();
      
      // If zooming in, try to center on click position
      if (lightboxZoom > 1) {
        const container = document.getElementById('lightboxZoomContainer');
        const rect = container.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Scroll to center the clicked area
        setTimeout(() => {
          container.scrollLeft = (clickX * lightboxZoom) - (rect.width / 2);
          container.scrollTop = (clickY * lightboxZoom) - (rect.height / 2);
        }, 50);
      }
    }
    
    function handleLightboxWheel(event) {
      event.preventDefault();
      event.stopPropagation();
      
      const delta = event.deltaY > 0 ? -0.25 : 0.25;
      lightboxZoom = Math.max(0.5, Math.min(5, lightboxZoom + delta));
      updateLightboxZoom();
    }
    
    // Drag to pan when zoomed
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('lightboxZoomContainer');
      if (!container) return;
      
      container.addEventListener('mousedown', (e) => {
        if (lightboxZoom <= 1) return;
        lightboxIsDragging = true;
        lightboxDragStart = { x: e.clientX, y: e.clientY };
        lightboxScrollStart = { x: container.scrollLeft, y: container.scrollTop };
        container.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!lightboxIsDragging) return;
        const dx = e.clientX - lightboxDragStart.x;
        const dy = e.clientY - lightboxDragStart.y;
        container.scrollLeft = lightboxScrollStart.x - dx;
        container.scrollTop = lightboxScrollStart.y - dy;
      });
      
      document.addEventListener('mouseup', () => {
        lightboxIsDragging = false;
        const container = document.getElementById('lightboxZoomContainer');
        if (container && lightboxZoom > 1) {
          container.style.cursor = 'grab';
        }
      });
    });
    
    async function lightboxUseImage() {
      if (!currentLightboxUrl) return;
      
      // Set as the current generated image
      lastGeneratedUrl = currentLightboxUrl;
      await showGeneratedImage(currentLightboxUrl, currentAspectRatio);
      
      // Also put it in the content images
      useImageInContent();
      
      closeLightbox();
    }
    
    function lightboxDownload() {
      if (!currentLightboxUrl) return;
      window.open(currentLightboxUrl, '_blank');
    }
    
    function lightboxCopyUrl() {
      if (!currentLightboxUrl) return;
      navigator.clipboard.writeText(currentLightboxUrl);
      alert('URL copied to clipboard!');
    }
    
    async function lightboxSaveToArticle() {
      if (!currentLightboxUrl) return;
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select an article first before saving images.');
        return;
      }
      await autoSaveImageToNocoDB(currentLightboxUrl);
      closeLightbox();
    }
    
    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    function downloadImage() {
      if (!lastGeneratedUrl) return;
      window.open(lastGeneratedUrl, '_blank');
    }

    function copyImageUrl() {
      if (!lastGeneratedUrl) return;
      navigator.clipboard.writeText(lastGeneratedUrl);
      const btn = event.currentTarget;
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
      setTimeout(() => btn.innerHTML = original, 1500);
    }

    // ========================================
    // IMAGE DROP ZONES
    // ========================================
    function handleImageDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-over');
    }

    function handleImageDragLeave(event) {
      event.currentTarget.classList.remove('drag-over');
    }

    // Original handler for simple URL drops (from Generation History)
    async function handleImageDrop(event, aspectRatio) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (!imageUrl) return;

      setContentImage(aspectRatio, imageUrl);
    }
    
    // Enhanced handler for Content Images - handles files, URLs, and external images
    async function handleContentImageDrop(event, aspectRatio) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      // Check for files first (dragged from computer)
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          await uploadAndSetImage(file, aspectRatio);
          return;
        }
      }
      
      // Check for URL (dragged from browser or Generation History)
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
        setContentImage(aspectRatio, imageUrl);
        return;
      }
      
      // Check for HTML with image (dragged from web page)
      const html = event.dataTransfer.getData('text/html');
      if (html) {
        const match = html.match(/src=["']([^"']+)["']/);
        if (match && match[1]) {
          setContentImage(aspectRatio, match[1]);
          return;
        }
      }
    }
    
    // Handle file input upload for content images
    async function handleContentFileUpload(event, aspectRatio) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        await uploadAndSetImage(file, aspectRatio);
      }
      // Reset file input so same file can be selected again
      event.target.value = '';
    }
    
    // Upload file and set as content image
    async function uploadAndSetImage(file, aspectRatio) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      
      // Show loading state
      container.innerHTML = '<div class="flex flex-col items-center gap-2"><i class="fas fa-spinner fa-spin text-2xl text-amber-500"></i><span class="text-xs text-gray-400">Uploading...</span></div>';
      
      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        // Upload to freeimage.host
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64 })
        });
        const uploadData = await uploadRes.json();
        
        if ((uploadData.image || {}).url) {
          setContentImage(aspectRatio, uploadData.image.url);
        } else {
          throw new Error('Upload failed');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        container.innerHTML = '<span class="text-red-400 text-sm">Upload failed - try again</span>';
        setTimeout(() => {
          container.innerHTML = '<span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>';
        }, 2000);
      }
    }
    
    // Convert file to base64
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    // Set content image with X button to remove
    function setContentImage(aspectRatio, imageUrl) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      container.innerHTML = \`
        <img src="\${imageUrl}" alt="\${aspectRatio}">
        <button class="remove-image-btn" onclick="event.stopPropagation(); clearContentImage('\${aspectRatio}')" title="Remove image">
          <i class="fas fa-times"></i>
        </button>
      \`;
      container.classList.add('has-image');
      
      contentImages[aspectRatio] = imageUrl;

      if (currentRecordId) {
        showSaveIndicator();
      }
    }
    
    // Clear/remove content image
    function clearContentImage(aspectRatio) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      container.innerHTML = '<span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>';
      container.classList.remove('has-image');
      
      contentImages[aspectRatio] = null;
      
      showSaveIndicator();
    }
    
    // ========================================
    // RESIZE TO ALL SIZES
    // ========================================
    function toggleResizeDropdown() {
      const dropdown = document.getElementById('resizeDropdown');
      dropdown.classList.toggle('hidden');
      
      // Close dropdown when clicking outside
      if (!dropdown.classList.contains('hidden')) {
        setTimeout(() => {
          document.addEventListener('click', closeResizeDropdown, { once: true });
        }, 10);
      }
    }
    
    function closeResizeDropdown(event) {
      const dropdown = document.getElementById('resizeDropdown');
      const btn = document.getElementById('resizeDropdownBtn');
      if (!dropdown.contains(event.target) && !btn.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    }
    
    async function resizeToAllSizes(method) {
      // Close dropdown
      document.getElementById('resizeDropdown').classList.add('hidden');
      
      // Find which image we have to use as source
      // Priority: 16:9 > 9:16 > 1:1
      let sourceUrl = contentImages['16:9'] || contentImages['9:16'] || contentImages['1:1'];
      let sourceRatio = contentImages['16:9'] ? '16:9' : (contentImages['9:16'] ? '9:16' : '1:1');
      
      if (!sourceUrl) {
        alert('Please add an image to any slot first, then resize to other sizes.');
        return;
      }
      
      // Show status
      const statusDiv = document.getElementById('resizeStatus');
      const statusText = document.getElementById('resizeStatusText');
      statusDiv.classList.remove('hidden');
      
      // Determine which sizes to generate
      const allRatios = ['16:9', '9:16', '1:1'];
      const sizesToGenerate = allRatios.filter(r => r !== sourceRatio || !contentImages[r]);
      
      try {
        for (const targetRatio of sizesToGenerate) {
          if (contentImages[targetRatio] && targetRatio === sourceRatio) continue; // Skip source
          
          statusText.textContent = method === 'ai' 
            ? 'AI generating ' + targetRatio + '...' 
            : 'Cropping to ' + targetRatio + '...';
          
          let resultUrl;
          
          if (method === 'ai') {
            // Use fal.ai Flux Klein 9B to regenerate
            resultUrl = await generateImageForRatioFal(targetRatio);
          } else {
            // Use canvas to crop
            resultUrl = await cropImageToRatio(sourceUrl, targetRatio);
          }
          
          // Check if headline text should be added
          const addHeadlineTextEl = document.getElementById('addHeadlineText');
          const addHeadlineText = addHeadlineTextEl ? addHeadlineTextEl.checked : false;
          const shortHeadlineEl = document.getElementById('shortHeadline');
          const shortHeadline = shortHeadlineEl && shortHeadlineEl.value ? shortHeadlineEl.value.trim() : '';
          
          if (addHeadlineText && shortHeadline) {
            statusText.textContent = 'Adding text to ' + targetRatio + '...';
            try {
              resultUrl = await addTextOverlayWithZImage(resultUrl, shortHeadline, targetRatio);
            } catch (err) {
              console.error('Error adding text overlay:', err);
            }
          }
          
          setContentImage(targetRatio, resultUrl);
          addToHistory(resultUrl, 'Resized from ' + sourceRatio + ' to ' + targetRatio);
        }
        
        statusText.textContent = 'All sizes created!';
        setTimeout(() => statusDiv.classList.add('hidden'), 2000);
        
        // Auto-save
        if (currentRecordId && currentBase && currentTable) {
          await saveImagesToNocoDB();
        }
        
      } catch (err) {
        console.error('Error resizing:', err);
        statusText.textContent = 'Error: ' + err.message;
        setTimeout(() => statusDiv.classList.add('hidden'), 3000);
      }
    }

    // ========================================
    // AUTO-SAVE
    // ========================================
    function setupAutoSave() {
      document.querySelectorAll('.editable-field').forEach(field => {
        field.removeEventListener('input', handleFieldInput);
        field.addEventListener('input', handleFieldInput);
      });
    }

    function handleFieldInput(e) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => autoSave(e.target), 1000);
    }

    async function autoSave(field) {
      if (!currentRecordId || !currentBase || !currentTable) return;
      
      const nocodbField = field.dataset.field;
      if (!nocodbField) return;
      
      try {
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [nocodbField]: field.value })
        });
        
        if (res.ok) {
          showSaveIndicator();
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }

    function showSaveIndicator() {
      const indicator = document.getElementById('saveIndicator');
      indicator.classList.add('show');
      setTimeout(() => indicator.classList.remove('show'), 1500);
    }

    // ========================================
    // TABS
    // ========================================
    function showTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      
      document.querySelector(\`[data-tab="\${tab}"]\`).classList.add('tab-active');
      document.getElementById('tab-' + tab).classList.remove('hidden');
    }

    function copyContent(type) {
      const contentMap = {
        twitter: 'contentTwitter', threads: 'contentThreads', bluesky: 'contentBluesky',
        linkedin: 'contentLinkedin', facebook: 'contentFacebook', instagram: 'contentInstagram',
        blog: 'contentBlog', script: 'contentScript'
      };
      const text = document.getElementById(contentMap[type]).value;
      navigator.clipboard.writeText(text);
      
      const btn = event.currentTarget;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
      setTimeout(() => btn.innerHTML = originalHtml, 1500);
    }

    // ========================================
    // RECORD ACTIONS
    // ========================================
    async function approveRecord() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
        method: 'PATCH',
        headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Approved' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    async function declineRecord() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
        method: 'PATCH',
        headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Declined' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    // ========================================
    // RE-ENRICH RECORD FROM SOURCE URL
    // ========================================
    async function reEnrichRecord() {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select a record first.');
        return;
      }

      // Extract the source URL from the record's Source field.
      // The field may contain extra text like "TechCrunch - https://..." so we
      // pull out the first http(s) URL we find.
      const sourceRaw = (currentRecord && currentRecord.fields && currentRecord.fields.Source) || '';
      const urlMatch = sourceRaw.match(/https?:\/\/[^\s]+/);
      const sourceUrl = urlMatch ? urlMatch[0].replace(/[.,;)]+$/, '') : '';

      if (!sourceUrl) {
        alert('No source URL found for this record. Make sure the Source field contains a URL.');
        return;
      }

      const btn = document.getElementById('reEnrichBtn');
      const statusEl = document.getElementById('reEnrichStatus');
      const originalBtnHtml = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Re-Enriching...';
      statusEl.className = 'w-full mt-2 text-xs px-1 text-blue-400';
      statusEl.textContent = 'Fetching article from ' + sourceUrl + '...';

      try {
        const res = await fetch('/api/re-enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCODB_TOKEN
          },
          body: JSON.stringify({
            sourceUrl: sourceUrl,
            recordId:  currentRecordId,
            tableId:   currentTable.id
          })
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Update the Content Review UI immediately with the returned fields
        const f = data.fields || {};

        // Headline
        if (f.Headline) {
          document.getElementById('detailTitle').textContent = f.Headline;
          if (currentRecord && currentRecord.fields) currentRecord.fields.Headline = f.Headline;
        }
        // Rewritten Headline
        var rwEl = document.getElementById('detailRewritten');
        var rwWrap = document.getElementById('detailRewrittenWrap');
        if (f['Rewritten Headline']) {
          rwEl.textContent = f['Rewritten Headline'];
          rwWrap.classList.remove('hidden');
          if (currentRecord && currentRecord.fields) currentRecord.fields['Rewritten Headline'] = f['Rewritten Headline'];
        }
        // Caption
        var capEl = document.getElementById('detailCaption');
        var capWrap = document.getElementById('detailCaptionWrap');
        if (f.Caption) {
          capEl.textContent = f.Caption;
          capWrap.classList.remove('hidden');
          if (currentRecord && currentRecord.fields) currentRecord.fields.Caption = f.Caption;
        }
        // Why It Matters
        var whyEl = document.getElementById('detailWhy');
        var whyWrap = document.getElementById('detailWhyWrap');
        if (f['Why It Matters']) {
          whyEl.textContent = f['Why It Matters'];
          whyWrap.classList.remove('hidden');
          if (currentRecord && currentRecord.fields) currentRecord.fields['Why It Matters'] = f['Why It Matters'];
        }

        // Refresh the records list so the headline update shows in the sidebar
        loadRecords();

        statusEl.className = 'w-full mt-2 text-xs px-1 text-green-400';
        statusEl.textContent = '\u2713 Re-enriched successfully from ' + sourceUrl;

        // Auto-hide the status message after 5 seconds
        setTimeout(() => { statusEl.className = 'hidden'; statusEl.textContent = ''; }, 5000);

      } catch (err) {
        console.error('[reEnrichRecord] error:', err);
        statusEl.className = 'w-full mt-2 text-xs px-1 text-red-400';
        statusEl.textContent = '\u2717 Re-enrich failed: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    }

    // ========================================
    // SAVE IMAGES TO NOCODB
    // ========================================
    async function saveImagesToNocoDB() {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select a record first before saving images.');
        return;
      }
      
      // Check if we have any images to save
      const hasImages = contentImages['16:9'] || contentImages['9:16'] || contentImages['1:1'];
      if (!hasImages) {
        alert('No images to save. Generate or drop images first.');
        return;
      }
      
      const btn = document.getElementById('saveImagesToNocoDBBtn');
      const statusDiv = document.getElementById('saveImagesStatus');
      const statusText = document.getElementById('saveImagesText');
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
      statusDiv.classList.remove('hidden');
      
      try {
        // Get the first available image URL - priority: 16:9 > 1:1 > 9:16
        let imageUrl = '';
        if (contentImages['16:9']) {
          imageUrl = contentImages['16:9'];
        } else if (contentImages['1:1']) {
          imageUrl = contentImages['1:1'];
        } else if (contentImages['9:16']) {
          imageUrl = contentImages['9:16'];
        }
        
        if (!imageUrl) {
          throw new Error('No images to save. Add images to Content Images first.');
        }
        
        // Post Image Preview is an Attachment column — must send an array of objects
        // Also save the current Image Prompt from the review textarea
        const reviewPromptVal = (document.getElementById('reviewImagePrompt') || {}).value || '';
        const mainPromptVal = (document.getElementById('promptInput') || {}).value || '';
        const imagePromptToSave = reviewPromptVal || mainPromptVal;

        // Build updates object — always include 16:9 (Post Image Preview), and
        // add 9:16 and 1:1 attachment fields when those slots have images.
        const attachmentPayload = buildAttachmentPayload(imageUrl);
        const updates = { 'Post Image Preview': attachmentPayload };

        const url916 = contentImages['9:16'];
        const url1x1 = contentImages['1:1'];
        if (url916) {
          updates['Post Image 9:16'] = buildAttachmentPayload(url916);
        }
        if (url1x1) {
          updates['Post Image 1:1'] = buildAttachmentPayload(url1x1);
        }

        if (imagePromptToSave) {
          updates.ImagePrompt = imagePromptToSave;
        }

        // Count how many image fields are being saved
        const imageFieldsSaved = ['Post Image Preview', ...(url916 ? ['Post Image 9:16'] : []), ...(url1x1 ? ['Post Image 1:1'] : [])];
        const savedCount = imageFieldsSaved.length;

        console.log('[NocoDB save] PATCHing fields:', imageFieldsSaved.join(', '));
        console.log('[NocoDB save] "Post Image Preview" payload:', JSON.stringify(attachmentPayload));
        if (url916) console.log('[NocoDB save] "Post Image 9:16" payload:', JSON.stringify(updates['Post Image 9:16']));
        if (url1x1) console.log('[NocoDB save] "Post Image 1:1" payload:', JSON.stringify(updates['Post Image 1:1']));
        
        // Save to NocoDB
        statusText.textContent = 'Uploading ' + savedCount + ' image(s) to NocoDB...';
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        const result = await res.json();
        console.log('[NocoDB save] PATCH response:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'NocoDB error');
        }

        // Update local record cache for all saved fields
        if (currentRecord && currentRecord.fields) {
          currentRecord.fields['Post Image Preview'] = attachmentPayload;
          if (url916) currentRecord.fields['Post Image 9:16'] = updates['Post Image 9:16'];
          if (url1x1) currentRecord.fields['Post Image 1:1'] = updates['Post Image 1:1'];
        }
        
        statusText.textContent = '\u2713 Saved ' + savedCount + ' image slot(s) [' + imageFieldsSaved.join(', ') + ']' + (imagePromptToSave ? ' + prompt' : '') + ' to NocoDB!';
        statusDiv.classList.remove('border-blue-500/30', 'bg-blue-900/30');
        statusDiv.classList.add('border-green-500/30', 'bg-green-900/30');
        statusText.classList.remove('text-blue-300');
        statusText.classList.add('text-green-300');
        
        showSaveIndicator();

        // Re-fetch the current record from NocoDB and re-render the thumbnail
        // so the new image appears immediately in the Content Review section.
        await refreshRecordThumbnail();
        
        // Hide status after a moment
        setTimeout(() => {
          statusDiv.classList.add('hidden');
          statusDiv.classList.remove('border-green-500/30', 'bg-green-900/30');
          statusDiv.classList.add('border-blue-500/30', 'bg-blue-900/30');
          statusText.classList.remove('text-green-300');
          statusText.classList.add('text-blue-300');
        }, 3000);
        
      } catch (err) {
        console.error('Error saving images:', err);
        statusText.textContent = '✗ Error: ' + err.message;
        statusDiv.classList.remove('border-blue-500/30', 'bg-blue-900/30');
        statusDiv.classList.add('border-red-500/30', 'bg-red-900/30');
        statusText.classList.remove('text-blue-300');
        statusText.classList.add('text-red-300');
        
        setTimeout(() => {
          statusDiv.classList.add('hidden');
          statusDiv.classList.remove('border-red-500/30', 'bg-red-900/30');
          statusDiv.classList.add('border-blue-500/30', 'bg-blue-900/30');
          statusText.classList.remove('text-red-300');
          statusText.classList.add('text-blue-300');
        }, 5000);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Save to NocoDB';
      }
    }

    // ========================================
    // CONTENT CALENDAR
    // ========================================
    let calendarDate = new Date();
    let calendarPosts = []; // Posts with scheduled dates
    let unscheduledPosts = []; // Posts ready to schedule (approved but no date)
    let draggedPost = null;
    
    function renderCalendar() {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      
      // Update header
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      document.getElementById('calendarMonthYear').textContent = monthNames[month] + ' ' + year;
      
      // Get first day and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay(); // 0 = Sunday
      const daysInMonth = lastDay.getDate();
      
      // Get days from previous month to fill first row
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      // Build calendar grid
      let html = '';
      let dayCount = 1;
      let nextMonthDay = 1;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 6 rows max
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
          const cellIndex = row * 7 + col;
          let dateStr = '';
          let dayNumber = '';
          let isOtherMonth = false;
          let isToday = false;
          
          if (cellIndex < startDay) {
            // Previous month
            dayNumber = prevMonthLastDay - startDay + cellIndex + 1;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            dateStr = prevYear + '-' + String(prevMonth + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isOtherMonth = true;
          } else if (dayCount <= daysInMonth) {
            // Current month
            dayNumber = dayCount;
            dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isToday = dateStr === todayStr;
            dayCount++;
          } else {
            // Next month
            dayNumber = nextMonthDay;
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            dateStr = nextYear + '-' + String(nextMonth + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isOtherMonth = true;
            nextMonthDay++;
          }
          
          // Get posts for this date
          const dayPosts = calendarPosts.filter(p => p.scheduledDate === dateStr);
          
          html += '<div class="calendar-day' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '') + '" ' +
                  'data-date="' + dateStr + '" ' +
                  'ondragover="handleCalendarDragOver(event)" ' +
                  'ondragleave="handleCalendarDragLeave(event)" ' +
                  'ondrop="handleCalendarDrop(event)" ' +
                  'onclick="openDayDetail(\\'' + dateStr + '\\')">' +
                  '<div class="calendar-day-number">' + dayNumber + '</div>' +
                  '<div class="calendar-day-posts">' + renderDayPosts(dayPosts) + '</div>' +
                  '</div>';
        }
        
        // Stop if we've gone past the current month
        if (dayCount > daysInMonth && row >= 4) break;
      }
      
      document.getElementById('calendarGrid').innerHTML = html;
    }
    
    function renderDayPosts(posts) {
      if (posts.length === 0) return '';
      
      const maxShow = 3;
      let html = posts.slice(0, maxShow).map(p => 
        '<img src="' + p.thumbnail + '" class="calendar-post-thumb" title="' + escapeHtml(p.title) + '" onclick="event.stopPropagation(); selectRecord(\\'' + p.id + '\\', event)">'
      ).join('');
      
      if (posts.length > maxShow) {
        html += '<div class="calendar-post-more">+' + (posts.length - maxShow) + '</div>';
      }
      
      return html;
    }
    
    function prevMonth() {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    }
    
    function nextMonth() {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    }
    
    function goToToday() {
      calendarDate = new Date();
      renderCalendar();
    }
    
    // Load posts for calendar
    async function loadCalendarPosts() {
      if (!currentBase || !currentTable) return;
      
      try {
        // Fetch all records to find scheduled and unscheduled posts
        const res = await fetch('/api/records?baseId=' + currentBase.id + '&tableId=' + currentTable.id + '&pageSize=100', {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) return;
        
        const records = data.records || [];
        
        // Find date field and image field
        const dateField = (tableFields.find(f => f.type === 'date') || {}).name || 'Start date';
        const imageField = (tableFields.find(f => IMAGE_FIELD_TYPES.includes(f.type)) || {}).name;
        // Title: prefer actual NocoDB field names used in Articles table
        const titleFieldPriority = ['Headline', 'Title', 'Name', 'sourceHeadline'];
        const foundTitleField = titleFieldPriority.find(f => tableFields.find(tf => tf.name === f));
        // Fallback: use 'Headline' directly if tableFields is empty (NocoDB Articles table always has it)
        let titleField = foundTitleField || 'Headline';
        
        calendarPosts = [];
        unscheduledPosts = [];
        
        records.forEach(r => {
          const scheduledDate = r.fields[dateField];
          const status = (r.fields.Status || '').toLowerCase();
          const title = r.fields[titleField] || 'Untitled';
          
          // Get thumbnail - use same priority as card rendering:
          // 1. Post Image Preview attachment (NocoDB attachment field)
          // 2. Post Image URL text field
          // 3. Legacy imageURL field
          // 4. Generic imageField from tableFields schema
          let thumbnail = '';
          var pip = r.fields['Post Image Preview'];
          if (pip && Array.isArray(pip) && pip.length > 0) {
            var att = pip[0];
            thumbnail = att.url || att.signedUrl || ((att.thumbnails || {}).large || {}).url || ((att.thumbnails || {}).small || {}).url || (att.signedPath ? '/api/nocodb-proxy/' + att.signedPath : '') || (att.path ? '/api/nocodb-proxy/' + (att.path.startsWith('/') ? att.path.substring(1) : att.path) : '') || '';
          }
          if (!thumbnail && r.fields['Post Image'] && r.fields['Post Image'].startsWith('http')) {
            thumbnail = r.fields['Post Image'];
          }
          if (!thumbnail && r.fields.imageURL) {
            thumbnail = r.fields.imageURL;
          }
          if (!thumbnail && imageField && r.fields[imageField] && Array.isArray(r.fields[imageField]) && r.fields[imageField].length > 0) {
            const img = r.fields[imageField][0];
            thumbnail = ((img.thumbnails || {}).large || {}).url || ((img.thumbnails || {}).small || {}).url || img.url || (img.signedPath ? '/api/nocodb-proxy/' + img.signedPath : '') || (img.path ? '/api/nocodb-proxy/' + (img.path.startsWith('/') ? img.path.substring(1) : img.path) : '') || '';
          }
          
          const postObj = {
            id: r.id,
            title: typeof title === 'string' ? title : JSON.stringify(title),
            thumbnail: thumbnail,
            scheduledDate: scheduledDate || null,
            status: status
          };
          
          if (scheduledDate) {
            calendarPosts.push(postObj);
          } else if (status === 'approved' || status === 'ready' || thumbnail) {
            // Posts that are ready but not scheduled
            unscheduledPosts.push(postObj);
          }
        });
        
        renderCalendar();
        renderUnscheduledQueue();
        
      } catch (err) {
        console.error('Error loading calendar posts:', err);
      }
    }
    
    function renderUnscheduledQueue() {
      const queue = document.getElementById('readyToScheduleQueue');
      const count = document.getElementById('readyToScheduleCount');
      
      count.textContent = unscheduledPosts.length;
      
      if (unscheduledPosts.length === 0) {
        queue.innerHTML = '<p class="text-gray-500 text-sm p-4 text-center w-full">No posts ready to schedule</p>';
        return;
      }
      
      queue.innerHTML = unscheduledPosts.map(p => 
        '<div class="schedule-queue-item" draggable="true" ' +
        'ondragstart="handleQueueDragStart(event, \\'' + p.id + '\\')" ' +
        'ondragend="handleQueueDragEnd(event)" ' +
        'onclick="selectRecord(\\'' + p.id + '\\', event)">' +
        (p.thumbnail ? '<img src="' + p.thumbnail + '" alt="">' : '<div class="w-full h-[60px] bg-white/5 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500"></i></div>') +
        '<div class="schedule-queue-item-title">' + escapeHtml(p.title) + '</div>' +
        '</div>'
      ).join('');
    }
    
    // Drag and drop handlers
    function handleQueueDragStart(event, postId) {
      draggedPost = unscheduledPosts.find(p => p.id === postId) || calendarPosts.find(p => p.id === postId);
      event.currentTarget.classList.add('dragging');
      event.dataTransfer.setData('text/plain', postId);
    }
    
    function handleQueueDragEnd(event) {
      event.currentTarget.classList.remove('dragging');
      draggedPost = null;
    }
    
    function handleCalendarDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-over');
    }
    
    function handleCalendarDragLeave(event) {
      event.currentTarget.classList.remove('drag-over');
    }
    
    async function handleCalendarDrop(event) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      const date = event.currentTarget.dataset.date;
      const postId = event.dataTransfer.getData('text/plain');
      
      if (!postId || !date) return;
      
      // Open schedule modal to confirm time
      openScheduleModal(postId, date);
    }
    
    function openDayDetail(dateStr) {
      const dayPosts = calendarPosts.filter(p => p.scheduledDate === dateStr);
      
      if (dayPosts.length === 0) {
        // No posts - could open modal to schedule something
        return;
      }
      
      // If only one post, select it
      if (dayPosts.length === 1) {
        selectRecord(dayPosts[0].id, null);
        return;
      }
      
      // Multiple posts - show in modal
      const modal = document.getElementById('scheduleModal');
      const content = document.getElementById('scheduleModalContent');
      
      const dateObj = new Date(dateStr + 'T12:00:00');
      const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      
      content.innerHTML = 
        '<p class="text-sm text-gray-400 mb-4">' + dateFormatted + '</p>' +
        '<div class="space-y-3">' +
        dayPosts.map(p => 
          '<div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors" onclick="selectRecord(\\'' + p.id + '\\', null); closeScheduleModal();">' +
          (p.thumbnail ? '<img src="' + p.thumbnail + '" class="w-16 h-16 object-cover rounded">' : '<div class="w-16 h-16 bg-white/10 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500"></i></div>') +
          '<div class="flex-1 min-w-0">' +
          '<p class="text-sm font-medium truncate">' + escapeHtml(p.title) + '</p>' +
          '<p class="text-xs text-gray-500">' + (p.status || 'No status') + '</p>' +
          '</div>' +
          '</div>'
        ).join('') +
        '</div>';
      
      modal.classList.remove('hidden');
    }
    
    function openScheduleModal(postId, date) {
      const post = unscheduledPosts.find(p => p.id === postId) || calendarPosts.find(p => p.id === postId);
      if (!post) return;
      
      const modal = document.getElementById('scheduleModal');
      const content = document.getElementById('scheduleModalContent');
      
      const dateObj = new Date(date + 'T12:00:00');
      const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      
      content.innerHTML = 
        '<div class="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5">' +
        (post.thumbnail ? '<img src="' + post.thumbnail + '" class="w-20 h-20 object-cover rounded">' : '<div class="w-20 h-20 bg-white/10 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500 text-2xl"></i></div>') +
        '<div class="flex-1 min-w-0">' +
        '<p class="text-sm font-medium line-clamp-2">' + escapeHtml(post.title) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="mb-4">' +
        '<label class="text-sm text-gray-400 mb-2 block">Schedule for:</label>' +
        '<div class="flex items-center gap-2">' +
        '<input type="date" id="scheduleDate" value="' + date + '" class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">' +
        '<input type="time" id="scheduleTime" value="09:00" class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">' +
        '</div>' +
        '</div>' +
        '<div class="flex gap-3">' +
        '<button onclick="confirmSchedule(\\'' + postId + '\\')" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold py-2 rounded-lg transition-all">' +
        '<i class="fas fa-calendar-check mr-2"></i>Schedule' +
        '</button>' +
        '<button onclick="closeScheduleModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">' +
        'Cancel' +
        '</button>' +
        '</div>';
      
      modal.classList.remove('hidden');
    }
    
    function closeScheduleModal() {
      document.getElementById('scheduleModal').classList.add('hidden');
    }
    
    async function confirmSchedule(postId) {
      const date = document.getElementById('scheduleDate').value;
      const time = document.getElementById('scheduleTime').value;
      
      if (!date) {
        alert('Please select a date');
        return;
      }
      
      if (!currentBase || !currentTable) {
        alert('Please select a base and table first');
        return;
      }
      
      try {
        // Find the date field name
        const dateField = (tableFields.find(f => f.type === 'date') || {}).name || 'Start date';
        
        // Update NocoDB record
        const res = await fetch('/api/records/' + postId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [dateField]: date })
        });
        
        if (res.ok) {
          closeScheduleModal();
          showSaveIndicator();
          // Reload calendar
          await loadCalendarPosts();
        } else {
          throw new Error('Failed to update record');
        }
      } catch (err) {
        console.error('Error scheduling post:', err);
        alert('Failed to schedule post: ' + err.message);
      }
    }

    // ========================================
    // START
    // ========================================
    init();
  </script>
</body>
</html>
  `)
})

// Handle favicon.ico requests to prevent 500 errors
app.get('/favicon.ico', (c) => {
  return c.body(null, 204) // Return 204 No Content
})

// Catch-all route to prevent "Context is not finalized" errors
app.all('*', (c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app
