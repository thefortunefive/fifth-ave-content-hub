# 5th Ave Content Hub

## Vision
A content management dashboard for 5th Ave Crypto that streamlines the workflow from content creation to social media publishing. The system manages AI-generated images featuring "Angel" (the brand's persona), schedules posts across multiple platforms, and integrates with Airtable for data persistence.

## Core Goals
1. **Image Generation** - Generate consistent brand images using AI with reference images for character consistency
2. **Multi-Platform Content** - Manage content for Twitter, Threads, Bluesky, LinkedIn, Facebook, Instagram, Blog, and Video Scripts
3. **Scheduling** - Visual calendar for planning and scheduling posts
4. **Automation Ready** - Designed to integrate with n8n and Blotato for automated posting

## Tech Stack
- **Framework**: Hono (TypeScript)
- **Deployment**: Cloudflare Pages/Workers
- **Database**: Airtable (external)
- **Image Generation**: KieAI API (google/nano-banana model)
- **Image Hosting**: freeimage.host
- **Frontend**: Vanilla JS + Tailwind CSS (CDN)
- **Process Manager**: PM2 (development)

## Key Features

### Image Generation System
- Reference library with 8 categories: Face, Custom, Pose, Outfit, Background, Props, Mood, Logo
- Per-aspect-ratio references (16:9, 9:16, 1:1)
- Headline text overlay via Canvas API (not AI-generated text)
- "Generate All Sizes" uses approved 16:9 as reference to regenerate other ratios

### Content Management
- Airtable integration for records (Social Posts table)
- Dynamic field rendering based on table schema
- Social media content editor with platform-specific guidelines
- Auto-save on edit

### Calendar Scheduling
- Month view with navigation
- Drag-and-drop scheduling from "Ready to Schedule" queue
- Posts display as thumbnails on scheduled dates
- Saves to Airtable "Start date" field

## Constraints
- Cloudflare Workers runtime (no Node.js APIs, no filesystem)
- 10MB bundle size limit
- Must work with existing Airtable schema
- Images must be hosted externally (freeimage.host)

## External Integrations
- **Airtable**: Base `appgyL5gKf8rjaJPv`, Table "Social Posts"
- **KieAI**: Image generation API
- **Future**: n8n automation, Blotato posting API
