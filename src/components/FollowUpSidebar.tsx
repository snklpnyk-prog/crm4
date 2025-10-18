import { Calendar, Filter } from 'lucide-react';
import type { Lead } from '../lib/types';

interface FollowUpSidebarProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FollowUpSidebar({ leads, onLeadSelect, selectedFilter, onFilterChange }: FollowUpSidebarProps) {
  const getFollowUpLeads = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leadsWithFollowUp = leads.filter(lead => lead.next_followup_date);

    switch (selectedFilter) {
      case 'today':
        return leadsWithFollowUp.filter(lead => {
          const followUpDate = new Date(lead.next_followup_date!);
          followUpDate.setHours(0, 0, 0, 0);
          return followUpDate.getTime() === today.getTime();
        });
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return leadsWithFollowUp.filter(lead => {
          const followUpDate = new Date(lead.next_followup_date!);
          followUpDate.setHours(0, 0, 0, 0);
          return followUpDate.getTime() === tomorrow.getTime();
        });
      case 'thisWeek':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        return leadsWithFollowUp.filter(lead => {
          const followUpDate = new Date(lead.next_followup_date!);
          return followUpDate >= today && followUpDate <= endOfWeek;
        });
      case 'nextWeek':
        const startOfNextWeek = new Date(today);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + (7 - startOfNextWeek.getDay() + 1));
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
        return leadsWithFollowUp.filter(lead => {
          const followUpDate = new Date(lead.next_followup_date!);
          return followUpDate >= startOfNextWeek && followUpDate <= endOfNextWeek;
        });
      case 'overdue':
        return leadsWithFollowUp.filter(lead => {
          const followUpDate = new Date(lead.next_followup_date!);
          return followUpDate < today;
        });
      default:
        return leadsWithFollowUp;
    }
  };

  const filteredLeads = getFollowUpLeads();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot':
        return 'border-red-500';
      case 'Warm':
        return 'border-yellow-500';
      case 'Cold':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const isOverdue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(dateString);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate < today;
  };

  const filters = [
    { id: 'all', label: 'All Follow-ups' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'nextWeek', label: 'Next Week' }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Follow-ups</h2>
        </div>

        <div className="space-y-1">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                selectedFilter === filter.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No follow-ups found</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <button
              key={lead.id}
              onClick={() => onLeadSelect(lead)}
              className={`w-full text-left bg-white border-l-4 ${getStatusColor(lead.lead_status)} rounded-lg p-3 hover:shadow-md transition`}
            >
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                {lead.contact_person}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {lead.business_name}
              </p>
              <div className={`flex items-center gap-1 text-xs ${isOverdue(lead.next_followup_date!) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                <Calendar className="w-3 h-3" />
                {new Date(lead.next_followup_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
