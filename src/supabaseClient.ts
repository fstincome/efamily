import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvqgkivycndraajkzjpd.supabase.co';
const supabaseKey = 'sb_publishable_AkpeWdmHP1ZnnZRL-77cwQ_WijCad0Y'; 

export const supabase = createClient(supabaseUrl, supabaseKey);