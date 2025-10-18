import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sql = `
      CREATE TABLE IF NOT EXISTS leads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        business_name text NOT NULL,
        contact_person text NOT NULL,
        phone text NOT NULL,
        email text,
        address text,
        city text,
        lead_status text NOT NULL CHECK (lead_status IN ('Hot', 'Warm', 'Cold')),
        stage text NOT NULL CHECK (stage IN ('Contacted', 'Requirements Received', 'Follow-ups', 'Closed/Won')),
        next_followup_date timestamptz,
        interested_services text[],
        notes_first_call text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        created_by text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        file_name text NOT NULL,
        file_url text NOT NULL,
        file_type text,
        uploaded_at timestamptz DEFAULT now(),
        uploaded_by text NOT NULL
      );

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
      CREATE TRIGGER update_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view leads' AND tablename = 'leads') THEN
          CREATE POLICY "Anyone can view leads" ON leads FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert leads' AND tablename = 'leads') THEN
          CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update leads' AND tablename = 'leads') THEN
          CREATE POLICY "Anyone can update leads" ON leads FOR UPDATE USING (true) WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete leads' AND tablename = 'leads') THEN
          CREATE POLICY "Anyone can delete leads" ON leads FOR DELETE USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view attachments' AND tablename = 'attachments') THEN
          CREATE POLICY "Anyone can view attachments" ON attachments FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert attachments' AND tablename = 'attachments') THEN
          CREATE POLICY "Anyone can insert attachments" ON attachments FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update attachments' AND tablename = 'attachments') THEN
          CREATE POLICY "Anyone can update attachments" ON attachments FOR UPDATE USING (true) WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete attachments' AND tablename = 'attachments') THEN
          CREATE POLICY "Anyone can delete attachments" ON attachments FOR DELETE USING (true);
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
      CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
      CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
      CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_date);
      CREATE INDEX IF NOT EXISTS idx_attachments_lead_id ON attachments(lead_id);
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Database initialized successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});