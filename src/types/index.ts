export interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  description: string;
}

export interface SurveyAnswer {
  [key: string]: string | number;
}

export interface InitialSurvey extends SurveyAnswer {
  age?: string;
  gender?: string;
  education?: string;
  device?: string;
  financial?: string;
  frequency?: string;
  // Likert scale questions
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
}

export interface LikertAnswer {
  [key: string]: number;
}

export interface FinalSurveyData extends SurveyAnswer {
  environmental_consideration: string;
  feel_guilty?: number;
  difficult_design?: number;
  feel_responsible?: number;
  difficult_options?: number;
  effort_understand?: number;
  difficult_overview?: number;
  feel_irresponsible?: number;
  useful_descriptions?: number;
}

export interface ProductInteraction {
  firstClickAt: string;
  clickCount: number;
}

export interface CheckoutData {
  product: Product;
  variant: string;
  checkoutStartedAt: string;
  productClickData?: ProductInteraction;
}

export interface OrderData {
  firstName: string;
  lastName: string;
  shippingAddress: string;
  productTitle: string;
  productPrice: string;
  productId: number;
  deliveryMethod: string;
  deliveryValue: string;
  checkoutTimeSpent?: number;
  orderCompletedAt: string;
}

export interface SurveyData {
  timestamp: string;
  sessionId: string;
  surveyStartTime?: number;
  initialSurvey?: InitialSurvey;
  checkoutData?: CheckoutData;
  orderData?: OrderData;
  finalSurvey?: FinalSurveyData;
  productInteractions?: { [key: number]: ProductInteraction };
  totalTimeSpent?: number;
  completedAt?: string;
  initialSurveyCompletedAt?: string;
  ecommerceStartedAt?: string;
  finalSurveyCompletedAt?: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  type: 'radio';
  options: Array<{
    value: string;
    label: string;
  }>;
}

export interface LikertQuestion {
  id: string;
  text: string;
}

export type SurveyStep = 'intro' | 'initial' | 'likert' | 'scenario' | 'ecommerce' | 'checkout' | 'success' | 'final' | 'complete'; 