import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  FiSave, FiCamera, FiTrash2, FiBriefcase, FiPhone, FiMail, FiMapPin,
  FiCreditCard, FiFileText, FiZoomIn, FiZoomOut, FiRotateCw, FiCrop,
  FiCheck, FiX, FiAlertCircle, FiInfo, FiTag, FiDroplet,
} from 'react-icons/fi';
import { useCompanySettings } from '../../components/Layout/CompanySettingsContext';
import { COLOR_PALETTES, applyPalette, getPaletteById } from '../../core/theme/palettes';

/* ─── Canvas crop helper ────────────────────────────────────────────────────── */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, size = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-size / 2, -size / 2);
      ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

/* ─── Image Cropper Overlay ─────────────────────────────────────────────────── */
function ImageCropperOverlay({ imageSrc, cropShape, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, area) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onConfirm(result);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-50">
              <FiCrop size={14} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Crop Image</p>
              <p className="text-[11px] text-slate-400">Drag · Scroll to zoom · Rotate</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
            <FiX size={16} />
          </button>
        </div>

        <div className="relative bg-slate-900" style={{ height: 280 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              cropAreaStyle: {
                border: '3px solid #6366f1',
                boxShadow: '0 0 0 9999px rgba(15,23,42,0.65)',
              },
            }}
          />
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
              <FiZoomOut size={14} />
            </button>
            <input
              type="range" min={1} max={3} step={0.02} value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full accent-indigo-600 cursor-pointer"
            />
            <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
              <FiZoomIn size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Rotation: {rotation}°</span>
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <FiRotateCw size={12} /> Rotate 90°
            </button>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={processing}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {processing
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiCheck size={13} />}
              {processing ? 'Processing…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Image Upload Card ─────────────────────────────────────────────────────── */
function ImageUploadCard({ label, hint, value, cropShape = 'round', onChange, onRemove, previewClass = '' }) {
  const fileRef = useRef(null);
  const [rawSrc, setRawSrc] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawSrc(ev.target.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`relative group cursor-pointer border-2 border-dashed transition-colors ${value ? 'border-indigo-300' : 'border-slate-300 hover:border-indigo-400'} ${previewClass}`}
          onClick={() => fileRef.current?.click()}
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
              <FiCamera size={22} />
              <span className="text-[11px] font-medium">Click to upload</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[inherit]">
            <FiCamera size={20} className="text-white" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
          >
            <FiCamera size={12} /> {value ? 'Change' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
            >
              <FiTrash2 size={12} /> Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 text-center">{hint}</p>
      </div>

      {showCrop && rawSrc && (
        <ImageCropperOverlay
          imageSrc={rawSrc}
          cropShape={cropShape}
          onConfirm={(b64) => { onChange(b64); setShowCrop(false); setRawSrc(null); }}
          onCancel={() => { setShowCrop(false); setRawSrc(null); }}
        />
      )}
    </>
  );
}

/* ─── Section Wrapper ───────────────────────────────────────────────────────── */
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="p-2 rounded-xl bg-indigo-50">
          <Icon size={16} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Text Input Field ──────────────────────────────────────────────────────── */
function Field({ label, icon: Icon, required, maxLength, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ─── Main Settings Page ────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { settings, updateSettings } = useCompanySettings();

  const [form, setForm] = useState({
    companyName: settings.companyName || '',
    tagline: settings.tagline || '',
    logo: settings.logo || null,
    colorPalette: settings.colorPalette || 'indigo',
    phone: settings.phone || '',
    email: settings.email || '',
    address: settings.address || '',
    bankName: settings.bankName || '',
    ifscCode: settings.ifscCode || '',
    branchName: settings.branchName || '',
    accountNumber: settings.accountNumber || '',
    accountName: settings.accountName || '',
    esign: settings.esign || null,
    stamp: settings.stamp || null,
  });

  // Live-preview the palette without saving yet
  const handlePaletteSelect = (paletteId) => {
    setForm(f => ({ ...f, colorPalette: paletteId }));
    applyPalette(getPaletteById(paletteId));
  };
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Company Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your company profile, bank details, and document stamps used on invoices.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm shadow-indigo-600/20"
        >
          <FiSave size={15} /> Save Settings
        </button>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          <FiCheck size={16} className="shrink-0" />
          Settings saved! Changes are reflected across your invoices.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
          <FiAlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── 1. Brand Identity ─────────────────────────────────────────── */}
        <Section icon={FiBriefcase} title="Brand Identity" subtitle="Appears in the sidebar and on every invoice">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FiCamera size={12} /> Company Logo
              </p>
              <ImageUploadCard
                label="Logo"
                hint="Max 5 MB · JPG, PNG · Shown in sidebar & invoices"
                value={form.logo}
                cropShape="round"
                previewClass="w-28 h-28 rounded-2xl"
                onChange={set('logo')}
                onRemove={() => setForm(f => ({ ...f, logo: null }))}
              />
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <Field
                label="Company Name" required icon={FiBriefcase}
                value={form.companyName} onChange={set('companyName')}
                placeholder="e.g. InvoSaaS" maxLength={50}
              />
              <Field
                label="Tagline / Subtitle" icon={FiTag}
                value={form.tagline} onChange={set('tagline')}
                placeholder="e.g. Enterprise Billing" maxLength={60}
              />
            </div>
          </div>
        </Section>

        {/* ── 2. Color Palette ─────────────────────────────────────────── */}
        <Section icon={FiDroplet} title="Brand Color Palette" subtitle="Choose a color theme that matches your company logo">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COLOR_PALETTES.map((palette) => {
              const isSelected = form.colorPalette === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => handlePaletteSelect(palette.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? 'border-transparent shadow-lg scale-[1.03]'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  style={isSelected ? { borderColor: palette.primary, backgroundColor: palette.primaryLight } : {}}
                >
                  {/* Swatch circles */}
                  <div className="flex items-center gap-1">
                    {palette.swatch.map((color, i) => (
                      <div
                        key={i}
                        className="rounded-full shadow-sm"
                        style={{
                          backgroundColor: color,
                          width: i === 0 ? 28 : i === 1 ? 22 : 16,
                          height: i === 0 ? 28 : i === 1 ? 22 : 16,
                          opacity: i === 0 ? 1 : i === 1 ? 0.75 : 0.45,
                        }}
                      />
                    ))}
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: isSelected ? palette.primary : '#374151' }}
                    >
                      {palette.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {palette.description}
                    </p>
                  </div>

                  {/* Selected tick */}
                  {isSelected && (
                    <div
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <FiCheck size={11} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live preview bar */}
          {(() => {
            const pal = getPaletteById(form.colorPalette);
            return (
              <div
                className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-medium"
                style={{ backgroundColor: pal.primaryLight, borderColor: pal.primaryMuted, color: pal.primaryText }}
              >
                <div className="w-6 h-6 rounded-lg shrink-0" style={{ backgroundColor: pal.primary }} />
                <div>
                  <span className="font-bold">{pal.name}</span>
                  <span className="text-slate-500 ml-1">— {pal.description}</span>
                  <span className="ml-2 opacity-70">The sidebar and buttons will use this color throughout the app.</span>
                </div>
              </div>
            );
          })()}
        </Section>

        {/* ── 3. Contact Information ────────────────────────────────────── */}
        <Section icon={FiPhone} title="Contact Information" subtitle="Displayed on invoice headers and footers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Phone Number" icon={FiPhone}
              value={form.phone} onChange={set('phone')}
              placeholder="+91 98765 43210" type="tel"
            />
            <Field
              label="Email Address" icon={FiMail}
              value={form.email} onChange={set('email')}
              placeholder="billing@company.com" type="email"
            />
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <FiMapPin size={12} /> Address
              </label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123, Business Park, Mumbai, Maharashtra - 400001"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal resize-none"
              />
            </div>
          </div>
        </Section>

        {/* ── 3. Bank Details ───────────────────────────────────────────── */}
        <Section icon={FiCreditCard} title="Bank Details" subtitle="Used in invoice payment sections for client transfers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Bank Name" icon={FiCreditCard}
              value={form.bankName} onChange={set('bankName')}
              placeholder="e.g. HDFC Bank"
            />
            <Field
              label="Branch Name" icon={FiBriefcase}
              value={form.branchName} onChange={set('branchName')}
              placeholder="e.g. Andheri West Branch"
            />
            <Field
              label="IFSC Code" icon={FiFileText}
              value={form.ifscCode} onChange={set('ifscCode')}
              placeholder="e.g. HDFC0001234" maxLength={11}
              hint="11-character code on your cheque book"
            />
            <Field
              label="Account Number" icon={FiCreditCard}
              value={form.accountNumber} onChange={set('accountNumber')}
              placeholder="e.g. 0123456789"
            />
            <div className="md:col-span-2">
              <Field
                label="Account Holder Name" icon={FiBriefcase}
                value={form.accountName} onChange={set('accountName')}
                placeholder="e.g. InvoSaaS Private Limited"
              />
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
            <FiInfo size={14} className="shrink-0 mt-0.5" />
            These details will appear in the <strong className="font-bold mx-0.5">Bank Transfer</strong> section at the bottom of every invoice PDF.
          </div>
        </Section>

        {/* ── 4. E-Sign & Company Stamp ─────────────────────────────────── */}
        <Section icon={FiFileText} title="E-Sign & Company Stamp" subtitle="Appear at the bottom of invoices for authorization">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Authorised Signature (E-Sign)
              </p>
              <ImageUploadCard
                label="E-Sign"
                hint="Upload a transparent PNG · Max 3 MB"
                value={form.esign}
                cropShape="rect"
                previewClass="w-full h-28 rounded-xl bg-slate-50"
                onChange={set('esign')}
                onRemove={() => setForm(f => ({ ...f, esign: null }))}
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Company Stamp / Seal
              </p>
              <ImageUploadCard
                label="Stamp"
                hint="Upload a transparent PNG · Max 3 MB"
                value={form.stamp}
                cropShape="round"
                previewClass="w-28 h-28 rounded-full mx-auto bg-slate-50"
                onChange={set('stamp')}
                onRemove={() => setForm(f => ({ ...f, stamp: null }))}
              />
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
            <FiInfo size={14} className="shrink-0 mt-0.5" />
            For best results, use a <strong className="font-bold mx-0.5">transparent background PNG</strong> for the signature and stamp so they look clean on white invoices.
          </div>
        </Section>

        {/* Bottom Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <FiSave size={15} /> Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
