import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getSurveyData } from '../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SurveyData {
  timestamp: string;
  sessionId: string;
  totalTimeSpent?: number;
  initialSurvey?: {
    age?: string;
    gender?: string;
    education?: string;
    device?: string;
    financial?: string;
    frequency?: string;
    get_tired?: number;
    open_tabs?: number;
    save_time?: number;
    avoid_hassle?: number;
    easy_compare?: number;
    end_up_sites?: number;
    find_website?: number;
    easy_shopping?: number;
    download_files?: number;
    enjoy_shopping?: number;
    buy_unavailable?: number;
    stress_financial?: number;
    confusing_structure?: number;
  };
  orderData?: {
    productTitle?: string;
    productPrice?: string;
    productId?: string;
    deliveryMethod?: string;
    deliveryValue?: string;
    checkoutTimeSpent?: number;
    firstName?: string;
    lastName?: string;
    shippingAddress?: string;
    orderCompletedAt?: string;
  };
  checkoutData?: {
    variant?: string;
    product?: any;
    checkoutStartedAt?: string;
    productClickData?: any;
  };
  finalSurvey?: {
    environmental_consideration?: string;
    feel_guilty?: number;
    difficult_design?: number;
    feel_responsible?: number;
    difficult_options?: number;
    effort_understand?: number;
    difficult_overview?: number;
    feel_irresponsible?: number;
    useful_descriptions?: number;
  };
  productInteractions?: Record<string, any>;
  completedAt?: string;
  initialSurveyCompletedAt?: string;
  ecommerceStartedAt?: string;
  finalSurveyCompletedAt?: string;
}

interface Stats {
  totalResponses: number;
  lastUpdate: string;
  averageCheckoutTime: string;
  averageTotalTime: string;
  
  // Demographics
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  educationDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  financialDistribution: Record<string, number>;
  frequencyDistribution: Record<string, number>;
  
  // E-commerce
  productDistribution: Record<string, number>;
  deliveryDistribution: Record<string, number>;
  checkoutVariantDistribution: Record<string, number>;
  // Delivery choice per checkout variant (for grouped bar chart)
  deliveryByVariant: { labels: string[]; home: number[]; cc: number[] };
  checkoutTimeRanges: { labels: string[]; data: number[]; };
  
  // Likert Scale Questions (Initial Survey)
  likertAverages: Record<string, number>;
  
  // Final Survey
  environmentalConsiderationDistribution: Record<string, number>;
  finalSurveyAverages: Record<string, number>;
  
  // Time Analysis
  timeSpentRanges: { labels: string[]; data: number[]; };
  surveyCompletionTimes: { labels: string[]; data: number[]; };
}

