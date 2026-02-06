# 5th Ave Content Hub

A dual-topic content management dashboard for generating AI images, managing social media content, and scheduling posts. Supports both **Crypto News** and **AI News** workflows.

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

## Airtable Schema

**Base**: 5th Ave Crypto (`appgyL5gKf8rjaJPv`)

| Table | ID | Purpose |
|-------|----|---------|
| Social Posts | `tblZwA0JCNPeORaGi` | Crypto news social content |
| Social Posts - AI | `tblSXrbwYXTQC7D2u` | AI news social content |
| Avatar News | `tblBHdEBezNbZGz7N` | HeyGen avatar video pipeline |
| Keywords | `tblYlceUCTuysv1V8` | SEO keywords |
| Writing Prompts | `tblNlXsKkFJvdLDdo` | Per-platform writing prompts |
| Brand Guidelines | `tblki4OkwIYoml1cw` | Image style & brand voice |

**Social Posts & Social Posts - AI fields**: sourceHeadline, category, sourceSummary, postImage, imagePrompt, Status, sourceURL, socialChannels, imageSize, blogCopy, linkedinCopy, facebookCopy, instagramCopy, twitterCopy, threadsCopy, blueskyCopy, whyItMatters, rewrittenHeadline, caption, shortScript, Start date, datePosted

## n8n Workflows

| Workflow | ID | Status | Schedule | Target Table |
|----------|----|--------|----------|-------------|
| 5th Ave Crypto News | `XNLL4gkhUCfXKX5K` | ✅ Active | Every 8 hours | Social Posts |
| Fifth Ave AI News | `9UDqdrzT6RNfKaOI` | ❌ Needs manual activation | Every 8 hours | Social Posts - AI |
| 5th Ave Crypto - Extension Pickup | `jATELdNUDfmLMeXC` | ✅ Active | Every 15 min | Social Posts |
| 5th Ave AI - Extension Pickup | `ptL1slQw6YD7xm2I` | ✅ Active | Every 15 min | Social Posts - AI |

### What's Configured
- All AI workflow nodes updated: prompts, table IDs, categories
- Extension Pickup workflows: find new records, enrich from URL, generate image prompts + social content
- See `5TH_AVE_NEWS_FIX_GUIDE.md` for complete details

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
| `/api/save` | POST | Browser extension save (routes to correct table) |
| `/api/topics` | GET | List available topics for extension |

## Tech Stack

- **Backend**: Hono (TypeScript)
- **Frontend**: Vanilla JS + Tailwind CSS
- **Database**: Airtable (external)
- **Image Generation**: KieAI API
- **Text Overlay**: Ideogram character-edit (via KieAI)
- **Image Hosting**: freeimage.host
- **Browser Extension**: Chrome extension for saving URLs to pipeline
- **Automation**: n8n (2 workflows: Crypto + AI, each with auto-discovery + extension pickup)
- **Deployment**: Cloudflare Pages (planned)

## Project Structure

```
webapp/
├── src/index.tsx              # Main application (backend + frontend)
├── dist/                      # Build output
├── masks/                     # Mask images for text overlay
├── public/                    # Static assets
├── ecosystem.config.cjs       # PM2 configuration
├── vite.config.ts             # Vite build config
├── package.json               # Dependencies
├── PROJECT.md                 # Project vision/specification
├── STATE.md                   # Current state tracking
├── extension/                 # Chrome extension source files
│   ├── manifest.json          # Extension manifest (v3)
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Extension popup logic
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
  Auto-Discovery (every 8 hrs)     Browser Extension (manual)
  AI finds 5 top stories           You save any URL
         │                                │
         ▼                                ▼
  ┌─────────────────────────────────────────────┐
  │        Airtable: Social Posts / AI          │
  │        Status: "Needs Approval"             │
  └──────────────────┬──────────────────────────┘
                     ▼
  ┌─────────────────────────────────────────────┐
  │  n8n: Image Generation + Social Copy        │
  │  (shared pipeline for both triggers)        │
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
