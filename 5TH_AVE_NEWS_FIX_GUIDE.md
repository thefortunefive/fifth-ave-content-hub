# 5th Ave News Workflow - Complete Status & Fix Guide

## Project Overview

- **Workflow ID**: XNLL4gkhUCfXKX5K
- **Workflow Name**: 5th Ave News
- **n8n MCP Endpoint**: https://fifthaveai.app.n8n.cloud/mcp-server/http
- **Airtable Base ID**: appgyL5gKf8rjaJPv
- **Airtable Table ID**: tblZwA0JCNPeORaGi

---

## ✅ COMPLETED FIXES

### 1. KieAI Image Generation - FIXED

**Correct Configuration:**
```json
={
  "model": "google/nano-banana",
  "input": {
    "prompt": {{ JSON.stringify($json.imagePrompt) }},
    "image_urls": [
      "https://iili.io/fM9hV6B.png",
      "https://iili.io/fM99P3l.png",
      "https://iili.io/fEiEfUB.png"
    ],
    "aspect_ratio": "16:9",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

**Reference Images:**
| Purpose | URL |
|---------|-----|
| Face Reference | `https://iili.io/fM9hV6B.png` |
| Outfit Reference | `https://iili.io/fM99P3l.png` |
| Logo Reference | `https://iili.io/fEiEfUB.png` |

**API Key**: `84c612356a4a1fdcb9d640ecf376d935`

### 2. Workflow Connections - FIXED
- Create a record → AI Writer1 (was disconnected)
- Infinite retry loop disconnected (Wait Retry → KieAI)

### 3. Airtable Data - CLEANED
- 15 bad records with broken data deleted
- 20 good records remain ready for processing

### 4. imagePrompt Field - FIXED
- Now uses AI-generated prompts from Angel Image Prompt node
- Expression: `={{ JSON.parse($json.message.content).image_prompt }}`

### 5. Create a Record Field Mappings - FIXED
- All fields reference `$('Split Stories')` node correctly

---

## ⏳ IN PROGRESS - Platform Content Generation

### Problem
These Airtable columns exist but are NOT being populated:
- `blogCopy`
- `linkedinCopy`
- `facebookCopy`
- `instagramCopy`
- `twitterCopy`
- `rewrittenHeadline`
- `caption`
- `shortScript`

### Solution - Two Steps Required

#### Step 1: Update AI Writer1 Prompt

Replace the USER message in AI Writer1 with:

```
=Write social media content for this crypto story:

HEADLINE: {{ $('Split Stories').item.json.headline }}
SUMMARY: {{ $('Split Stories').item.json.summary }}
CATEGORY: {{ $('Split Stories').item.json.category }}
WHY IT MATTERS: {{ $('Split Stories').item.json.why_it_matters }}
SOURCE URL: {{ $('Split Stories').item.json.primary_url }}

Create platform-specific content for the 5th Ave Angel brand:

1. rewrittenHeadline: Punchy, attention-grabbing headline (max 80 chars)

2. caption: General social caption in your voice (150-200 chars)

3. blogCopy: A 300-500 word blog article that:
   - Opens with a hook
   - Explains the news clearly
   - Provides context and analysis
   - Ends with what this means for everyday crypto users
   - Written in 5th Ave Angel's confident, approachable voice

4. linkedinCopy: Professional LinkedIn post (1000-1500 chars):
   - Start with a bold statement or question
   - Provide professional analysis
   - End with a thought-provoking question or call to action
   - No hashtags in the main text, add 3-5 relevant hashtags at the end

5. facebookCopy: Engaging Facebook post (500-800 chars):
   - Conversational and relatable tone
   - Include a question to drive engagement
   - Add 2-3 relevant hashtags at the end

6. instagramCopy: Instagram caption (1500-2000 chars):
   - Start with a hook (first line matters most)
   - Break into short paragraphs
   - Include a call to action
   - End with 20-30 relevant hashtags on separate lines

7. twitterCopy: Twitter/X post (max 270 chars):
   - Punchy and direct
   - Include 1-2 hashtags
   - Leave room for a link

8. shortScript: A 30-second video script (60-80 words):
   - Hook in first 3 seconds
   - Deliver the key news point
   - End with a takeaway or question

Return ONLY valid JSON with this exact structure:
{
  "rewrittenHeadline": "...",
  "caption": "...",
  "blogCopy": "...",
  "linkedinCopy": "...",
  "facebookCopy": "...",
  "instagramCopy": "...",
  "twitterCopy": "...",
  "shortScript": "..."
}
```

