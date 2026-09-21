import { useState, useMemo } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUser, FiX } from 'react-icons/fi';

const ClientTable = ({ clients = [], onEdit, onDelete, onCreateClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        client.name?.toLowerCase().includes(q) ||
        client.email?.toLowerCase().includes(q) ||
        (client.clientId || client.invoiceNumber)?.toLowerCase().includes(q) ||
        client.phone?.toLowerCase().includes(q) ||
        client.gstin?.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery]);

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm max-w-4xl mx-auto space-y-5">
        <div className="p-4 rounded-full bg-blue-50 text-blue-500">
          <FiUser size={40} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800">No Clients Registered Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Register client profiles with Unique Client IDs to manage billing details easily.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          Add First Client
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden max-w-7xl mx-auto space-y-0">
      {/* Search Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, client ID (CLT-0001)..."
            className="w-full pl-10 pr-9 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-semibold self-center">
          Showing <span className="text-slate-800 font-bold">{filteredClients.length}</span> of {clients.length} clients
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-sm font-bold text-slate-600">No clients match your search query.</p>
            <p className="text-xs text-slate-400">Try searching with a different name, email, or Client ID.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Client ID</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">GSTIN / Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredClients.map((client) => {
                const clientId = client.clientId || client.invoiceNumber || `CLT-${client.id?.slice(-4)}`;
                const isActive = client.status !== 'Inactive';

                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Client ID Badge */}
                    <td className="px-6 py-4">
                      <span className="font-bold border px-2.5 py-1 rounded-lg text-xs text-blue-600 bg-blue-50/60 border-blue-100">
                        {clientId}
                      </span>
                    </td>

                    {/* Client Name */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{client.name}</p>
                      {client.notes && (
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5 truncate max-w-xs">
                          {client.notes}
                        </p>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-700">{client.email}</p>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">{client.phone || '-'}</p>
                    </td>

                    {/* GSTIN / Address */}
                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-700">{client.gstin || '-'}</p>
                      <p className="text-slate-400 font-normal mt-0.5 truncate max-w-xs">{client.address || '-'}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                          title="Edit Client"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete client ${client.name} (${clientId})?`)) {
                              onDelete(client.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-600 transition-colors"
                          title="Delete Client"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientTable;
