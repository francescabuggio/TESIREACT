import { useNavigate } from 'react-router-dom';
import type { SurveyData } from '../types';

interface ScenarioProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const Scenario = ({ updateSurveyData }: ScenarioProps) => {
  const navigate = useNavigate();

  const handleStartEcommerce = () => {
    updateSurveyData({
      ecommerceStartedAt: new Date().toISOString()
    });
    navigate('/shop');
  };

  return (
    <div className="scenario-container">
      <h2 className="scenario-title">Descrizione Scenario</h2>
      <div className="scenario-content">
        <p className="scenario-text">
          «È <span className="scenario-highlight">domenica mattina</span>. Hai ricevuto via e-mail un 
          <span className="scenario-highlight"> buono regalo da 50 €</span> da usare sullo shop di ceramiche 
          <span className="shop-name"> Terracotta Dreams</span> entro <span className="scenario-highlight">72 ore</span>. 
          La tua migliore amica compie <span className="scenario-highlight">30 anni sabato prossimo</span>, e 
          sta arredando la sua nuova casa. Vorresti regalarle un pezzo di ceramica artigianale 
          che possa valorizzare la sua cucina.»
        </p>
      </div>
      <button className="scenario-button" onClick={handleStartEcommerce}>
        Esplora Terracotta Dreams 🏺
      </button>
    </div>
  );
};

export default Scenario; 