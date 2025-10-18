import { useState } from 'react';
import { Edit2, Trash2, Calendar, Mail, Phone, MapPin, Building } from 'lucide-react';
import type { Lead } from '../lib/types';

interface LeadsSectionProps {
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
}

export function LeadsSection({ leads, onUpdateLead, onDeleteLead }: LeadsSectionProps) {
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesStage = !filterStage || lead.stage === filterStage;
    const matchesStatus = !filterStatus || lead.lead_status === filterStatus;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const handleSaveEdit = async () => {
    if (!editingLead) return;

    await onUpdateLead(editingLead.id, {
      business_name: editingLead.business_name,
      contact_person: editingLead.contact_person,
      phone: editingLead.phone,
      email: editingLead.email,
      address: editingLead.address,
      city: editingLead.city,
      lead_status: editingLead.lead_status,
      stage: editingLead.stage,
      next_followup_date: editingLead.next_followup_date,
      interested_services: editingLead.interested_services,
      notes_first_call: editingLead.notes_first_call,
    });

    setEditingLead(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Leads</h2>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Stages</option>
            <option value="Contacted">Contacted</option>
            <option value="Requirements Received">Requirements Received</option>
            <option value="Follow-ups">Follow-ups</option>
            <option value="Closed/Won">Closed/Won</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            {editingLead?.id === lead.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={editingLead.business_name}
                      onChange={(e) => setEditingLead({ ...editingLead, business_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={editingLead.contact_person}
                      onChange={(e) => setEditingLead({ ...editingLead, contact_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingLead.phone}
                      onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingLead.email || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editingLead.city || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={editingLead.stage}
                      onChange={(e) => setEditingLead({ ...editingLead, stage: e.target.value as Lead['stage'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Contacted">Contacted</option>
                      <option value="Requirements Received">Requirements Received</option>
                      <option value="Follow-ups">Follow-ups</option>
                      <option value="Closed/Won">Closed/Won</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingLead.lead_status}
                      onChange={(e) => setEditingLead({ ...editingLead, lead_status: e.target.value as Lead['lead_status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Hot">Hot</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                    <input
                      type="date"
                      value={editingLead.next_followup_date?.split('T')[0] || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, next_followup_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingLead.address || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingLead.notes_first_call || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, notes_first_call: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {lead.business_name}
                    </h3>
                    <p className="text-gray-600 mt-1">{lead.contact_person}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lead.lead_status === 'Hot' ? 'bg-red-100 text-red-800' :
                      lead.lead_status === 'Warm' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.lead_status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {lead.stage}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{lead.phone}</span>
                  </div>
                  {lead.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{lead.city}</span>
                    </div>
                  )}
                  {lead.next_followup_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(lead.next_followup_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {lead.address && (
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Address:</span> {lead.address}
                  </p>
                )}

                {lead.interested_services && lead.interested_services.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 text-sm">Services:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {lead.interested_services.map((service, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lead.notes_first_call && (
                  <p className="text-gray-600 text-sm mb-3">
                    <span className="font-medium">Notes:</span> {lead.notes_first_call}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this lead?')) {
                        onDeleteLead(lead.id);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition ml-auto text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No leads found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
