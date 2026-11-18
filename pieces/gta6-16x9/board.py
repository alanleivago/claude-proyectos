"""Tile a still strip (from still.mjs, frames side by side) into a 4-column frame sheet with time labels."""
import sys, cv2, numpy as np
src, out, n = sys.argv[1], sys.argv[2], int(sys.argv[3]); times = sys.argv[4].split(',')
im = cv2.imread(src); w = im.shape[1] // n
tiles = [im[:, i * w:(i + 1) * w].copy() for i in range(n)]
for t, x in zip(times, tiles): cv2.rectangle(x, (0, 0), (70, 26), (20, 10, 24), -1); cv2.putText(x, t + 's', (6, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 240, 255), 1, cv2.LINE_AA)
while len(tiles) % 4: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 90])
