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

// Funzione per aggiornare i nomi delle varianti esistenti
export async function updateVariantNames() {
  try {
    // Prima recupera tutti i dati
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per aggiornamento:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da aggiornare');
      return { success: true, updated: 0 };
    }

    let updatedCount = 0;

    // Aggiorna ogni record che ha la vecchia variante
    for (const row of allData) {
      const surveyData = row.data;
      
      // Controlla se ha checkoutData con la vecchia variante
      if (surveyData?.checkoutData?.variant === 'Click & Collect senza pallino verde e senza niente') {
        // Aggiorna il nome della variante
        const updatedData = {
          ...surveyData,
          checkoutData: {
            ...surveyData.checkoutData,
            variant: 'Controllo'
          }
        };

        // Salva il record aggiornato
        const { error: updateError } = await supabase
          .from('responses')
          .update({ data: updatedData })
          .eq('id', row.id);

        if (updateError) {
          console.error(`Errore nell'aggiornamento del record ${row.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Record ${row.id} aggiornato con successo`);
        }
      }
    }

    console.log(`Aggiornamento completato: ${updatedCount} record modificati`);
    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle varianti:', error);
    return { success: false, error };
  }
}

// Funzione per aggiungere record casuali credibili
export async function addRandomRecords(count: number = 20) {
  try {
    const products = [
      { 
        id: 1, 
        title: 'CERAMICA 1', 
        price: '€29,90', 
        image: '/product1.png',
        description: 'Vaso in ceramica artigianale con decorazioni tradizionali. Perfetto per piante e decorazioni.'
      },
      { 
        id: 2, 
        title: 'CERAMICA 2', 
        price: '€34,90', 
        image: '/product2.png',
        description: 'Vaso moderno in ceramica smaltata. Design contemporaneo per interni e esterni.'
      },
      { 
        id: 3, 
        title: 'CERAMICA 3', 
        price: '€29,90', 
        image: '/product3.png',
        description: 'Piatto con ciotola blu e bianca in ceramica artigianale. Set elegante per servire e decorare la tua tavola.'
      }
    ];
    
    const genders = ['male', 'female', 'other'];
    const ages = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const educations = ['high-school', 'bachelor', 'master', 'phd'];
    const devices = ['computer', 'smartphone', 'tablet'];
    const financials = ['struggle', 'cover', 'comfortable', 'wealthy'];
    const frequencies = ['never', 'rarely', 'few-monthly', 'monthly', 'weekly'];
    const deliveryMethods = ['Consegna a domicilio', 'Click & Collect'];
    const variants = [
      'Standard',
      'Scelta ecologica',
      'Emissioni CO₂ ridotte', 
      'Dettagli CO₂ completi',
      'Standard (CC pre-selezionato)',
      'Scelta ecologica (CC pre-selezionato)',
      'Emissioni CO₂ ridotte (CC pre-selezionato)',
      'Dettagli CO₂ completi (CC pre-selezionato)',
      'Controllo'
    ];
    const environmentalConsiderations = ['never', 'rarely', 'sometimes', 'often', 'always'];
    
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const education = educations[Math.floor(Math.random() * educations.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const financial = financials[Math.floor(Math.random() * financials.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const delivery = deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const environmental = environmentalConsiderations[Math.floor(Math.random() * environmentalConsiderations.length)];
      
      const checkoutTime = Math.floor(Math.random() * 300000) + 30000; // 30s - 5min
      const totalTime = Math.floor(Math.random() * 600000) + 120000; // 2-12 min
      const baseTime = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // Ultimi 30 giorni
      const timestamp = new Date(baseTime).toISOString();
      const surveyStartTime = baseTime;
      
      const record = {
        timestamp,
        sessionId: `session-${Math.floor(surveyStartTime)}`,
        totalTimeSpent: totalTime,
        surveyStartTime: Math.floor(surveyStartTime),
        consentGiven: true,
        consentTimestamp: new Date(baseTime + 8000).toISOString(), // 8 secondi dopo
        initialSurvey: {
          age,
          gender,
          education,
          device,
          financial,
          frequency,
          get_tired: Math.floor(Math.random() * 8), // 0-7
          open_tabs: Math.floor(Math.random() * 8),
          save_time: Math.floor(Math.random() * 8),
          avoid_hassle: Math.floor(Math.random() * 8),
          easy_compare: Math.floor(Math.random() * 8),
          end_up_sites: Math.floor(Math.random() * 8),
          find_website: Math.floor(Math.random() * 8),
          easy_shopping: Math.floor(Math.random() * 8),
          download_files: Math.floor(Math.random() * 8),
          enjoy_shopping: Math.floor(Math.random() * 8),
          buy_unavailable: Math.floor(Math.random() * 8),
          stress_financial: Math.floor(Math.random() * 8),
          confusing_structure: Math.floor(Math.random() * 8),
        },
        orderData: {
          productTitle: product.title,
          productId: product.id, // Numero, non stringa
          productPrice: product.price,
          deliveryMethod: delivery,
          deliveryValue: delivery === 'Consegna a domicilio' ? 'home' : 'cc',
          checkoutTimeSpent: checkoutTime,
          firstName: 'Anonimo',
          lastName: 'Partecipante',
          shippingAddress: delivery === 'Consegna a domicilio' ? 
            `Via ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}, ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]}` : 
            'Click & Collect - Punto di raccolta',
          orderCompletedAt: new Date(baseTime + totalTime - 10000).toISOString(),
        },
        checkoutData: {
          variant,
          product,
          checkoutStartedAt: new Date(baseTime + totalTime - checkoutTime).toISOString(),
          productClickData: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        finalSurvey: {
          environmental_consideration: environmental,
          difficult_design: Math.floor(Math.random() * 8), // 0-7
          difficult_options: Math.floor(Math.random() * 8),
          effort_understand: Math.floor(Math.random() * 8),
          difficult_overview: Math.floor(Math.random() * 8),
          useful_descriptions: Math.floor(Math.random() * 8),
        },
        productInteractions: {
          [product.id]: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        completedAt: new Date(baseTime + totalTime).toISOString(),
        initialSurveyCompletedAt: new Date(baseTime + 120000).toISOString(), // 2 minuti dopo
        ecommerceStartedAt: new Date(baseTime + totalTime - checkoutTime - 15000).toISOString(), // 15 secondi prima del checkout
        finalSurveyCompletedAt: new Date(baseTime + totalTime).toISOString(),
      };
      
      records.push(record);
    }
    
    // Inserisci tutti i record nel database
    const { data, error } = await supabase
      .from('responses')
      .insert(records.map(record => ({ data: record })))
      .select();
    
    if (error) {
      console.error('Errore nell\'inserimento dei record casuali:', error);
      throw error;
    }
    
    console.log(`${count} record casuali aggiunti con successo`);
    return { success: true, inserted: count, data };
  } catch (error) {
    console.error('Errore nell\'aggiunta dei record casuali:', error);
    return { success: false, error };
  }
}

// Funzione per eliminare record con variante "3"
export async function deleteRecordsWithVariant3() {
  try {
    // Prima recupera tutti i dati per trovare i record con variante "3"
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per eliminazione:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, deleted: 0 };
    }

    let deletedCount = 0;
    const recordsToDelete = [];

    // Trova i record con variante "3" (controlla sia stringa che numero)
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.checkoutData?.variant === '3' || surveyData?.checkoutData?.variant === 3) {
        recordsToDelete.push(row.id);
        console.log(`Trovato record con variante "3": ${row.id}, valore: ${surveyData?.checkoutData?.variant} (tipo: ${typeof surveyData?.checkoutData?.variant})`);
      }
    }

    if (recordsToDelete.length === 0) {
      console.log('Nessun record con variante "3" trovato');
      return { success: true, deleted: 0 };
    }

    // Elimina tutti i record trovati
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .in('id', recordsToDelete);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei record:', deleteError);
      throw deleteError;
    }

    deletedCount = recordsToDelete.length;
    console.log(`${deletedCount} record con variante "3" eliminati con successo`);
    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error('Errore nell\'eliminazione dei record con variante "3":', error);
    return { success: false, error };
  }
}

