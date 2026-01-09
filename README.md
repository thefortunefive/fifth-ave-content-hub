# 5th Ave Content Hub

A content management dashboard for generating AI images, managing social media content, and scheduling posts.

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

### 🎨 Image Generation
- AI-powered image generation using KieAI
- 8 reference categories (Face, Custom, Pose, Outfit, Background, Props, Mood, Logo)
- Per-aspect-ratio references (16:9, 9:16, 1:1)
- Optional headline text overlay (Canvas-based)
- "Generate All Sizes" uses approved image as reference

### 📝 Content Management
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

### 📅 Content Calendar
- Month view with navigation
- Drag-and-drop scheduling
- "Ready to Schedule" queue
- Visual post thumbnails on calendar

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bases` | GET | List Airtable bases |
| `/api/bases/:id/tables` | GET | List tables in base |
| `/api/records` | GET | List records (with filter) |
| `/api/records/:id` | GET | Get single record |
| `/api/records/:id` | PATCH | Update record |
| `/api/generate-image` | POST | Generate AI image |
| `/api/task-status/:id` | GET | Check generation status |
| `/api/upload-image` | POST | Upload to freeimage.host |
| `/api/proxy-image` | POST | Proxy image for CORS |

## Tech Stack

- **Backend**: Hono (TypeScript)
- **Frontend**: Vanilla JS + Tailwind CSS
- **Database**: Airtable
- **Image Generation**: KieAI API
- **Image Hosting**: freeimage.host
- **Deployment**: Cloudflare Pages (planned)

## Project Structure

```
webapp/
├── src/index.tsx      # Main application
├── dist/              # Build output
├── PROJECT.md         # Project specification
├── STATE.md           # Current state tracking
└── README.md          # This file
```

## Workflow

1. **Select Record** - Choose an article from Airtable
2. **Generate Image** - Create 16:9 image with references
3. **Approve & Generate Sizes** - Create 9:16 and 1:1 versions
4. **Edit Content** - Write/edit social media copy
5. **Schedule** - Drag to calendar to set publish date
6. **Post** - (Future) Automated via n8n + Blotato

## Configuration

### Environment Variables
- `AIRTABLE_TOKEN` - Airtable API token (currently hardcoded)
- `KIEAI_API_KEY` - KieAI API key (in code)

### Airtable Schema
- **Base**: 5th Ave Crypto (appgyL5gKf8rjaJPv)
- **Table**: Social Posts
- **Key Fields**: sourceHeadline, postImage, Status, Start date, [platform]Copy

## Development

```bash
# Kill existing process
fuser -k 3000/tcp

# Rebuild and restart
npm run build && pm2 restart all

# Check status
pm2 list
```

## License

Private - 5th Ave Crypto
