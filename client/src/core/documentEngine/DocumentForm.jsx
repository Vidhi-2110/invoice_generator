import { useState } from 'react';
import { Button, InputField, TextAreaField, MultiSelectDropdown } from '../components';
import { generateNextNumber } from '../utils';
import { useClients } from '../../modules/client';
import { FiSave, FiRefreshCw, FiArrowLeft, FiUser } from 'react-icons/fi';

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
      if (!formData.gstin.trim()) {
        newErrors.gstin = 'GSTIN is required';
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase().trim())) {
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

            return (
              <div className="md:col-span-2 bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5">
                <label className="block text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <FiUser size={15} />
                  <span>
                    Select Client (Auto-fills customer details
                    {!isProforma ? ' & loads their proforma line items' : ''})
                  </span>
                </label>
                <select
                  value={formData.selectedClientId || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;
                    const selectedClient = clientList.find((c) => c.id === selectedId || c.clientId === selectedId);
                    if (selectedClient) {
                      // For Invoice mode: find all PENDING proformas belonging to this client
                      // (Approved proformas are already invoiced — skip them)
                      let mergedLineItems = null;
                      if (!isProforma && referenceNoData && referenceNoData.length > 0) {
                        const clientProformas = referenceNoData.filter(
                          (p) =>
                            (p.clientId === selectedClient.clientId ||
                              p.email?.toLowerCase() === selectedClient.email?.toLowerCase()) &&
                            p.status !== 'Approved'
                        );
                        if (clientProformas.length > 0) {
                          mergedLineItems = clientProformas.flatMap((p) =>
                            p.lineItems && p.lineItems.length > 0
                              ? p.lineItems.map((li) => ({
                                  ...li,
                                  rate: li.rate?.toString() ?? '',
                                  _fromProforma: p.invoiceNumber,
                                }))
                              : [{ description: p.description || '', rate: (p.rate ?? '').toString() }]
                          );
                        }
                      }

                      // Collect PENDING proforma IDs that were loaded for this client
                      // (Approved proformas are already invoiced — skip them)
                      let proformaRefs = null;
                      if (!isProforma && referenceNoData && referenceNoData.length > 0) {
                        const clientProformas = referenceNoData.filter(
                          (p) =>
                            (p.clientId === selectedClient.clientId ||
                              p.email?.toLowerCase() === selectedClient.email?.toLowerCase()) &&
                            p.status !== 'Approved'
                        );
                        if (clientProformas.length > 0) {
                          proformaRefs = clientProformas.map((p) => p.invoiceNumber).filter(Boolean);
                        }
                      }

                      setFormData((prev) => ({
                        ...prev,
                        selectedClientId: selectedClient.id,
                        clientId: selectedClient.clientId || '',
                        name: selectedClient.name || '',
                        email: selectedClient.email || '',
                        phone: selectedClient.phone || '',
                        address: selectedClient.address || '',
                        gstin: selectedClient.gstin || '',
                        // Replace line items with proforma items if available (Invoice mode only)
                        ...(mergedLineItems && mergedLineItems.length > 0
                          ? { lineItems: mergedLineItems }
                          : {}),
                        // Store proforma ref IDs so they appear in the invoice table column
                        ...(proformaRefs && proformaRefs.length > 0
                          ? { proformaRefs }
                          : {}),
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        gstin: '',
                      }));
                    }
                  }}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs"
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
            label="GSTIN"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            placeholder="e.g. 22AAAAA0000A1Z5"
            maxLength={15}
            error={errors.gstin}
            required
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