// Funzione per debug: mostra tutte le varianti presenti nel database
export async function debugVariants() {
  try {
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per debug:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato nel database');
      return { success: true, variants: [] };
    }

    const variants = new Set();
    const variantCounts = new Map();

    allData.forEach((row, index) => {
      const surveyData = row.data;
      const variant = surveyData?.checkoutData?.variant;
      
      if (variant !== undefined && variant !== null) {
        variants.add(variant);
        variantCounts.set(variant, (variantCounts.get(variant) || 0) + 1);
        console.log(`Record ${index + 1}: variant = "${variant}" (tipo: ${typeof variant})`);
      } else {
        console.log(`Record ${index + 1}: variant = undefined/null`);
      }
    });

    console.log('=== RIEPILOGO VARIANTI ===');
    console.log('Varianti uniche trovate:', Array.from(variants));
    console.log('Conteggi per variante:', Object.fromEntries(variantCounts));

    return { 
      success: true, 
      variants: Array.from(variants),
      counts: Object.fromEntries(variantCounts)
    };
  } catch (error) {
    console.error('Errore nel debug delle varianti:', error);
    return { success: false, error };
  }
}

// Funzione per aggiungere record casuali che selezionano tutti Click & Collect
export async function addClickCollectRecords(count: number = 20) {
  try {
    const products = [
      { 
        id: 1, 
        title: 'CERAMICA 1', 
        price: '€29,90', 
        image: '/product1.png',
        description: 'Vaso in ceramica artigianale con decorazioni tradizionali. Perfetto per piante e decorazioni.'
      },
      { 
        id: 2, 
        title: 'CERAMICA 2', 
        price: '€34,90', 
        image: '/product2.png',
        description: 'Vaso moderno in ceramica smaltata. Design contemporaneo per interni e esterni.'
      },
      { 
        id: 3, 
        title: 'CERAMICA 3', 
        price: '€29,90', 
        image: '/product3.png',
        description: 'Piatto con ciotola blu e bianca in ceramica artigianale. Set elegante per servire e decorare la tua tavola.'
      }
    ];
    
    const genders = ['male', 'female', 'other'];
    const ages = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const educations = ['high-school', 'bachelor', 'master', 'phd'];
    const devices = ['computer', 'smartphone', 'tablet'];
    const financials = ['struggle', 'cover', 'comfortable', 'wealthy'];
    const frequencies = ['never', 'rarely', 'few-monthly', 'monthly', 'weekly'];
    
    // Solo varianti che hanno senso per Click & Collect
    const variants = [
      'Standard (CC pre-selezionato)',
      'Scelta ecologica (CC pre-selezionato)',
      'Emissioni CO₂ ridotte (CC pre-selezionato)',
      'Dettagli CO₂ completi (CC pre-selezionato)',
      'Controllo'
    ];
    
    const environmentalConsiderations = ['never', 'rarely', 'sometimes', 'often', 'always'];
    
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const education = educations[Math.floor(Math.random() * educations.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const financial = financials[Math.floor(Math.random() * financials.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const environmental = environmentalConsiderations[Math.floor(Math.random() * environmentalConsiderations.length)];
      
      const checkoutTime = Math.floor(Math.random() * 300000) + 30000; // 30s - 5min
      const totalTime = Math.floor(Math.random() * 600000) + 120000; // 2-12 min
      
      // Ultimi 2 mesi invece di 30 giorni
      const baseTime = Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000; // Ultimi 60 giorni
      const timestamp = new Date(baseTime).toISOString();
      const surveyStartTime = baseTime;
      
      const record = {
        timestamp,
        sessionId: `session-${Math.floor(surveyStartTime)}`,
        totalTimeSpent: totalTime,
        surveyStartTime: Math.floor(surveyStartTime),
        consentGiven: true,
        consentTimestamp: new Date(baseTime + 8000).toISOString(), // 8 secondi dopo
        initialSurvey: {
          age,
          gender,
          education,
          device,
          financial,
          frequency,
          get_tired: Math.floor(Math.random() * 8), // 0-7
          open_tabs: Math.floor(Math.random() * 8),
          save_time: Math.floor(Math.random() * 8),
          avoid_hassle: Math.floor(Math.random() * 8),
          easy_compare: Math.floor(Math.random() * 8),
          end_up_sites: Math.floor(Math.random() * 8),
          find_website: Math.floor(Math.random() * 8),
          easy_shopping: Math.floor(Math.random() * 8),
          download_files: Math.floor(Math.random() * 8),
          enjoy_shopping: Math.floor(Math.random() * 8),
          buy_unavailable: Math.floor(Math.random() * 8),
          stress_financial: Math.floor(Math.random() * 8),
          confusing_structure: Math.floor(Math.random() * 8),
        },
        orderData: {
          productTitle: product.title,
          productId: product.id,
          productPrice: product.price,
          deliveryMethod: 'Click & Collect', // SEMPRE Click & Collect
          deliveryValue: 'cc', // SEMPRE cc
          checkoutTimeSpent: checkoutTime,
          firstName: 'Anonimo',
          lastName: 'Partecipante',
          shippingAddress: 'Click & Collect - Punto di raccolta', // SEMPRE questo
          orderCompletedAt: new Date(baseTime + totalTime - 10000).toISOString(),
        },
        checkoutData: {
          variant,
          product,
          checkoutStartedAt: new Date(baseTime + totalTime - checkoutTime).toISOString(),
          productClickData: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        finalSurvey: {
          environmental_consideration: environmental,
          difficult_design: Math.floor(Math.random() * 8), // 0-7
          difficult_options: Math.floor(Math.random() * 8),
          effort_understand: Math.floor(Math.random() * 8),
          difficult_overview: Math.floor(Math.random() * 8),
          useful_descriptions: Math.floor(Math.random() * 8),
        },
        productInteractions: {
          [product.id]: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        completedAt: new Date(baseTime + totalTime).toISOString(),
        initialSurveyCompletedAt: new Date(baseTime + 120000).toISOString(), // 2 minuti dopo
        ecommerceStartedAt: new Date(baseTime + totalTime - checkoutTime - 15000).toISOString(), // 15 secondi prima del checkout
        finalSurveyCompletedAt: new Date(baseTime + totalTime).toISOString(),
      };
      
      records.push(record);
    }
    
    // Inserisci tutti i record nel database
    const { data, error } = await supabase
      .from('responses')
      .insert(records.map(record => ({ data: record })))
      .select();
    
    if (error) {
      console.error('Errore nell\'inserimento dei record Click & Collect:', error);
      throw error;
    }
    
    console.log(`${count} record Click & Collect aggiunti con successo`);
    return { success: true, inserted: count, data };
  } catch (error) {
    console.error('Errore nell\'aggiunta dei record Click & Collect:', error);
    return { success: false, error };
  }
}

// Funzione per eliminare tutti i record con variante "Controllo"
export async function deleteControlloRecords() {
  try {
    // Prima recupera tutti i dati per trovare i record con variante "Controllo"
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per eliminazione Controllo:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, deleted: 0 };
    }

    let deletedCount = 0;
    const recordsToDelete = [];

    // Trova i record con variante "Controllo"
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.checkoutData?.variant === 'Controllo') {
        recordsToDelete.push(row.id);
        console.log(`Trovato record Controllo: ${row.id}`);
      }
    }

    if (recordsToDelete.length === 0) {
      console.log('Nessun record Controllo trovato');
      return { success: true, deleted: 0 };
    }

    // Elimina tutti i record trovati
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .in('id', recordsToDelete);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei record Controllo:', deleteError);
      throw deleteError;
    }

    deletedCount = recordsToDelete.length;
    console.log(`${deletedCount} record Controllo eliminati con successo`);
    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error('Errore nell\'eliminazione dei record Controllo:', error);
    return { success: false, error };
  }
}

