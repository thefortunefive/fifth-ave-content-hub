#!/usr/bin/env python3
"""Fix image rendering in the dashboard"""

with open('index.tsx', 'r') as f:
    content = f.read()

# Fix 1: Update isValidImageUrl function
old_isvalid = "const isValidImageUrl = (url) => typeof url === 'string' && url.startsWith('http');"
new_isvalid = "const isValidImageUrl = (url) => typeof url === 'string' && url.match(/^https?:\\/\\/.+/);"

content = content.replace(old_isvalid, new_isvalid)

# Fix 2: Add extractImageUrl function after isValidImageUrl
extract_function = '''

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
            const possibleUrls = [
              img.url,
              img.signedUrl,
              img.signedURL,
              img.path,
              img.thumbnails?.large?.url,
              img.thumbnails?.small?.url,
              img.thumbnails?.full?.url,
              img.thumbnails?.card_cover?.url,
              img.thumbnail
            ];

            for (const url of possibleUrls) {
              if (isValidImageUrl(url)) {
                return url;
              }
            }
            return null;
          };'''

# Insert after isValidImageUrl line
if 'const extractImageUrl' not in content:
    content = content.replace(new_isvalid + '\n\n', new_isvalid + extract_function + '\n')

# Fix 3: Replace thumbUrl logic
old_thumb_logic = '''let thumbUrl = '';
          // Fallback chain: Post Image Preview (attachment) -> Post Image (URL) -> placeholder
          if (imageAttachmentField && r.fields[imageAttachmentField] && Array.isArray(r.fields[imageAttachmentField]) && r.fields[imageAttachmentField].length > 0) {
            // Use Post Image Preview attachment thumbnails
            const img = r.fields[imageAttachmentField][0];
            thumbUrl = img.thumbnails?.large?.url || img.thumbnails?.full?.url || img.url || img.signedUrl || '';
          }

          // If no valid preview thumbnail, fallback to Post Image URL
          if (!isValidImageUrl(thumbUrl) && isValidImageUrl(r.fields['Post Image'])) {
            thumbUrl = r.fields['Post Image'];
          }

          // If still no valid image, try legacy imageURL
          if (!isValidImageUrl(thumbUrl) && isValidImageUrl(r.fields.imageURL)) {
            thumbUrl = r.fields.imageURL;
          }'''

new_thumb_logic = '''let thumbUrl = '';

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

          // Generate unique ID for this card's image for error handling
          const cardId = `card-img-${r.id}`;'''

content = content.replace(old_thumb_logic, new_thumb_logic)

# Fix 4: Replace image template with improved error handling
old_template = '''${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-36 object-cover rounded-lg">` :
                  '<div class="w-full h-36 bg-white/5 rounded-lg flex items-center justify-center"><i class="fas fa-image text-gray-500 text-2xl"></i></div>'}'''

new_template = '''${thumbUrl ?
                  `<div class="w-full h-36 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center relative">
                    <img id="${cardId}" src="${thumbUrl}"
                         class="w-full h-full object-cover"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-image text-gray-500 text-2xl\\'></i>';"
                         onload="this.style.display='block';">
                   </div>` :
                  `<div class="w-full h-36 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                     <div class="text-center">
                       <i class="fas fa-image text-gray-500 text-2xl mb-1"></i>
                       <p class="text-xs text-gray-600">No image</p>
                     </div>
                   </div>`}'''

content = content.replace(old_template, new_template)

# Fix 5: Update the image counting logic for consistency
old_count = """const withImages = records.filter(r => r.fields['Post Image Preview']?.length > 0 || (r.fields['Post Image'] && typeof r.fields['Post Image'] === 'string' && r.fields['Post Image'].startsWith('http'))).length;"""
new_count = """const withImages = records.filter(r => {
            const hasPreview = extractImageUrl(r.fields['Post Image Preview']);
            const hasPostImage = isValidImageUrl(r.fields['Post Image']);
            const hasLegacy = isValidImageUrl(r.fields.imageURL);
            return hasPreview || hasPostImage || hasLegacy;
          }).length;"""

content = content.replace(old_count, new_count)

with open('index.tsx', 'w') as f:
    f.write(content)

print("Image rendering fixes applied successfully!")
