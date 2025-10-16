import { useNavigate, useLocation } from 'react-router-dom';
import type { SurveyData, OrderData } from '../types';

interface SuccessProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const Success = ({ onNext, updateSurveyData, surveyData }: SuccessProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData as OrderData;

  const handleContinue = () => {
    navigate('/final-survey');
  };

  if (!orderData) {
    navigate('/shop');
    return null;
  }

  return (
    <>
      <header>
        <h1>Terracotta Dreams</h1>
      </header>
      <div className="container">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2 className="success-title">MOCKUP STORE TERMINATO</h2>
          <p className="success-message">
            Hai completato con successo la simulazione dell'esperienza di acquisto online.
          </p>
          
          <div className="order-summary">
            <h5>RIEPILOGO ORDINE</h5>
            <p><strong>Prodotto:</strong> {orderData.productTitle}</p>
            <p><strong>Prezzo:</strong> {orderData.productPrice}</p>
            <p><strong>Spedizione:</strong> {orderData.shippingAddress}</p>
            <p><strong>Modalità:</strong> {orderData.deliveryMethod}</p>
            <p><strong>Numero ordine:</strong> #{Math.floor(Math.random() * 100000)}</p>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1.5rem 0',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
              <strong>Prossimo step:</strong> Adesso ci sarà una survey finale. 
              Sei pregato di completarla per finalizzare la partecipazione allo studio.
            </p>
          </div>
          
          <button className="btn btn-primary" onClick={handleContinue}>
            Inizia Survey Finale
          </button>
        </div>
      </div>
    </>
  );
};

export default Success; 