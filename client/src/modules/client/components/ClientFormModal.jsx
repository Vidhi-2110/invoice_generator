import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiSave, FiCheckCircle } from 'react-icons/fi';
import { generateNextNumber } from '../../../core/utils';

const ClientFormModal = ({ isOpen, onClose, onSave, clientToEdit = null, existingClients = [] }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    status: 'Active',
    notes: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        clientId: clientToEdit.clientId || clientToEdit.invoiceNumber || '',
        name: clientToEdit.name || '',
        email: clientToEdit.email || '',
        phone: clientToEdit.phone || '',
        address: clientToEdit.address || '',
        gstin: clientToEdit.gstin || '',
        status: clientToEdit.status || 'Active',
        notes: clientToEdit.notes || '',
      });
    } else {
      const nextId = generateNextNumber(existingClients, 'CLT');
      setFormData({
        clientId: nextId,
        name: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        status: 'Active',
        notes: '',
      });
    }
    setSaved(false);
  }, [clientToEdit, existingClients, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onSave(formData);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FiUser size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {clientToEdit ? 'Edit Client Record' : 'Add New Client'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {clientToEdit ? `Updating ${clientToEdit.clientId}` : 'Register a client with a Unique Client ID'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 space-y-3 text-center">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-500">
              <FiCheckCircle size={44} />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Client {clientToEdit ? 'Updated' : 'Saved'} Successfully!
            </h4>
            <p className="text-xs text-slate-400">
              Unique Client ID: <span className="font-bold text-indigo-600">{formData.clientId}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Unique Client ID & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Unique Client ID <span className="text-slate-400 font-normal">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-indigo-600 tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Client / Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acma Corporate Solutions"
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@company.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* GSTIN & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="27AAACG0000A1Z5"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Address / Location</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="City, State, Country"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow shadow-blue-500/20 transition-all active:scale-95"
              >
                <FiSave size={14} />
                <span>{clientToEdit ? 'Save Changes' : 'Save Client'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientFormModal;
