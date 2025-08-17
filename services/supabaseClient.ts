import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkezihgrukjcrxwiooqe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZXppaGdydWtqY3J4d2lvb3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzY5MjIsImV4cCI6MjA3MTAxMjkyMn0.DVohX5AkIcBJpkIQ69myHS4A327MfAfKhofzk2lGuZY';

const initializeSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      client: null,
      error: "Supabase URL or anonymous key is missing. Please check your configuration."
    };
  }
  return {
    client: createClient(supabaseUrl, supabaseAnonKey),
    error: null
  };
};

const result = initializeSupabase();
export const supabase = result.client;
export const supabaseInitializationError = result.error;