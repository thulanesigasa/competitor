import os
from PIL import Image

os.makedirs("assets", exist_ok=True)

# 1. Scale existing original icon down by 48% onto pure white background
original_path = "assets/icon-original.png"
if not os.path.exists(original_path):
    if os.path.exists("assets/icon.png"):
        import shutil
        shutil.copyfile("assets/icon.png", original_path)

if os.path.exists(original_path):
    orig = Image.open(original_path).convert("RGBA")
    W, H = orig.size
    scale = 1.0 - 0.48  # 0.52 (decreased by 48%)
    new_w = int(W * scale)
    new_h = int(H * scale)
    scaled = orig.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 1. assets/icon.png (1024x1024)
    canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
    icon_w = int(1024 * scale)
    icon_h = int(1024 * scale)
    scaled_icon = orig.resize((icon_w, icon_h), Image.Resampling.LANCZOS)
    canvas.paste(scaled_icon, ((1024 - icon_w) // 2, (1024 - icon_h) // 2), scaled_icon)
    canvas.convert("RGB").save("assets/icon.png", "PNG")
    print(f"Saved assets/icon.png: 1024x1024 with {icon_w}x{icon_h} glyph")

    # 2. assets/android-icon-foreground.png (512x512 canvas with 96px centered glyph per Rule 15 & 19)
    android_canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    scaled_android = orig.resize((96, 96), Image.Resampling.LANCZOS)
    android_canvas.paste(scaled_android, ((512 - 96) // 2, (512 - 96) // 2), scaled_android)
    android_canvas.save("assets/android-icon-foreground.png", "PNG")
    print("Saved assets/android-icon-foreground.png: 512x512 with 96px glyph (~72% margin)")

    # 3. assets/splash.png (1284x2778)
    splash_canvas = Image.new("RGBA", (1284, 2778), (255, 255, 255, 255))
    scaled_splash = orig.resize((240, 240), Image.Resampling.LANCZOS)
    splash_canvas.paste(scaled_splash, ((1284 - 240) // 2, (2778 - 240) // 2), scaled_splash)
    splash_canvas.convert("RGB").save("assets/splash.png", "PNG")
    print("Saved assets/splash.png (1284x2778)")

    # 4. Favicon 48x48
    fav = orig.resize((48, 48), Image.Resampling.LANCZOS)
    fav.save("assets/favicon.png", "PNG")
    print("Saved assets/favicon.png (48x48)")
