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
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Ordine Completato!</h2>
          <p className="success-message">
            Ciao {orderData.firstName}! Il tuo ordine è stato ricevuto con successo.<br />
            Riceverai una email di conferma a breve.
          </p>
          
          <div className="order-summary">
            <h5>Riepilogo Ordine</h5>
            <p><strong>Prodotto:</strong> {orderData.productTitle}</p>
            <p><strong>Prezzo:</strong> {orderData.productPrice}</p>
            <p><strong>Spedizione:</strong> {orderData.shippingAddress}</p>
            <p><strong>Modalità:</strong> {orderData.deliveryMethod}</p>
            <p><strong>Numero ordine:</strong> #{Math.floor(Math.random() * 100000)}</p>
          </div>
          
          <button className="btn btn-primary" onClick={handleContinue}>
            Continua
          </button>
        </div>
      </div>
    </>
  );
};

export default Success; 