#### Step 2: Update "Airtable Update Status (FIXED)" Node

Add these field mappings:

| Field | Value |
|-------|-------|
| rewrittenHeadline | `={{ JSON.parse($json.message.content).rewrittenHeadline }}` |
| caption | `={{ JSON.parse($json.message.content).caption }}` |
| blogCopy | `={{ JSON.parse($json.message.content).blogCopy }}` |
| linkedinCopy | `={{ JSON.parse($json.message.content).linkedinCopy }}` |
| facebookCopy | `={{ JSON.parse($json.message.content).facebookCopy }}` |
| instagramCopy | `={{ JSON.parse($json.message.content).instagramCopy }}` |
| twitterCopy | `={{ JSON.parse($json.message.content).twitterCopy }}` |
| shortScript | `={{ JSON.parse($json.message.content).shortScript }}` |

#### Step 3: Connect AI Writer1 to Airtable Update

Ensure AI Writer1 output reaches the Airtable Update node to save content.

---

## ⏳ IN PROGRESS - Multi-Size Images

### Requirement
Generate images in multiple aspect ratios for different platforms:

| Aspect Ratio | Platforms |
|--------------|-----------|
| 16:9 | YouTube thumbnails, Twitter/X, LinkedIn, Facebook |
| 9:16 | TikTok, Instagram Reels/Stories, YouTube Shorts, Pinterest |
| 1:1 | Instagram Feed, Facebook Feed |

### Implementation Options
1. Sequential nodes (one for each size)
2. Split into 3 parallel branches
3. Loop through aspect ratios

**Not yet implemented**

---

## API Keys Reference

| Service | Key |
|---------|-----|
| KieAI | `84c612356a4a1fdcb9d640ecf376d935` |
| Airtable | `patuhJllpfFdYQYCr.880a18b1310ed5b987a1461fa8a1056857ab65c0b021834d29a21d520647e5b0` |
| n8n MCP Token | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMGRhMjQzNC03NGVjLTRmZDgtOWQwZS1lYTg1ZDFmM2I0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjUzM2ZlYjhjLTI5ZDQtNGZhNS04YjM4LWI3YzU3ZWQ2ZThiYyIsImlhdCI6MTc2NTEwNDA1N30.5PaVyNphAbk9dgMpRII5vnVO2o0R33uVskLiGGkitWA` |

---

## Workflow Flow (Current)

```
Schedule Trigger1 (every 4 hours)
    ↓
AI Research - Top (generates 5 crypto stories)
    ↓
AI Research - Report1 (enriches stories)
    ↓
Split Stories (parses JSON into 5 items)
    ↓
Angel Image Prompt (generates imagePrompt)
    ↓
Create a record (saves to Airtable with Status "Needs Approval")
    ↓
AI Writer1 (generates social copy) ← NEEDS UPDATED PROMPT
    ↓
Airtable Search (Needs Images)
    ↓
KieAI Create Task (google/nano-banana) ← FIXED
    ↓
Wait 5s → KieAI Record Info → IF Success?
    ↓
Parse KieAI Result → Airtable Upload Attachment
    ↓
Airtable Update Status (FIXED) ← NEEDS FIELD MAPPINGS ADDED
```

---

## 🆕 5TH AVE AI NEWS WORKFLOW

### Overview
A duplicate of the "5th Ave News" workflow, renamed to "5th Ave AI News", targeting the new **Social Posts - AI** table.

### Airtable Table IDs
| Table | ID | Purpose |
|-------|-----|---------|
| Social Posts (Crypto) | `tblZwA0JCNPeORaGi` | Original crypto workflow |
| Social Posts - AI | `tblSXrbwYXTQC7D2u` | New AI workflow |

### Category Field
The **Social Posts - AI** table has a `category` field with these AI-specific choices:
- `ai_models` (blue)
- `ai_regulation` (cyan)
- `ai_workplace` (teal)
- `ai_research` (green)
- `ai_products` (yellow)
- `ai_ethics` (red)
- `ai_robotics` (purple)

> **Note**: There is also a `category_old` field with the leftover crypto choices — it's harmless and can be hidden or deleted manually from the Airtable UI.

### Nodes to Update (in the duplicated "5th Ave AI News" workflow)

#### Node 1: AI Research - Top
Change the system/user prompt from crypto to AI:
```
Find the top 5 breaking artificial intelligence and AI technology news stories from the last 24 hours.

