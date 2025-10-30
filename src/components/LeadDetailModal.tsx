import { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Building2, Calendar, FileText, Tag, Pencil, Save, MessageSquarePlus, Clock } from 'lucide-react';
import type { Lead, LeadStatus, FollowUpConversation } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
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

export function LeadDetailModal({ lead, onClose, onUpdate }: LeadDetailModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [conversations, setConversations] = useState<FollowUpConversation[]>([]);
  const [showAddConversation, setShowAddConversation] = useState(false);
  const [newConversation, setNewConversation] = useState('');
  const [conversationDate, setConversationDate] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [editData, setEditData] = useState({
    business_name: lead.business_name,
    contact_person: lead.contact_person,
    phone: lead.phone,
    email: lead.email || '',
    address: lead.address || '',
    city: lead.city || '',
    lead_status: lead.lead_status,
    next_followup_date: lead.next_followup_date || '',
    interested_services: lead.interested_services || [],
    notes_first_call: lead.notes_first_call || ''
  });

  useEffect(() => {
    fetchConversations();
  }, [lead.id]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const { data, error } = await supabase
        .from('followup_conversations')
        .select('*')
        .eq('lead_id', lead.id)
        .order('conversation_date', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSave = () => {
    onUpdate(lead.id, editData);
    setIsEditing(false);
  };

  const handleAddConversation = async () => {
    if (!newConversation.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('followup_conversations')
        .insert({
          lead_id: lead.id,
          created_by: user.id,
          conversation_text: newConversation,
          conversation_date: conversationDate || new Date().toISOString()
        });

      if (error) {
        console.error('Error adding conversation:', error);
        alert('Failed to add conversation');
      } else {
        setNewConversation('');
        setConversationDate('');
        setShowAddConversation(false);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error adding conversation:', error);
      alert('Failed to add conversation');
    }
  };

  const handleServiceToggle = (service: string) => {
    setEditData(prev => ({
      ...prev,
      interested_services: prev.interested_services.includes(service)
        ? prev.interested_services.filter(s => s !== service)
        : [...prev.interested_services, service]
    }));
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Hot':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cold':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(isEditing ? editData.lead_status : lead.lead_status)}`}>
              {isEditing ? editData.lead_status : lead.lead_status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      business_name: lead.business_name,
                      contact_person: lead.contact_person,
                      phone: lead.phone,
                      email: lead.email || '',
                      address: lead.address || '',
                      city: lead.city || '',
                      lead_status: lead.lead_status,
                      next_followup_date: lead.next_followup_date || '',
                      interested_services: lead.interested_services || [],
                      notes_first_call: lead.notes_first_call || ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Building2 className="w-4 h-4" />
                Business Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.business_name}
                  onChange={(e) => setEditData({ ...editData, business_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 font-medium">{lead.business_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Tag className="w-4 h-4" />
                Contact Person
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.contact_person}
                  onChange={(e) => setEditData({ ...editData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 font-medium">{lead.contact_person}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 font-medium">{lead.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900">{lead.email || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <MapPin className="w-4 h-4" />
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900">{lead.city || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Calendar className="w-4 h-4" />
                Next Follow-up
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.next_followup_date}
                  onChange={(e) => setEditData({ ...editData, next_followup_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900">
                  {lead.next_followup_date ? new Date(lead.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Lead Status
                </label>
                <select
                  value={editData.lead_status}
                  onChange={(e) => setEditData({ ...editData, lead_status: e.target.value as LeadStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <MapPin className="w-4 h-4" />
              Address
            </label>
            {isEditing ? (
              <textarea
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            ) : (
              <p className="text-gray-900">{lead.address || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">
              Interested Services
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map(service => (
                  <label key={service} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.interested_services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {lead.interested_services && lead.interested_services.length > 0 ? (
                  lead.interested_services.map(service => (
                    <span key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No services selected</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText className="w-4 h-4" />
              Notes on First Call
            </label>
            {isEditing ? (
              <textarea
                value={editData.notes_first_call}
                onChange={(e) => setEditData({ ...editData, notes_first_call: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Add notes from the first call..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{lead.notes_first_call || 'No notes added'}</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Follow-up Conversations</h3>
              <button
                onClick={() => setShowAddConversation(!showAddConversation)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Add Conversation
              </button>
            </div>

            {showAddConversation && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conversation Date & Time</label>
                  <input
                    type="datetime-local"
                    value={conversationDate}
                    onChange={(e) => setConversationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conversation Notes</label>
                  <textarea
                    value={newConversation}
                    onChange={(e) => setNewConversation(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Add details about this conversation..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowAddConversation(false);
                      setNewConversation('');
                      setConversationDate('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConversation}
                    disabled={!newConversation.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Save Conversation
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {loadingConversations ? (
                <p className="text-gray-500 text-sm text-center py-4">Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No conversations yet. Add the first one!</p>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(conv.conversation_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{conv.conversation_text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <span className="ml-2 text-gray-900 font-medium">{lead.created_by}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created at:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
