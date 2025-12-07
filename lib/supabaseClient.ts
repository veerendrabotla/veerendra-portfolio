import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azbrroumocogcwfnenfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6YnJyb3Vtb2NvZ2N3Zm5lbmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzMwMjcsImV4cCI6MjA4MDYwOTAyN30.6FaN_j9X_xG5n6Egwzo_0xDjl-eKfniJsi6q2tYZfoY';

export const supabase = createClient(supabaseUrl, supabaseKey);