Focus on these categories:
- ai_models: New AI model releases, benchmarks, capabilities (OpenAI, Anthropic, Google, Meta, Mistral)
- ai_regulation: AI policy, government regulation, safety frameworks, executive orders
- ai_workplace: AI in hiring, productivity, workforce transformation, automation
- ai_research: Research breakthroughs, papers, new capabilities, AGI progress
- ai_products: New AI tools, apps, features, consumer products
- ai_ethics: AI bias, safety, alignment, deepfakes, misinformation
- ai_robotics: Humanoid robots, autonomous systems, physical AI

Cover companies like OpenAI, Anthropic, Google DeepMind, Meta AI, Microsoft, NVIDIA, xAI, and emerging AI startups.
```

#### Node 2: AI Research - Report1
Change enrichment context from crypto to AI/technology.

#### Node 3: Angel Image Prompt
Change prompt context to generate AI-themed image prompts:
```
Generate an image prompt for the 5th Ave AI educator "Angel" covering this AI technology news story.
The image should reflect AI and technology themes rather than cryptocurrency.
```

#### Node 4: Create a Record
**CRITICAL** — Change the Airtable table ID:
- **From**: `tblZwA0JCNPeORaGi` (Social Posts)
- **To**: `tblSXrbwYXTQC7D2u` (Social Posts - AI)

#### Node 5: AI Writer1
Update the USER prompt — replace "crypto story" with "AI/technology story":
```
=Write social media content for this AI and technology story:

HEADLINE: {{ $('Split Stories').item.json.headline }}
SUMMARY: {{ $('Split Stories').item.json.summary }}
CATEGORY: {{ $('Split Stories').item.json.category }}
WHY IT MATTERS: {{ $('Split Stories').item.json.why_it_matters }}
SOURCE URL: {{ $('Split Stories').item.json.primary_url }}

Create platform-specific content for the 5th Ave Angel brand (AI & technology focus):

1. rewrittenHeadline: Punchy, attention-grabbing headline (max 80 chars)

2. caption: General social caption in your voice (150-200 chars)

3. blogCopy: A 300-500 word blog article that:
   - Opens with a hook about the AI development
   - Explains the news clearly for a general audience
   - Provides context and analysis
   - Ends with what this means for everyday people
   - Written in 5th Ave Angel's confident, approachable voice

4. linkedinCopy: Professional LinkedIn post (1000-1500 chars):
   - Start with a bold statement or question about AI
   - Provide professional analysis
   - End with a thought-provoking question or call to action
   - No hashtags in the main text, add 3-5 relevant hashtags at the end

5. facebookCopy: Engaging Facebook post (500-800 chars):
   - Conversational and relatable tone
   - Include a question to drive engagement
   - Add 2-3 relevant hashtags at the end

6. instagramCopy: Instagram caption (1500-2000 chars):
   - Start with a hook (first line matters most)
   - Break into short paragraphs
   - Include a call to action
   - End with 20-30 relevant hashtags on separate lines

7. twitterCopy: Twitter/X post (max 270 chars):
   - Punchy and direct
   - Include 1-2 hashtags
   - Leave room for a link

8. shortScript: A 30-second video script (60-80 words):
   - Hook in first 3 seconds
   - Deliver the key news point
   - End with a takeaway or question

