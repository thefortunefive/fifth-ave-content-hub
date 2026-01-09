# Project State

## Current Status: Active Development
**Last Updated**: 2026-01-09

## What's Working ✅

### Core Functionality
- [x] Hono server running on port 3000
- [x] Airtable API integration (bases, tables, records, PATCH)
- [x] KieAI image generation with reference images
- [x] Image upload to freeimage.host
- [x] PM2 process management

### UI Components
- [x] Reference Library (8 categories, per-ratio images, collapsible)
- [x] Image Generator (prompt input, aspect ratio selection, generate button)
- [x] Generated Image Preview (large, draggable)
- [x] Content Images section (3 drop zones for 16:9, 9:16, 1:1)
- [x] Generation History (single row, 4 recent, 200px thumbnails)
- [x] Airtable Records browser (horizontal scroll, large image cards)
- [x] Content Calendar (month view, drag-to-schedule)
- [x] Social Media Content editor (8 platforms, large text areas, collapsible record details)
- [x] Lightbox with zoom/pan

### Features
- [x] Auto-save images to Airtable postImage field
- [x] Auto-save social content on edit
- [x] "Generate All Sizes" - uses approved image as reference for other ratios
- [x] Canvas-based text overlay (not AI text)
- [x] Drag images between sections
- [x] Copy content buttons per platform

## Known Issues ⚠️

### High Priority
- [ ] Text overlay on images needs refinement (font sizing, positioning)
- [ ] Reference images sometimes not triggering correctly in generation

### Medium Priority
- [ ] Calendar posts only show if "Start date" field has data
- [ ] No time-of-day scheduling (only date)

### Low Priority
- [ ] Tailwind CDN warning (production should use built CSS)
- [ ] No favicon (500 error in console)

## Recent Changes (Session 2026-01-09)

1. **Layout Overhaul**
   - Changed to single-column stacked layout for maximum image visibility
   - Made all images larger (preview 600px max, history 200px, record cards with large thumbnails)
   - Record Details section now collapsible (collapsed by default)
   - Social Media Content section takes most of screen

2. **Generate All Sizes Rework**
   - Changed from cropping to AI regeneration
   - Uses approved 16:9 image as reference for 9:16 and 1:1
   - Maintains character/scene consistency

3. **Content Calendar Added**
   - Full month view calendar
   - "Ready to Schedule" queue for unscheduled posts
   - Drag-and-drop to schedule
   - Schedule modal with date/time picker
   - Saves to Airtable "Start date" field

4. **Airtable Image Quality**
   - Changed thumbnails from small to large for record cards

## Next Steps (Prioritized)

### Immediate
1. Test and refine "Generate All Sizes" with AI regeneration
2. Verify calendar scheduling saves correctly to Airtable
3. Test full workflow: select record → generate image → schedule

### Short Term
1. n8n integration planning for automated posting
2. Blotato API research and integration
3. Add time-of-day to scheduling

### Future
1. Deploy to Cloudflare Pages (production)
2. GitHub repository setup
3. Multiple calendar views (week view)
4. Post status tracking (Draft → Scheduled → Posted)

## Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| Canvas text overlay instead of AI text | AI image generators are bad at text rendering | 2026-01-09 |
| AI regeneration for sizes instead of cropping | Cropping cuts off important parts, AI recomposes properly | 2026-01-09 |
| Single column layout | Maximize image visibility per user request | 2026-01-09 |
| Collapsible record details | Social content editing is primary focus | 2026-01-09 |
| Large thumbnails in Airtable records | Small thumbnails were blurry | 2026-01-09 |

## Files Structure

```
/home/user/webapp/
├── src/
│   └── index.tsx          # Main Hono app (all HTML/CSS/JS inline)
├── dist/                   # Built output
├── public/                 # Static assets (currently empty)
├── ecosystem.config.cjs    # PM2 configuration
├── wrangler.jsonc          # Cloudflare config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── PROJECT.md              # This project spec
├── STATE.md                # This state file
└── README.md               # Documentation
```
