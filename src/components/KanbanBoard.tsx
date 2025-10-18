import { useState } from 'react';
import type { Lead, Stage } from '../lib/types';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onSelectLead: (lead: Lead) => void;
}

const STAGES: Stage[] = ['Contacted', 'Requirements Received', 'Follow-ups', 'Closed/Won'];

export function KanbanBoard({ leads, onUpdateLead, onSelectLead }: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stage) {
      onUpdateLead(draggedLead.id, { stage });
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const getLeadsByStage = (stage: Stage) => {
    return leads.filter(lead => lead.stage === stage);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAGES.map(stage => {
        const stageLeads = getLeadsByStage(stage);
        const isDragOver = dragOverStage === stage;

        return (
          <div key={stage} className="flex flex-col">
            <div className="bg-white rounded-t-lg border-b-2 border-gray-200 px-4 py-3">
              <h3 className="font-semibold text-gray-900 text-sm">
                {stage}
              </h3>
              <span className="text-xs text-gray-500">
                {stageLeads.length} {stageLeads.length === 1 ? 'lead' : 'leads'}
              </span>
            </div>

            <div
              className={`bg-gray-50 rounded-b-lg p-3 min-h-[600px] space-y-3 transition-colors ${
                isDragOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {stageLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onDragStart={() => handleDragStart(lead)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectLead(lead)}
                  onQuickEdit={(updates) => onUpdateLead(lead.id, updates)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
