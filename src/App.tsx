import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Consent from './pages/Consent';
import SurveyIntro from './pages/SurveyIntro';
import SurveyInitial from './pages/SurveyInitial';
import SurveyLikert from './pages/SurveyLikert';
import Scenario from './pages/Scenario';
import Ecommerce from './pages/Ecommerce';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import FinalSurvey from './pages/FinalSurvey';
import Complete from './pages/Complete';
import Admin from './pages/Admin';
import Spiegazione from './pages/Spiegazione';
import type { SurveyStep, SurveyData } from './types';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState<SurveyStep>('consent');
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({
    timestamp: new Date().toISOString(),
    sessionId: 'session-' + Date.now(),
    surveyStartTime: Date.now()
  });

  const updateSurveyData = useCallback((data: Partial<SurveyData>) => {
    setSurveyData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = (step: SurveyStep) => {
    setCurrentStep(step);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <Consent 
              onNext={() => nextStep('intro')}
              updateSurveyData={updateSurveyData}
            />
          } />
          <Route path="/intro" element={
            <SurveyIntro 
              onNext={() => nextStep('initial')}
              updateSurveyData={updateSurveyData}
            />
          } />
          <Route path="/survey" element={
            <SurveyInitial 
              onNext={() => nextStep('likert')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/likert" element={
            <SurveyLikert 
              onNext={() => nextStep('scenario')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/scenario" element={
            <Scenario 
              onNext={() => nextStep('ecommerce')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/shop" element={
            <Ecommerce 
              onNext={() => nextStep('checkout')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/checkout" element={
            <Checkout 
              onNext={() => nextStep('success')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/success" element={
            <Success 
              onNext={() => nextStep('final')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/final-survey" element={
            <FinalSurvey 
              onNext={() => nextStep('complete')}
              updateSurveyData={updateSurveyData}
              surveyData={surveyData}
            />
          } />
          <Route path="/complete" element={
            <Complete 
              surveyData={surveyData}
            />
          } />
          <Route path="/admin" element={<Admin />} />
          <Route path="/spiegazione" element={<Spiegazione />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
