import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiCheck, FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiCrop } from 'react-icons/fi';

/**
 * getCroppedImg — renders the cropped area of `imageSrc` onto a canvas
 * and returns a base64 JPEG data URL.
 */
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0, outputSize = 400) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      // Rotate around centre
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      // Scale from source crop to output canvas
      const scaleX = outputSize / pixelCrop.width;
      const scaleY = outputSize / pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
      );

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    });
    image.addEventListener('error', reject);
    image.src = imageSrc;
  });
};

/**
 * ImageCropper
 * Props:
 *   imageSrc  — raw base64 / object URL of the selected file
 *   onConfirm — callback(croppedBase64: string)
 *   onCancel  — callback()
 */
const ImageCropper = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onConfirm(cropped);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const adjustZoom = (delta) => setZoom((z) => Math.min(3, Math.max(1, +(z + delta).toFixed(2))));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-50">
              <FiCrop size={15} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Crop & Resize Photo</h3>
              <p className="text-[11px] text-slate-400">Drag to reposition · Scroll to zoom</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Crop Canvas */}
        <div className="relative w-full bg-slate-900" style={{ height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: '3px solid #6366f1',
                boxShadow: '0 0 0 9999px rgba(15,23,42,0.65)',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4">

          {/* Zoom slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Zoom</span>
              <span className="text-[11px] font-bold text-indigo-600">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustZoom(-0.1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <FiZoomOut size={15} />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-indigo-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => adjustZoom(0.1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <FiZoomIn size={15} />
              </button>
            </div>
          </div>

          {/* Rotate */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rotation</span>
            <button
              type="button"
              onClick={rotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <FiRotateCw size={13} />
              Rotate 90°
              <span className="ml-1 text-slate-400">({rotation}°)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <FiCheck size={15} />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
