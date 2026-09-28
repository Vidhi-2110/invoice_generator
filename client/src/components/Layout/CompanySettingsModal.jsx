import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  FiX, FiCheck, FiCamera, FiTrash2, FiSettings,
  FiType, FiTag, FiZoomIn, FiZoomOut, FiRotateCw, FiCrop, FiAlertCircle,
} from 'react-icons/fi';
import { useCompanySettings } from './CompanySettingsContext';

/* ─── Canvas crop helper ──────────────────────────────────────────────────── */
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const SIZE = 200;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      ctx.translate(SIZE / 2, SIZE / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-SIZE / 2, -SIZE / 2);
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

/* ─── Mini Logo Cropper ───────────────────────────────────────────────────── */
const LogoCropper = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, area) => setCroppedAreaPixels(area), []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onConfirm(result);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-50"><FiCrop size={14} className="text-violet-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-800">Crop Logo</p>
              <p className="text-[11px] text-slate-400">Drag · Zoom · Rotate</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><FiX size={15} /></button>
        </div>

        <div className="relative bg-slate-900" style={{ height: 240 }}>
          <Cropper
            image={imageSrc}
            crop={crop} zoom={zoom} rotation={rotation} aspect={1}
            cropShape="round" showGrid={false}
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
            style={{
              cropAreaStyle: { border: '3px solid #6366f1', boxShadow: '0 0 0 9999px rgba(15,23,42,0.65)' },
            }}
          />
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><FiZoomOut size={14} /></button>
            <input type="range" min={1} max={3} step={0.02} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 h-1.5 rounded-full accent-indigo-600 cursor-pointer" />
            <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><FiZoomIn size={14} /></button>
          </div>
          {/* Rotate */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Rotation: {rotation}°</span>
            <button type="button" onClick={() => setRotation(r => (r + 90) % 360)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700">
              <FiRotateCw size={12} /> Rotate 90°
            </button>
          </div>
          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleApply} disabled={processing} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-1.5">
              {processing ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={13} />}
              {processing ? 'Processing…' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Company Settings Modal ─────────────────────────────────────────── */
const CompanySettingsModal = ({ onClose }) => {
  const { settings, updateSettings } = useCompanySettings();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    companyName: settings.companyName,
    tagline: settings.tagline,
  });
  const [logoPreview, setLogoPreview] = useState(settings.logo);
  const [logoFile, setLogoFile] = useState(undefined); // undefined=no change, null=remove, string=new
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setRawImageSrc(ev.target.result); setShowCropper(true); };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropConfirm = (base64) => {
    setLogoPreview(base64);
    setLogoFile(base64);
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    if (!form.companyName.trim()) { setError('Company name cannot be empty.'); return; }
    const updates = { companyName: form.companyName.trim(), tagline: form.tagline.trim() };
    if (logoFile !== undefined) updates.logo = logoFile;
    updateSettings(updates);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'I');

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50"><FiSettings size={16} className="text-indigo-600" /></div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Company Settings</h2>
                <p className="text-[11px] text-slate-400">Customize your brand in the sidebar</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><FiX size={18} /></button>
          </div>

          <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

            {/* Live Preview */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3">
              <div className="relative shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-400 shadow-md" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/30">
                    {getInitial(form.companyName)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{form.companyName || 'Company Name'}</p>
                <p className="text-xs text-indigo-400 font-medium">{form.tagline || 'Tagline'}</p>
              </div>
              <span className="ml-auto text-[10px] text-slate-500 font-medium px-2 py-1 bg-slate-800 rounded-lg">Preview</span>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FiCamera size={13} /> Company Logo
              </label>
              <div className="flex items-center gap-4">
                {/* Logo preview thumb */}
                <div
                  className="relative group w-16 h-16 rounded-2xl shrink-0 cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <FiCamera size={20} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiCamera size={16} className="text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                    <FiCamera size={12} /> Upload Logo
                  </button>
                  {logoPreview && (
                    <button type="button" onClick={removeLogo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">
                      <FiTrash2 size={12} /> Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400">Max 5 MB · JPG, PNG, WEBP · Will be cropped</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FiType size={12} /> Company Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-semibold"
                placeholder="e.g. InvoSaaS"
                maxLength={30}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.companyName.length}/30</p>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FiTag size={12} /> Tagline / Subtitle
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                placeholder="e.g. Enterprise Billing"
                maxLength={40}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.tagline.length}/40</p>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <FiAlertCircle size={14} className="shrink-0" />{error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <FiCheck size={14} className="shrink-0" />Settings saved!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <FiCheck size={15} /> Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logo Cropper */}
      {showCropper && rawImageSrc && (
        <LogoCropper
          imageSrc={rawImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => { setShowCropper(false); setRawImageSrc(null); }}
        />
      )}
    </>
  );
};

export default CompanySettingsModal;
