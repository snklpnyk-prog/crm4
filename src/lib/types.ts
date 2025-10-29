export type LeadStatus = 'Hot' | 'Warm' | 'Cold';
export type Stage = 'Contacted' | 'Requirements Received' | 'Follow-ups' | 'Closed/Won';

export interface Lead {
  id: string;
  user_id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  lead_status: LeadStatus;
  stage: Stage;
  next_followup_date?: string;
  interested_services?: string[];
  notes_first_call?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Attachment {
  id: string;
  lead_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<Attachment, 'id' | 'uploaded_at'>>;
      };
    };
  };
}
