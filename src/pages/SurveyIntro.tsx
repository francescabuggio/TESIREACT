import { useNavigate } from 'react-router-dom';
import type { SurveyData } from '../types';

interface SurveyIntroProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
}

const SurveyIntro = ({ onNext, updateSurveyData }: SurveyIntroProps) => {
  const navigate = useNavigate();

  const handleStart = () => {
    updateSurveyData({
      initialSurveyCompletedAt: new Date().toISOString()
    });
    navigate('/survey');
  };

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h1>SONDAGGIO ECOMMERCE - UNITO</h1>
      </div>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#8b6952', marginBottom: '2rem' }}>Caro partecipante,</h2>
        <div style={{ 
          background: 'rgba(255,248,240,0.8)', 
          padding: '2rem', 
          borderRadius: '16px', 
          marginBottom: '2rem', 
          borderLeft: '4px solid #8b6952' 
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            La compilazione del questionario richiederà <strong>5-6 minuti</strong>. La partecipazione a questo studio non 
            è obbligatoria; il questionario è completamente anonimo e i dati saranno utilizzati 
            esclusivamente per la ricerca.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic' }}>
            In questo questionario non ci sono risposte giuste o sbagliate: ci interessano solo 
            le tue opinioni e preferenze.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#d4951a', fontWeight: 'bold' }}>
            Sei pregato di portarlo alla fine.
          </p>
        </div>
        <button 
          className="btn-survey btn-next" 
          onClick={handleStart}
          style={{ 
            background: '#8b6952', 
            padding: '1rem 2rem', 
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Inizia il questionario
        </button>
      </div>
    </div>
  );
};

export default SurveyIntro; 