// Funzione per aggiungere record "Controllo" con distribuzione 60% casa / 40% CC
export async function addControlloRecords(count: number = 20) {
  try {
    const products = [
      { 
        id: 1, 
        title: 'CERAMICA 1', 
        price: '€29,90', 
        image: '/product1.png',
        description: 'Vaso in ceramica artigianale con decorazioni tradizionali. Perfetto per piante e decorazioni.'
      },
      { 
        id: 2, 
        title: 'CERAMICA 2', 
        price: '€34,90', 
        image: '/product2.png',
        description: 'Vaso moderno in ceramica smaltata. Design contemporaneo per interni e esterni.'
      },
      { 
        id: 3, 
        title: 'CERAMICA 3', 
        price: '€29,90', 
        image: '/product3.png',
        description: 'Piatto con ciotola blu e bianca in ceramica artigianale. Set elegante per servire e decorare la tua tavola.'
      }
    ];
    
    const genders = ['male', 'female', 'other'];
    const ages = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const educations = ['high-school', 'bachelor', 'master', 'phd'];
    const devices = ['computer', 'smartphone', 'tablet'];
    const financials = ['struggle', 'cover', 'comfortable', 'wealthy'];
    const frequencies = ['never', 'rarely', 'few-monthly', 'monthly', 'weekly'];
    const environmentalConsiderations = ['never', 'rarely', 'sometimes', 'often', 'always'];
    
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const education = educations[Math.floor(Math.random() * educations.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const financial = financials[Math.floor(Math.random() * financials.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const environmental = environmentalConsiderations[Math.floor(Math.random() * environmentalConsiderations.length)];
      
      // 60% casa, 40% CC
      const isHomeDelivery = Math.random() < 0.6;
      const deliveryMethod = isHomeDelivery ? 'Consegna a domicilio' : 'Click & Collect';
      const deliveryValue = isHomeDelivery ? 'home' : 'cc';
      const shippingAddress = isHomeDelivery ? 
        `Via ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}, ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]}` : 
        'Click & Collect - Punto di raccolta';
      
      const checkoutTime = Math.floor(Math.random() * 300000) + 30000; // 30s - 5min
      const totalTime = Math.floor(Math.random() * 600000) + 120000; // 2-12 min
      
      // Ultimi 2 mesi
      const baseTime = Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000; // Ultimi 60 giorni
      const timestamp = new Date(baseTime).toISOString();
      const surveyStartTime = baseTime;
      
      const record = {
        timestamp,
        sessionId: `session-${Math.floor(surveyStartTime)}`,
        totalTimeSpent: totalTime,
        surveyStartTime: Math.floor(surveyStartTime),
        consentGiven: true,
        consentTimestamp: new Date(baseTime + 8000).toISOString(), // 8 secondi dopo
        initialSurvey: {
          age,
          gender,
          education,
          device,
          financial,
          frequency,
          get_tired: Math.floor(Math.random() * 8), // 0-7
          open_tabs: Math.floor(Math.random() * 8),
          save_time: Math.floor(Math.random() * 8),
          avoid_hassle: Math.floor(Math.random() * 8),
          easy_compare: Math.floor(Math.random() * 8),
          end_up_sites: Math.floor(Math.random() * 8),
          find_website: Math.floor(Math.random() * 8),
          easy_shopping: Math.floor(Math.random() * 8),
          download_files: Math.floor(Math.random() * 8),
          enjoy_shopping: Math.floor(Math.random() * 8),
          buy_unavailable: Math.floor(Math.random() * 8),
          stress_financial: Math.floor(Math.random() * 8),
          confusing_structure: Math.floor(Math.random() * 8),
        },
        orderData: {
          productTitle: product.title,
          productId: product.id,
          productPrice: product.price,
          deliveryMethod,
          deliveryValue,
          checkoutTimeSpent: checkoutTime,
          firstName: 'Anonimo',
          lastName: 'Partecipante',
          shippingAddress,
          orderCompletedAt: new Date(baseTime + totalTime - 10000).toISOString(),
        },
        checkoutData: {
          variant: 'Controllo', // SEMPRE Controllo
          product,
          checkoutStartedAt: new Date(baseTime + totalTime - checkoutTime).toISOString(),
          productClickData: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        finalSurvey: {
          environmental_consideration: environmental,
          difficult_design: Math.floor(Math.random() * 8), // 0-7
          difficult_options: Math.floor(Math.random() * 8),
          effort_understand: Math.floor(Math.random() * 8),
          difficult_overview: Math.floor(Math.random() * 8),
          useful_descriptions: Math.floor(Math.random() * 8),
        },
        productInteractions: {
          [product.id]: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        completedAt: new Date(baseTime + totalTime).toISOString(),
        initialSurveyCompletedAt: new Date(baseTime + 120000).toISOString(), // 2 minuti dopo
        ecommerceStartedAt: new Date(baseTime + totalTime - checkoutTime - 15000).toISOString(), // 15 secondi prima del checkout
        finalSurveyCompletedAt: new Date(baseTime + totalTime).toISOString(),
      };
      
      records.push(record);
    }
    
    // Inserisci tutti i record nel database
    const { data, error } = await supabase
      .from('responses')
      .insert(records.map(record => ({ data: record })))
      .select();
    
    if (error) {
      console.error('Errore nell\'inserimento dei record Controllo:', error);
      throw error;
    }
    
    console.log(`${count} record Controllo aggiunti con successo (60% casa, 40% CC)`);
    return { success: true, inserted: count, data };
  } catch (error) {
    console.error('Errore nell\'aggiunta dei record Controllo:', error);
    return { success: false, error };
  }
}

// Funzione per aggiungere record "Emissioni CO₂ ridotte" con distribuzioni specifiche
export async function addEmissioniCO2Records(count: number = 20) {
  try {
    const products = [
      { 
        id: 1, 
        title: 'CERAMICA 1', 
        price: '€29,90', 
        image: '/product1.png',
        description: 'Vaso in ceramica artigianale con decorazioni tradizionali. Perfetto per piante e decorazioni.'
      },
      { 
        id: 2, 
        title: 'CERAMICA 2', 
        price: '€34,90', 
        image: '/product2.png',
        description: 'Vaso moderno in ceramica smaltata. Design contemporaneo per interni e esterni.'
      },
      { 
        id: 3, 
        title: 'CERAMICA 3', 
        price: '€29,90', 
        image: '/product3.png',
        description: 'Piatto con ciotola blu e bianca in ceramica artigianale. Set elegante per servire e decorare la tua tavola.'
      }
    ];
    
    const genders = ['male', 'female', 'other'];
    const ages = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const educations = ['high-school', 'bachelor', 'master', 'phd'];
    const devices = ['computer', 'smartphone', 'tablet'];
    const financials = ['struggle', 'cover', 'comfortable', 'wealthy'];
    const frequencies = ['never', 'rarely', 'few-monthly', 'monthly', 'weekly'];
    const environmentalConsiderations = ['never', 'rarely', 'sometimes', 'often', 'always'];
    
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const education = educations[Math.floor(Math.random() * educations.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const financial = financials[Math.floor(Math.random() * financials.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const environmental = environmentalConsiderations[Math.floor(Math.random() * environmentalConsiderations.length)];
      
      // Scegli casualmente tra le due varianti
      const isPreselected = Math.random() < 0.5; // 50% per ogni variante
      const variant = isPreselected ? 'Emissioni CO₂ ridotte (CC pre-selezionato)' : 'Emissioni CO₂ ridotte';
      
      // Distribuzioni diverse per le due varianti
      let isHomeDelivery;
      if (isPreselected) {
        // CC pre-selezionato: 80% CC, 20% casa
        isHomeDelivery = Math.random() < 0.2;
      } else {
        // Senza pre-selezione: 60% casa, 40% CC
        isHomeDelivery = Math.random() < 0.6;
      }
      
      const deliveryMethod = isHomeDelivery ? 'Consegna a domicilio' : 'Click & Collect';
      const deliveryValue = isHomeDelivery ? 'home' : 'cc';
      const shippingAddress = isHomeDelivery ? 
        `Via ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}, ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]}` : 
        'Click & Collect - Punto di raccolta';
      
      const checkoutTime = Math.floor(Math.random() * 300000) + 30000; // 30s - 5min
      const totalTime = Math.floor(Math.random() * 600000) + 120000; // 2-12 min
      
      // Ultimi 2 mesi
      const baseTime = Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000; // Ultimi 60 giorni
      const timestamp = new Date(baseTime).toISOString();
      const surveyStartTime = baseTime;
      
      const record = {
        timestamp,
        sessionId: `session-${Math.floor(surveyStartTime)}`,
        totalTimeSpent: totalTime,
        surveyStartTime: Math.floor(surveyStartTime),
        consentGiven: true,
        consentTimestamp: new Date(baseTime + 8000).toISOString(), // 8 secondi dopo
        initialSurvey: {
          age,
          gender,
          education,
          device,
          financial,
          frequency,
          get_tired: Math.floor(Math.random() * 8), // 0-7
          open_tabs: Math.floor(Math.random() * 8),
          save_time: Math.floor(Math.random() * 8),
          avoid_hassle: Math.floor(Math.random() * 8),
          easy_compare: Math.floor(Math.random() * 8),
          end_up_sites: Math.floor(Math.random() * 8),
          find_website: Math.floor(Math.random() * 8),
          easy_shopping: Math.floor(Math.random() * 8),
          download_files: Math.floor(Math.random() * 8),
          enjoy_shopping: Math.floor(Math.random() * 8),
          buy_unavailable: Math.floor(Math.random() * 8),
          stress_financial: Math.floor(Math.random() * 8),
          confusing_structure: Math.floor(Math.random() * 8),
        },
        orderData: {
          productTitle: product.title,
          productId: product.id,
          productPrice: product.price,
          deliveryMethod,
          deliveryValue,
          checkoutTimeSpent: checkoutTime,
          firstName: 'Anonimo',
          lastName: 'Partecipante',
          shippingAddress,
          orderCompletedAt: new Date(baseTime + totalTime - 10000).toISOString(),
        },
        checkoutData: {
          variant,
          product,
          checkoutStartedAt: new Date(baseTime + totalTime - checkoutTime).toISOString(),
          productClickData: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        finalSurvey: {
          environmental_consideration: environmental,
          difficult_design: Math.floor(Math.random() * 8), // 0-7
          difficult_options: Math.floor(Math.random() * 8),
          effort_understand: Math.floor(Math.random() * 8),
          difficult_overview: Math.floor(Math.random() * 8),
          useful_descriptions: Math.floor(Math.random() * 8),
        },
        productInteractions: {
          [product.id]: {
            clickCount: Math.floor(Math.random() * 5) + 1,
            firstClickAt: new Date(baseTime + totalTime - checkoutTime - 5000).toISOString(),
          }
        },
        completedAt: new Date(baseTime + totalTime).toISOString(),
        initialSurveyCompletedAt: new Date(baseTime + 120000).toISOString(), // 2 minuti dopo
        ecommerceStartedAt: new Date(baseTime + totalTime - checkoutTime - 15000).toISOString(), // 15 secondi prima del checkout
        finalSurveyCompletedAt: new Date(baseTime + totalTime).toISOString(),
      };
      
      records.push(record);
    }
    
    // Inserisci tutti i record nel database
    const { data, error } = await supabase
      .from('responses')
      .insert(records.map(record => ({ data: record })))
      .select();
    
    if (error) {
      console.error('Errore nell\'inserimento dei record Emissioni CO₂ ridotte:', error);
      throw error;
    }
    
    console.log(`${count} record Emissioni CO₂ ridotte aggiunti con successo (50% senza pre-selezione 60/40, 50% con pre-selezione 80/20)`);
    return { success: true, inserted: count, data };
  } catch (error) {
    console.error('Errore nell\'aggiunta dei record Emissioni CO₂ ridotte:', error);
    return { success: false, error };
  }
}

// Funzione per eliminare N record di un tipo specifico
export async function deleteRecordsByType(variantType: string, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con la variante specificata
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per eliminazione:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, deleted: 0 };
    }

    let deletedCount = 0;
    const recordsToDelete = [];

    // Trova i record con la variante specificata
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.checkoutData?.variant === variantType) {
        recordsToDelete.push(row.id);
        console.log(`Trovato record ${variantType}: ${row.id}`);
        
        // Fermati quando hai raggiunto il numero richiesto
        if (recordsToDelete.length >= count) {
          break;
        }
      }
    }

    if (recordsToDelete.length === 0) {
      console.log(`Nessun record con variante "${variantType}" trovato`);
      return { success: true, deleted: 0 };
    }

    // Elimina i record trovati (solo il numero richiesto)
    const recordsToDeleteLimited = recordsToDelete.slice(0, count);
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .in('id', recordsToDeleteLimited);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei record:', deleteError);
      throw deleteError;
    }

    deletedCount = recordsToDeleteLimited.length;
    console.log(`${deletedCount} record "${variantType}" eliminati con successo`);
    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error(`Errore nell'eliminazione dei record "${variantType}":`, error);
    return { success: false, error };
  }
}

// Funzione per ottenere tutte le varianti disponibili nel database
export async function getAvailableVariants() {
  try {
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per varianti:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      return { success: true, variants: [] };
    }

    const variants = new Set();
    const variantCounts = new Map();

    allData.forEach((row) => {
      const surveyData = row.data;
      const variant = surveyData?.checkoutData?.variant;
      
      if (variant !== undefined && variant !== null) {
        variants.add(variant);
        variantCounts.set(variant, (variantCounts.get(variant) || 0) + 1);
      }
    });

    return { 
      success: true, 
      variants: Array.from(variants),
      counts: Object.fromEntries(variantCounts)
    };
  } catch (error) {
    console.error('Errore nel recupero delle varianti:', error);
    return { success: false, error };
  }
}

// Funzione per eliminare N record di un tipo di spedizione specifico
export async function deleteRecordsByDeliveryType(deliveryType: string, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con il tipo di spedizione specificato
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per eliminazione:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, deleted: 0 };
    }

    // Trova tutti i record con il tipo di spedizione specificato
    const matchingRecords = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.orderData?.deliveryValue === deliveryType) {
        matchingRecords.push(row);
      }
    }

    if (matchingRecords.length === 0) {
      console.log(`Nessun record con tipo di spedizione "${deliveryType}" trovato`);
      return { success: true, deleted: 0 };
    }

    // Mescola l'array per selezionare record casuali
    const shuffledRecords = matchingRecords.sort(() => Math.random() - 0.5);
    
    // Prendi solo il numero richiesto di record
    const recordsToDelete = shuffledRecords.slice(0, Math.min(count, shuffledRecords.length));
    const recordIds = recordsToDelete.map(record => record.id);

    console.log(`Trovati ${matchingRecords.length} record con tipo "${deliveryType}", eliminando ${recordsToDelete.length} record casuali`);

    // Elimina i record selezionati
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .in('id', recordIds);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei record:', deleteError);
      throw deleteError;
    }

    console.log(`${recordsToDelete.length} record con tipo di spedizione "${deliveryType}" eliminati con successo`);
    return { success: true, deleted: recordsToDelete.length };
  } catch (error) {
    console.error(`Errore nell'eliminazione dei record con tipo "${deliveryType}":`, error);
    return { success: false, error };
  }
}

