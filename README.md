# 5th Ave Content Hub

A dual-topic content management dashboard for generating AI images, managing social media content, and scheduling posts. Supports both **Crypto News** and **AI News** workflows with **instant webhook processing** (no 15-minute wait).

## Live URL
**Development**: https://3000-i8wcwhv91wsc5cw1epaap-02b9cc79.sandbox.novita.ai

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs --nostream
```

## Features

### Instant Webhook Processing (NocoDB-Native)
- **No more 15-minute wait!** Content saved via browser extension is processed instantly
- `/api/save` creates NocoDB record, then fires a webhook to n8n for immediate processing
- n8n pipeline: Perplexity research + OpenAI image prompt + social content (all platforms)
- Popup shows real-time processing status with polling (`/api/process-status/:recordId`)
- Full pipeline takes ~90 seconds from save to complete content generation + image
- Crypto and AI topics trigger instant processing; General saves without processing

### n8n Workflow: FifthAveAIContentMaster (Fixed 2026-03-08)
- **Workflow**: `5th Ave AI - Extension Pickup (NANO BANANA PRO)` (ID: `ptL1slQw6YD7xm2I`)
- **Key fixes applied**: 10 node fixes correcting Airtable→NocoDB migration
- **Find Extension Records**: Now HTTP Request to NocoDB, filter `Status=draft AND ImagePrompt=null AND Source!=null`
- **Has Records?**: Checks `$json.list[0].Headline` (NocoDB list format)
- **Set Record Data**: Maps NocoDB fields `Id, Headline, Lead, Source, Body` → internal camelCase
- **Generate Image Prompt**: Article-specific scene (no generic "blonde woman" bias); rule 9 bans hair color
- **Save imagePrompt**: NocoDB PATCH with `Id` in body, field `ImagePrompt`
- **Save Social Content**: NocoDB PATCH with exact spaced field names (`Rewritten Headline`, `Caption`, etc.)
- **Save postImage**: NocoDB PATCH to `Post Image` (text URL) + `Post Image Preview` (attachment), Status→`ready`
- **Record ID integrity**: All code nodes pin ID to `$('Set Record Data').first().json.id`

### Dual-Topic Support (Crypto & AI)
- **Auto-detect mode** from selected Airtable table name
- **Crypto Mode** (amber badge): crypto_regulation, bitcoin_adoption, macro_market, self_banking, infra_dev
- **AI Mode** (purple badge): ai_models, ai_regulation, ai_workplace, ai_research, ai_products, ai_ethics, ai_robotics
- Topic-specific image prompt settings, visual context extraction, and Angel persona

### Image Generation
- AI-powered image generation using KieAI (google/nano-banana model)
- 8 reference categories (Face, Custom, Pose, Outfit, Background, Props, Mood, Logo)
- Per-aspect-ratio references (16:9, 9:16, 1:1)
- Optional headline text overlay via Ideogram character-edit
- "Generate All Sizes" uses approved image as reference

### Content Management
- Airtable integration for data storage
- Social media editor for 8 platforms:
  - Twitter/X (280 chars)
  - Threads (100-150 words)
  - Bluesky (300 chars)
  - LinkedIn (150-200 words)
  - Facebook (100-150 words)
  - Instagram (80-125 words + hashtags)
  - Blog (400-600 words)
  - Video Script
- Auto-save on edit

### Content Calendar
- Month view with navigation
- Drag-and-drop scheduling
- "Ready to Schedule" queue
- Visual post thumbnails on calendar

### Browser Extension (v3.0)
- Chrome extension for saving URLs to any pipeline
- Auto-detects topic from URL/title keywords
- Shows instant processing status after save
- Polls for completion with real-time progress updates
- Platform selection (Twitter, LinkedIn, Blog, Instagram, Facebook, Avatar)

## Airtable Schema

**Base**: 5th Ave Content Hub (`appgyL5gKf8rjaJPv`)

| Table | ID | Purpose |
|-------|----|---------|
| Social Posts | `tblZwA0JCNPeORaGi` | Crypto news social content |
| Social Posts - AI | `tblSXrbwYXTQC7D2u` | AI news social content |
| Avatar News | `tblBHdEBezNbZGz7N` | HeyGen avatar video pipeline |
| Keywords | `tblYlceUCTuysv1V8` | SEO keywords |
| Writing Prompts | `tblNlXsKkFJvdLDdo` | Per-platform writing prompts |
| Brand Guidelines | `tblki4OkwIYoml1cw` | Image style & brand voice |

**Social Posts & Social Posts - AI fields**: sourceHeadline, rewrittenHeadline, category, sourceSummary, postImage, imagePrompt, Status, sourceURL, socialChannels, imageSize, blogCopy, linkedinCopy, facebookCopy, instagramCopy, twitterCopy, threadsCopy, blueskyCopy, whyItMatters, caption, shortScript, Start date, datePosted

## n8n Workflows

| Workflow | ID | Status | Trigger | Target Table |
|----------|----|--------|---------|-------------|
| 5th Ave Crypto News | `XNLL4gkhUCfXKX5K` | Active | Every 8 hours | Social Posts |
| Fifth Ave AI News | `9UDqdrzT6RNfKaOI` | Needs activation | Every 8 hours | Social Posts - AI |
| 5th Ave Crypto - Extension Pickup | `jATELdNUDfmLMeXC` | **Active** | **Instant webhook** + 15min fallback | Social Posts |
| 5th Ave AI - Extension Pickup | `ptL1slQw6YD7xm2I` | **Active** | **Instant webhook** + 15min fallback | Social Posts - AI |

### Webhook Processing Architecture

```
Extension Save (/api/save)
       │
       ├── Creates Airtable record (Status: "Needs Approval")
       │
       └── Fires webhook (crypto/ai only) ──► n8n Instant Trigger
                                                     │
                                                     ▼
                                              Set Record Data
                                              (normalizes webhook payload)
                                                     │
                                                     ▼
                                              Enrich from URL
                                              (Perplexity sonar-pro)
                                                     │
                                        ┌────────────┴────────────┐
                                        ▼                         ▼
                                Generate Image Prompt       AI Writer
                                (GPT-4o)                    (GPT-4o)
                                        │                         │
                                        ▼                         ▼
                                Parse Image Prompt        Parse Social Content
                                        │                         │
                                        ▼                         ▼
                                HTTP PATCH Airtable       HTTP PATCH Airtable
                                (save imagePrompt)        (save all social copy)
