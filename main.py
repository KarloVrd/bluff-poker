import os

# rename all images from /public/cards_images to index.jpg

files = os.listdir('public/cards_images')
for i, file in enumerate(files):
    os.rename(f'public/cards_images/{file}', f'public/cards_images/{i}.png')