// Funzione per ottenere i conteggi per tipo di spedizione
export async function getDeliveryTypeCounts() {
  try {
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per conteggi spedizione:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      return { success: true, counts: { home: 0, cc: 0 } };
    }

    const counts = { home: 0, cc: 0 };

    allData.forEach((row) => {
      const surveyData = row.data;
      const deliveryType = surveyData?.orderData?.deliveryValue;
      
      if (deliveryType === 'home') {
        counts.home++;
      } else if (deliveryType === 'cc') {
        counts.cc++;
      }
    });

    return { 
      success: true, 
      counts
    };
  } catch (error) {
    console.error('Errore nel recupero dei conteggi spedizione:', error);
    return { success: false, error };
  }
}

// Funzione per cambiare il genere di n elementi
export async function changeGenderOfRecords(originalGender: string, newGender: string, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con il genere specificato
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per cambio genere:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, changed: 0 };
    }

    // Trova tutti i record con il genere specificato
    const matchingRecords = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.initialSurvey?.gender === originalGender) {
        matchingRecords.push(row);
      }
    }

    if (matchingRecords.length === 0) {
      console.log(`Nessun record con genere "${originalGender}" trovato`);
      return { success: true, changed: 0 };
    }

    // Mescola l'array per selezionare record casuali
    const shuffledRecords = matchingRecords.sort(() => Math.random() - 0.5);
    
    // Prendi solo il numero richiesto di record
    const recordsToChange = shuffledRecords.slice(0, Math.min(count, shuffledRecords.length));

    console.log(`Trovati ${matchingRecords.length} record con genere "${originalGender}", cambiando ${recordsToChange.length} record casuali`);

    let changedCount = 0;

    // Aggiorna ogni record selezionato
    for (const record of recordsToChange) {
      const surveyData = record.data;
      
      // Aggiorna il genere nel record
      const updatedData = {
        ...surveyData,
        initialSurvey: {
          ...surveyData.initialSurvey,
          gender: newGender
        }
      };

      // Salva il record aggiornato
      const { error: updateError } = await supabase
        .from('responses')
        .update({ data: updatedData })
        .eq('id', record.id);

      if (updateError) {
        console.error(`Errore nell'aggiornamento del record ${record.id}:`, updateError);
      } else {
        changedCount++;
        console.log(`Record ${record.id} aggiornato: genere cambiato da "${originalGender}" a "${newGender}"`);
      }
    }

    console.log(`${changedCount} record aggiornati con successo: genere cambiato da "${originalGender}" a "${newGender}"`);
    return { success: true, changed: changedCount };
  } catch (error) {
    console.error(`Errore nel cambio genere da "${originalGender}" a "${newGender}":`, error);
    return { success: false, error };
  }
}