```

**Webhook endpoints (production):**
- Crypto: `https://fifthaveai.app.n8n.cloud/webhook/crypto-pickup`
- AI: `https://fifthaveai.app.n8n.cloud/webhook/ai-pickup`

**Webhook payload shape:**
```json
{
  "recordId": "recXXXXXX",
  "sourceURL": "https://...",
  "sourceHeadline": "Article Title",
  "sourceSummary": "Notes from extension",
  "topic": "crypto|ai",
  "triggeredAt": "2026-02-06T05:10:56.000Z"
}
```

### Key Fixes Applied (2026-02-06)
1. **Bypassed broken Has Records? IF node** - n8n v2.2 IF node with `{{ $json.sourceURL }} isNotEmpty` always evaluated false; replaced with direct routing through Set Record Data
2. **Fixed cross-node references** - Enrich from URL used `$json.fields.sourceURL` but Airtable returns `$json.sourceURL`; corrected all references
3. **Replaced Airtable Save nodes with HTTP PATCH** - n8n Airtable node v2.1 had a bug where `id: {{ $json.id }}` didn't resolve correctly; HTTP Request nodes reliably use `$json.id`
4. **Fixed double AI Writer execution** - Set Record Data now connects only to Enrich from URL, not parallel to AI Writer

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bases` | GET | List Airtable bases |
| `/api/bases/:id/tables` | GET | List tables in base |
| `/api/records` | GET | List records (with filter) |
| `/api/records/:id` | GET | Get single record |
| `/api/records/:id` | PATCH | Update record |
| `/api/generate-image` | POST | Generate AI image (KieAI) |
| `/api/generate-image-ideogram` | POST | Text overlay (Ideogram) |
| `/api/task-status/:id` | GET | Check generation status |
| `/api/upload-image` | POST | Upload to freeimage.host |
| `/api/proxy-image` | POST | Proxy image for CORS |
| `/api/save` | POST | **Browser extension save + instant webhook trigger** |
| `/api/process-status/:id` | GET | **Poll processing status (hasResearch, hasImagePrompt, hasSocialContent)** |
| `/api/process` | POST | **Manually re-trigger processing for existing record** |
| `/api/topics` | GET | List available topics for extension |

## Tech Stack

- **Backend**: Hono (TypeScript)
- **Frontend**: Vanilla JS + Tailwind CSS
- **Database**: Airtable (external)
- **Image Generation**: KieAI API
- **Text Overlay**: Ideogram character-edit (via KieAI)
- **Image Hosting**: freeimage.host
- **Browser Extension**: Chrome extension v3.0 with instant processing
- **Automation**: n8n (webhook-triggered instant processing + 15-min fallback)
- **AI Pipeline**: Perplexity (sonar-pro) + OpenAI (GPT-4o) via n8n
- **Deployment**: Cloudflare Pages (planned)

## Project Structure

```
webapp/
├── src/index.tsx              # Main application (backend + frontend + /api/save webhook)
├── dist/                      # Build output
├── masks/                     # Mask images for text overlay
├── public/                    # Static assets
├── ecosystem.config.cjs       # PM2 configuration
├── vite.config.ts             # Vite build config
├── package.json               # Dependencies
├── PROJECT.md                 # Project vision/specification
├── STATE.md                   # Current state tracking
├── extension/                 # Chrome extension source files (v3.0)
│   ├── manifest.json          # Extension manifest (v3)
│   ├── popup.html             # Extension popup UI (with processing status)
│   ├── popup.js               # Extension popup logic (instant webhook + polling)
│   └── icons/                 # Extension icons
├── 5TH_AVE_NEWS_FIX_GUIDE.md # n8n workflow fix guide
└── README.md                  # This file
```

## Development

```bash
# Kill existing process
fuser -k 3000/tcp

