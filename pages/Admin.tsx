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
import { getSurveyData, updateVariantNames, addRandomRecords, deleteRecordsWithVariant3, debugVariants, addClickCollectRecords, deleteControlloRecords, addControlloRecords, addEmissioniCO2Records, deleteRecordsByType, getAvailableVariants, deleteRecordsByDeliveryType, getDeliveryTypeCounts, changeGenderOfRecords, getGenderCounts, changeEnvironmentalConsiderationOfRecords, changeDeviceOfRecords, removeNARecordsFromDatabase, modifyFinalSurveyFields } from '../lib/supabase';
import * as XLSX from 'xlsx';

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
  
  // Stati per la modifica dei dati
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [modifyCount, setModifyCount] = useState<number>(1);
  const [newValues, setNewValues] = useState<Record<string, number>>({});
  const [modifying, setModifying] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<{variants: string[], counts: Record<string, number>}>({variants: [], counts: {}});
  const [selectedVariant, setSelectedVariant] = useState('');
  const [deleteCount, setDeleteCount] = useState(1);
  const [showDeliveryDeleteModal, setShowDeliveryDeleteModal] = useState(false);
  const [deliveryCounts, setDeliveryCounts] = useState<{home: number, cc: number}>({home: 0, cc: 0});
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('home');
  const [deliveryDeleteCount, setDeliveryDeleteCount] = useState(1);
  const [showGenderChangeModal, setShowGenderChangeModal] = useState(false);
  const [genderCounts, setGenderCounts] = useState<{male: number, female: number, other: number}>({male: 0, female: 0, other: 0});
  const [selectedOriginalGender, setSelectedOriginalGender] = useState('male');
  const [selectedNewGender, setSelectedNewGender] = useState('female');
  const [genderChangeCount, setGenderChangeCount] = useState(1);
  const [showEnvironmentalModal, setShowEnvironmentalModal] = useState(false);
  const [selectedEnvironmentalValue, setSelectedEnvironmentalValue] = useState('never');
  const [newEnvironmentalValue, setNewEnvironmentalValue] = useState('rarely');
  const [environmentalChangeCount, setEnvironmentalChangeCount] = useState(1);
  const [showRemoveNAModal, setShowRemoveNAModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDeviceValue, setSelectedDeviceValue] = useState('computer');
  const [newDeviceValue, setNewDeviceValue] = useState('smartphone');
  const [deviceChangeCount, setDeviceChangeCount] = useState(1);

  // No label normalization; we only compute an order so original labels remain intact

  useEffect(() => {
    loadData();
    // Auto-refresh disabled
    // const interval = setInterval(loadData, 30000); // Ricarica ogni 30 secondi
    // return () => clearInterval(interval);
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

  // Funzioni per la modifica dei dati
  const openModifyModal = () => {
    setShowModifyModal(true);
    setSelectedFields([]);
    setNewValues({});
    setModifyCount(1);
  };

  const closeModifyModal = () => {
    setShowModifyModal(false);
    setSelectedFields([]);
    setNewValues({});
    setModifyCount(1);
  };

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const updateNewValue = (field: string, value: number) => {
    setNewValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const modifySurveyData = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to modify');
      return;
    }

    if (modifyCount < 1 || modifyCount > surveyData.length) {
      alert('Invalid number of records');
      return;
    }

    // Verifica che tutti i campi selezionati abbiano un valore
    for (const field of selectedFields) {
      if (newValues[field] === undefined || newValues[field] < 1 || newValues[field] > 7) {
        alert(`Invalid value for field "${field}". Must be between 1 and 7.`);
        return;
      }
    }

    setModifying(true);

    try {
      // Esegui la modifica dei campi survey finale nel database
      const result = await modifyFinalSurveyFields(newValues, modifyCount);
      
      if (result.success) {
        alert(`Successfully modified ${result.updated || 0} records in the database!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        closeModifyModal();
      } else {
        alert('Error during data modification: ' + ((result.error ? String(result.error) : 'Unknown error') || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error in modification:', error);
      alert('Error during data modification');
    } finally {
      setModifying(false);
    }
  };

  const handleUpdateVariants = async () => {
    if (!confirm('Sei sicuro di voler aggiornare tutti i nomi delle varianti nel database? Questa operazione non può essere annullata.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await updateVariantNames();
      
      if (result.success) {
        alert(`Aggiornamento completato! ${result.updated} record modificati.`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'aggiornamento: ' + ((result.error ? String(result.error) : 'Errore sconosciuto')));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiornamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRandomRecords = async () => {
    const count = prompt('Quanti record casuali vuoi aggiungere? (default: 20)', '20');
    const numRecords = parseInt(count || '20');
    
    if (isNaN(numRecords) || numRecords <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    if (!confirm(`Sei sicuro di voler aggiungere ${numRecords} record casuali al database?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await addRandomRecords(numRecords);
      
      if (result.success) {
        alert(`${result.inserted} record casuali aggiunti con successo!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'aggiunta dei record: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiunta dei record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant3 = async () => {
    if (!confirm('Sei sicuro di voler eliminare tutti i record con variante "3"? Questa operazione non può essere annullata.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteRecordsWithVariant3();
      
      if (result.success) {
        if (result.deleted && result.deleted > 0) {
          alert(`${result.deleted} record con variante "3" eliminati con successo!`);
        } else {
          alert('Nessun record con variante "3" trovato.');
        }
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'eliminazione: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  const handleDebugVariants = async () => {
    try {
      setLoading(true);
      const result = await debugVariants();
      
      if (result.success) {
        const variantsList = (result.variants || []).join(', ');
        const countsList = Object.entries(result.counts || {}).map(([variant, count]) => `${variant}: ${count}`).join(', ');
        alert(`Varianti trovate: ${variantsList}\n\nConteggi: ${countsList}\n\nControlla la console per i dettagli completi.`);
      } else {
        alert('Errore durante il debug: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il debug');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClickCollectRecords = async () => {
    const count = prompt('Quanti record Click & Collect vuoi aggiungere? (default: 20)', '20');
    const numRecords = parseInt(count || '20');
    
    if (isNaN(numRecords) || numRecords <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    if (!confirm(`Sei sicuro di voler aggiungere ${numRecords} record che selezionano tutti Click & Collect?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await addClickCollectRecords(numRecords);
      
      if (result.success) {
        alert(`${result.inserted} record Click & Collect aggiunti con successo!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'aggiunta dei record: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiunta dei record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteControlloRecords = async () => {
    if (!confirm('Sei sicuro di voler eliminare TUTTI i record con variante "Controllo"? Questa operazione non può essere annullata.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteControlloRecords();
      
      if (result.success) {
        if (result.deleted && result.deleted > 0) {
          alert(`${result.deleted} record Controllo eliminati con successo!`);
        } else {
          alert('Nessun record Controllo trovato.');
        }
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'eliminazione: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  const handleAddControlloRecords = async () => {
    const count = prompt('Quanti record Controllo vuoi aggiungere? (default: 20)', '20');
    const numRecords = parseInt(count || '20');
    
    if (isNaN(numRecords) || numRecords <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    if (!confirm(`Sei sicuro di voler aggiungere ${numRecords} record Controllo (60% casa, 40% CC)?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await addControlloRecords(numRecords);
      
      if (result.success) {
        alert(`${result.inserted} record Controllo aggiunti con successo! (60% casa, 40% CC)`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'aggiunta dei record: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiunta dei record');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmissioniCO2Records = async () => {
    const count = prompt('Quanti record Emissioni CO₂ ridotte vuoi aggiungere? (default: 20)', '20');
    const numRecords = parseInt(count || '20');
    
    if (isNaN(numRecords) || numRecords <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    if (!confirm(`Sei sicuro di voler aggiungere ${numRecords} record Emissioni CO₂ ridotte?\n\n• 50% senza pre-selezione: 60% casa, 40% CC\n• 50% con pre-selezione: 80% CC, 20% casa`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await addEmissioniCO2Records(numRecords);
      
      if (result.success) {
        alert(`${result.inserted} record Emissioni CO₂ ridotte aggiunti con successo!\n\n• 50% senza pre-selezione: 60% casa, 40% CC\n• 50% con pre-selezione: 80% CC, 20% casa`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
      } else {
        alert('Errore durante l\'aggiunta dei record: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiunta dei record');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = async () => {
    try {
      setLoading(true);
      
      // Prima ottieni le varianti disponibili
      const variantsResult = await getAvailableVariants();
      
      if (!variantsResult.success) {
        alert('Errore nel recupero delle varianti: ' + ((variantsResult.error ? String(variantsResult.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
        return;
      }

      if (!variantsResult.variants || variantsResult.variants.length === 0) {
        alert('Nessuna variante trovata nel database');
        return;
      }

      setAvailableVariants({
        variants: variantsResult.variants as string[],
        counts: variantsResult.counts
      });
      setSelectedVariant((variantsResult.variants as string[])[0]);
      setDeleteCount(1);
      setShowDeleteModal(true);
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il caricamento delle varianti');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecordsByType = async () => {
    if (!selectedVariant) {
      alert('Seleziona una variante');
      return;
    }

    if (deleteCount <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    if (deleteCount > availableVariants.counts[selectedVariant]) {
      alert(`Non ci sono abbastanza record. Disponibili: ${availableVariants.counts[selectedVariant]}`);
      return;
    }

    try {
      setLoading(true);
      
      // Esegui l'eliminazione
      const result = await deleteRecordsByType(selectedVariant, deleteCount);
      
      if (result.success) {
        alert(`${result.deleted || 0} record di "${selectedVariant}" eliminati con successo!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowDeleteModal(false);
      } else {
        alert('Errore durante l\'eliminazione: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  const openDeliveryDeleteModal = async () => {
    try {
      setLoading(true);
      
      // Prima ottieni i conteggi per tipo di spedizione
      const countsResult = await getDeliveryTypeCounts();
      
      if (!countsResult.success) {
        alert('Errore nel recupero dei conteggi spedizione: ' + ((countsResult.error ? String(countsResult.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
        return;
      }

      if (!countsResult.counts || (countsResult.counts.home === 0 && countsResult.counts.cc === 0)) {
        alert('Nessun record di spedizione trovato nel database');
        return;
      }

      setDeliveryCounts(countsResult.counts);
      setSelectedDeliveryType(countsResult.counts.home > 0 ? 'home' : 'cc');
      setDeliveryDeleteCount(1);
      setShowDeliveryDeleteModal(true);
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il caricamento dei conteggi spedizione');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecordsByDeliveryType = async () => {
    if (!selectedDeliveryType) {
      alert('Seleziona un tipo di spedizione');
      return;
    }

    if (deliveryDeleteCount <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    const maxCount = selectedDeliveryType === 'home' ? deliveryCounts.home : deliveryCounts.cc;
    if (deliveryDeleteCount > maxCount) {
      alert(`Non ci sono abbastanza record. Disponibili: ${maxCount}`);
      return;
    }

    try {
      setLoading(true);
      
      // Esegui l'eliminazione
      const result = await deleteRecordsByDeliveryType(selectedDeliveryType, deliveryDeleteCount);
      
      if (result.success) {
        const deliveryTypeName = selectedDeliveryType === 'home' ? 'Consegna a domicilio' : 'Click & Collect';
        alert(`${result.deleted || 0} record di "${deliveryTypeName}" eliminati con successo!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowDeliveryDeleteModal(false);
      } else {
        alert('Errore durante l\'eliminazione: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'eliminazione');
    } finally {
      setLoading(false);
    }
  };

  const openGenderChangeModal = async () => {
    try {
      setLoading(true);
      
      // Prima ottieni i conteggi per genere
      const countsResult = await getGenderCounts();
      
      if (!countsResult.success) {
        alert('Errore nel recupero dei conteggi genere: ' + ((countsResult.error ? String(countsResult.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
        return;
      }
      
      if (countsResult.counts) {
        setGenderCounts(countsResult.counts);
      }
      setShowGenderChangeModal(true);
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il caricamento dei conteggi genere');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeGender = async () => {
    if (!selectedOriginalGender || !selectedNewGender) {
      alert('Seleziona sia il genere originale che quello nuovo');
      return;
    }

    if (selectedOriginalGender === selectedNewGender) {
      alert('Il genere originale e quello nuovo devono essere diversi');
      return;
    }

    if (genderChangeCount <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    const maxCount = selectedOriginalGender === 'male' ? genderCounts.male : 
                    selectedOriginalGender === 'female' ? genderCounts.female : 
                    genderCounts.other;
    
    if (genderChangeCount > maxCount) {
      alert(`Non ci sono abbastanza record. Disponibili: ${maxCount}`);
      return;
    }

    const originalGenderName = selectedOriginalGender === 'male' ? 'Maschio' : 
                              selectedOriginalGender === 'female' ? 'Femmina' : 'Altro';
    const newGenderName = selectedNewGender === 'male' ? 'Maschio' : 
                         selectedNewGender === 'female' ? 'Femmina' : 'Altro';

    if (!confirm(`Sei sicuro di voler cambiare il genere di ${genderChangeCount} record da "${originalGenderName}" a "${newGenderName}"? Questa operazione non può essere annullata.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Esegui il cambio genere
      const result = await changeGenderOfRecords(selectedOriginalGender, selectedNewGender, genderChangeCount);
      
      if (result.success) {
        alert(`${result.changed || 0} record aggiornati con successo: genere cambiato da "${originalGenderName}" a "${newGenderName}"!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowGenderChangeModal(false);
      } else {
        alert('Errore durante il cambio genere: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il cambio genere');
    } finally {
      setLoading(false);
    }
  };

  const openEnvironmentalModal = () => {
    setShowEnvironmentalModal(true);
    setSelectedEnvironmentalValue('never');
    setNewEnvironmentalValue('rarely');
    setEnvironmentalChangeCount(1);
  };

  const handleChangeEnvironmental = async () => {
    if (!selectedEnvironmentalValue || !newEnvironmentalValue) {
      alert('Seleziona sia il valore originale che quello nuovo');
      return;
    }

    if (selectedEnvironmentalValue === newEnvironmentalValue) {
      alert('Il valore originale e quello nuovo devono essere diversi');
      return;
    }

    if (environmentalChangeCount <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    // Conta quanti record hanno il valore selezionato
    const availableCount = surveyData.filter(item => 
      item.finalSurvey?.environmental_consideration === selectedEnvironmentalValue
    ).length;

    if (environmentalChangeCount > availableCount) {
      alert(`Non ci sono abbastanza record. Disponibili: ${availableCount}`);
      return;
    }

    if (!confirm(`Sei sicuro di voler cambiare la considerazione ambientale di ${environmentalChangeCount} record da "${selectedEnvironmentalValue}" a "${newEnvironmentalValue}"? Questa operazione non può essere annullata.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Esegui il cambio considerazione ambientale nel database
      const result = await changeEnvironmentalConsiderationOfRecords(selectedEnvironmentalValue, newEnvironmentalValue, environmentalChangeCount);
      
      if (result.success) {
        alert(`${result.changed || 0} record aggiornati con successo: considerazione ambientale cambiata da "${selectedEnvironmentalValue}" a "${newEnvironmentalValue}"!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowEnvironmentalModal(false);
      } else {
        alert('Errore durante il cambio considerazione ambientale: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il cambio considerazione ambientale');
    } finally {
      setLoading(false);
    }
  };

  const openRemoveNAModal = () => {
    setShowRemoveNAModal(true);
  };

  const handleRemoveNARecords = async () => {
    // Conta quanti record hanno valori N/A nei campi principali
    const naRecords = surveyData.filter(item => 
      !item.initialSurvey?.age || 
      !item.initialSurvey?.gender || 
      !item.initialSurvey?.education || 
      !item.initialSurvey?.device || 
      !item.initialSurvey?.financial || 
      !item.initialSurvey?.frequency ||
      !item.orderData?.productTitle ||
      !item.orderData?.deliveryMethod ||
      !item.checkoutData?.variant
    );

    if (naRecords.length === 0) {
      alert('Nessun record con valori N/A trovato!');
      setShowRemoveNAModal(false);
      return;
    }

    if (!confirm(`Sei sicuro di voler rimuovere ${naRecords.length} record con valori N/A? Questa operazione non può essere annullata.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Esegui la rimozione dei record N/A dal database
      const result = await removeNARecordsFromDatabase();
      
      if (result.success) {
        alert(`${result.deleted || 0} record con valori N/A rimossi con successo dal database!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowRemoveNAModal(false);
      } else {
        alert('Errore durante la rimozione dei record N/A: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante la rimozione dei record N/A');
    } finally {
      setLoading(false);
    }
  };

  const openDeviceModal = () => {
    setShowDeviceModal(true);
    setSelectedDeviceValue('computer');
    setNewDeviceValue('smartphone');
    setDeviceChangeCount(1);
  };

  const handleChangeDevice = async () => {
    if (!selectedDeviceValue || !newDeviceValue) {
      alert('Seleziona sia il valore originale che quello nuovo');
      return;
    }

    if (selectedDeviceValue === newDeviceValue) {
      alert('Il valore originale e quello nuovo devono essere diversi');
      return;
    }

    if (deviceChangeCount <= 0) {
      alert('Inserisci un numero valido');
      return;
    }

    // Conta quanti record hanno il valore selezionato
    const availableCount = surveyData.filter(item => 
      item.initialSurvey?.device === selectedDeviceValue
    ).length;

    if (deviceChangeCount > availableCount) {
      alert(`Non ci sono abbastanza record. Disponibili: ${availableCount}`);
      return;
    }

    if (!confirm(`Sei sicuro di voler cambiare il dispositivo di ${deviceChangeCount} record da "${selectedDeviceValue}" a "${newDeviceValue}"? Questa operazione non può essere annullata.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Esegui il cambio dispositivo nel database
      const result = await changeDeviceOfRecords(selectedDeviceValue, newDeviceValue, deviceChangeCount);
      
      if (result.success) {
        alert(`${result.changed || 0} record aggiornati con successo: dispositivo cambiato da "${selectedDeviceValue}" a "${newDeviceValue}"!`);
        // Ricarica i dati per mostrare le modifiche
        await loadData();
        setShowDeviceModal(false);
      } else {
        alert('Errore durante il cambio dispositivo: ' + ((result.error ? String(result.error) : 'Errore sconosciuto') || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il cambio dispositivo');
    } finally {
      setLoading(false);
    }
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

  const exportExcelTextual = () => {
    if (surveyData.length === 0) {
      alert('Nessun dato da esportare');
      return;
    }

    const headers = [
      'Timestamp', 'SessionID', 'Age', 'Gender', 'Education', 'Device',
      'Financial', 'Frequency', 'ProductTitle', 'ProductID', 'DeliveryMethod',
      'DeliveryValue', 'CheckoutTimeSeconds', 'CheckoutVariant', 'CheckoutVariant_Code (ordinato)', 'CheckoutVariant_IsPreselected',
      'EnvironmentalConsideration', 'TotalTimeMinutes', 'ProductClicks',
      'StartedAt', 'CompletedAt'
    ];

    const initialLikertFields = [
      'get_tired', 'open_tabs', 'save_time', 'avoid_hassle', 'easy_compare',
      'end_up_sites', 'find_website', 'easy_shopping', 'download_files',
      'enjoy_shopping', 'buy_unavailable', 'stress_financial', 'confusing_structure'
    ];
    const finalLikertFields = [
      'feel_guilty', 'difficult_design', 'feel_responsible', 'difficult_options',
      'effort_understand', 'difficult_overview', 'feel_irresponsible', 'useful_descriptions'
    ];

    const headersWithSurveys = [
      ...headers,
      ...initialLikertFields.map(f => `initial_${f}`),
      ...finalLikertFields.map(f => `final_${f}`)
    ];

    const normalizeVariantTextual = (value: any): string => {
      const raw = (value ?? '').toString().trim();
      if (!raw) return '';
      return raw.replace('CO2', 'CO₂');
    };

    // Mappatura ordinata 1..9 richiesta
    const orderedVariantCodesTextual: Record<string, number> = {
      'Controllo': 1,
      'Standard': 2,
      'Standard (CC pre-selezionato)': 3,
      'Scelta ecologica': 4,
      'Scelta ecologica (CC pre-selezionato)': 5,
      'Emissioni CO₂ ridotte': 6,
      'Emissioni CO₂ ridotte (CC pre-selezionato)': 7,
      'Dettagli CO₂ completi': 8,
      'Dettagli CO₂ completi (CC pre-selezionato)': 9,
    };

    const getOrderedCodeTextual = (value: any): number => {
      const v = normalizeVariantTextual(value);
      return orderedVariantCodesTextual[v] ?? 0;
    };

    const isPreselectedTextual = (value: any): number => {
      const v = normalizeVariantTextual(value);
      return v.includes('(CC pre-selezionato)') ? 1 : 0;
    };

    const rows: (string | number)[][] = surveyData.map((item: any) => [
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
      getOrderedCodeTextual(item.checkoutData?.variant),
      isPreselectedTextual(item.checkoutData?.variant),
      item.finalSurvey?.environmental_consideration || '',
      item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) : '',
      item.productInteractions ? Object.values(item.productInteractions).reduce((sum: number, data: any) => sum + (data?.clickCount || 0), 0) : '',
      item.timestamp || '',
      item.completedAt || ''
    ]);

    const wb = XLSX.utils.book_new();
    const rowsWithSurveys: (string | number)[][] = surveyData.map((item: any) => {
      const base = [
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
        getOrderedCodeTextual(item.checkoutData?.variant),
        isPreselectedTextual(item.checkoutData?.variant),
        item.finalSurvey?.environmental_consideration || '',
        item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) : '',
        item.productInteractions ? Object.values(item.productInteractions).reduce((sum: number, data: any) => sum + (data?.clickCount || 0), 0) : '',
        item.timestamp || '',
        item.completedAt || ''
      ];
      const initialLikert = initialLikertFields.map((key) => {
        const v = item.initialSurvey?.[key];
        return typeof v === 'number' ? v : '';
      });
      const finalLikert = finalLikertFields.map((key) => {
        const v = item.finalSurvey?.[key];
        return typeof v === 'number' ? v : '';
      });
      return [...base, ...initialLikert, ...finalLikert];
    });

    const wsData = [headersWithSurveys, ...rowsWithSurveys];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Dati');

    // Aggregati: Tipi di Checkout vs Scelta Spedizione (conteggi per variante)
    if (stats) {
      const aggHeaders = ['Variante', 'Domicilio', 'Click & Collect', 'Totale'];
      const aggRows: (string | number)[][] = stats.deliveryByVariant.labels.map((label, idx) => {
        const home = stats.deliveryByVariant.home[idx] ?? 0;
        const cc = stats.deliveryByVariant.cc[idx] ?? 0;
        return [label, home, cc, home + cc];
      });
      const wsAgg = XLSX.utils.aoa_to_sheet([aggHeaders, ...aggRows]);
      XLSX.utils.book_append_sheet(wb, wsAgg, 'Conteggi per Variante');
    }

    // Analisi temporale: distribuzioni e medie
    if (stats) {
      const timeHeader = ['Range', 'Numero utenti'];
      const totalRows = stats.timeSpentRanges.labels.map((label, idx) => [label, stats.timeSpentRanges.data[idx] ?? 0]);
      const checkoutRows = stats.checkoutTimeRanges.labels.map((label, idx) => [label, stats.checkoutTimeRanges.data[idx] ?? 0]);

      const checkoutTimes = surveyData
        .map(i => i.orderData?.checkoutTimeSpent)
        .filter((v): v is number => typeof v === 'number');
      const totalTimes = surveyData
        .map(i => i.totalTimeSpent)
        .filter((v): v is number => typeof v === 'number');
      const avgCheckoutS = checkoutTimes.length ? Math.round(checkoutTimes.reduce((a, b) => a + b, 0) / checkoutTimes.length / 1000) : 0;
      const avgTotalMin = totalTimes.length ? Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length / 60000) : 0;

      const wsTime = XLSX.utils.aoa_to_sheet([
        ['Tempo Totale Speso'],
        timeHeader,
        ...totalRows,
        [''],
        ['Tempo nel Checkout'],
        timeHeader,
        ...checkoutRows,
        [''],
        ['Medie'],
        ['Media Checkout (s)', avgCheckoutS],
        ['Media Totale (min)', avgTotalMin]
      ]);
      XLSX.utils.book_append_sheet(wb, wsTime, 'Analisi Temporale');
    }

    const legendRows: (string | number)[][] = [
      ['Campo', 'Valori / Unità', 'Descrizione'],
      ['DeliveryValue', 'home | cc', 'home = domicilio, cc = Click & Collect'],
      ['CheckoutTimeSeconds', 'secondi', 'Tempo trascorso nel checkout'],
      ['TotalTimeMinutes', 'minuti', 'Tempo totale dall\'inizio alla fine'],
      ['StartedAt', 'ISO-8601', 'Timestamp inizio (ISO string)'],
      ['CompletedAt', 'ISO-8601', 'Timestamp fine (ISO string)'],
      ['initial_*', '1..7', 'Risposte scala Likert iniziale (1=min, 7=max)'],
      ['final_*', '1..7', 'Risposte survey finale (Likert 1=min, 7=max)'],
      ['EnvironmentalConsideration', 'Mai | Raramente | A volte | Spesso | Sempre', 'Considerazione ambientale']
    ];
    // Mappatura completa scala Likert 1-7
    legendRows.push(['', '', '']);
    legendRows.push(['Likert (initial_* / final_*)', 1, 'Fortemente in disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 2, 'Disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 3, 'Parzialmente in disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 4, 'Neutro/Indifferente']);
    legendRows.push(['Likert (initial_* / final_*)', 5, 'Parzialmente d\'accordo']);
    legendRows.push(['Likert (initial_* / final_*)', 6, 'D\'accordo']);
    legendRows.push(['Likert (initial_* / final_*)', 7, 'Fortemente d\'accordo']);

    const wsLegend = XLSX.utils.aoa_to_sheet(legendRows);
    XLSX.utils.book_append_sheet(wb, wsLegend, 'Legenda');

    XLSX.writeFile(wb, `survey-data-testuale-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportExcelNumeric = () => {
    if (surveyData.length === 0) {
      alert('Nessun dato da esportare');
      return;
    }

    const headers = [
      'TimestampEpochMs', 'SessionID_Code', 'Age_Code', 'Gender_Code', 'Education_Code', 'Device_Code',
      'Financial_Code', 'Frequency_Code', 'ProductTitle_Code', 'ProductID_Code', 'DeliveryMethod_Code',
      'DeliveryValue_Code', 'CheckoutTimeSeconds', 'CheckoutVariant', 'CheckoutVariant_Code (ordinato)', 'CheckoutVariant_IsPreselected',
      'EnvironmentalConsideration_Code', 'TotalTimeMinutes', 'ProductClicks',
      'StartedAtEpochMs', 'CompletedAtEpochMs'
    ];

    const initialLikertFields = [
      'get_tired', 'open_tabs', 'save_time', 'avoid_hassle', 'easy_compare',
      'end_up_sites', 'find_website', 'easy_shopping', 'download_files',
      'enjoy_shopping', 'buy_unavailable', 'stress_financial', 'confusing_structure'
    ];
    const finalLikertFields = [
      'feel_guilty', 'difficult_design', 'feel_responsible', 'difficult_options',
      'effort_understand', 'difficult_overview', 'feel_irresponsible', 'useful_descriptions'
    ];

    const headersWithSurveys = [
      ...headers,
      ...initialLikertFields.map(f => `initial_${f}`),
      ...finalLikertFields.map(f => `final_${f}`)
    ];

    const buildCodeMap = (values: (string | undefined | null)[]) => {
      const map = new Map<string, number>();
      let next = 1;
      values.forEach(v => {
        const key = (v ?? '').toString();
        if (key && !map.has(key)) map.set(key, next++);
      });
      return map;
    };

    const sessionIdMap = buildCodeMap(surveyData.map(i => i.sessionId));
    const ageMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.age));
    const genderMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.gender));
    const educationMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.education));
    const deviceMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.device));
    const financialMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.financial));
    const frequencyMap = buildCodeMap(surveyData.map(i => i.initialSurvey?.frequency));
    const productTitleMap = buildCodeMap(surveyData.map(i => i.orderData?.productTitle));
    const productIdMap = buildCodeMap(surveyData.map(i => i.orderData?.productId));
    const deliveryMethodMap = buildCodeMap(surveyData.map(i => i.orderData?.deliveryMethod));
    const deliveryValueMap = buildCodeMap(surveyData.map(i => i.orderData?.deliveryValue));
    const envConsiderationMap = buildCodeMap(surveyData.map(i => i.finalSurvey?.environmental_consideration));

    const codeOrZero = (map: Map<string, number>, value: any) => {
      const key = (value ?? '').toString();
      if (!key) return 0;
      return map.get(key) || 0;
    };

    // Normalizza stringa variante per allineare differenze (CO2 vs CO₂, spazi, maiuscole)
    const normalizeVariant = (value: any): string => {
      const raw = (value ?? '').toString().trim();
      if (!raw) return '';
      const co2Fixed = raw.replace('CO2', 'CO₂');
      return co2Fixed;
    };

    // Mappatura dettagliata (ordine fisso 1..9 per legenda dettagliata)
    const detailedVariantOrder: string[] = [
      'Standard (CC pre-selezionato)',
      'Emissioni CO₂ ridotte (CC pre-selezionato)',
      'Emissioni CO₂ ridotte',
      'Dettagli CO₂ completi',
      'Standard',
      'Controllo',
      'Dettagli CO₂ completi (CC pre-selezionato)',
      'Scelta ecologica (CC pre-selezionato)',
      'Scelta ecologica'
    ];

    const getCheckoutVariantDetailedCode = (value: any): number => {
      const v = normalizeVariant(value);
      const idx = detailedVariantOrder.indexOf(v);
      return idx >= 0 ? idx + 1 : 0; // 0 per valori non riconosciuti
    };

    // Codifica 1..9 richiesta (ordinato)
    const orderedVariantCodes: Record<string, number> = {
      'Controllo': 1,
      'Standard': 2,
      'Standard (CC pre-selezionato)': 3,
      'Scelta ecologica': 4,
      'Scelta ecologica (CC pre-selezionato)': 5,
      'Emissioni CO₂ ridotte': 6,
      'Emissioni CO₂ ridotte (CC pre-selezionato)': 7,
      'Dettagli CO₂ completi': 8,
      'Dettagli CO₂ completi (CC pre-selezionato)': 9,
    };

    const getCheckoutVariantOrderedCode = (value: any): number => {
      const v = normalizeVariant(value);
      return orderedVariantCodes[v] ?? 0;
    };

    const isPreselectedNumeric = (value: any): number => {
      const v = normalizeVariant(value);
      return v.includes('(CC pre-selezionato)') ? 1 : 0;
    };

    const rows: (string | number)[][] = surveyData.map((item: any) => {
      const base = [
        item.timestamp ? Date.parse(item.timestamp) : 0,
        codeOrZero(sessionIdMap, item.sessionId),
        codeOrZero(ageMap, item.initialSurvey?.age),
        codeOrZero(genderMap, item.initialSurvey?.gender),
        codeOrZero(educationMap, item.initialSurvey?.education),
        codeOrZero(deviceMap, item.initialSurvey?.device),
        codeOrZero(financialMap, item.initialSurvey?.financial),
        codeOrZero(frequencyMap, item.initialSurvey?.frequency),
        codeOrZero(productTitleMap, item.orderData?.productTitle),
        codeOrZero(productIdMap, item.orderData?.productId),
        codeOrZero(deliveryMethodMap, item.orderData?.deliveryMethod),
        codeOrZero(deliveryValueMap, item.orderData?.deliveryValue),
        item.orderData?.checkoutTimeSpent ? Math.round(item.orderData.checkoutTimeSpent / 1000) : 0,
        normalizeVariant(item.checkoutData?.variant),
        getCheckoutVariantOrderedCode(item.checkoutData?.variant),
        isPreselectedNumeric(item.checkoutData?.variant),
        codeOrZero(envConsiderationMap, item.finalSurvey?.environmental_consideration),
        item.totalTimeSpent ? Math.round(item.totalTimeSpent / 60000) : 0,
        item.productInteractions ? Object.values(item.productInteractions).reduce((sum: number, data: any) => sum + (data?.clickCount || 0), 0) : 0,
        item.timestamp ? Date.parse(item.timestamp) : 0,
        item.completedAt ? Date.parse(item.completedAt) : 0
      ];
      const initialLikert = initialLikertFields.map((key) => {
        const v = item.initialSurvey?.[key];
        return typeof v === 'number' ? v : 0;
      });
      const finalLikert = finalLikertFields.map((key) => {
        const v = item.finalSurvey?.[key];
        return typeof v === 'number' ? v : 0;
      });
      return [...base, ...initialLikert, ...finalLikert];
    });

    const wb = XLSX.utils.book_new();
    const wsData = [headersWithSurveys, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Dati');

    // Aggregati: Tipi di Checkout vs Scelta Spedizione (conteggi per variante)
    if (stats) {
      const aggHeaders = ['Variante', 'Domicilio', 'Click & Collect', 'Totale'];
      const aggRows: (string | number)[][] = stats.deliveryByVariant.labels.map((label, idx) => {
        const home = stats.deliveryByVariant.home[idx] ?? 0;
        const cc = stats.deliveryByVariant.cc[idx] ?? 0;
        return [label, home, cc, home + cc];
      });
      const wsAgg = XLSX.utils.aoa_to_sheet([aggHeaders, ...aggRows]);
      XLSX.utils.book_append_sheet(wb, wsAgg, 'Conteggi per Variante');
    }

    // Analisi temporale: distribuzioni e medie
    if (stats) {
      const timeHeader = ['Range', 'Numero utenti'];
      const totalRows = stats.timeSpentRanges.labels.map((label, idx) => [label, stats.timeSpentRanges.data[idx] ?? 0]);
      const checkoutRows = stats.checkoutTimeRanges.labels.map((label, idx) => [label, stats.checkoutTimeRanges.data[idx] ?? 0]);

      const checkoutTimes = surveyData
        .map(i => i.orderData?.checkoutTimeSpent)
        .filter((v): v is number => typeof v === 'number');
      const totalTimes = surveyData
        .map(i => i.totalTimeSpent)
        .filter((v): v is number => typeof v === 'number');
      const avgCheckoutS = checkoutTimes.length ? Math.round(checkoutTimes.reduce((a, b) => a + b, 0) / checkoutTimes.length / 1000) : 0;
      const avgTotalMin = totalTimes.length ? Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length / 60000) : 0;

      const wsTime = XLSX.utils.aoa_to_sheet([
        ['Tempo Totale Speso'],
        timeHeader,
        ...totalRows,
        [''],
        ['Tempo nel Checkout'],
        timeHeader,
        ...checkoutRows,
        [''],
        ['Medie'],
        ['Media Checkout (s)', avgCheckoutS],
        ['Media Totale (min)', avgTotalMin]
      ]);
      XLSX.utils.book_append_sheet(wb, wsTime, 'Analisi Temporale');
    }

    const legendRows: (string | number)[][] = [
      ['Campo', 'Codice', 'Valore']
    ];

    const pushLegend = (field: string, map: Map<string, number>) => {
      if (map.size === 0) return;
      legendRows.push([field, '', '']);
      Array.from(map.entries())
        .sort((a, b) => a[1] - b[1])
        .forEach(([val, code]) => legendRows.push([field, code, val]));
      legendRows.push(['', '', '']);
    };

    pushLegend('SessionID', sessionIdMap);
    pushLegend('Age', ageMap);
    pushLegend('Gender', genderMap);
    pushLegend('Education', educationMap);
    pushLegend('Device', deviceMap);
    pushLegend('Financial', financialMap);
    pushLegend('Frequency', frequencyMap);
    pushLegend('ProductTitle', productTitleMap);
    pushLegend('ProductID', productIdMap);
    pushLegend('DeliveryMethod', deliveryMethodMap);
    pushLegend('DeliveryValue', deliveryValueMap);
    // Legenda dettagliata fissa (1..9) nell'ordine richiesto
    legendRows.push(['', '', '']);
    legendRows.push(['CheckoutVariant (dettaglio)', '1', 'Standard (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant (dettaglio)', '2', 'Emissioni CO₂ ridotte (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant (dettaglio)', '3', 'Emissioni CO₂ ridotte']);
    legendRows.push(['CheckoutVariant (dettaglio)', '4', 'Dettagli CO₂ completi']);
    legendRows.push(['CheckoutVariant (dettaglio)', '5', 'Standard']);
    legendRows.push(['CheckoutVariant (dettaglio)', '6', 'Controllo']);
    legendRows.push(['CheckoutVariant (dettaglio)', '7', 'Dettagli CO₂ completi (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant (dettaglio)', '8', 'Scelta ecologica (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant (dettaglio)', '9', 'Scelta ecologica']);

    // Legenda "ordinato" 1..9 usata per CheckoutVariant_Code (ordinato) nel dataset
    legendRows.push(['', '', '']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 1, 'Controllo']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 2, 'Standard']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 3, 'Standard (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 4, 'Scelta ecologica']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 5, 'Scelta ecologica (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 6, 'Emissioni CO₂ ridotte']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 7, 'Emissioni CO₂ ridotte (CC pre-selezionato)']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 8, 'Dettagli CO₂ completi']);
    legendRows.push(['CheckoutVariant_Code (ordinato)', 9, 'Dettagli CO₂ completi (CC pre-selezionato)']);
    pushLegend('EnvironmentalConsideration', envConsiderationMap);

    // Unità e scale
    legendRows.push(['', '', '']);
    legendRows.push(['CheckoutTimeSeconds', '', 'secondi']);
    legendRows.push(['TotalTimeMinutes', '', 'minuti']);
    legendRows.push(['StartedAtEpochMs', '', 'millisecondi da Unix epoch']);
    legendRows.push(['CompletedAtEpochMs', '', 'millisecondi da Unix epoch']);
    // Mappatura completa scala Likert 1-7
    legendRows.push(['Likert (initial_* / final_*)', 1, 'Fortemente in disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 2, 'Disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 3, 'Parzialmente in disaccordo']);
    legendRows.push(['Likert (initial_* / final_*)', 4, 'Neutro/Indifferente']);
    legendRows.push(['Likert (initial_* / final_*)', 5, 'Parzialmente d\'accordo']);
    legendRows.push(['Likert (initial_* / final_*)', 6, 'D\'accordo']);
    legendRows.push(['Likert (initial_* / final_*)', 7, 'Fortemente d\'accordo']);

    const wsLegend = XLSX.utils.aoa_to_sheet(legendRows);
    XLSX.utils.book_append_sheet(wb, wsLegend, 'Legenda');

    XLSX.writeFile(wb, `survey-data-numerico-${new Date().toISOString().split('T')[0]}.xlsx`);
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
            {/*
            <button onClick={exportData} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>📥 Esporta CSV</button>
            <button onClick={openModifyModal} style={{ background: '#ff6b35', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>✏️ Modify Final Survey</button>
            <button onClick={handleUpdateVariants} style={{ background: '#ff6b35', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🔄 Aggiorna Varianti DB</button>
            <button onClick={handleUpdateVariants} style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>➡️ CC senza pallino → Controllo</button>
            <button onClick={handleAddRandomRecords} style={{ background: '#6f42c1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🎲 Aggiungi Record Casuali</button>
            <button onClick={handleDeleteVariant3} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🗑️ Elimina Variante "3"</button>
            <button onClick={handleDebugVariants} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🔍 Debug Varianti</button>
            <button onClick={handleAddClickCollectRecords} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>📦 Solo Click & Collect</button>
            <button onClick={handleDeleteControlloRecords} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🗑️ Elimina Controllo</button>
            <button onClick={handleAddControlloRecords} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🎯 Solo Controllo (60/40)</button>
            <button onClick={handleAddEmissioniCO2Records} style={{ background: '#20c997', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🌱 Emissioni CO₂ (60/40 + 80/20)</button>
            <button onClick={openDeleteModal} style={{ background: '#e83e8c', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginRight: '1rem' }}>🎯 Elimina N per Tipo</button>
            <button onClick={openDeliveryDeleteModal} style={{ background: '#fd7e14', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem' }}>📦 Elimina N per Spedizione</button>
            <button onClick={exportExcelTextual} style={{ background: '#ffc107', color: '#212529', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginLeft: '0.5rem' }}>📊 Excel Testuale</button>
            */}
            <button 
              onClick={exportExcelNumeric}
              style={{ 
                background: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                marginBottom: '1rem',
                marginLeft: '0.5rem'
              }}
            >
              🔢 Excel Numerico + Legenda
            </button>
            {/**
            <button onClick={openGenderChangeModal} style={{ background: '#6f42c1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginLeft: '0.5rem' }}>👤 Cambia Genere N Elementi</button>
            <button onClick={openEnvironmentalModal} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginLeft: '0.5rem' }}>🌱 Cambia Considerazione Ambientale</button>
            <button onClick={openRemoveNAModal} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginLeft: '0.5rem' }}>🗑️ Rimuovi Record N/A</button>
            <button onClick={openDeviceModal} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem', marginLeft: '0.5rem' }}>📱 Cambia Dispositivo</button>
            */}
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

      {/* Modale per eliminazione record */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              color: '#333',
              textAlign: 'center'
            }}>
              🗑️ Elimina Record per Tipo
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Seleziona Variante:
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                {availableVariants.variants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant} ({availableVariants.counts[variant]} record)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Numero di record da eliminare:
              </label>
              <input
                type="number"
                min="1"
                max={availableVariants.counts[selectedVariant] || 1}
                value={deleteCount}
                onChange={(e) => setDeleteCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.25rem'
              }}>
                Disponibili: {availableVariants.counts[selectedVariant] || 0} record
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteRecordsByType}
                disabled={loading || !selectedVariant || deleteCount <= 0}
                style={{
                  background: loading ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale per eliminazione record per tipo di spedizione */}
      {showDeliveryDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              color: '#333',
              textAlign: 'center'
            }}>
              📦 Elimina Record per Tipo di Spedizione
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Seleziona Tipo di Spedizione:
              </label>
              <select
                value={selectedDeliveryType}
                onChange={(e) => setSelectedDeliveryType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="home">
                  🏠 Consegna a domicilio ({deliveryCounts.home} record)
                </option>
                <option value="cc">
                  📦 Click & Collect ({deliveryCounts.cc} record)
                </option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Numero di record da eliminare (casuale):
              </label>
              <input
                type="number"
                min="1"
                max={selectedDeliveryType === 'home' ? deliveryCounts.home : deliveryCounts.cc}
                value={deliveryDeleteCount}
                onChange={(e) => setDeliveryDeleteCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.25rem'
              }}>
                Disponibili: {selectedDeliveryType === 'home' ? deliveryCounts.home : deliveryCounts.cc} record
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                I record verranno selezionati casualmente tra quelli del tipo scelto
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeliveryDeleteModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteRecordsByDeliveryType}
                disabled={loading || !selectedDeliveryType || deliveryDeleteCount <= 0}
                style={{
                  background: loading ? '#ccc' : '#fd7e14',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale per cambio genere */}
      {showGenderChangeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              Cambia Genere di N Elementi
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Genere Originale:
              </label>
              <select
                value={selectedOriginalGender}
                onChange={(e) => setSelectedOriginalGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="male">Maschio ({genderCounts.male} record)</option>
                <option value="female">Femmina ({genderCounts.female} record)</option>
                <option value="other">Altro ({genderCounts.other} record)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Nuovo Genere:
              </label>
              <select
                value={selectedNewGender}
                onChange={(e) => setSelectedNewGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="male">Maschio</option>
                <option value="female">Femmina</option>
                <option value="other">Altro</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Numero di elementi da cambiare:
              </label>
              <input
                type="number"
                min="1"
                max={selectedOriginalGender === 'male' ? genderCounts.male : 
                     selectedOriginalGender === 'female' ? genderCounts.female : 
                     genderCounts.other}
                value={genderChangeCount}
                onChange={(e) => setGenderChangeCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.25rem'
              }}>
                Disponibili: {selectedOriginalGender === 'male' ? genderCounts.male : 
                            selectedOriginalGender === 'female' ? genderCounts.female : 
                            genderCounts.other} record
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                I record verranno selezionati casualmente tra quelli del genere scelto
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowGenderChangeModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleChangeGender}
                disabled={loading || !selectedOriginalGender || !selectedNewGender || selectedOriginalGender === selectedNewGender || genderChangeCount <= 0}
                style={{
                  background: loading ? '#ccc' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Cambio in corso...' : 'Cambia Genere'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per modificare i dati */}
      {showModifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>
              ✏️ Modify Final Survey
            </h2>

            {/* Selezione numero di record */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                How many records do you want to modify?
              </label>
              <input
                type="number"
                min="1"
                max={surveyData.filter(item => item.finalSurvey).length}
                value={modifyCount}
                onChange={(e) => setModifyCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                Available: {surveyData.filter(item => item.finalSurvey).length} records with final survey
              </div>
            </div>

            {/* Selezione campi */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Which fields do you want to modify?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {[
                  { key: 'feel_guilty', label: 'feel guilty' },
                  { key: 'difficult_design', label: 'difficult design' },
                  { key: 'feel_responsible', label: 'feel responsible' },
                  { key: 'difficult_options', label: 'difficult options' },
                  { key: 'effort_understand', label: 'effort understand' },
                  { key: 'difficult_overview', label: 'difficult overview' },
                  { key: 'feel_irresponsible', label: 'feel irresponsible' },
                  { key: 'useful_descriptions', label: 'useful descriptions' }
                ].map(field => (
                  <label key={field.key} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.5rem',
                    background: selectedFields.includes(field.key) ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: selectedFields.includes(field.key) ? '2px solid #2196f3' : '2px solid transparent'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleFieldSelection(field.key)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Input valori */}
            {selectedFields.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Set new values (1-7):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {selectedFields.map(field => {
                    const fieldLabel = [
                      { key: 'feel_guilty', label: 'feel guilty' },
                      { key: 'difficult_design', label: 'difficult design' },
                      { key: 'feel_responsible', label: 'feel responsible' },
                      { key: 'difficult_options', label: 'difficult options' },
                      { key: 'effort_understand', label: 'effort understand' },
                      { key: 'difficult_overview', label: 'difficult overview' },
                      { key: 'feel_irresponsible', label: 'feel irresponsible' },
                      { key: 'useful_descriptions', label: 'useful descriptions' }
                    ].find(f => f.key === field)?.label || field;

                    return (
                      <div key={field}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                          {fieldLabel}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          value={newValues[field] || ''}
                          onChange={(e) => updateNewValue(field, parseInt(e.target.value) || 1)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pulsanti */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModifyModal}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={modifySurveyData}
                disabled={modifying || selectedFields.length === 0}
                style={{
                  background: modifying ? '#ccc' : '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: modifying ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {modifying ? 'Modifying...' : 'Modify Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale per cambio considerazione ambientale */}
      {showEnvironmentalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              🌱 Cambia Considerazione Ambientale
            </h3>
            
            {/* Debug info */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #dee2e6',
              fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                🔍 Debug - Valori nel Database:
              </div>
              <div style={{ color: '#666' }}>
                {(() => {
                  const uniqueValues = [...new Set(surveyData.map(item => item.finalSurvey?.environmental_consideration).filter(v => v !== undefined))];
                  return uniqueValues.map((value, index) => (
                    <div key={index}>
                      • "{value}" (tipo: {typeof value}) - {surveyData.filter(item => item.finalSurvey?.environmental_consideration === value).length} record
                    </div>
                  ));
                })()}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Valore Originale:
              </label>
              <select
                value={selectedEnvironmentalValue}
                onChange={(e) => setSelectedEnvironmentalValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="never">never ({surveyData.filter(item => item.finalSurvey?.environmental_consideration === 'never').length} record)</option>
                <option value="rarely">rarely ({surveyData.filter(item => item.finalSurvey?.environmental_consideration === 'rarely').length} record)</option>
                <option value="sometimes">sometimes ({surveyData.filter(item => item.finalSurvey?.environmental_consideration === 'sometimes').length} record)</option>
                <option value="often">often ({surveyData.filter(item => item.finalSurvey?.environmental_consideration === 'often').length} record)</option>
                <option value="always">always ({surveyData.filter(item => item.finalSurvey?.environmental_consideration === 'always').length} record)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Nuovo Valore:
              </label>
              <select
                value={newEnvironmentalValue}
                onChange={(e) => setNewEnvironmentalValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="never">never</option>
                <option value="rarely">rarely</option>
                <option value="sometimes">sometimes</option>
                <option value="often">often</option>
                <option value="always">always</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Numero di elementi da cambiare:
              </label>
              <input
                type="number"
                min="1"
                max={surveyData.filter(item => item.finalSurvey?.environmental_consideration === selectedEnvironmentalValue).length}
                value={environmentalChangeCount}
                onChange={(e) => setEnvironmentalChangeCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.25rem'
              }}>
                Disponibili: {surveyData.filter(item => item.finalSurvey?.environmental_consideration === selectedEnvironmentalValue).length} record
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                I record verranno selezionati casualmente tra quelli con il valore originale
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowEnvironmentalModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleChangeEnvironmental}
                disabled={loading || !selectedEnvironmentalValue || !newEnvironmentalValue || selectedEnvironmentalValue === newEnvironmentalValue || environmentalChangeCount <= 0}
                style={{
                  background: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Cambio in corso...' : 'Cambia Valore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale per rimozione record N/A */}
      {showRemoveNAModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              🗑️ Rimuovi Record con Valori N/A
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: '#666', lineHeight: '1.5' }}>
                Questa operazione rimuoverà tutti i record che hanno valori "N/A" nei campi principali:
              </p>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem', color: '#666' }}>
                <li>Età</li>
                <li>Genere</li>
                <li>Educazione</li>
                <li>Dispositivo</li>
                <li>Situazione finanziaria</li>
                <li>Frequenza acquisti</li>
                <li>Prodotto scelto</li>
                <li>Metodo di spedizione</li>
                <li>Variante checkout</li>
              </ul>
            </div>

            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
                📊 Statistiche Attuali:
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                • Record totali: {surveyData.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                • Record con N/A: {surveyData.filter(item => 
                  !item.initialSurvey?.age || 
                  !item.initialSurvey?.gender || 
                  !item.initialSurvey?.education || 
                  !item.initialSurvey?.device || 
                  !item.initialSurvey?.financial || 
                  !item.initialSurvey?.frequency ||
                  !item.orderData?.productTitle ||
                  !item.orderData?.deliveryMethod ||
                  !item.checkoutData?.variant
                ).length}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                • Record validi: {surveyData.filter(item => 
                  item.initialSurvey?.age && 
                  item.initialSurvey?.gender && 
                  item.initialSurvey?.education && 
                  item.initialSurvey?.device && 
                  item.initialSurvey?.financial && 
                  item.initialSurvey?.frequency &&
                  item.orderData?.productTitle &&
                  item.orderData?.deliveryMethod &&
                  item.checkoutData?.variant
                ).length}
              </div>
            </div>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: '#856404', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ⚠️ Attenzione
              </div>
              <div style={{ color: '#856404', fontSize: '0.9rem' }}>
                Questa operazione non può essere annullata. I record con valori N/A verranno eliminati definitivamente.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRemoveNAModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleRemoveNARecords}
                disabled={loading || surveyData.filter(item => 
                  !item.initialSurvey?.age || 
                  !item.initialSurvey?.gender || 
                  !item.initialSurvey?.education || 
                  !item.initialSurvey?.device || 
                  !item.initialSurvey?.financial || 
                  !item.initialSurvey?.frequency ||
                  !item.orderData?.productTitle ||
                  !item.orderData?.deliveryMethod ||
                  !item.checkoutData?.variant
                ).length === 0}
                style={{
                  background: loading ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Rimozione in corso...' : 'Rimuovi Record N/A'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale per cambio dispositivo */}
      {showDeviceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              📱 Cambia Dispositivo Utilizzato
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Dispositivo Originale:
              </label>
              <select
                value={selectedDeviceValue}
                onChange={(e) => setSelectedDeviceValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="computer">Computer ({surveyData.filter(item => item.initialSurvey?.device === 'computer').length} record)</option>
                <option value="smartphone">Smartphone ({surveyData.filter(item => item.initialSurvey?.device === 'smartphone').length} record)</option>
                <option value="tablet">Tablet ({surveyData.filter(item => item.initialSurvey?.device === 'tablet').length} record)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Nuovo Dispositivo:
              </label>
              <select
                value={newDeviceValue}
                onChange={(e) => setNewDeviceValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="computer">Computer</option>
                <option value="smartphone">Smartphone</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                Numero di elementi da cambiare:
              </label>
              <input
                type="number"
                min="1"
                max={surveyData.filter(item => item.initialSurvey?.device === selectedDeviceValue).length}
                value={deviceChangeCount}
                onChange={(e) => setDeviceChangeCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.25rem'
              }}>
                Disponibili: {surveyData.filter(item => item.initialSurvey?.device === selectedDeviceValue).length} record
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                I record verranno selezionati casualmente tra quelli con il dispositivo originale
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeviceModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleChangeDevice}
                disabled={loading || !selectedDeviceValue || !newDeviceValue || selectedDeviceValue === newDeviceValue || deviceChangeCount <= 0}
                style={{
                  background: loading ? '#ccc' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Cambio in corso...' : 'Cambia Dispositivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 