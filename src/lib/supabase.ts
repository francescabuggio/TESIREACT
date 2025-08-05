import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzytokqhoaqslwdsmijz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXRva3Fob2Fxc2x3ZHNtaWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTI5OTQsImV4cCI6MjA2OTAyODk5NH0.SqaQfe68M2iGebGYnSNZfjfWmfpXEEhVKJ1HWK2g6K0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funzione per salvare i dati della survey
export async function saveSurveyData(data: any) {
  try {
    const { data: result, error } = await supabase
      .from('responses')
      .insert([{ data }])
      .select();

    if (error) {
      console.error('Errore nel salvataggio:', error);
      throw error;
    }

    console.log('Dati salvati con successo:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Errore nella chiamata Supabase:', error);
    return { success: false, error };
  }
}

// Funzione per recuperare tutti i dati
export async function getSurveyData() {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dati:', error);
      throw error;
    }

    // Estrai i dati dal campo 'data' di ogni record
    const surveyData = data?.map(row => row.data) || [];
    return { success: true, data: surveyData };
  } catch (error) {
    console.error('Errore nella chiamata Supabase:', error);
    return { success: false, error };
  }
} 