// Funzione per ottenere i conteggi per genere
export async function getGenderCounts() {
  try {
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per conteggi genere:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      return { success: true, counts: { male: 0, female: 0, other: 0 } };
    }

    const counts = { male: 0, female: 0, other: 0 };

    allData.forEach((row) => {
      const surveyData = row.data;
      const gender = surveyData?.initialSurvey?.gender;
      
      if (gender === 'male') {
        counts.male++;
      } else if (gender === 'female') {
        counts.female++;
      } else if (gender === 'other') {
        counts.other++;
      }
    });

    return { 
      success: true, 
      counts
    };
  } catch (error) {
    console.error('Errore nel recupero dei conteggi genere:', error);
    return { success: false, error };
  }
}

// Funzione per cambiare la considerazione ambientale di n elementi
export async function changeEnvironmentalConsiderationOfRecords(originalValue: string, newValue: string, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con il valore originale
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per cambio considerazione ambientale:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, changed: 0 };
    }

    // Trova tutti i record con il valore originale
    const matchingRecords = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.finalSurvey?.environmental_consideration === originalValue) {
        matchingRecords.push(row);
      }
    }

    if (matchingRecords.length === 0) {
      console.log(`Nessun record con considerazione ambientale "${originalValue}" trovato`);
      return { success: true, changed: 0 };
    }

    // Mescola l'array per selezionare record casuali
    const shuffledRecords = matchingRecords.sort(() => Math.random() - 0.5);
    
    // Prendi solo il numero richiesto di record
    const recordsToChange = shuffledRecords.slice(0, Math.min(count, shuffledRecords.length));

    console.log(`Trovati ${matchingRecords.length} record con considerazione ambientale "${originalValue}", modificando ${recordsToChange.length} record casuali`);

    let changedCount = 0;

    // Aggiorna ogni record selezionato
    for (const record of recordsToChange) {
      const surveyData = record.data;
      
      // Aggiorna la considerazione ambientale nel record
      const updatedData = {
        ...surveyData,
        finalSurvey: {
          ...surveyData.finalSurvey,
          environmental_consideration: newValue
        }
      };

      // Salva il record aggiornato
      const { error: updateError } = await supabase
        .from('responses')
        .update({ data: updatedData })
        .eq('id', record.id);

      if (updateError) {
        console.error(`Errore nell'aggiornamento del record ${record.id}:`, updateError);
      } else {
        changedCount++;
        console.log(`Record ${record.id} aggiornato: considerazione ambientale cambiata da "${originalValue}" a "${newValue}"`);
      }
    }

    console.log(`${changedCount} record aggiornati con successo: considerazione ambientale cambiata da "${originalValue}" a "${newValue}"`);
    return { success: true, changed: changedCount };
  } catch (error) {
    console.error(`Errore nel cambio considerazione ambientale da "${originalValue}" a "${newValue}":`, error);
    return { success: false, error };
  }
}

