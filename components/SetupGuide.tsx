

import React, { useState } from 'react';
import { useAppData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const SQL_SCHEMA_CREATION = `
-- This script sets up the necessary tables and row-level security policies.
-- Run this entire script in your Supabase SQL Editor. It is safe to run multiple times.

-- 1. Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.machine_status AS ENUM ('Running', 'Idle', 'Maintenance', 'Error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TYPE public.tool_status AS ENUM ('Active', 'Inactive', 'Needs Replacement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.machines (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status machine_status NOT NULL,
  oee NUMERIC NOT NULL,
  running_time NUMERIC NOT NULL,
  idle_time NUMERIC NOT NULL,
  current_part TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  remaining_life NUMERIC NOT NULL,
  location TEXT NOT NULL,
  status tool_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  part_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  quantity_produced INTEGER NOT NULL,
  scrap_count INTEGER NOT NULL,
  cycle_time NUMERIC NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cnc_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name TEXT NOT NULL,
  work_order_number TEXT NOT NULL,
  work_piece_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  si_no TEXT,
  in_time TIMESTAMPTZ NOT NULL,
  out_time TIMESTAMPTZ NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Set up Row Level Security (RLS)
-- This ensures that only authenticated users can access THEIR OWN data.

-- Enable RLS for all tables
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnc_time_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure this script can be re-run
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.machines;
DROP POLICY IF EXISTS "Users can manage their own machines" ON public.machines;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.tools;
DROP POLICY IF EXISTS "Users can manage their own tools" ON public.tools;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.production_records;
DROP POLICY IF EXISTS "Users can manage their own production records" ON public.production_records;
DROP POLICY IF EXISTS "Users can manage their own time logs" ON public.cnc_time_logs;

-- Policy: Users can only create, view, update, and delete their own data.
CREATE POLICY "Users can manage their own machines" ON public.machines
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tools" ON public.tools
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own production records" ON public.production_records
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own time logs" ON public.cnc_time_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
`.trim();

const SQL_SEED_DATA = `
-- With the new security policies, data is now tied to individual user accounts.
-- Sample data cannot be pre-loaded as it requires a specific user ID for each row.
--
-- After running the setup script, please log in and use the application's features
-- to add your own machines, tools, and production data.
--
-- The dashboard will use mock data for demonstration purposes until you add
-- your own data to the database.
`.trim();


const CodeBlock: React.FC<{ title: string; code: string; onCopy: () => void; copyText: string }> = ({ title, code, onCopy, copyText }) => {
    return (
        <div className="mt-8">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
                <button
                    onClick={onCopy}
                    className="bg-gray-700 hover:bg-gray-600 text-sm font-semibold text-white py-1 px-3 rounded-md transition-colors flex items-center min-w-[100px] justify-center"
                    aria-label={`Copy ${title} to clipboard`}
                >
                    {copyText.includes('Copied') ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {copyText}
                    </>
                    ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy
                    </>
                    )}
                </button>
            </div>
            <pre className="bg-gray-900 text-sm text-cyan-300 p-4 rounded-b-lg overflow-x-auto">
                <code>
                    {code}
                </code>
            </pre>
        </div>
    );
};


const SetupGuide: React.FC = () => {
    const [copySuccess, setCopySuccess] = useState({ schema: '', seed: '' });
    const { refetchData, loading, setupRequired, isCncLogSchemaMissing } = useAppData();
    const [justRefetched, setJustRefetched] = useState(false);

    const handleCopy = (text: string, type: 'schema' | 'seed') => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(prev => ({ ...prev, [type]: 'Copied!' }));
            setTimeout(() => setCopySuccess(prev => ({ ...prev, [type]: '' })), 2000);
        }, () => {
            setCopySuccess(prev => ({ ...prev, [type]: 'Failed to copy' }));
            setTimeout(() => setCopySuccess(prev => ({ ...prev, [type]: '' })), 2000);
        });
    };

    const handleVerify = async () => {
        setJustRefetched(false);
        await refetchData();
        setJustRefetched(true);
    };
    
    const allSetupOk = !setupRequired && !isCncLogSchemaMissing;
    
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto text-gray-200">
      <div className="flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" />
        </svg>
        <h1 className="text-3xl font-bold text-white">Database Setup Guide</h1>
      </div>
      <p className="mb-6">
        Welcome to ManuSys AI Dashboard! To get started, you need to set up the database tables in your Supabase project. Follow the two steps below.
      </p>

      <div className="space-y-6 text-gray-300 border-l-4 border-teal-500 pl-6 py-2">
        <h2 className="text-2xl font-semibold text-white">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
            <li>Navigate to the <strong>SQL Editor</strong> in your Supabase project dashboard.</li>
            <li>Click <strong>+ New query</strong> to open a new editor.</li>
            <li>
                <strong>For Step 1 below:</strong> Copy the entire SQL script, paste it into the editor, and click <strong>RUN</strong>. This script handles table creation and security policies, and is safe to run multiple times.
            </li>
            <li>
                <strong>For Step 2 below (Optional):</strong> The seed data script has been updated to reflect the new user-specific data model. You can review its contents.
            </li>
            <li>After running the script(s), use the <strong>Verification</strong> section below to confirm your setup.</li>
        </ol>
      </div>

      {/* Verification Section */}
      <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Verification</h2>
          <p className="text-gray-400 mb-6">After running the scripts in your Supabase SQL Editor, click the button below to verify the connection and reload the dashboard data.</p>
          <div className="flex items-center space-x-6">
              <button 
                  onClick={handleVerify} 
                  disabled={loading} 
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-wait flex items-center"
              >
                    {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                    </>
                    ) : 'Verify & Reload'}
              </button>
              {justRefetched && !loading && (
                  allSetupOk ? (
                      <div className="flex items-center space-x-2 text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>Success! All tables found. <Link to="/dashboard" className="font-bold underline">Go to Dashboard</Link></span>
                      </div>
                  ) : (
                      <div className="flex items-center space-x-2 text-yellow-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>Some tables are still missing. Please double-check the SQL scripts.</span>
                      </div>
                  )
              )}
          </div>
      </div>

      <CodeBlock 
        title="Step 1: Create Tables & Security Policies"
        code={SQL_SCHEMA_CREATION}
        onCopy={() => handleCopy(SQL_SCHEMA_CREATION, 'schema')}
        copyText={copySuccess.schema}
      />
      
      <CodeBlock 
        title="Step 2: Add Sample Data (Optional)"
        code={SQL_SEED_DATA}
        onCopy={() => handleCopy(SQL_SEED_DATA, 'seed')}
        copyText={copySuccess.seed}
      />
    </div>
  );
};

export default SetupGuide;