Return ONLY valid JSON with this exact structure:
{
  "rewrittenHeadline": "...",
  "caption": "...",
  "blogCopy": "...",
  "linkedinCopy": "...",
  "facebookCopy": "...",
  "instagramCopy": "...",
  "twitterCopy": "...",
  "shortScript": "..."
}
```

#### Node 6: Airtable Search (Needs Images)
**CRITICAL** — Change the Airtable table ID:
- **From**: `tblZwA0JCNPeORaGi`
- **To**: `tblSXrbwYXTQC7D2u`

#### Node 7: Airtable Upload Attachment
**CRITICAL** — Change the Airtable table ID:
- **From**: `tblZwA0JCNPeORaGi`
- **To**: `tblSXrbwYXTQC7D2u`

#### Node 8: Airtable Update Status
**CRITICAL** — Change the Airtable table ID:
- **From**: `tblZwA0JCNPeORaGi`
- **To**: `tblSXrbwYXTQC7D2u`

### Workflow Renaming
- **Original**: "5th Ave News" → Rename to **"5th Ave Crypto News"**
- **Duplicate**: Already named **"5th Ave AI News"**

### Summary of Changes
| What | Change |
|------|--------|
| Schedule Trigger | Keep same (every 4 hours) or customize |
| AI Research prompt | Crypto → AI/technology stories |
| Angel Image Prompt | Crypto context → AI context |
| 4x Airtable table IDs | `tblZwA0JCNPeORaGi` → `tblSXrbwYXTQC7D2u` |
| AI Writer1 prompt | Crypto voice → AI/tech voice |
| KieAI image generation | Same (same reference images, same model) |

---

## Next Steps

### For Crypto Workflow (5th Ave Crypto News)
1. Update AI Writer1 prompt (see Platform Content Generation section above)
2. Add field mappings to Airtable Update Status node
3. Connect workflow so content gets saved
4. Implement multi-size image generation
5. Test full workflow end-to-end

### For AI Workflow (5th Ave AI News)
1. Update all 4 Airtable node table IDs to `tblSXrbwYXTQC7D2u`
2. Update AI Research prompt for AI topics
3. Update AI Writer1 prompt for AI context
4. Test end-to-end with AI news
5. Verify records appear in dashboard under "Social Posts - AI" table

---

## 🔌 PHASE 2: BROWSER EXTENSION PICKUP

### Overview
The browser extension saves articles/videos directly to the Social Posts tables with `Status = "Needs Approval"` and no `imagePrompt`. Each n8n workflow needs a **second trigger** that watches for these extension-saved records and processes them.

### How Extension-Saved Records Differ from Auto-Discovered
| Field | Auto-Discovered (Trigger 1) | Extension-Saved (Trigger 2) |
|-------|---------------------------|---------------------------|
| `sourceHeadline` | AI-generated from research | Page title or user-edited |
| `sourceSummary` | AI-generated full summary | User's notes (may be brief) |
| `sourceURL` | AI-found URL | User-saved URL |
| `imagePrompt` | AI-generated | **EMPTY** (needs generation) |
| `category` | AI-assigned | **EMPTY** (needs assignment) |
| `whyItMatters` | AI-generated | **EMPTY** (needs generation) |
| `Status` | `Needs Approval` | `Needs Approval` |
| Social copy fields | AI-generated | **EMPTY** (need generation) |

### Detection Filter
Extension-saved records can be identified by:
```
AND(
  {Status} = 'Needs Approval',
  {imagePrompt} = '',
  {sourceURL} != ''
)
```
This catches records that have a URL but haven't been enriched yet.

### Trigger 2 Workflow: Extension Pickup (for EACH workflow - Crypto & AI)

```
Airtable Trigger: Watch for new records (every 15 min)
  Table: tblZwA0JCNPeORaGi (Crypto) or tblSXrbwYXTQC7D2u (AI)
  Filter: {imagePrompt} = '' AND {sourceURL} != ''
    ↓
AI Enrichment (new node - enriches from URL)
  Input: sourceURL, sourceHeadline
  Output: enriched summary, category, whyItMatters
    ↓
Update Record: Save enrichment to Airtable
  Fields: sourceSummary, category, whyItMatters
    ↓
Angel Image Prompt (existing node - reuse)
  Input: sourceHeadline, category
  Output: imagePrompt
    ↓
Update Record: Save imagePrompt
    ↓
AI Writer1 (existing node - reuse)
  Input: sourceHeadline, sourceSummary, category, whyItMatters, sourceURL
  Output: JSON with all social copy fields
    ↓
Update Record: Save all social copy fields
    ↓
KieAI Create Task (existing node - reuse)
    ↓
Wait 5s → KieAI Record Info → IF Success?
    ↓
Parse KieAI Result → Airtable Upload Attachment
    ↓
Airtable Update Status
```

### AI Enrichment Node (NEW)

This node takes a URL and headline, then uses AI to generate a full summary, category, and analysis. Add this as a new AI node.

**System Prompt:**
```
You are a content analyst for 5th Ave, a media brand covering {TOPIC} news.
Given a URL and headline, analyze the content and produce structured data.
```

**User Prompt (Crypto version):**
```
=Analyze this article and generate structured content data:

URL: {{ $json.fields.sourceURL }}
HEADLINE: {{ $json.fields.sourceHeadline }}
NOTES: {{ $json.fields.sourceSummary || 'No additional notes' }}

Generate a JSON response with:
1. "summary": A 2-3 paragraph summary of the article (200-400 words)
2. "category": One of: crypto_regulation, bitcoin_adoption, macro_market, self_banking, infra_dev
3. "why_it_matters": A concise explanation of why this matters for everyday crypto users (100-150 words)

Return ONLY valid JSON:
{
  "summary": "...",
  "category": "...",
  "why_it_matters": "..."
}
```

**User Prompt (AI version):**
```
=Analyze this article and generate structured content data:

URL: {{ $json.fields.sourceURL }}
HEADLINE: {{ $json.fields.sourceHeadline }}
NOTES: {{ $json.fields.sourceSummary || 'No additional notes' }}

