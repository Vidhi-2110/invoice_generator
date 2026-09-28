import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiLogOut, FiShield, FiChevronDown, FiMail,
  FiEdit3, FiCamera, FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ImageCropper from './ImageCropper';

export const UserDropdown = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Edit form state ────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarPreview, setAvatarPreview] = useState(null); // base64 or null
  const [avatarFile, setAvatarFile] = useState(undefined);  // undefined = no change, null = remove, string = new base64
  const [rawImageSrc, setRawImageSrc] = useState(null);     // raw file src before crop
  const [showCropper, setShowCropper] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const openEditModal = () => {
    setIsOpen(false);
    setForm({ name: user.name || '', email: user.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setAvatarPreview(user.avatar || null);
    setAvatarFile(undefined);
    setSuccess('');
    setEditError('');
    setShowEditModal(true);
  };

  // ── Avatar image picker — open cropper after picking ─────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setEditError('Image must be smaller than 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be picked again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropConfirm = (croppedBase64) => {
    setAvatarPreview(croppedBase64);
    setAvatarFile(croppedBase64);
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null); // explicit null → remove from DB
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setSuccess('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setEditError('New passwords do not match.');
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setEditError('New password must be at least 6 characters.');
      return;
    }

    const payload = {};
    if (form.name.trim() && form.name.trim() !== user.name) payload.name = form.name.trim();
    if (form.email.trim() && form.email.trim() !== user.email) payload.email = form.email.trim();
    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }
    if (avatarFile !== undefined) payload.avatar = avatarFile; // null or base64

    if (Object.keys(payload).length === 0) {
      setEditError('No changes detected.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setAvatarFile(undefined);
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar display helper ──────────────────────────────────────────────────
  const AvatarDisplay = ({ size = 'sm', className = '' }) => {
    const avatarSrc = avatarPreview ?? user.avatar ?? null;
    const sizeClasses = size === 'lg'
      ? 'w-20 h-20 rounded-2xl text-3xl font-black'
      : 'w-10 h-10 rounded-xl text-base font-bold';

    if (avatarSrc) {
      return (
        <img
          src={avatarSrc}
          alt={user.name}
          className={`${sizeClasses} object-cover border-2 border-indigo-200 shadow-sm ${className}`}
        />
      );
    }
    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 border border-indigo-200 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 ${className}`}>
        {getInitial(user.name)}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Trigger Button ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 focus:outline-none cursor-pointer group"
      >
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
            {user.name}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{user.email}</p>
        </div>

        <div className="relative">
          <AvatarDisplay size="sm" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <FiChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
        />
      </button>

      {/* ── Dropdown Menu ───────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 py-2 z-50 animate-fadeIn">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 flex items-center gap-1">
                <FiShield size={10} />
                {user.role || 'Member'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 truncate mt-1">{user.name}</p>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <FiMail size={12} className="text-slate-400" />
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={openEditModal}
              className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FiUser size={16} className="text-slate-400" />
              Edit Account Profile
            </button>
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FiLogOut size={16} className="text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ───────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 animate-fadeIn overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <FiEdit3 size={16} className="text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Edit Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* ── Avatar Upload ─────────────────────────────────── */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview ?? user.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-indigo-500/30 border-2 border-indigo-200">
                      {getInitial(form.name || user.name)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title="Change photo"
                  >
                    <FiCamera size={22} className="text-white" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  >
                    Upload Photo
                  </button>
                  {(avatarPreview || user.avatar) && (
                    <>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Max 10 MB · JPG, PNG, WEBP · Will be cropped to square</p>
              </div>

              {/* ── Name & Email ──────────────────────────────────── */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                  <div className="relative">
                    <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* ── Change Password ───────────────────────────────── */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiLock size={12} /> Change Password <span className="font-normal normal-case">(optional)</span>
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={form.currentPassword}
                      onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrentPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNewPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              {/* ── Feedback Messages ─────────────────────────────── */}
              {editError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  <FiAlertCircle size={14} className="shrink-0" />
                  {editError}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <FiCheck size={14} className="shrink-0" />
                  {success}
                </div>
              )}

              {/* ── Action Buttons ────────────────────────────────── */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FiCheck size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Image Cropper (shown over edit modal) ─────────────────────────── */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default UserDropdown;
