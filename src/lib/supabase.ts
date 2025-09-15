import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tieihuqxnawowwhyqcvi.supabase.co'; // Ex.: https://xxxxx.supabase.co (cole aqui a URL do seu projeto)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZWlodXF4bmF3b3d3aHlxY3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjA5OTcsImV4cCI6MjA3MzQzNjk5N30.K0i9z-8PWYi12miOlekFjPfjaonM5Jcha23C7oFevrE'; // Chave pública (anon) - cole aqui sua anon key

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('xxxxx') || supabaseAnonKey.startsWith('PASTE_')) {
  // Evita crash em dev: informe os valores reais acima.
  console.warn('Supabase URL e anon key não configuradas. Cole seus valores em src/lib/supabase.ts.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DeviceType = 'controller' | 'tracker';

export interface UserProfile {
  id: string;
  email: string;
  device_type: DeviceType | null;
  created_at: string;
  updated_at: string;
}

export interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  battery_level: number | null;
  timestamp: string;
  address: string | null;
}