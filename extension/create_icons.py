from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple lightning bolt shape
    points = [
        (size*0.5, size*0.2),
        (size*0.4, size*0.5),
        (size*0.55, size*0.5),
        (size*0.45, size*0.8),
        (size*0.6, size*0.45),
        (size*0.5, size*0.45)
    ]
    
    draw.polygon(points, fill='#ffffff')
    img.save(filename)
    print(f"Created {filename}")

create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')
