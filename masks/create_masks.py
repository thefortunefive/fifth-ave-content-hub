from PIL import Image

# Mask specs: white = preserve, black = edit (where text banner goes)
# Banner at bottom: 15% for 16:9, 12% for 9:16, 14% for 1:1

masks = [
    # (filename, width, height, banner_percent)
    ("mask_16x9.png", 1920, 1080, 0.15),   # 16:9 - 15% bottom
    ("mask_9x16.png", 1080, 1920, 0.12),   # 9:16 - 12% bottom  
    ("mask_1x1.png", 1080, 1080, 0.14),    # 1:1 - 14% bottom
]

for filename, width, height, banner_pct in masks:
    # Create white image (preserve area)
    img = Image.new('RGB', (width, height), 'white')
    
    # Calculate banner height
    banner_height = int(height * banner_pct)
    banner_y = height - banner_height
    
    # Draw black rectangle at bottom (edit area)
    for y in range(banner_y, height):
        for x in range(width):
            img.putpixel((x, y), (0, 0, 0))
    
    img.save(filename)
    print(f"Created {filename}: {width}x{height}, banner {banner_height}px ({banner_pct*100}%)")

print("Done!")
