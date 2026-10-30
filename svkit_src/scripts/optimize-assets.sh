#!/usr/bin/env sh
# Regenerates the served media in static/ from the untouched originals in originals/.
# Needs ffmpeg (with libwebp and libmp3lame). Run with: pnpm assets
set -eu
cd "$(dirname "$0")/.."

src=originals
out=static
ff="ffmpeg -hide_banner -loglevel error -y"

mkdir -p "$out/img/avatar/thumb" "$out/img/avatar/large" "$out/video" "$out/audio"

# Avatars: small thumbnails for the field (40–50px, 2x for HiDPI) and a larger version for the
# 300px main avatar, loaded only when needed. Images are only ever scaled down.
# A few of the PNGs carry junk padding after the image, which ffmpeg reports as a decoding error
# for a second frame; only the first frame is used, so image errors are kept quiet.
img="ffmpeg -hide_banner -loglevel fatal -y"
fit() { echo "scale='min($1,iw)':'min($1,ih)':force_original_aspect_ratio=decrease"; }
for file in "$src"/img/avatar/*.png; do
	name=$(basename "$file" .png)
	case "$name" in
	empty) ;; # the placeholder is only shown large
	*) $img -i "$file" -vf "$(fit 100)" -frames:v 1 -c:v libwebp -quality 80 "$out/img/avatar/thumb/$name.webp" ;;
	esac
	$img -i "$file" -vf "$(fit 600)" -frames:v 1 -c:v libwebp -quality 82 "$out/img/avatar/large/$name.webp"
done

# Video: same encoding, index moved to the front so playback can start before the download ends.
$ff -i "$src/video/bots.mp4" -c copy -movflags +faststart "$out/video/bots.mp4"

# Music: 320 kbps is overkill for background music.
$ff -i "$src/audio/ira-theme.mp3" -map 0:a -c:a libmp3lame -b:a 128k "$out/audio/ira-theme.mp3"

echo "done: $(du -sh "$out" | cut -f1) in $out (originals: $(du -sh "$src" | cut -f1))"
