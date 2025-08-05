import type { SurveyQuestion, LikertQuestion, Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    title: "CERAMICA 1",
    price: "€29,90",
    image: "/product1.png",
    description: "Tazza artigianale in ceramica con delicati puntini neri. Ogni pezzo è unico, modellato a mano con argilla locale di alta qualità. Perfetta per il tuo rituale del caffè mattutino."
  },
  {
    id: 2,
    title: "CERAMICA 2", 
    price: "€29,90",
    image: "/product2.png",
    description: "Elegante set di due ciotole in ceramica con affascinante pattern splash blu. Ideali per servire o come raffinato elemento decorativo. Realizzate con smalti naturali."
  },
  {
    id: 3,
    title: "CERAMICA 3",
    price: "€29,90",
    image: "/product3.png",
    description: "Straordinaria teiera artigianale con suggestivo effetto galaxy. Argilla nera impreziosita da riflessi dorati. Un vero pezzo d'arte per le tue cerimonie del tè."
  }
];

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'age',
    title: 'Qual è la tua fascia d\'età?',
    type: 'radio',
    options: [
      { value: 'under18', label: '<18' },
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55-64', label: '55-64' }
    ]
  },
  {
    id: 'gender',
    title: 'Di che genere sei?',
    type: 'radio',
    options: [
      { value: 'male', label: 'Maschile' },
      { value: 'female', label: 'Femminile' },
      { value: 'other', label: 'Altro' }
    ]
  },
  {
    id: 'education',
    title: 'Qual è il tuo livello di istruzione più elevato?',
    type: 'radio',
    options: [
      { value: 'elementary', label: 'Elementari' },
      { value: 'middle', label: 'Medie' },
      { value: 'diploma', label: 'Diploma' },
      { value: 'bachelor', label: 'Laurea di I livello' },
      { value: 'master', label: 'Laurea di II livello' },
      { value: 'other', label: 'Oltre' }
    ]
  },
  {
    id: 'device',
    title: 'Con quale dispositivo effettui più frequentemente acquisti online?',
    type: 'radio',
    options: [
      { value: 'smartphone', label: 'Smartphone' },
      { value: 'computer', label: 'Computer (desktop/laptop)' },
      { value: 'tablet', label: 'Tablet' }
    ]
  },
  {
    id: 'financial',
    title: 'Come descriveresti la tua situazione finanziaria? Con il mio reddito...',
    type: 'radio',
    options: [
      { value: 'struggle', label: 'Faccio fatica ad arrivare a fine mese' },
      { value: 'cover', label: 'Riesco solo a coprire le spese' },
      { value: 'save', label: 'Guadagno abbastanza da risparmiare o permettermi qualche extra' },
      { value: 'buy', label: 'Guadagno abbastanza da poter comprare (quasi) tutto ciò che voglio' }
    ]
  },
  {
    id: 'frequency',
    title: 'Quanto spesso effettui acquisti online?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Mai' },
      { value: 'yearly', label: 'Una volta all\'anno' },
      { value: 'monthly', label: 'Una volta al mese' },
      { value: 'few-monthly', label: 'Qualche volta al mese' },
      { value: 'weekly', label: 'Una volta a settimana' }
    ]
  }
];

export const likertQuestions: LikertQuestion[] = [
  {
    id: 'stress_financial',
    text: 'Quanto senti di essere stressato/a dalla tua situazione finanziaria attuale?'
  },
  {
    id: 'download_files',
    text: 'So come aprire i file che ho scaricato'
  },
  {
    id: 'open_tabs',
    text: 'So come aprire una nuova scheda nel mio Browser'
  },
  {
    id: 'find_website',
    text: 'Ho difficoltà a ritrovare un sito web che ho visitato in precedenza'
  },
  {
    id: 'get_tired',
    text: 'Mi stanco facilmente quando cerco informazioni online'
  },
  {
    id: 'end_up_sites',
    text: 'Mi capita di finire su siti web senza sapere come ci sono arrivato/a'
  },
  {
    id: 'confusing_structure',
    text: 'Trovo confusa la struttura della maggior parte dei siti web'
  },
  {
    id: 'easy_shopping',
    text: 'È facile fare acquisti online'
  },
  {
    id: 'buy_unavailable',
    text: 'Online posso acquistare prodotti che non sono disponibili nei negozi fisici'
  },
  {
    id: 'save_time',
    text: 'Fare acquisti online fa risparmiare tempo'
  },
  {
    id: 'easy_compare',
    text: 'È più facile confrontare i prodotti online'
  },
  {
    id: 'avoid_hassle',
    text: 'Fare acquisti online evita il fastidio di andare in negozio'
  },
  {
    id: 'enjoy_shopping',
    text: 'Mi piace fare acquisti online perché posso farlo in qualsiasi momento della giornata o della notte'
  }
];

export const likertScale = [
  'Totalmente in disaccordo',
  'Molto in disaccordo', 
  'Abbastanza in disaccordo',
  'Né d\'accordo né in disaccordo',
  'Abbastanza d\'accordo',
  'Molto d\'accordo',
  'Totalmente d\'accordo'
];

export const finalSurveyQuestions = [
  {
    id: 'environmental_consideration',
    title: 'Indica con quale frequenza ti riconosci nella seguente affermazione:',
    subtitle: 'Tengo in considerazione il potenziale impatto ambientale delle mie azioni quando prendo la maggior parte delle mie decisioni',
    type: 'radio' as const,
    options: [
      { value: 'never', label: 'Mai' },
      { value: 'rarely', label: 'Raramente' },
      { value: 'sometimes', label: 'A volte' },
      { value: 'often', label: 'Spesso' },
      { value: 'always', label: 'Sempre' }
    ]
  }
];

export const finalLikertQuestions: LikertQuestion[] = [
  {
    id: 'feel_irresponsible',
    text: 'Mi sentirei irresponsabile se non scegliessi l\'opzione di consegna più sostenibile'
  },
  {
    id: 'feel_guilty',
    text: 'Mi sentirei in colpa se non scegliessi l\'opzione di consegna più sostenibile'
  },
  {
    id: 'feel_responsible',
    text: 'Mi sentirei responsabile se non contribuissi a proteggere l\'ambiente'
  },
  {
    id: 'difficult_overview',
    text: 'È stato difficile avere una visione d\'insieme delle opzioni di consegna'
  },
  {
    id: 'difficult_design',
    text: 'Il design della pagina ha reso difficile trovare rapidamente le informazioni rilevanti'
  },
  {
    id: 'effort_understand',
    text: 'Ho dovuto fare uno sforzo per comprendere le opzioni di consegna prima di scegliere'
  },
  {
    id: 'difficult_options',
    text: 'Le opzioni di consegna erano difficili da comprendere durante la fase di checkout'
  },
  {
    id: 'useful_descriptions',
    text: 'Le descrizioni relative alle opzioni di consegna sono state utili per la mia scelta'
  }
];

export const finalLikertScale = [
  'Totalmente in disaccordo',
  'Molto in disaccordo',
  'Abbastanza in disaccordo',
  'Né d\'accordo né in disaccordo',
  'Abbastanza d\'accordo',
  'Molto d\'accordo',
  'Totalmente d\'accordo'
];

export const LIKERT_PER_PAGE = 5; 