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

## Next Steps

1. Update AI Writer1 prompt (see above)
2. Add field mappings to Airtable Update Status node
3. Connect workflow so content gets saved
4. Implement multi-size image generation
5. Test full workflow end-to-end

---

*Last Updated: 2026-01-06*
