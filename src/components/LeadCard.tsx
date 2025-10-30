import { useState, useEffect } from 'react';
import { Phone, Building2, Calendar, Edit2, Check, X, MessageSquare } from 'lucide-react';
import type { Lead, LeadStatus } from '../lib/types';
import { supabase } from '../lib/supabase';

interface LeadCardProps {
  lead: Lead;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  onQuickEdit: (updates: Partial<Lead>) => void;
}

export function LeadCard({ lead, onDragStart, onDragEnd, onClick, onQuickEdit }: LeadCardProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDate, setEditDate] = useState(lead.next_followup_date || '');
  const [latestConversation, setLatestConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestConversation();
  }, [lead.id]);

  const fetchLatestConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('followup_conversations')
        .select('conversation_text')
        .eq('lead_id', lead.id)
        .order('conversation_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLatestConversation(data.conversation_text);
      }
    } catch (error) {
      console.error('Error fetching latest conversation:', error);
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Hot':
        return 'bg-red-500';
      case 'Warm':
        return 'bg-yellow-500';
      case 'Cold':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: LeadStatus) => {
    e.stopPropagation();
    onQuickEdit({ lead_status: newStatus });
  };

  const handleDateSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickEdit({ next_followup_date: editDate });
    setIsEditingDate(false);
  };

  const handleDateCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDate(lead.next_followup_date || '');
    setIsEditingDate(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 relative"
      style={{ borderLeftColor: getStatusColor(lead.lead_status).replace('bg-', '#').replace('500', '').replace('red', 'ef4444').replace('yellow', 'eab308').replace('green', '22c55e') }}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={(e) => handleStatusChange(e, 'Hot')}
          className={`w-3 h-3 rounded-full ${lead.lead_status === 'Hot' ? 'bg-red-500 ring-2 ring-red-200' : 'bg-red-200'} hover:bg-red-500 transition`}
          title="Hot"
        />
        <button
          onClick={(e) => handleStatusChange(e, 'Warm')}
          className={`w-3 h-3 rounded-full ${lead.lead_status === 'Warm' ? 'bg-yellow-500 ring-2 ring-yellow-200' : 'bg-yellow-200'} hover:bg-yellow-500 transition`}
          title="Warm"
        />
        <button
          onClick={(e) => handleStatusChange(e, 'Cold')}
          className={`w-3 h-3 rounded-full ${lead.lead_status === 'Cold' ? 'bg-green-500 ring-2 ring-green-200' : 'bg-green-200'} hover:bg-green-500 transition`}
          title="Cold"
        />
      </div>

      <div className="space-y-2 mt-2">
        <div>
          <h4 className="font-bold text-gray-900 text-base">
            {lead.business_name}
          </h4>
          <p className="font-semibold text-gray-700 text-sm mt-1">
            {lead.contact_person}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.phone}</span>
        </div>

        {latestConversation && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3 h-3 flex-shrink-0 text-gray-400 mt-0.5" />
              <p className="text-xs text-gray-500 line-clamp-2">
                {latestConversation}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          {!isEditingDate ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs flex-1">
                <Calendar className={`w-3 h-3 flex-shrink-0 ${isOverdue(lead.next_followup_date) ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`truncate ${isOverdue(lead.next_followup_date) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {formatDate(lead.next_followup_date)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDate(true);
                }}
                className="text-gray-400 hover:text-blue-600 transition"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleDateSave}
                className="text-green-600 hover:text-green-700 p-1"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleDateCancel}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
