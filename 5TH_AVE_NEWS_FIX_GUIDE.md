# 5th Ave News Workflow - Complete Status & Fix Guide

## Project Overview

### Workflow IDs
| Workflow | ID | Status | Schedule |
|----------|----|--------|----------|
| 5th Ave Crypto News | `XNLL4gkhUCfXKX5K` | ✅ Active | Every 8 hours |
| Fifth Ave AI News | `9UDqdrzT6RNfKaOI` | ❌ Inactive (needs manual activation) | Every 8 hours |
| 5th Ave Crypto - Extension Pickup | `jATELdNUDfmLMeXC` | ✅ Active | Every 15 minutes |
| 5th Ave AI - Extension Pickup | `ptL1slQw6YD7xm2I` | ✅ Active | Every 15 minutes |

### Key References
- **n8n Instance**: https://fifthaveai.app.n8n.cloud
- **n8n API Key**: `eyJhbGci...` (audience: public-api)
- **Airtable Base ID**: appgyL5gKf8rjaJPv
- **Crypto Table**: tblZwA0JCNPeORaGi (Social Posts)
- **AI Table**: tblSXrbwYXTQC7D2u (Social Posts - AI)

---

## ✅ ALL COMPLETED CHANGES (via n8n API)

### 1. Crypto Workflow (5th Ave Crypto News) - XNLL4gkhUCfXKX5K
- ✅ Renamed from "5th Ave News" to "5th Ave Crypto News"
- ✅ Schedule Trigger updated from every 4 hours to **every 8 hours**
- ✅ Active and running

### 2. AI Workflow (Fifth Ave AI News) - 9UDqdrzT6RNfKaOI
All changes applied via API:
- ✅ Schedule Trigger updated to **every 8 hours**
- ✅ All 6 Airtable nodes updated: table ID → `tblSXrbwYXTQC7D2u` (Social Posts - AI)
  - Create a record
  - Airtable Search (Needs Images)
  - Get Social Post (From Button)
  - Save imagePrompt (From Button)
  - Airtable Upload Attachment (postImage)
  - Airtable Update Status (FIXED)
  - Update record
- ✅ AI Research - Top: Prompt changed to find 5 AI/technology stories per category (ai_models, ai_regulation, ai_workplace, ai_research, ai_products)
- ✅ AI Research - Report1: Prompt changed to enrich AI/technology stories
- ✅ Angel Image Prompt: System and user prompts updated for AI-themed image generation with category-specific visual themes
- ✅ AI Writer1: System prompt updated to AI technology commentator; user prompt updated for AI social content

**⚠️ NEEDS MANUAL ACTIVATION**: Go to https://fifthaveai.app.n8n.cloud → Fifth Ave AI News → Toggle Active. Won't activate via API (likely credential issue from duplication).

### 3. Extension Pickup Workflows - NEW
Two new dedicated workflows for processing browser extension saves:

#### 5th Ave Crypto - Extension Pickup (jATELdNUDfmLMeXC) ✅ Active
- Runs every 15 minutes
- Searches for: `AND({Status}='Needs Approval', {imagePrompt}='', {sourceURL}!='')`
- Flow: Find Records → Enrich from URL (Perplexity) → Generate Image Prompt (OpenAI) + AI Writer (OpenAI) → Save to Airtable

#### 5th Ave AI - Extension Pickup (ptL1slQw6YD7xm2I) ✅ Active
- Same structure, targets AI table (tblSXrbwYXTQC7D2u)
- AI-themed prompts for enrichment, image generation, and social content

### 4. Previous Fixes (from earlier sessions)
- ✅ KieAI Image Generation: model google/nano-banana, reference images configured
- ✅ Workflow connections: Create a record → AI Writer1
- ✅ Airtable data cleaned: bad records deleted
- ✅ imagePrompt field: uses AI-generated prompts
- ✅ Create a Record field mappings: all reference Split Stories node

---

## API Keys Reference

