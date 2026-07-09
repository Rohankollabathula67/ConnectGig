import os
from PIL import Image, ImageDraw

assets_dir = r"d:\startup\Connect_Gig\assets\images"
os.makedirs(assets_dir, exist_ok=True)

# 1. icon.png (1024x1024)
img_icon = Image.new('RGBA', (1024, 1024), color='#3B6FF4')
draw = ImageDraw.Draw(img_icon)
# Draw a minimalist G logo in white
draw.ellipse([256, 256, 768, 768], outline='white', width=40)
draw.rectangle([512, 450, 768, 570], fill='white')
img_icon.save(os.path.join(assets_dir, 'icon.png'))

# 2. android-icon-foreground.png (1024x1024, transparent)
img_fore = Image.new('RGBA', (1024, 1024), color=(0, 0, 0, 0))
draw_fore = ImageDraw.Draw(img_fore)
draw_fore.ellipse([256, 256, 768, 768], fill='#3B6FF4')
draw_fore.ellipse([320, 320, 704, 704], outline='white', width=20)
draw_fore.rectangle([512, 480, 704, 540], fill='white')
img_fore.save(os.path.join(assets_dir, 'android-icon-foreground.png'))

# 3. splash-icon.png (1024x1024)
img_splash = Image.new('RGBA', (1024, 1024), color='#08080F')
draw_splash = ImageDraw.Draw(img_splash)
draw_splash.ellipse([256, 256, 768, 768], fill='#3B6FF4')
draw_splash.ellipse([320, 320, 704, 704], outline='white', width=20)
draw_splash.rectangle([512, 480, 704, 540], fill='white')
img_splash.save(os.path.join(assets_dir, 'splash-icon.png'))

print("Placeholder icons generated successfully!")