// Funzione per cambiare il dispositivo di n elementi
export async function changeDeviceOfRecords(originalDevice: string, newDevice: string, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con il dispositivo originale
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per cambio dispositivo:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, changed: 0 };
    }

    // Trova tutti i record con il dispositivo originale
    const matchingRecords = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.initialSurvey?.device === originalDevice) {
        matchingRecords.push(row);
      }
    }

    if (matchingRecords.length === 0) {
      console.log(`Nessun record con dispositivo "${originalDevice}" trovato`);
      return { success: true, changed: 0 };
    }

    // Mescola l'array per selezionare record casuali
    const shuffledRecords = matchingRecords.sort(() => Math.random() - 0.5);
    
    // Prendi solo il numero richiesto di record
    const recordsToChange = shuffledRecords.slice(0, Math.min(count, shuffledRecords.length));

    console.log(`Trovati ${matchingRecords.length} record con dispositivo "${originalDevice}", modificando ${recordsToChange.length} record casuali`);

    let changedCount = 0;

    // Aggiorna ogni record selezionato
    for (const record of recordsToChange) {
      const surveyData = record.data;
      
      // Aggiorna il dispositivo nel record
      const updatedData = {
        ...surveyData,
        initialSurvey: {
          ...surveyData.initialSurvey,
          device: newDevice
        }
      };

      // Salva il record aggiornato
      const { error: updateError } = await supabase
        .from('responses')
        .update({ data: updatedData })
        .eq('id', record.id);

      if (updateError) {
        console.error(`Errore nell'aggiornamento del record ${record.id}:`, updateError);
      } else {
        changedCount++;
        console.log(`Record ${record.id} aggiornato: dispositivo cambiato da "${originalDevice}" a "${newDevice}"`);
      }
    }

    console.log(`${changedCount} record aggiornati con successo: dispositivo cambiato da "${originalDevice}" a "${newDevice}"`);
    return { success: true, changed: changedCount };
  } catch (error) {
    console.error(`Errore nel cambio dispositivo da "${originalDevice}" a "${newDevice}":`, error);
    return { success: false, error };
  }
}

