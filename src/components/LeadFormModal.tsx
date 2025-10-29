import { useState } from 'react';
import { X } from 'lucide-react';
import type { Lead, LeadStatus } from '../lib/types';

interface LeadFormModalProps {
  onClose: () => void;
  onSubmit: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  userId: string;
}

const SERVICE_OPTIONS = [
  'SEO',
  'SMM (Social Media Marketing)',
  'Website Development',
  'Paid Ads (Google/Facebook)',
  'Content Marketing',
  'Email Marketing',
  'Graphic Design',
  'Video Production'
];

export function LeadFormModal({ onClose, onSubmit, userId }: LeadFormModalProps) {
  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    lead_status: 'Warm' as LeadStatus,
    next_followup_date: '',
    interested_services: [] as string[],
    notes_first_call: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leadData = {
      ...formData,
      stage: 'Contacted' as const,
      user_id: userId,
      created_by: userId,
      next_followup_date: formData.next_followup_date ? new Date(formData.next_followup_date).toISOString() : null,
      interested_services: formData.interested_services.length > 0 ? formData.interested_services : null,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      notes_first_call: formData.notes_first_call || null
    };

    console.log('Submitting lead data:', leadData);
    onSubmit(leadData);
    onClose();
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      interested_services: prev.interested_services.includes(service)
        ? prev.interested_services.filter(s => s !== service)
        : [...prev.interested_services, service]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Status
              </label>
              <select
                value={formData.lead_status}
                onChange={(e) => setFormData({ ...formData, lead_status: e.target.value as LeadStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={formData.next_followup_date}
                onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interested Services
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_OPTIONS.map(service => (
                <label key={service} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interested_services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes on First Call
            </label>
            <textarea
              value={formData.notes_first_call}
              onChange={(e) => setFormData({ ...formData, notes_first_call: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Add any notes from the initial conversation..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