| Service | Key |
|---------|-----|
| KieAI | `84c612356a4a1fdcb9d640ecf376d935` |
| Airtable | `patuhJllpfFdYQYCr.880a18b1310ed5b987a1461fa8a1056857ab65c0b021834d29a21d520647e5b0` |
| n8n API Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMGRhMjQzNC03NGVjLTRmZDgtOWQwZS1lYTg1ZDFmM2I0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY3OTQ1MjM1fQ.I3M_c7z41VeHE6Bkh2bh_XVJ1wGXidw-BpYqKe6W9eg` |
| n8n MCP Token | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMGRhMjQzNC03NGVjLTRmZDgtOWQwZS1lYTg1ZDFmM2I0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjUzM2ZlYjhjLTI5ZDQtNGZhNS04YjM4LWI3YzU3ZWQ2ZThiYyIsImlhdCI6MTc2NTEwNDA1N30.5PaVyNphAbk9dgMpRII5vnVO2o0R33uVskLiGGkitWA` |

### n8n Credential IDs (for API workflow creation)
| Credential | ID | Name |
|------------|-----|------|
| OpenAI | `yJsxQEuCnARneBwk` | OpenAi account |
| Perplexity | `85M5dA95vlkhLZ1k` | Perplexity account |
| Airtable (nodes) | `I8fDHFKHYmySAB0N` | Airtable Personal Access Token account 2 |
| Airtable (HTTP) | `xQZVhW3y1q1BtqpG` | NanoBanana Airtable Personal Access Token account 5 |

---

## Workflow Architecture

```
╔══════════════════════════════════════════════════════════════╗
║              5th Ave Content Pipeline                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌─── SOURCE 1: Auto-Discovery ──────────────────────────┐  ║
║  │ Schedule: Every 8 hours                                │  ║
║  │ 5th Ave Crypto News (XNLL4gkhUCfXKX5K) ✅             │  ║
║  │ Fifth Ave AI News (9UDqdrzT6RNfKaOI) ❌ needs manual  │  ║
║  │                                                        │  ║
║  │ Flow: AI Research → Split Stories → Image Prompt       │  ║
║  │       → Create Record → AI Writer → KieAI → Upload    │  ║
║  └────────────────────────────┬───────────────────────────┘  ║
║                               ▼                              ║
║  ┌─── Airtable ──────────────────────────────────────────┐  ║
║  │ Social Posts (Crypto): tblZwA0JCNPeORaGi              │  ║
║  │ Social Posts - AI:     tblSXrbwYXTQC7D2u              │  ║
║  │ Status: "Needs Approval"                               │  ║
║  └────────────────────────────┬───────────────────────────┘  ║
║                               ▲                              ║
║  ┌─── SOURCE 2: Browser Extension ───────────────────────┐  ║
║  │ Chrome Extension → /api/save → Routes to table        │  ║
║  └────────────────────────────┬───────────────────────────┘  ║
║                               ▼                              ║
║  ┌─── Extension Pickup Workflows ────────────────────────┐  ║
║  │ Schedule: Every 15 minutes                             │  ║
║  │ Crypto Pickup (jATELdNUDfmLMeXC) ✅ Active            │  ║
║  │ AI Pickup (ptL1slQw6YD7xm2I) ✅ Active                │  ║
║  │                                                        │  ║
║  │ Flow: Find new records → Enrich from URL (Perplexity) │  ║
║  │       → Image Prompt (OpenAI) + AI Writer (OpenAI)    │  ║
║  │       → Save imagePrompt + Social Content             │  ║
║  └────────────────────────────┬───────────────────────────┘  ║
║                               ▼                              ║
║  ┌─── Dashboard ──────────────────────────────────────────┐  ║
║  │ Review → Approve Images → Edit Content → Schedule      │  ║
║  └────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🌐 BROWSER EXTENSION

### Overview
The **5th Ave Content Saver** Chrome extension allows you to save any URL to the correct pipeline with one click.

### Extension Files Location
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

---

## Remaining TODO

### Must Do
- [ ] Manually activate "Fifth Ave AI News" workflow in n8n UI
- [ ] Test full end-to-end: save a URL via extension → verify pickup workflow processes it

### Nice to Have
- [ ] Multi-size image generation in n8n (16:9, 9:16, 1:1)
- [ ] Threads copy and Bluesky copy in main workflow AI Writer1
- [ ] Automated posting via Blotato
- [ ] Cloudflare Pages production deployment
- [ ] Avatar News dashboard integration (HeyGen)

---

*Last Updated: 2026-02-06*