// Funzione per rimuovere record con valori N/A dal database
export async function removeNARecordsFromDatabase() {
  try {
    // Prima recupera tutti i dati per trovare i record con valori N/A
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per rimozione N/A:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, deleted: 0 };
    }

    // Trova tutti i record con valori N/A nei campi principali
    const recordsToDelete = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      // Controlla se ha valori N/A nei campi principali
      if (!surveyData?.initialSurvey?.age || 
          !surveyData?.initialSurvey?.gender || 
          !surveyData?.initialSurvey?.education || 
          !surveyData?.initialSurvey?.device || 
          !surveyData?.initialSurvey?.financial || 
          !surveyData?.initialSurvey?.frequency ||
          !surveyData?.orderData?.productTitle ||
          !surveyData?.orderData?.deliveryMethod ||
          !surveyData?.checkoutData?.variant) {
        recordsToDelete.push(row.id);
        console.log(`Trovato record N/A: ${row.id}`);
      }
    }

    if (recordsToDelete.length === 0) {
      console.log('Nessun record con valori N/A trovato');
      return { success: true, deleted: 0 };
    }

    console.log(`Trovati ${recordsToDelete.length} record con valori N/A, procedendo con l'eliminazione`);

    // Elimina tutti i record con valori N/A
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .in('id', recordsToDelete);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei record N/A:', deleteError);
      throw deleteError;
    }

    console.log(`${recordsToDelete.length} record con valori N/A eliminati con successo dal database`);
    return { success: true, deleted: recordsToDelete.length };
  } catch (error) {
    console.error('Errore nella rimozione dei record N/A:', error);
    return { success: false, error };
  }
}

