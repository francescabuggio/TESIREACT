import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SurveyData, FinalSurveyData } from '../types';
import { finalSurveyQuestions, finalLikertQuestions } from '../data/surveyData';
import { shuffleArray } from '../utils/shuffle';

interface FinalSurveyProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const FinalSurvey = ({ updateSurveyData }: FinalSurveyProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Partial<FinalSurveyData>>({});
  const [randomizedLikertQuestions, setRandomizedLikertQuestions] = useState<typeof finalLikertQuestions>([]);

  // Randomize Likert questions on component mount
  useEffect(() => {
    setRandomizedLikertQuestions(shuffleArray(finalLikertQuestions));
  }, []);

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPage === 0) {
      // Prima pagina completata, vai alla seconda
      setCurrentPage(1);
    } else {
      // Survey finale completato
      updateSurveyData({
        finalSurvey: answers as FinalSurveyData,
        finalSurveyCompletedAt: new Date().toISOString()
      });
      navigate('/complete');
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (currentPage === 0) {
    // Prima pagina - domanda singola
    const question = finalSurveyQuestions[0];
    const hasAnswer = answers[question.id];

    return (
      <div className="survey-container">
        <div className="survey-header">
          <h1>SONDAGGIO ECOMMERCE - UNITO</h1>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '50%' }}></div>
        </div>
        <div className="question-group">
          <div className="question-title">{question.title}</div>
          {question.subtitle && (
            <div style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#555' }}>
              {question.subtitle}
            </div>
          )}
          
          {/* Legenda */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem', 
            fontSize: '0.85rem' 
          }}>
            <strong>Legenda:</strong><br />
            Mai | Raramente | A volte | Spesso | Sempre
          </div>
          
          <table className="likert-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '60%', textAlign: 'left', padding: '0.8rem', background: '#f8f9fa' }}>
                  Frequenza
                </th>
                {question.options.map(opt => (
                  <th key={opt.value} style={{ width: '8%', textAlign: 'center', padding: '0.8rem', background: '#f8f9fa' }}>
                    {opt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.8rem', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                  Considerazione ambientale
                </td>
                {question.options.map(opt => (
                  <td key={opt.value} style={{ padding: '0.8rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <input 
                      type="radio" 
                      name={question.id} 
                      value={opt.value} 
                      onChange={() => handleAnswer(question.id, opt.value)}
                      checked={answers[question.id] === opt.value}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="survey-buttons">
          <button 
            className="btn-survey btn-next" 
            onClick={handleNext}
            disabled={!hasAnswer}
          >
            Avanti
          </button>
        </div>
      </div>
    );
  }

  // Don't render until questions are randomized
  if (randomizedLikertQuestions.length === 0) {
    return <div>Caricamento...</div>;
  }

  // Seconda pagina - domande Likert
  const finalLikertGroups = [];
  const LIKERT_PER_PAGE = 5;
  for (let i = 0; i < randomizedLikertQuestions.length; i += LIKERT_PER_PAGE) {
    finalLikertGroups.push(randomizedLikertQuestions.slice(i, i + LIKERT_PER_PAGE));
  }

  const currentQuestions = finalLikertGroups[currentPage - 1];
  const totalPages = finalLikertGroups.length + 1; // +1 per la prima pagina
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
            (Pagina {currentPage} di {totalPages - 1})
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
          1 = Totalmente in disaccordo | 2 = Molto in disaccordo | 3 = Abbastanza in disaccordo | 
          4 = Né d'accordo né in disaccordo | 5 = Abbastanza d'accordo | 6 = Molto d'accordo | 7 = Totalmente d'accordo
        </div>
        
        <table className="likert-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '60%', textAlign: 'left', padding: '0.8rem', background: '#f8f9fa' }}>
                Affermazione
              </th>
              {[0,1,2,3,4,5,6].map(i => (
                <th key={i} style={{ width: '5.7%', textAlign: 'center', padding: '0.8rem', background: '#f8f9fa' }}>
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentQuestions.map(q => (
              <tr key={q.id}>
                <td style={{ padding: '0.8rem', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                  {q.text}
                </td>
                {[0,1,2,3,4,5,6].map(i => (
                  <td key={i} style={{ padding: '0.8rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={i} 
                      onChange={() => handleAnswer(q.id, i)}
                      checked={answers[q.id] === i}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="survey-buttons">
        <button 
          className="btn-survey btn-prev" 
          onClick={handlePrev}
        >
          Indietro
        </button>
        {currentPage === totalPages - 1 ? (
          <button 
            className="btn-survey btn-submit" 
            onClick={handleNext}
            disabled={!allCurrentAnswered}
          >
            Completa questionario
          </button>
        ) : (
          <button 
            className="btn-survey btn-next" 
            onClick={handleNext}
            disabled={!allCurrentAnswered}
          >
            Avanti
          </button>
        )}
      </div>
    </div>
  );
};

export default FinalSurvey; 