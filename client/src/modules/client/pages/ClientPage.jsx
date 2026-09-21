import { useState } from 'react';
import { useClients } from '../context/ClientContext';
import ClientTable from '../components/ClientTable';
import ClientFormModal from '../components/ClientFormModal';
import { FiPlus, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';

const ClientPage = () => {
  const { clients, addClient, updateClient, deleteClient, config } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleSave = (clientData) => {
    if (clientToEdit) {
      updateClient(clientToEdit.id, clientData);
    } else {
      addClient(clientData);
    }
  };

  const activeCount = clients.filter((c) => c.status !== 'Inactive').length;
  const inactiveCount = clients.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Client Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Store and manage corporate client profiles with Unique Client IDs (`CLT-XXXX`).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-600/10 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Clients</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{clients.length}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FiUsers size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Active Accounts</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{activeCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Inactive Accounts</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{inactiveCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
            <FiClock size={20} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="animate-fade-in">
        <ClientTable
          clients={clients}
          onEdit={handleOpenEdit}
          onDelete={deleteClient}
          onCreateClick={handleOpenCreate}
        />
      </div>

      {/* Modal Form */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        clientToEdit={clientToEdit}
        existingClients={clients}
      />
    </div>
  );
};

export default ClientPage;