// Funzione per modificare i campi del survey finale di n elementi
export async function modifyFinalSurveyFields(fieldsToUpdate: Record<string, number>, count: number) {
  try {
    // Prima recupera tutti i dati per trovare i record con finalSurvey
    const { data: allData, error: fetchError } = await supabase
      .from('responses')
      .select('*');

    if (fetchError) {
      console.error('Errore nel recupero dati per modifica survey finale:', fetchError);
      throw fetchError;
    }

    if (!allData || allData.length === 0) {
      console.log('Nessun dato da controllare');
      return { success: true, updated: 0 };
    }

    // Trova tutti i record che hanno finalSurvey
    const recordsWithFinalSurvey = [];
    for (const row of allData) {
      const surveyData = row.data;
      
      if (surveyData?.finalSurvey) {
        recordsWithFinalSurvey.push(row);
      }
    }

    if (recordsWithFinalSurvey.length === 0) {
      console.log('Nessun record con survey finale trovato');
      return { success: true, updated: 0 };
    }

    // Mescola l'array per selezionare record casuali
    const shuffledRecords = recordsWithFinalSurvey.sort(() => Math.random() - 0.5);
    
    // Prendi solo il numero richiesto di record
    const recordsToUpdate = shuffledRecords.slice(0, Math.min(count, shuffledRecords.length));

    console.log(`Trovati ${recordsWithFinalSurvey.length} record con survey finale, modificando ${recordsToUpdate.length} record casuali`);

    let updatedCount = 0;

    // Aggiorna ogni record selezionato
    for (const record of recordsToUpdate) {
      const surveyData = record.data;
      
      // Aggiorna i campi specificati nel finalSurvey
      const updatedData = {
        ...surveyData,
        finalSurvey: {
          ...surveyData.finalSurvey,
          ...fieldsToUpdate
        }
      };

      // Salva il record aggiornato
      const { error: updateError } = await supabase
        .from('responses')
        .update({ data: updatedData })
        .eq('id', record.id);

      if (updateError) {
        console.error(`Errore nell'aggiornamento del record ${record.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Record ${record.id} aggiornato: campi survey finale modificati`);
      }
    }

    console.log(`${updatedCount} record aggiornati con successo: campi survey finale modificati`);
    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error('Errore nella modifica dei campi survey finale:', error);
    return { success: false, error };
  }
} 