const Admin = () => {
  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No label normalization; we only compute an order so original labels remain intact

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Ricarica ogni 30 secondi
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prova prima a leggere da Supabase
      const result = await getSurveyData();
      
      if (result.success && result.data) {
        setSurveyData(result.data);
        setStats(calculateStats(result.data));
      } else {
        // Se non ci sono dati su Supabase, prova il localStorage
        const localStorageData = localStorage.getItem('surveyData');
        if (localStorageData) {
          const data = JSON.parse(localStorageData);
          setSurveyData(data);
          setStats(calculateStats(data));
        } else {
          // Se non ci sono dati, usa i dati di esempio
          const mockData = generateMockData();
          setSurveyData(mockData);
          setStats(calculateStats(mockData));
        }
      }
    } catch (error) {
      console.error('Errore:', error);
      setError('Errore nel caricamento dei dati');
      
      // Dati di esempio per sviluppo
      const mockData = generateMockData();
      setSurveyData(mockData);
      setStats(calculateStats(mockData));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): SurveyData[] => {
    const mockData: SurveyData[] = [];
    const products = ['Vaso Classico', 'Vaso Moderno', 'Vaso Rustico'];
    const genders = ['Uomo', 'Donna', 'Altro'];
    const ages = ['18-25', '26-35', '36-45', '46-55', '55+'];
    const deliveryMethods = ['Consegna a domicilio', 'Click & Collect'];
    const variants = ['Standard', 'Scelta ecologica', 'Emissioni CO₂ ridotte', 'Dettagli CO₂ completi'];

    for (let i = 0; i < 25; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const delivery = deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const checkoutTime = Math.floor(Math.random() * 300000) + 30000; // 30s - 5min

      mockData.push({
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        sessionId: `session-${Date.now()}-${i}`,
        totalTimeSpent: Math.floor(Math.random() * 600000) + 120000, // 2-12 min
        initialSurvey: {
          age,
          gender,
          education: 'Laurea',
          device: 'Desktop',
          financial: 'Buona',
          frequency: 'Mensile',
          get_tired: Math.floor(Math.random() * 7),
          open_tabs: Math.floor(Math.random() * 7),
          save_time: Math.floor(Math.random() * 7),
          avoid_hassle: Math.floor(Math.random() * 7),
          easy_compare: Math.floor(Math.random() * 7),
          end_up_sites: Math.floor(Math.random() * 7),
          find_website: Math.floor(Math.random() * 7),
          easy_shopping: Math.floor(Math.random() * 7),
          download_files: Math.floor(Math.random() * 7),
          enjoy_shopping: Math.floor(Math.random() * 7),
          buy_unavailable: Math.floor(Math.random() * 7),
          stress_financial: Math.floor(Math.random() * 7),
          confusing_structure: Math.floor(Math.random() * 7),
        },
        orderData: {
          productTitle: product,
          productId: `product-${Math.floor(Math.random() * 3) + 1}`,
          deliveryMethod: delivery,
          deliveryValue: delivery === 'Consegna a domicilio' ? 'home' : 'cc',
          checkoutTimeSpent: checkoutTime,
          firstName: 'Nome',
          lastName: 'Cognome',
          shippingAddress: 'Via Roma 123, Torino',
          orderCompletedAt: new Date().toISOString(),
        },
        checkoutData: {
          variant,
          product: { id: 1, title: product, price: '€29.99' },
          checkoutStartedAt: new Date().toISOString(),
        },
        finalSurvey: {
          environmental_consideration: ['Mai', 'Raramente', 'A volte', 'Spesso', 'Sempre'][Math.floor(Math.random() * 5)],
          feel_guilty: Math.floor(Math.random() * 7),
          difficult_design: Math.floor(Math.random() * 7),
          feel_responsible: Math.floor(Math.random() * 7),
          difficult_options: Math.floor(Math.random() * 7),
          effort_understand: Math.floor(Math.random() * 7),
          difficult_overview: Math.floor(Math.random() * 7),
          feel_irresponsible: Math.floor(Math.random() * 7),
          useful_descriptions: Math.floor(Math.random() * 7),
        },
        completedAt: new Date().toISOString(),
      });
    }

    return mockData;
  };

  const calculateStats = (data: SurveyData[]): Stats => {
    // Distribuzioni demografiche
    const ageDistribution: Record<string, number> = {};
    const genderDistribution: Record<string, number> = {};
    const educationDistribution: Record<string, number> = {};
    const deviceDistribution: Record<string, number> = {};
    const financialDistribution: Record<string, number> = {};
    const frequencyDistribution: Record<string, number> = {};
    
    // E-commerce
    const productDistribution: Record<string, number> = {};
    const deliveryDistribution: Record<string, number> = {};
    const checkoutVariantDistribution: Record<string, number> = {};
    const deliveryByVariantMap: Record<string, { home: number; cc: number }> = {};
    
    // Tempi
    const checkoutTimes: number[] = [];
    const totalTimes: number[] = [];
    
    // Likert averages
    const likertSums: Record<string, number> = {};
    const likertCounts: Record<string, number> = {};
    
    // Final survey
    const environmentalConsiderationDistribution: Record<string, number> = {};
    const finalSurveySums: Record<string, number> = {};
    const finalSurveyCounts: Record<string, number> = {};

    data.forEach(item => {
      // Demographics
      if (item.initialSurvey?.age) {
        ageDistribution[item.initialSurvey.age] = (ageDistribution[item.initialSurvey.age] || 0) + 1;
      }
      if (item.initialSurvey?.gender) {
        genderDistribution[item.initialSurvey.gender] = (genderDistribution[item.initialSurvey.gender] || 0) + 1;
      }
      if (item.initialSurvey?.education) {
        educationDistribution[item.initialSurvey.education] = (educationDistribution[item.initialSurvey.education] || 0) + 1;
      }
      if (item.initialSurvey?.device) {
        deviceDistribution[item.initialSurvey.device] = (deviceDistribution[item.initialSurvey.device] || 0) + 1;
      }
      if (item.initialSurvey?.financial) {
        financialDistribution[item.initialSurvey.financial] = (financialDistribution[item.initialSurvey.financial] || 0) + 1;
      }
      if (item.initialSurvey?.frequency) {
        frequencyDistribution[item.initialSurvey.frequency] = (frequencyDistribution[item.initialSurvey.frequency] || 0) + 1;
      }

      // E-commerce
      if (item.orderData?.productTitle) {
        productDistribution[item.orderData.productTitle] = (productDistribution[item.orderData.productTitle] || 0) + 1;
      }
      if (item.orderData?.deliveryMethod) {
        deliveryDistribution[item.orderData.deliveryMethod] = (deliveryDistribution[item.orderData.deliveryMethod] || 0) + 1;
      }
      if (item.checkoutData?.variant) {
        checkoutVariantDistribution[item.checkoutData.variant] = (checkoutVariantDistribution[item.checkoutData.variant] || 0) + 1;
      }

      // Delivery choice per checkout variant
      const variant: string | undefined = item.checkoutData?.variant as string | undefined;
      const deliveryValue: string | undefined = item.orderData?.deliveryValue as string | undefined;
      if (variant && deliveryValue) {
        if (!deliveryByVariantMap[variant]) {
          deliveryByVariantMap[variant] = { home: 0, cc: 0 };
        }
        if (deliveryValue === 'home') {
          deliveryByVariantMap[variant].home += 1;
        } else if (deliveryValue === 'cc') {
          deliveryByVariantMap[variant].cc += 1;
        }
      }

      // Times
      if (item.orderData?.checkoutTimeSpent) {
        checkoutTimes.push(item.orderData.checkoutTimeSpent);
      }
      if (item.totalTimeSpent) {
        totalTimes.push(item.totalTimeSpent);
      }

      // Likert scale questions (from initialSurvey)
      const likertQuestions = [
        'get_tired', 'open_tabs', 'save_time', 'avoid_hassle', 'easy_compare',
        'end_up_sites', 'find_website', 'easy_shopping', 'download_files',
        'enjoy_shopping', 'buy_unavailable', 'stress_financial', 'confusing_structure'
      ];
      
      likertQuestions.forEach(question => {
        const value = item.initialSurvey?.[question as keyof typeof item.initialSurvey];
        if (typeof value === 'number') {
          likertSums[question] = (likertSums[question] || 0) + value;
          likertCounts[question] = (likertCounts[question] || 0) + 1;
        }
      });

      // Final survey
      if (item.finalSurvey?.environmental_consideration) {
        environmentalConsiderationDistribution[item.finalSurvey.environmental_consideration] = 
          (environmentalConsiderationDistribution[item.finalSurvey.environmental_consideration] || 0) + 1;
      }

      const finalSurveyQuestions = [
        'feel_guilty', 'difficult_design', 'feel_responsible', 'difficult_options',
        'effort_understand', 'difficult_overview', 'feel_irresponsible', 'useful_descriptions'
      ];

      finalSurveyQuestions.forEach(question => {
        const value = item.finalSurvey?.[question as keyof typeof item.finalSurvey];
        if (typeof value === 'number') {
          finalSurveySums[question] = (finalSurveySums[question] || 0) + value;
          finalSurveyCounts[question] = (finalSurveyCounts[question] || 0) + 1;
        }
      });
    });

    // Calculate averages
    const likertAverages: Record<string, number> = {};
    Object.keys(likertSums).forEach(question => {
      likertAverages[question] = likertSums[question] / likertCounts[question];
    });

    const finalSurveyAverages: Record<string, number> = {};
    Object.keys(finalSurveySums).forEach(question => {
      finalSurveyAverages[question] = finalSurveySums[question] / finalSurveyCounts[question];
    });

    // Time ranges
    const checkoutTimeRanges = {
      labels: ['0-60s', '1-2min', '2-5min', '5-10min', '10min+'],
      data: [
        checkoutTimes.filter(t => t < 60000).length,
        checkoutTimes.filter(t => t >= 60000 && t < 120000).length,
        checkoutTimes.filter(t => t >= 120000 && t < 300000).length,
        checkoutTimes.filter(t => t >= 300000 && t < 600000).length,
        checkoutTimes.filter(t => t >= 600000).length
      ]
    };

    const timeSpentRanges = {
      labels: ['0-2min', '2-5min', '5-10min', '10-15min', '15min+'],
      data: [
        totalTimes.filter(t => t < 120000).length,
        totalTimes.filter(t => t >= 120000 && t < 300000).length,
        totalTimes.filter(t => t >= 300000 && t < 600000).length,
        totalTimes.filter(t => t >= 600000 && t < 900000).length,
        totalTimes.filter(t => t >= 900000).length
      ]
    };

    const averageCheckoutTime = checkoutTimes.length > 0 
      ? `${Math.round(checkoutTimes.reduce((a, b) => a + b, 0) / checkoutTimes.length / 1000)}s`
      : '-';

    const averageTotalTime = totalTimes.length > 0
      ? `${Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length / 60000)}min`
      : '-';

    // Prepare deliveryByVariant arrays
    // Sort labels so that non-preselected and preselected variants are adjacent
    const getVariantPriority = (label: string): number => {
      const l = label.toLowerCase();
      const isPre = l.includes('pre') && (l.includes('selez') || l.includes('impost'));
      if (l.includes('standard')) return isPre ? 1 : 0;
      if (l.includes('ecologic')) return isPre ? 3 : 2; // "scelta ecologica"
      if (l.includes('emission')) return isPre ? 5 : 4; // emissioni / co2
      if (l.includes('dettagl')) return isPre ? 7 : 6;  // dettagli
      return 999;
    };
    const variantLabels: string[] = Object.keys(deliveryByVariantMap)
      .sort((a, b) => getVariantPriority(a) - getVariantPriority(b));
    const deliveryByVariant = {
      labels: variantLabels,
      home: variantLabels.map(v => deliveryByVariantMap[v]?.home ?? 0),
      cc: variantLabels.map(v => deliveryByVariantMap[v]?.cc ?? 0)
    };

    return {
      totalResponses: data.length,
      lastUpdate: new Date().toISOString(),
      averageCheckoutTime,
      averageTotalTime,
      ageDistribution,
      genderDistribution,
      educationDistribution,
      deviceDistribution,
      financialDistribution,
      frequencyDistribution,
      productDistribution,
      deliveryDistribution,
      checkoutVariantDistribution,
      deliveryByVariant,
      checkoutTimeRanges,
      likertAverages,
      environmentalConsiderationDistribution,
      finalSurveyAverages,
      timeSpentRanges,
      surveyCompletionTimes: checkoutTimeRanges // Reuse for now
    };
  };

  const exportData = () => {
    if (surveyData.length === 0) {
      alert('Nessun dato da esportare');
      return;
    }

    const headers = [
      'Timestamp', 'SessionID', 'Age', 'Gender', 'Education', 'Device', 
      'Financial', 'Frequency', 'ProductTitle', 'ProductID', 'DeliveryMethod', 
      'DeliveryValue', 'CheckoutTimeSeconds', 'CheckoutVariant',
      'EnvironmentalConsideration', 'TotalTimeMinutes', 'ProductClicks'
    ];
    
    const rows = surveyData.map(item => [
      item.timestamp || '',
      item.sessionId || '',
      item.initialSurvey?.age || '',
      item.initialSurvey?.gender || '',
      item.initialSurvey?.education || '',
      item.initialSurvey?.device || '',
      item.initialSurvey?.financial || '',
      item.initialSurvey?.frequency || '',
      item.orderData?.productTitle || '',
      item.orderData?.productId || '',
      item.orderData?.deliveryMethod || '',
      item.orderData?.deliveryValue || '',
      item.orderData?.checkoutTimeSpent ? Math.round(item.orderData.checkoutTimeSpent / 1000) : '',
      item.checkoutData?.variant || '',
      item.finalSurvey?.environmental_consideration || '',
      item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) : '',
      item.productInteractions ? Object.values(item.productInteractions).reduce((sum: number, data: any) => sum + data.clickCount, 0) : ''
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (surveyData.length === 0) {
      alert('Nessun dato da esportare');
      return;
    }

    const headers = [
      'Timestamp', 'SessionID', 'Age', 'Gender', 'Education', 'Device', 
      'Financial', 'Frequency', 'ProductTitle', 'ProductID', 'DeliveryMethod', 
      'DeliveryValue', 'CheckoutTimeSeconds', 'CheckoutVariant',
      'EnvironmentalConsideration', 'TotalTimeMinutes', 'ProductClicks'
    ];

    const rows: (string | number)[][] = surveyData.map((item: SurveyData) => [
      item.timestamp || '',
      item.sessionId || '',
      item.initialSurvey?.age || '',
      item.initialSurvey?.gender || '',
      item.initialSurvey?.education || '',
      item.initialSurvey?.device || '',
      item.initialSurvey?.financial || '',
      item.initialSurvey?.frequency || '',
      item.orderData?.productTitle || '',
      item.orderData?.productId || '',
      item.orderData?.deliveryMethod || '',
      item.orderData?.deliveryValue || '',
      item.orderData?.checkoutTimeSpent ? Math.round(item.orderData.checkoutTimeSpent / 1000) : '',
      item.checkoutData?.variant || '',
      item.finalSurvey?.environmental_consideration || '',
      item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) : '',
      item.productInteractions ? Object.values(item.productInteractions).reduce((sum: number, data: any) => sum + (data?.clickCount || 0), 0) : ''
    ]);

    const escapeHTML = (value: string) => (
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    );

    let html = '<table><thead><tr>';
    html += headers.map(h => `<th>${escapeHTML(String(h))}</th>`).join('');
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += '<tr>' + row.map(field => `<td>${escapeHTML(String(field))}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-data-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const viewDetails = (index: number) => {
    const item = surveyData[index];
    
    const details = `
═══════════════════════════════════════
📊 DETTAGLI COMPLETI RISPOSTA
═══════════════════════════════════════

🆔 IDENTIFICATORI:
• Session ID: ${item.sessionId || 'N/A'}
• Timestamp: ${item.timestamp || 'N/A'}
• Data locale: ${item.timestamp ? new Date(item.timestamp).toLocaleString('it-IT') : 'N/A'}
• Completato il: ${item.completedAt || 'N/A'}

⏱️ ANALISI TEMPORALE:
• Tempo totale (ms): ${item.totalTimeSpent || 'N/A'}
• Tempo totale (minuti): ${item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) + ' min' : 'N/A'}
• Survey iniziale completato: ${item.initialSurveyCompletedAt || 'N/A'}
• Ecommerce iniziato: ${item.ecommerceStartedAt || 'N/A'}
• Survey finale completato: ${item.finalSurveyCompletedAt || 'N/A'}
• Tempo nel checkout: ${item.orderData?.checkoutTimeSpent ? Math.round(item.orderData.checkoutTimeSpent / 1000) + ' secondi (' + item.orderData.checkoutTimeSpent + ' ms)' : 'N/A'}

📋 SURVEY INIZIALE COMPLETO:
• Età: ${item.initialSurvey?.age || 'N/A'}
• Genere: ${item.initialSurvey?.gender || 'N/A'}
• Educazione: ${item.initialSurvey?.education || 'N/A'}
• Dispositivo: ${item.initialSurvey?.device || 'N/A'}
• Situazione finanziaria: ${item.initialSurvey?.financial || 'N/A'}
• Frequenza acquisti: ${item.initialSurvey?.frequency || 'N/A'}
• Si stanca facilmente: ${item.initialSurvey?.get_tired !== undefined ? item.initialSurvey.get_tired : 'N/A'}
• Apre troppe tabs: ${item.initialSurvey?.open_tabs !== undefined ? item.initialSurvey.open_tabs : 'N/A'}
• Vuole risparmiare tempo: ${item.initialSurvey?.save_time !== undefined ? item.initialSurvey.save_time : 'N/A'}
• Evita difficoltà: ${item.initialSurvey?.avoid_hassle !== undefined ? item.initialSurvey.avoid_hassle : 'N/A'}
• Facilità confronto: ${item.initialSurvey?.easy_compare !== undefined ? item.initialSurvey.easy_compare : 'N/A'}
• Finisce su altri siti: ${item.initialSurvey?.end_up_sites !== undefined ? item.initialSurvey.end_up_sites : 'N/A'}
• Facilità trovare siti: ${item.initialSurvey?.find_website !== undefined ? item.initialSurvey.find_website : 'N/A'}
• Shopping facile: ${item.initialSurvey?.easy_shopping !== undefined ? item.initialSurvey.easy_shopping : 'N/A'}
• Scarica file: ${item.initialSurvey?.download_files !== undefined ? item.initialSurvey.download_files : 'N/A'}
• Si diverte a fare shopping: ${item.initialSurvey?.enjoy_shopping !== undefined ? item.initialSurvey.enjoy_shopping : 'N/A'}
• Compra prodotti non disponibili: ${item.initialSurvey?.buy_unavailable !== undefined ? item.initialSurvey.buy_unavailable : 'N/A'}
• Stress finanziario: ${item.initialSurvey?.stress_financial !== undefined ? item.initialSurvey.stress_financial : 'N/A'}
• Struttura confusa: ${item.initialSurvey?.confusing_structure !== undefined ? item.initialSurvey.confusing_structure : 'N/A'}

🛒 DATI ECOMMERCE COMPLETI:
• Prodotto scelto: ${item.orderData?.productTitle || 'N/A'}
• ID Prodotto: ${item.orderData?.productId || 'N/A'}
• Prezzo prodotto: ${item.orderData?.productPrice || 'N/A'}
• Nome: ${item.orderData?.firstName || 'N/A'}
• Cognome: ${item.orderData?.lastName || 'N/A'}
• Indirizzo spedizione: ${item.orderData?.shippingAddress || 'N/A'}
• Metodo consegna: ${item.orderData?.deliveryMethod || 'N/A'}
• Valore delivery: ${item.orderData?.deliveryValue || 'N/A'}
• Ordine completato: ${item.orderData?.orderCompletedAt || 'N/A'}

🎯 DATI CHECKOUT:
• Variante checkout: ${item.checkoutData?.variant || 'N/A'}
• Prodotto checkout: ${item.checkoutData?.product ? JSON.stringify(item.checkoutData.product, null, 2) : 'N/A'}
• Checkout iniziato: ${item.checkoutData?.checkoutStartedAt || 'N/A'}
• Click data: ${item.checkoutData?.productClickData ? JSON.stringify(item.checkoutData.productClickData, null, 2) : 'N/A'}

📱 INTERAZIONI PRODOTTI:
${item.productInteractions ? Object.entries(item.productInteractions).map(([productId, data]) => 
  `• Prodotto ${productId}: ${data.clickCount} click, primo click: ${new Date(data.firstClickAt).toLocaleString('it-IT')}`
).join('\n') : '• Nessuna interazione tracciata'}

📝 SURVEY FINALE COMPLETO:
• Considerazione ambientale: ${item.finalSurvey?.environmental_consideration || 'N/A'}
• Si sente colpevole: ${item.finalSurvey?.feel_guilty !== undefined ? item.finalSurvey.feel_guilty : 'N/A'}
• Design difficile: ${item.finalSurvey?.difficult_design !== undefined ? item.finalSurvey.difficult_design : 'N/A'}
• Si sente responsabile: ${item.finalSurvey?.feel_responsible !== undefined ? item.finalSurvey.feel_responsible : 'N/A'}
• Opzioni difficili: ${item.finalSurvey?.difficult_options !== undefined ? item.finalSurvey.difficult_options : 'N/A'}
• Sforzo per capire: ${item.finalSurvey?.effort_understand !== undefined ? item.finalSurvey.effort_understand : 'N/A'}
• Overview difficile: ${item.finalSurvey?.difficult_overview !== undefined ? item.finalSurvey.difficult_overview : 'N/A'}
• Si sente irresponsabile: ${item.finalSurvey?.feel_irresponsible !== undefined ? item.finalSurvey.feel_irresponsible : 'N/A'}
• Descrizioni utili: ${item.finalSurvey?.useful_descriptions !== undefined ? item.finalSurvey.useful_descriptions : 'N/A'}

🔧 DATI RAW (JSON):
${JSON.stringify(item, null, 2)}

═══════════════════════════════════════
    `;
    
    alert(details);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        Caricamento dati...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#fee', 
        color: '#c33', 
        padding: '1rem', 
        borderRadius: '8px', 
        margin: '1rem', 
        textAlign: 'center' 
      }}>
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        Nessun dato disponibile
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', margin: 0, padding: 0, background: '#f5f5f5' }}>
      <div style={{ background: '#1e88e5', color: 'white', padding: '1.5rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>🏺 Terracotta Dreams - Analytics Dashboard</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e88e5', marginBottom: '0.5rem' }}>
              {stats.totalResponses}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Risposte Totali</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e88e5', marginBottom: '0.5rem' }}>
              {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString('it-IT') : 'Mai'}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Ultimo Aggiornamento</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e88e5', marginBottom: '0.5rem' }}>
              100%
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Tasso Completamento</div>
          </div>
                     <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
             <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e88e5', marginBottom: '0.5rem' }}>
               {stats.averageCheckoutTime}
             </div>
             <div style={{ color: '#666', fontSize: '0.9rem' }}>Tempo Medio Checkout</div>
           </div>
           <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
             <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e88e5', marginBottom: '0.5rem' }}>
               {stats.averageTotalTime}
             </div>
             <div style={{ color: '#666', fontSize: '0.9rem' }}>Tempo Medio Totale</div>
           </div>
        </div>

        {/* Demographics Charts */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>📊 Demografia</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Distribuzione Età
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.ageDistribution),
                    datasets: [{
                      data: Object.values(stats.ageDistribution),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Distribuzione Genere
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.genderDistribution),
                    datasets: [{
                      label: 'Risposte',
                      data: Object.values(stats.genderDistribution),
                      backgroundColor: '#36A2EB'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Livello di Educazione
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.educationDistribution),
                    datasets: [{
                      data: Object.values(stats.educationDistribution),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Dispositivo Utilizzato
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.deviceDistribution),
                    datasets: [{
                      label: 'Utenti',
                      data: Object.values(stats.deviceDistribution),
                      backgroundColor: '#4BC0C0'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Situazione Finanziaria
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.financialDistribution),
                    datasets: [{
                      data: Object.values(stats.financialDistribution),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Frequenza Acquisti Online
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.frequencyDistribution),
                    datasets: [{
                      label: 'Utenti',
                      data: Object.values(stats.frequencyDistribution),
                      backgroundColor: '#9966FF'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Tipi di Checkout vs Scelta Spedizione
              </div>
              <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                <Bar
                  data={{
                    labels: stats.deliveryByVariant.labels,
                    datasets: [
                      {
                        label: 'Spedizione a domicilio',
                        data: stats.deliveryByVariant.home,
                        backgroundColor: '#1e88e5'
                      },
                      {
                        label: 'Click & Collect',
                        data: stats.deliveryByVariant.cc,
                        backgroundColor: '#43a047'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Tabella Conteggi per Variante
              </div>
              <div style={{ overflowY: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', background: '#f8f9fa', color: '#333' }}>Variante</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', background: '#f8f9fa', color: '#333' }}>Domicilio</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', background: '#f8f9fa', color: '#333' }}>Click & Collect</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', background: '#f8f9fa', color: '#333' }}>Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.deliveryByVariant.labels.map((label, idx) => {
                      const homeCount = stats.deliveryByVariant.home[idx] ?? 0;
                      const ccCount = stats.deliveryByVariant.cc[idx] ?? 0;
                      const total = homeCount + ccCount;
                      return (
                        <tr key={label}>
                          <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f1f3f4' }}>{label}</td>
                          <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f1f3f4' }}>{homeCount}</td>
                          <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f1f3f4' }}>{ccCount}</td>
                          <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #f1f3f4' }}>{total}</td>
                        </tr>
                      );
                    })}
                    {stats.deliveryByVariant.labels.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.6rem', textAlign: 'center', color: '#666' }}>Nessun dato</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* E-commerce Charts */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>🛒 E-commerce</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Prodotti Scelti
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.productDistribution),
                    datasets: [{
                      data: Object.values(stats.productDistribution),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Metodi di Spedizione
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.deliveryDistribution),
                    datasets: [{
                      label: 'Scelte',
                      data: Object.values(stats.deliveryDistribution),
                      backgroundColor: '#4BC0C0'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Tempo nel Checkout
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: stats.checkoutTimeRanges.labels,
                    datasets: [{
                      label: 'Numero utenti',
                      data: stats.checkoutTimeRanges.data,
                      backgroundColor: '#9966FF'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Varianti Checkout
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.checkoutVariantDistribution),
                    datasets: [{
                      data: Object.values(stats.checkoutVariantDistribution),
                      backgroundColor: ['#FF9F40', '#FF6384', '#36A2EB', '#FFCE56']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Likert Scale Charts */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>📋 Survey Iniziale - Scala Likert</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Media Risposte Likert
              </div>
              <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.likertAverages).map(key => key.replace(/_/g, ' ')),
                    datasets: [{
                      label: 'Media (1-7)',
                      data: Object.values(stats.likertAverages),
                      backgroundColor: '#FF6384'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        max: 7,
                        ticks: { stepSize: 1 }
                      } 
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Survey Charts */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>📝 Survey Finale</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Considerazione Ambientale
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Doughnut
                  data={{
                    labels: Object.keys(stats.environmentalConsiderationDistribution),
                    datasets: [{
                      data: Object.values(stats.environmentalConsiderationDistribution),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Media Risposte Survey Finale
              </div>
              <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                <Bar
                  data={{
                    labels: Object.keys(stats.finalSurveyAverages).map(key => key.replace(/_/g, ' ')),
                    datasets: [{
                      label: 'Media (1-7)',
                      data: Object.values(stats.finalSurveyAverages),
                      backgroundColor: '#36A2EB'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        max: 7,
                        ticks: { stepSize: 1 }
                      } 
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time Analysis Charts */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>⏱️ Analisi Temporale</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Tempo Totale Speso
              </div>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar
                  data={{
                    labels: stats.timeSpentRanges.labels,
                    datasets: [{
                      label: 'Numero utenti',
                      data: stats.timeSpentRanges.data,
                      backgroundColor: '#FFCE56'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#f8f9fa', padding: '1rem 1.5rem', borderBottom: '1px solid #dee2e6' }}>
            <button 
              onClick={exportData}
              style={{ 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                marginBottom: '1rem' 
              }}
            >
              📥 Esporta CSV
            </button>
            <button 
              onClick={exportExcel}
              style={{ 
                background: '#ffc107', 
                color: '#212529', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                marginBottom: '1rem',
                marginLeft: '0.5rem'
              }}
            >
              📊 Esporta Excel
            </button>
            <h3 style={{ margin: 0, display: 'inline-block', marginLeft: '1rem' }}>Dati Dettagliati</h3>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Data</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Session ID</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Età</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Genere</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Prodotto</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Spedizione</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Tempo Checkout</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Tempo Totale</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8f9fa', fontWeight: '600', color: '#333' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {surveyData.map((item, index) => {
                  const timeSpent = item.totalTimeSpent ? 
                    Math.round(item.totalTimeSpent / 60000) + ' min' : 'N/A';
                  
                  const checkoutTime = item.orderData?.checkoutTimeSpent ? 
                    Math.round(item.orderData.checkoutTimeSpent / 1000) + 's' : 'N/A';
                  
                  return (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString('it-IT') + ' ' + new Date(item.timestamp).toLocaleTimeString('it-IT') : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.sessionId || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.initialSurvey?.age || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.initialSurvey?.gender || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.orderData?.productTitle || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {item.orderData?.deliveryValue === 'home' ? '🏠 Casa' : item.orderData?.deliveryValue === 'cc' ? '📦 C&C' : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {checkoutTime}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        {timeSpent}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #f1f3f4' }}>
                        <button 
                          onClick={() => viewDetails(index)}
                          style={{ 
                            background: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                          }}
                        >
                          Dettagli
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 