# Rebuild and restart
npm run build && pm2 restart all

# Check status
pm2 list
```

## Content Flow Architecture

```
  Auto-Discovery (every 8 hrs)     Browser Extension (instant!)
  AI finds 5 top stories           You save any URL
         │                                │
         ▼                                ▼
  ┌─────────────────────────────────────────────┐
  │        Airtable: Social Posts / AI          │
  │        Status: "Needs Approval"             │
  └──────────────────┬──────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
  15-min fallback        Instant webhook
  (schedule trigger)     (fires immediately)
          │                     │
          └──────────┬──────────┘
                     ▼
  ┌─────────────────────────────────────────────┐
  │  n8n: Perplexity Research → Image Prompt    │
  │  + Social Copy (all 8 platforms) (~60s)     │
  └──────────────────┬──────────────────────────┘
                     ▼
  ┌─────────────────────────────────────────────┐
  │  Dashboard: Review → Approve → Schedule     │
  └─────────────────────────────────────────────┘
```

## Not Yet Implemented
- Cloudflare Pages production deployment
- Manually activate "Fifth Ave AI News" workflow in n8n UI
- Multi-size image generation in n8n workflow (16:9, 9:16, 1:1)
- Automated posting via n8n + Blotato
- Avatar News dashboard integration (HeyGen video pipeline)

## Last Updated
2026-02-06

## License
Private - 5th Ave Crypto
