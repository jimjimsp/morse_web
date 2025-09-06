import os
from django.conf import settings
from django.shortcuts import render

# List of styles and frame types
STYLES = ['style1', 'style2', 'style3', 'style4', 'style5', 'style6']
FRAME_TYPES = ['open', 'closed', 'half_closed', 'half_open']

# Mapping frame type to folder name
FRAME_FOLDERS = {
    'open': 'A_open',
    'closed': 'A_closed',
    'half_closed': 'A_half_closed',
    'half_open': 'A_half_open'
}

def index(request):
    styles_data = {}

    for style in STYLES:
        frames_dict = {}
        for frame_type, folder_name in FRAME_FOLDERS.items():
            folder_path = os.path.join(
                settings.BASE_DIR, 'blinker', 'static', 'blinker', 'images', style, folder_name
            )
            if os.path.exists(folder_path):
                # Get all .png files and sort alphabetically
                files = sorted([
                    f for f in os.listdir(folder_path)
                    if f.lower().endswith('.png')
                ])
                # Build static paths for template
                frames_dict[frame_type] = [
                    f'blinker/images/{style}/{folder_name}/{f}' for f in files
                ]
            else:
                frames_dict[frame_type] = []

        styles_data[style] = frames_dict

    return render(request, 'blinker/index.html', {
        'styles_data': styles_data
    })
