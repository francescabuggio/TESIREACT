import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SurveyData, InitialSurvey } from '../types';
import { surveyQuestions } from '../data/surveyData';
import { shuffleArray } from '../utils/shuffle';

interface SurveyInitialProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const SurveyInitial = ({ updateSurveyData }: SurveyInitialProps) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<InitialSurvey>>({});
  const [randomizedQuestions, setRandomizedQuestions] = useState<typeof surveyQuestions>([]);

  // Randomize questions on component mount
  useEffect(() => {
    setRandomizedQuestions(shuffleArray(surveyQuestions));
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < randomizedQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Survey completato
      updateSurveyData({
        initialSurvey: answers as InitialSurvey,
        initialSurveyCompletedAt: new Date().toISOString()
      });
      navigate('/likert');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Don't render until questions are randomized
  if (randomizedQuestions.length === 0) {
    return <div>Caricamento...</div>;
  }

  const currentQ = randomizedQuestions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / randomizedQuestions.length) * 100;
  const hasAnswer = answers[currentQ.id];

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
        <div className="question-title">{currentQ.title}</div>
        <div className="radio-group">
          {currentQ.options.map(option => (
            <div 
              key={option.value}
              className={`radio-option ${answers[currentQ.id] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(currentQ.id, option.value)}
            >
              <input 
                type="radio" 
                id={`${currentQ.id}_${option.value}`}
                name={currentQ.id}
                value={option.value}
                checked={answers[currentQ.id] === option.value}
                onChange={() => handleAnswer(currentQ.id, option.value)}
              />
              <label htmlFor={`${currentQ.id}_${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="survey-buttons">
        <button 
          className="btn-survey btn-prev" 
          onClick={handlePrev}
          disabled={currentQuestion <= 0}
        >
          Indietro
        </button>
        <button 
          className="btn-survey btn-next" 
          onClick={handleNext}
          disabled={!hasAnswer}
        >
          {currentQuestion === randomizedQuestions.length - 1 ? 'Completa' : 'Avanti'}
        </button>
      </div>
    </div>
  );
};

export default SurveyInitial; 