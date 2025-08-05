import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SurveyData, LikertAnswer } from '../types';
import { likertQuestions, LIKERT_PER_PAGE } from '../data/surveyData';
import { shuffleArray } from '../utils/shuffle';

interface SurveyLikertProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const SurveyLikert = ({ updateSurveyData, surveyData }: SurveyLikertProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<LikertAnswer>({});
  const [randomizedLikertQuestions, setRandomizedLikertQuestions] = useState<typeof likertQuestions>([]);

  // Randomize Likert questions on component mount
  useEffect(() => {
    setRandomizedLikertQuestions(shuffleArray(likertQuestions));
  }, []);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPage < likertGroups.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      // Likert completato - salva direttamente in initialSurvey
      updateSurveyData({
        initialSurvey: {
          ...(surveyData.initialSurvey || {}),
          ...answers
        }
      });
      navigate('/scenario');
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Don't render until questions are randomized
  if (randomizedLikertQuestions.length === 0) {
    return <div>Caricamento...</div>;
  }

  // Dividi domande Likert in gruppi
  const likertGroups = [];
  for (let i = 0; i < randomizedLikertQuestions.length; i += LIKERT_PER_PAGE) {
    likertGroups.push(randomizedLikertQuestions.slice(i, i + LIKERT_PER_PAGE));
  }

  const currentQuestions = likertGroups[currentPage];
  const totalPages = likertGroups.length;
  const progressPercent = ((currentPage + 1) / totalPages) * 100;
  
  const allCurrentAnswered = currentQuestions.every(q => answers[q.id] !== undefined);

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h1>SONDAGGIO ECOMMERCE - UNITO</h1>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="question-group">
        <div className="question-title">
          Indica quanto sei d'accordo con ciascuna delle seguenti affermazioni:
          <span style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginTop: '0.5rem' }}>
            (Pagina {currentPage + 1} di {totalPages})
          </span>
        </div>
        
        {/* Legenda */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem', 
          fontSize: '0.85rem' 
        }}>
          <strong>Legenda:</strong><br />
          <span className="likert-legend-desktop">
            1 = Totalmente in disaccordo | 2 = Molto in disaccordo | 3 = Abbastanza in disaccordo | 
            4 = Né d'accordo né in disaccordo | 5 = Abbastanza d'accordo | 6 = Molto d'accordo | 7 = Totalmente d'accordo
          </span>
          <span className="likert-legend-mobile">
            1=Tot.disaccordo | 2=Molto disaccordo | 3=Abb.disaccordo | 4=Neutro | 5=Abb.accordo | 6=Molto accordo | 7=Tot.accordo
          </span>
        </div>
        
        <table className="likert-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="likert-question-header" style={{ width: '60%', textAlign: 'left', padding: '0.8rem', background: '#f8f9fa' }}>
                Affermazione
              </th>
              {[1,2,3,4,5,6,7].map(value => (
                <th key={value} className="likert-scale-header" style={{ width: '5.7%', textAlign: 'center', padding: '0.8rem', background: '#f8f9fa' }}>
                  {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentQuestions.map(q => (
              <tr key={q.id}>
                <td className="likert-question-cell" style={{ padding: '0.8rem', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                  {q.text}
                </td>
                {[1,2,3,4,5,6,7].map(value => (
                  <td key={value} className="likert-scale-cell" style={{ padding: '0.8rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={value} 
                      onChange={() => handleAnswer(q.id, value)}
                      checked={answers[q.id] === value}
                      className="likert-radio"
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-survey btn-prev" 
            onClick={handlePrev}
            disabled={currentPage === 0}
            style={{ 
              padding: '0.8rem 1.5rem', 
              border: '2px solid #8b6952', 
              background: 'transparent', 
              color: '#8b6952', 
              borderRadius: '8px', 
              cursor: 'pointer',
              opacity: currentPage === 0 ? 0.5 : 1
            }}
          >
            ← Precedente
          </button>
          
          <button 
            className="btn-survey btn-next" 
            onClick={handleNext}
            disabled={!allCurrentAnswered}
            style={{ 
              padding: '0.8rem 1.5rem', 
              background: allCurrentAnswered ? '#8b6952' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: allCurrentAnswered ? 'pointer' : 'not-allowed'
            }}
          >
            {currentPage === totalPages - 1 ? 'Completa' : 'Successivo →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyLikert; 