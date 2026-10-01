import { useState } from 'react';
import { Button, InputField, TextAreaField, MultiSelectDropdown } from '../components';
import { generateNextNumber } from '../utils';
import { useClients } from '../../modules/client';
import { FiSave, FiRefreshCw, FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiCheckSquare, FiSquare } from 'react-icons/fi';

const DocumentForm = ({ items = [], initialData, onSave, onCancel, isEdit = false, config, referenceNoOptions = [], referenceNoData = [] }) => {
  const isFieldActive = (fieldName) => (config.fields ? config.fields.includes(fieldName) : true);

  const [formData, setFormData] = useState(() => {
    if (isEdit && initialData) {
      const existingLineItems = initialData.lineItems?.length 
        ? initialData.lineItems 
        : [{ description: initialData.description || '', rate: initialData.rate || '' }];
      return {
        ...initialData,
        rate: initialData.rate?.toString() || '',
        referenceNo: initialData.referenceNo || '',
        referenceNoSelected: initialData.referenceNo
          ? initialData.referenceNo.split(', ').filter(Boolean)
          : [],
        lineItems: existingLineItems,
        adjustment: initialData.adjustment?.toString() || '0',
      };
    }

    const today = new Date();
    const createdStr = today.toISOString().split('T')[0];
    today.setDate(today.getDate() + 7);
    const dueStr = today.toISOString().split('T')[0];
    const nextNum = generateNextNumber(items, config.numberPrefix);

    return {
      invoiceNumber: nextNum,
      referenceNo: '',
      referenceNoSelected: [],
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      createdDate: createdStr,
      dueDate: dueStr,
      lineItems: [{ description: '', rate: '' }],
    };
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      lineItems: newLineItems,
    }));
    const errorKey = `lineItem_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', rate: '' }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (isFieldActive('referenceNo') && isFieldActive('referenceNoRequired') && !formData.referenceNo?.trim()) {
      newErrors.referenceNo = 'Reference Number is required';
    }

    if (isFieldActive('name') && !formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (isFieldActive('email')) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (isFieldActive('phone')) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Enter a valid 10-15 digit phone number';
      }
    }

    if (isFieldActive('address') && !formData.address.trim()) {
      newErrors.address = 'Billing address is required';
    }

    if (isFieldActive('gstin')) {
      if (formData.gstin.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase().trim())) {
        newErrors.gstin = 'Enter a valid 15-character GSTIN format (e.g. 22AAAAA0000A1Z5)';
      }
    }

    if (isFieldActive('createdDate') && !formData.createdDate) {
      newErrors.createdDate = 'Created date is required';
    }

    if (isFieldActive('dueDate')) {
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required';
      } else if (formData.createdDate && new Date(formData.dueDate) < new Date(formData.createdDate)) {
        newErrors.dueDate = 'Due date cannot be before created date';
      }
    }

    if (isFieldActive('description') || isFieldActive('rate')) {
      if (!formData.lineItems || formData.lineItems.length === 0) {
        newErrors.lineItems = 'At least one line item is required';
      } else {
        formData.lineItems.forEach((item, index) => {
          if (isFieldActive('description') && !item.description.trim()) {
            newErrors[`lineItem_${index}_description`] = 'Description is required';
          }
          if (isFieldActive('rate')) {
            if (!item.rate) {
              newErrors[`lineItem_${index}_rate`] = 'Rate is required';
            } else {
              const numRate = parseFloat(item.rate);
              if (isNaN(numRate) || numRate < 0) {
                newErrors[`lineItem_${index}_rate`] = 'Rate must be a valid number';
              }
            }
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const totalRate = formData.lineItems.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0);
      // Strip internal UI-only fields that should never be persisted to the database
      // eslint-disable-next-line no-unused-vars
      const { selectedClientId, referenceNoSelected, ...persistableData } = formData;
      const cleanedData = {
        ...persistableData,
        gstin: formData.gstin ? formData.gstin.toUpperCase().trim() : '',
        rate: totalRate,
        lineItems: formData.lineItems.map(item => {
          // eslint-disable-next-line no-unused-vars
          const { _fromProforma, ...cleanItem } = item;
          return { ...cleanItem, rate: parseFloat(item.rate) || 0 };
        })
      };
      onSave(cleanedData);
    }
  };

  const handleReset = () => {
    setFormData({
      invoiceNumber: isEdit ? formData.invoiceNumber : generateNextNumber(items, config.numberPrefix),
      referenceNo: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      rate: '',
      lineItems: [{ description: '', rate: '' }],
    });
    setErrors({});
  };

  const isProforma = config.title?.toLowerCase().includes('proforma');
  const badgeBg = isProforma ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? `Modify ${config.title} Records` : `Create New ${config.title}`}</h2>
          <p className="text-xs text-slate-400 mt-1">Fill in the fields below to {isEdit ? 'update' : 'issue'} billing details.</p>
        </div>
        <div className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold tracking-wide ${badgeBg}`}>
          {formData.invoiceNumber || 'DOC-XXXX'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Number */}
        {isFieldActive('referenceNo') && (
          referenceNoOptions.length > 0 ? (
            <div className="md:col-span-2">
              <MultiSelectDropdown
                label={`Reference No. ${isFieldActive('referenceNoRequired') ? '*' : '(Optional)'}`}
                options={referenceNoOptions}
                selected={formData.referenceNoSelected || []}
                onChange={(vals) => {
                  setFormData((prev) => {
                    const base = {
                      ...prev,
                      referenceNoSelected: vals,
                      referenceNo: vals.join(', '),
                    };

                    // Auto-fill from selected proforma(s)
                    if (vals.length > 0 && referenceNoData.length > 0) {
                      const selectedProformas = referenceNoData.filter((p) =>
                        vals.includes(p.invoiceNumber)
                      );

                      if (selectedProformas.length > 0) {
                        // Use the last-selected proforma for customer details
                        const primary = selectedProformas[selectedProformas.length - 1];

                        // Merge line items from all selected proformas
                        const mergedLineItems = selectedProformas.flatMap((p) =>
                          p.lineItems && p.lineItems.length > 0
                            ? p.lineItems.map((li) => ({
                                ...li,
                                rate: li.rate?.toString() ?? '',
                              }))
                            : [{ description: p.description || '', rate: (p.rate ?? '').toString() }]
                        );

                        return {
                          ...base,
                          // Customer details — only overwrite if currently empty
                          name:    primary.name    || prev.name,
                          email:   primary.email   || prev.email,
                          phone:   primary.phone   || prev.phone,
                          address: primary.address || prev.address,
                          gstin:   primary.gstin   || prev.gstin,
                          // Line items — always replaced by the selection
                          lineItems: mergedLineItems.length > 0
                            ? mergedLineItems
                            : [{ description: '', rate: '' }],
                          // Track primary source for status-sync
                          sourceProformaNumber: vals[0],
                        };
                      }
                    }

                    // Selection cleared — reset line items & source
                    if (vals.length === 0) {
                      return {
                        ...base,
                        lineItems: [{ description: '', rate: '' }],
                        sourceProformaNumber: '',
                      };
                    }

                    return base;
                  });
                  if (errors.referenceNo) setErrors((prev) => ({ ...prev, referenceNo: '' }));
                }}
                placeholder="Select proforma reference(s)…"
                error={errors.referenceNo}
                required={isFieldActive('referenceNoRequired')}
              />
            </div>
          ) : (
            <InputField
              label={`Reference No. ${isFieldActive('referenceNoRequired') ? '*' : '(Optional)'}`}
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleChange}
              placeholder="e.g. PO-74902 or QUOTE-8823"
              error={errors.referenceNo}
              containerClassName="md:col-span-2"
            />
          )
        )}

        {/* Quick Auto-Fill from Saved Client */}
        {(() => {
          try {
            const clientCtx = useClients();
            const clientList = clientCtx?.clients || [];
            if (!clientList || clientList.length === 0) return null;

            // Find proformas for the currently selected client
            const selectedClient = formData.selectedClientId
              ? clientList.find((c) => c.id === formData.selectedClientId || c.clientId === formData.selectedClientId)
              : null;

            const clientProformas = selectedClient && !isProforma && referenceNoData?.length > 0
              ? referenceNoData.filter(
                  (p) =>
                    p.clientId === selectedClient.clientId ||
                    p.email?.toLowerCase() === selectedClient.email?.toLowerCase()
                )
              : [];

            const handleClientChange = (e) => {
              const selectedId = e.target.value;
              if (!selectedId) {
                setFormData((prev) => ({
                  ...prev,
                  selectedClientId: '',
                  selectedProformaIds: [],
                  lineItems: [{ description: '', rate: '' }],
                  proformaRefs: [],
                }));
                return;
              }
              const client = clientList.find((c) => c.id === selectedId || c.clientId === selectedId);
              if (client) {
                setFormData((prev) => ({
                  ...prev,
                  selectedClientId: client.id,
                  clientId: client.clientId || '',
                  name: client.name || '',
                  email: client.email || '',
                  phone: client.phone || '',
                  address: client.address || '',
                  gstin: client.gstin || '',
                  selectedProformaIds: [],
                  lineItems: [{ description: '', rate: '' }],
                  proformaRefs: [],
                }));
                setErrors((prev) => ({ ...prev, name: '', email: '', phone: '', address: '', gstin: '' }));
              }
            };

            const handleProformaToggle = (proforma) => {
              setFormData((prev) => {
                const alreadySelected = (prev.selectedProformaIds || []).includes(proforma.invoiceNumber);
                const newSelected = alreadySelected
                  ? (prev.selectedProformaIds || []).filter((id) => id !== proforma.invoiceNumber)
                  : [...(prev.selectedProformaIds || []), proforma.invoiceNumber];

                // Re-build line items from newly selected proformas
                const selectedProformas = clientProformas.filter((p) =>
                  newSelected.includes(p.invoiceNumber)
                );
                const mergedLineItems =
                  selectedProformas.length > 0
                    ? selectedProformas.flatMap((p) =>
                        p.lineItems && p.lineItems.length > 0
                          ? p.lineItems.map((li) => ({
                              ...li,
                              rate: li.rate?.toString() ?? '',
                              _fromProforma: p.invoiceNumber,
                            }))
                          : [{ description: p.description || '', rate: (p.rate ?? '').toString(), _fromProforma: p.invoiceNumber }]
                      )
                    : [{ description: '', rate: '' }];

                return {
                  ...prev,
                  selectedProformaIds: newSelected,
                  referenceNoSelected: newSelected,
                  referenceNo: newSelected.join(', '),
                  lineItems: mergedLineItems,
                  proformaRefs: newSelected,
                  sourceProformaNumber: newSelected[0] || '',
                };
              });
            };

            const handleSelectAllProformas = () => {
              const allIds = clientProformas.map((p) => p.invoiceNumber);
              const allSelected = allIds.every((id) => (formData.selectedProformaIds || []).includes(id));
              if (allSelected) {
                // Deselect all
                setFormData((prev) => ({
                  ...prev,
                  selectedProformaIds: [],
                  referenceNoSelected: [],
                  referenceNo: '',
                  lineItems: [{ description: '', rate: '' }],
                  proformaRefs: [],
                  sourceProformaNumber: '',
                }));
              } else {
                // Select all
                const mergedLineItems = clientProformas.flatMap((p) =>
                  p.lineItems && p.lineItems.length > 0
                    ? p.lineItems.map((li) => ({
                        ...li,
                        rate: li.rate?.toString() ?? '',
                        _fromProforma: p.invoiceNumber,
                      }))
                    : [{ description: p.description || '', rate: (p.rate ?? '').toString(), _fromProforma: p.invoiceNumber }]
                );
                setFormData((prev) => ({
                  ...prev,
                  selectedProformaIds: allIds,
                  referenceNoSelected: allIds,
                  referenceNo: allIds.join(', '),
                  lineItems: mergedLineItems.length > 0 ? mergedLineItems : [{ description: '', rate: '' }],
                  proformaRefs: allIds,
                  sourceProformaNumber: allIds[0] || '',
                }));
              }
            };

            const allProformaIds = clientProformas.map((p) => p.invoiceNumber);
            const allSelected = allProformaIds.length > 0 && allProformaIds.every((id) => (formData.selectedProformaIds || []).includes(id));

            return (
              <div className="md:col-span-2 space-y-4">
                {/* Client Selector */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <FiUser size={14} />
                    <span>Select Client (Auto-fills customer details{!isProforma ? ' & loads proforma invoices' : ''})</span>
                  </label>
                  <select
                    value={formData.selectedClientId || ''}
                    onChange={handleClientChange}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
                  >
                    <option value="">-- Select Saved Client to Auto-Fill --</option>
                    {clientList.map((c) => {
                      const idBadge = c.clientId || c.invoiceNumber || `CLT-${c.id?.slice(-4)}`;
                      return (
                        <option key={c.id} value={c.id}>
                          {idBadge} — {c.name} ({c.email})
                        </option>
                      );
                    })}
                  </select>

                  {/* Client Details Card */}
                  {selectedClient && (
                    <div className="bg-white rounded-xl border border-blue-100 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                            {(selectedClient.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{selectedClient.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{selectedClient.clientId}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedClient.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {selectedClient.status || 'Active'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {selectedClient.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <FiMail size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{selectedClient.email}</span>
                          </div>
                        )}
                        {selectedClient.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <FiPhone size={11} className="text-slate-400 shrink-0" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.gstin && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <FiFileText size={11} className="text-slate-400 shrink-0" />
                            <span className="font-mono tracking-wide">{selectedClient.gstin}</span>
                          </div>
                        )}
                        {selectedClient.address && (
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 sm:col-span-2">
                            <FiMapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{selectedClient.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Proforma Invoices Panel — only for Invoice mode when a client is selected */}
                {!isProforma && selectedClient && (
                  <div className="bg-gradient-to-br from-violet-50/60 to-purple-50/40 border border-violet-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FiFileText size={14} className="text-violet-600" />
                        <span className="text-xs font-bold text-violet-700">
                          Proforma Invoices — {selectedClient.name}
                        </span>
                        {clientProformas.length > 0 && (
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                            {clientProformas.length}
                          </span>
                        )}
                      </div>
                      {clientProformas.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllProformas}
                          className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800 transition-colors"
                        >
                          {allSelected ? <FiCheckSquare size={13} /> : <FiSquare size={13} />}
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    {clientProformas.length === 0 ? (
                      <div className="bg-white/70 rounded-xl border border-violet-100 px-4 py-6 text-center">
                        <FiFileText size={22} className="mx-auto text-violet-200 mb-2" />
                        <p className="text-xs font-semibold text-slate-400">No proforma invoices found for this client</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientProformas.map((pf) => {
                          const isChecked = (formData.selectedProformaIds || []).includes(pf.invoiceNumber);
                          const pfTotal = (pf.lineItems || []).reduce((s, li) => s + (parseFloat(li.rate) || 0), 0) || pf.rate || 0;
                          const statusColor =
                            pf.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : pf.status === 'Paid'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200';
                          return (
                            <button
                              key={pf.invoiceNumber}
                              type="button"
                              onClick={() => handleProformaToggle(pf)}
                              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                                isChecked
                                  ? 'bg-violet-50 border-violet-300 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-violet-200 hover:bg-violet-50/30'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                isChecked ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                              }`}>
                                {isChecked && (
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1.5 4L3.2 5.7L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-700">{pf.invoiceNumber}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                      {pf.status || 'Pending'}
                                    </span>
                                    <span className="text-xs font-black text-slate-800">
                                      ₹{Number(pfTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-[11px] text-slate-500">{pf.name}</span>
                                  {pf.createdDate && (
                                    <span className="text-[11px] text-slate-400">Created: {pf.createdDate}</span>
                                  )}
                                  {pf.dueDate && (
                                    <span className="text-[11px] text-slate-400">Due: {pf.dueDate}</span>
                                  )}
                                </div>
                                {(pf.lineItems || []).length > 0 && (
                                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                                    {(pf.lineItems || []).map((li) => li.description).filter(Boolean).join(' · ')}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(formData.selectedProformaIds || []).length > 0 && (
                      <p className="text-[11px] text-violet-600 font-semibold pt-1">
                        ✓ {(formData.selectedProformaIds || []).length} proforma{(formData.selectedProformaIds || []).length > 1 ? 's' : ''} selected — line items loaded below
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          } catch {
            return null;
          }
        })()}

        {/* Customer Name */}
        {isFieldActive('name') && (
          <InputField
            label="Customer Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe / Acme Corp"
            error={errors.name}
            required
          />
        )}

        {/* Email Address */}
        {isFieldActive('email') && (
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. client@domain.com"
            error={errors.email}
            required
          />
        )}

        {/* Phone Number */}
        {isFieldActive('phone') && (
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 9876543210"
            error={errors.phone}
            required
          />
        )}

        {/* GSTIN */}
        {isFieldActive('gstin') && (
          <InputField
            label="GSTIN (Optional)"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            placeholder="e.g. 22AAAAA0000A1Z5"
            maxLength={15}
            error={errors.gstin}
            className="tracking-wide uppercase"
          />
        )}

        {/* Created Date */}
        {isFieldActive('createdDate') && (
          <InputField
            label="Created Date"
            type="date"
            name="createdDate"
            value={formData.createdDate}
            onChange={handleChange}
            error={errors.createdDate}
            required
          />
        )}

        {/* Due Date */}
        {isFieldActive('dueDate') && (
          <InputField
            label={isProforma ? "Valid Until / Due Date" : "Due Date"}
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            required
          />
        )}

        {/* Billing Address */}
        {isFieldActive('address') && (
          <TextAreaField
            label="Billing Address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter customer street address, city, state, pincode"
            error={errors.address}
            required
            containerClassName="md:col-span-2"
          />
        )}

        {/* Line Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              + Add Item
            </Button>
          </div>
          
          {errors.lineItems && (
            <p className="text-xs text-red-500 font-semibold">{errors.lineItems}</p>
          )}

          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="flex-grow">
                  <InputField
                    label={index === 0 ? "Line Item Description" : "Description"}
                    name={`description_${index}`}
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="e.g. Software Development Services"
                    error={errors[`lineItem_${index}_description`]}
                    required={isFieldActive('description')}
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <InputField
                    label={index === 0 ? `Rate / Amount (${config.currency || '₹'})` : "Amount"}
                    type="number"
                    name={`rate_${index}`}
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                    placeholder="0.00"
                    prefix={config.currency || '₹'}
                    error={errors[`lineItem_${index}_rate`]}
                    required={isFieldActive('rate')}
                  />
                </div>
                {formData.lineItems.length > 1 && (
                  <div className="flex items-center pt-6">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <Button variant="outline" onClick={onCancel} icon={FiArrowLeft}>
          Cancel
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={handleReset} icon={FiRefreshCw}>
            Reset Form
          </Button>
          <Button type="submit" variant={isProforma ? 'violet' : 'primary'} icon={FiSave}>
            Save {config.title}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DocumentForm;