Generate a JSON response with:
1. "summary": A 2-3 paragraph summary of the article (200-400 words)
2. "category": One of: ai_models, ai_regulation, ai_workplace, ai_research, ai_products, ai_ethics, ai_robotics
3. "why_it_matters": A concise explanation of why this matters for everyday people (100-150 words)

Return ONLY valid JSON:
{
  "summary": "...",
  "category": "...",
  "why_it_matters": "..."
}
```

### Update Record After Enrichment

| Field | Value |
|-------|-------|
| sourceSummary | `={{ JSON.parse($json.message.content).summary }}` |
| category | `={{ JSON.parse($json.message.content).category }}` |
| whyItMatters | `={{ JSON.parse($json.message.content).why_it_matters }}` |

### Recommended Schedules

| Trigger | Interval | Purpose |
|---------|----------|---------|
| Trigger 1: Auto-Discovery | Every 8 hours | Find 5 top stories automatically |
| Trigger 2: Extension Pickup | Every 15 minutes | Process manually-saved articles |

**Why 8 hours for auto-discovery?** 3 runs/day × 5 stories = 15 stories/day. Enough without flooding.

**Why 15 minutes for extension pickup?** Fast enough that saved articles are processed quickly. Cheap — most runs find zero new records.

### Complete Workflow Architecture (per topic)

```
╔════════════════════════════════════════════╗
║          5th Ave Crypto/AI News            ║
╠════════════════════════════════════════════╣
║                                            ║
║  TRIGGER 1: Schedule (every 8 hours)       ║
║    → AI Research (find 5 stories)          ║
║    → Split Stories                         ║
║    → Angel Image Prompt                    ║
║    → Create Record (Needs Approval)        ║
║    ─────────────────┐                      ║
║                     ▼                      ║
║  TRIGGER 2: Airtable Watch (every 15 min)  ║
║    → Filter: imagePrompt empty + has URL   ║
║    → AI Enrichment (from URL)              ║
║    → Update Record (summary, category)     ║
║    ─────────────────┐                      ║
║                     ▼                      ║
║  ┌─── SHARED PIPELINE ───────────────────┐ ║
║  │ Angel Image Prompt                    │ ║
║  │ AI Writer1 (social copy)              │ ║
║  │ KieAI Image Generation                │ ║
║  │ Upload Attachment                     │ ║
║  │ Update Status                         │ ║
║  └───────────────────────────────────────┘ ║
║                     ▼                      ║
║  Dashboard: Review → Approve → Schedule    ║
╚════════════════════════════════════════════╝
```

---

## 🌐 BROWSER EXTENSION

### Overview
The **5th Ave Content Saver** Chrome extension allows you to save any URL to the correct pipeline with one click.

### Extension Files Location
All extension files are in `webapp/extension/`:
```
extension/
├── manifest.json   # Chrome extension manifest (v3)
├── popup.html      # Extension popup UI
├── popup.js        # Extension popup logic
└── icons/          # Extension icons (add your own)
```

### Installation
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `webapp/extension/` folder
5. Pin the extension to your toolbar

### Configuration
- Click the gear icon in the extension popup
- Set the API endpoint to your Content Hub URL
- Default: `https://3000-i8wcwhv91wsc5cw1epaap-02b9cc79.sandbox.novita.ai`
- Production: Update to your Cloudflare Pages URL after deployment

### Topic Routing
| Selection | Base | Table | Status Set |
|-----------|------|-------|-----------|
| 🪙 Crypto | `appgyL5gKf8rjaJPv` | `tblZwA0JCNPeORaGi` (Social Posts) | `Needs Approval` |
| 🤖 AI News | `appgyL5gKf8rjaJPv` | `tblSXrbwYXTQC7D2u` (Social Posts - AI) | `Needs Approval` |
| 📋 General | `appQggEi0kxkoSmLn` | `tblhAFDUnMcdO8DLk` (Content Pipeline) | `Pending Review` |

### Field Mapping
| Extension Input | → Crypto/AI Field | → General Field |
|----------------|-------------------|-----------------|
| URL | `sourceURL` | `Video URL` |
| Title | `sourceHeadline` | `Video Title` |
| Notes | `sourceSummary` | `Notes` |
| Platforms | `socialChannels` | `Platforms` |

### Features
- **Auto-suggest topic**: Detects crypto/AI keywords in URL and title
- **Remember last topic**: Saves your last selection
- **Platform selection**: Choose which social platforms to target
- **Notes for AI**: Add context for the AI content generation

---

*Last Updated: 2026-02-06*
