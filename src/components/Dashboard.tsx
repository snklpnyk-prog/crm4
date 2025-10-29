import { useState, useEffect } from 'react';
import { Plus, LogOut, Filter, X, List, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Lead } from '../lib/types';
import { KanbanBoard } from './KanbanBoard';
import { LeadFormModal } from './LeadFormModal';
import { LeadDetailModal } from './LeadDetailModal';
import { FollowUpSidebar } from './FollowUpSidebar';
import { LeadsSection } from './LeadsSection';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      } else if (data) {
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([newLead])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error adding lead:', error);
        alert('Failed to add lead. Please check database connection.');
        return;
      }

      if (data) {
        setLeads([data, ...leads]);
        setShowLeadForm(false);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead. Please try again.');
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating lead:', error);
        alert('Failed to update lead');
        return;
      }

      if (data) {
        setLeads(leads.map(lead => lead.id === leadId ? data : lead));
        if (selectedLead?.id === leadId) {
          setSelectedLead(data);
        }
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
        return;
      }

      setLeads(leads.filter(lead => lead.id !== leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const getFilteredLeads = () => {
    let filtered = [...leads];

    if (cityFilter) {
      filtered = filtered.filter(lead =>
        lead.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    if (serviceFilter) {
      filtered = filtered.filter(lead =>
        lead.interested_services?.some(service =>
          service.toLowerCase().includes(serviceFilter.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const uniqueCities = Array.from(new Set(leads.map(lead => lead.city).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showSidebar && (
        <FollowUpSidebar
          leads={leads}
          onLeadSelect={setSelectedLead}
          selectedFilter={followUpFilter}
          onFilterChange={setFollowUpFilter}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-2 px-3 py-2 transition ${
                    viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 transition ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  All Leads
                </button>
              </div>
              <button
                onClick={() => setShowLeadForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Lead
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by service..."
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {(cityFilter || serviceFilter) && (
              <button
                onClick={() => {
                  setCityFilter('');
                  setServiceFilter('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Clear Filters
              </button>
            )}

            <div className="ml-auto text-sm text-gray-600 flex items-center">
              Total Leads: <span className="font-semibold ml-1">{getFilteredLeads().length}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {viewMode === 'kanban' ? (
            <div className="p-6">
              <KanbanBoard
                leads={getFilteredLeads()}
                onUpdateLead={handleUpdateLead}
                onSelectLead={setSelectedLead}
              />
            </div>
          ) : (
            <LeadsSection
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
            />
          )}
        </main>
      </div>

      {showLeadForm && (
        <LeadFormModal
          onClose={() => setShowLeadForm(false)}
          onSubmit={handleAddLead}
          userId={user!.id}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />
      )}
    </div>
  );
}
