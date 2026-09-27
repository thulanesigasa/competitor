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

    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    offset_x = (W - new_w) // 2
    offset_y = (H - new_h) // 2
    canvas.paste(scaled, (offset_x, offset_y), scaled)

    canvas_rgb = canvas.convert("RGB")
    canvas_rgb.save("assets/icon.png", "PNG")
    canvas_rgb.save("assets/android-icon-foreground.png", "PNG")
    print(f"Saved assets/icon.png & android-icon-foreground.png: {W}x{H} with {new_w}x{new_h} glyph (decreased 48%)")

    # Favicon 48x48
    fav = canvas_rgb.resize((48, 48), Image.Resampling.LANCZOS)
    fav.save("assets/favicon.png", "PNG")
    print("Saved assets/favicon.png (48x48)")
