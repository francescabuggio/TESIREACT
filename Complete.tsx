import { useEffect, useRef } from 'react';
import type { SurveyData } from '../types';
import { saveSurveyData } from '../lib/supabase';

interface CompleteProps {
  surveyData: Partial<SurveyData>;
}

const Complete = ({ surveyData }: CompleteProps) => {
  const hasSaved = useRef(false);

  useEffect(() => {
    // Evita il doppio salvataggio
    if (hasSaved.current) {
      return;
    }

    // Controlla se questa survey è già stata salvata
    const sessionId = surveyData.sessionId;
    if (!sessionId) {
      console.error('SessionId mancante, impossibile salvare');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem('surveyData') || '[]');
    const alreadySaved = existingData.some((item: any) => item.sessionId === sessionId);
    if (alreadySaved) {
      console.log('Survey già salvata, saltando...');
      hasSaved.current = true;
      return;
    }

    // Combina initialSurvey e likertAnswers come nel sito originale
    const combinedInitialSurvey = {
      ...surveyData.initialSurvey,
      ...surveyData.likertAnswers
    };

    // Salva i dati completi con la struttura corretta
    const completeData: SurveyData = {
      ...surveyData,
      initialSurvey: combinedInitialSurvey,
      totalTimeSpent: Date.now() - (surveyData.surveyStartTime || Date.now()),
      completedAt: new Date().toISOString()
    } as SurveyData;

    // Rimuovi likertAnswers separato per evitare duplicazione
    delete (completeData as any).likertAnswers;

    // Salva i dati nel localStorage per sviluppo
    existingData.push(completeData);
    localStorage.setItem('surveyData', JSON.stringify(existingData));

    // Log per debug
    console.log('Survey completato:', completeData);
    
    // Salva i dati su Supabase
    saveSurveyData(completeData).then(result => {
      if (result.success) {
        console.log('Dati salvati su Supabase:', result.data);
        hasSaved.current = true;
      } else {
        console.error('Errore nel salvataggio su Supabase:', result.error);
      }
    });
  }, [surveyData]);

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h1>SONDAGGIO ECOMMERCE - UNITO</h1>
      </div>
      <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
          We thank you for your time spent taking this survey.
        </p>
        <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6' }}>
          Your response has been recorded.
        </p>
      </div>
    </div>
  );
};

export default Complete; 