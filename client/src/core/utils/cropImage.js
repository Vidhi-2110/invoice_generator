/**
 * Renders the area chosen in react-easy-crop onto a canvas shaped like the crop box.
 *
 * `pixelCrop` from react-easy-crop is measured on the image AFTER rotation (its
 * bounding box), so the image is rotated onto a bounding-box canvas first and the
 * crop is taken from that. Areas outside the image (when zoomed out below 1) stay
 * transparent, so a non-square logo can be fitted whole inside the square.
 */
export const getCroppedImg = (imageSrc, pixelCrop, rotation = 0, size = 600) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const boxW = image.width * cos + image.height * sin;
      const boxH = image.width * sin + image.height * cos;

      const rotated = document.createElement('canvas');
      rotated.width = Math.round(boxW);
      rotated.height = Math.round(boxH);
      const rctx = rotated.getContext('2d');
      rctx.translate(boxW / 2, boxH / 2);
      rctx.rotate(rad);
      rctx.drawImage(image, -image.width / 2, -image.height / 2);

      const canvas = document.createElement('canvas');
      // Output keeps the shape of the crop box (square, wide…); `size` is the longer side
      const ratio = pixelCrop.width / pixelCrop.height;
      canvas.width = ratio >= 1 ? size : Math.round(size * ratio);
      canvas.height = ratio >= 1 ? Math.round(size / ratio) : size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      const scale = canvas.width / pixelCrop.width;
      ctx.scale(scale, scale);
      ctx.drawImage(rotated, -pixelCrop.x, -pixelCrop.y);

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

/**
 * Trims empty edges (transparent or near-white pixels) off an image so a logo
 * is shown at its real size instead of floating inside blank padding.
 * Resolves with the original source if nothing can be trimmed.
 */
export const trimImageEdges = (src, tolerance = 245) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const w = image.naturalWidth;
        const h = image.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const blank = data[i + 3] < 16 || (data[i] > tolerance && data[i + 1] > tolerance && data[i + 2] > tolerance);
            if (!blank) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) return resolve(src);
        const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
        const sx = Math.max(0, minX - pad);
        const sy = Math.max(0, minY - pad);
        const sw = Math.min(w, maxX + pad + 1) - sx;
        const sh = Math.min(h, maxY + pad + 1) - sy;
        if (sw >= w && sh >= h) return resolve(src);
        const out = document.createElement('canvas');
        out.width = sw;
        out.height = sh;
        out.getContext('2d').drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(src); // e.g. cross-origin image that can't be read
      }
    };
    image.onerror = () => resolve(src);
    image.src = src;
  });
