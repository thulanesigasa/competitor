import os
import math
from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets", exist_ok=True)

# 60-30-10 Palette
BG_COLOR = (10, 14, 23)        # #0A0E17 (60% background)
PANEL_COLOR = (22, 31, 48)     # #161F30 (30% surface)
ACCENT_COLOR = (229, 169, 60)   # #E5A93C (10% Gold accent)
WHITE = (255, 255, 255)
MUTED = (139, 155, 180)

def draw_morabaraba_symbol(draw, center_x, center_y, size, line_width=4, stroke_color=ACCENT_COLOR):
    """Draws the geometric Morabaraba concentric squares board symbol."""
    half = size / 2.0
    layers = [1.0, 0.65, 0.35]
    
    # Draw 3 concentric squares
    for factor in layers:
        s = half * factor
        draw.rectangle(
            [center_x - s, center_y - s, center_x + s, center_y + s],
            outline=stroke_color,
            width=line_width
        )
    
    # Cross lines (horizontal, vertical, diagonals connecting squares)
    s_outer = half * layers[0]
    s_inner = half * layers[2]
    
    # Cardinal midlines (from outer to inner)
    draw.line([center_x - s_outer, center_y, center_x - s_inner, center_y], fill=stroke_color, width=line_width)
    draw.line([center_x + s_inner, center_y, center_x + s_outer, center_y], fill=stroke_color, width=line_width)
    draw.line([center_x, center_y - s_outer, center_x, center_y - s_inner], fill=stroke_color, width=line_width)
    draw.line([center_x, center_y + s_inner, center_x, center_y + s_outer], fill=stroke_color, width=line_width)
    
    # Diagonal corner lines
    draw.line([center_x - s_outer, center_y - s_outer, center_x - s_inner, center_y - s_inner], fill=stroke_color, width=line_width)
    draw.line([center_x + s_outer, center_y - s_outer, center_x + s_inner, center_y - s_inner], fill=stroke_color, width=line_width)
    draw.line([center_x - s_outer, center_y + s_outer, center_x - s_inner, center_y + s_inner], fill=stroke_color, width=line_width)
    draw.line([center_x + s_outer, center_y + s_outer, center_x + s_inner, center_y + s_inner], fill=stroke_color, width=line_width)
    
    # Intersections dots on inner square corners
    dot_r = max(2, int(line_width * 1.2))
    for fx in [-1, 1]:
        for fy in [-1, 1]:
            for factor in layers:
                px = center_x + (half * factor * fx)
                py = center_y + (half * factor * fy)
                draw.ellipse([px - dot_r, py - dot_r, px + dot_r, py + dot_r], fill=stroke_color)

# 1. assets/icon.png: 1024x1024 canvas with 800px centered symbol (Rule 15/19)
icon_img = Image.new("RGBA", (1024, 1024), BG_COLOR)
draw_icon = ImageDraw.Draw(icon_img)
draw_morabaraba_symbol(draw_icon, 512, 512, 800, line_width=18, stroke_color=ACCENT_COLOR)
icon_img.save("assets/icon.png", "PNG")
print("Saved assets/icon.png (1024x1024, 800px symbol)")

# 2. assets/android-icon-foreground.png: 512x512 canvas with 96px centered glyph (Rule 15/19)
android_icon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
draw_android = ImageDraw.Draw(android_icon)
draw_morabaraba_symbol(draw_android, 256, 256, 96, line_width=3, stroke_color=ACCENT_COLOR)
android_icon.save("assets/android-icon-foreground.png", "PNG")
print("Saved assets/android-icon-foreground.png (512x512, 96px symbol)")

# 3. assets/splash.png: 1284x2778 dark splash screen
splash_img = Image.new("RGBA", (1284, 2778), BG_COLOR)
draw_splash = ImageDraw.Draw(splash_img)
draw_morabaraba_symbol(draw_splash, 642, 1200, 480, line_width=12, stroke_color=ACCENT_COLOR)
splash_img.save("assets/splash.png", "PNG")
print("Saved assets/splash.png")

# 4. assets/favicon.png: 48x48
fav_img = Image.new("RGBA", (48, 48), BG_COLOR)
draw_fav = ImageDraw.Draw(fav_img)
draw_morabaraba_symbol(draw_fav, 24, 24, 36, line_width=2, stroke_color=ACCENT_COLOR)
fav_img.save("assets/favicon.png", "PNG")
print("Saved assets/favicon.png")
