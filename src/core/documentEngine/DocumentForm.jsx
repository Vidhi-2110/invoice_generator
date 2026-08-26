import { useState } from 'react';
import { Button, InputField, TextAreaField } from '../components';
import { generateNextNumber } from '../utils';
import { FiSave, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const DocumentForm = ({ items = [], initialData, onSave, onCancel, isEdit = false, config }) => {
  const isFieldActive = (fieldName) => (config.fields ? config.fields.includes(fieldName) : true);

  const [formData, setFormData] = useState(() => {
    if (isEdit && initialData) {
      return {
        ...initialData,
        rate: initialData.rate?.toString() || '',
        referenceNo: initialData.referenceNo || '',
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
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      createdDate: createdStr,
      dueDate: dueStr,
      description: '',
      rate: '',
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

    if (isFieldActive('description') && !formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (isFieldActive('rate')) {
      if (!formData.rate) {
        newErrors.rate = 'Rate is required';
      } else {
        const numRate = parseFloat(formData.rate);
        if (isNaN(numRate) || numRate <= 0) {
          newErrors.rate = 'Rate must be a positive number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        gstin: formData.gstin ? formData.gstin.toUpperCase().trim() : '',
        rate: parseFloat(formData.rate) || 0,
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
          <InputField
            label={`Reference No. ${isFieldActive('referenceNoRequired') ? '*' : '(Optional)'}`}
            name="referenceNo"
            value={formData.referenceNo}
            onChange={handleChange}
            placeholder="e.g. PO-74902 or QUOTE-8823"
            error={errors.referenceNo}
            containerClassName="md:col-span-2"
          />
        )}

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

        {/* Description */}
        {isFieldActive('description') && (
          <InputField
            label="Line Item Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Software Development Services - Q3"
            error={errors.description}
            required
            containerClassName="md:col-span-2"
          />
        )}

        {/* Rate / Amount */}
        {isFieldActive('rate') && (
          <InputField
            label={`Rate / Amount (${config.currency || '₹'})`}
            type="number"
            name="rate"
            step="0.01"
            value={formData.rate}
            onChange={handleChange}
            placeholder="0.00"
            prefix={config.currency || '₹'}
            error={errors.rate}
            required
          />
        )}
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
