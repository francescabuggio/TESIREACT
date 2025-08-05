import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SurveyData } from '../types';
import './Consent.css';

interface ConsentProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
}

const Consent: React.FC<ConsentProps> = ({ onNext, updateSurveyData }) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const navigate = useNavigate();

  const handleConsent = () => {
    if (consentGiven) {
      updateSurveyData({
        consentGiven: true,
        consentTimestamp: new Date().toISOString()
      });
      onNext();
      navigate('/survey');
    }
  };

  return (
    <div className="consent-page">
      <div className="consent-container">
        <div className="consent-header">
          <h1 className="consent-title">
            Studio Universitario
          </h1>
          <div className="consent-divider"></div>
        </div>

        <div className="consent-content">
          <div className="info-section">
            <h2 className="section-title">
              Informazioni sullo Studio
            </h2>
            <p className="section-text">
              Questo è uno studio universitario condotto nel rispetto delle normative GDPR.
            </p>
          </div>

          <div className="principles-section">
            <h3 className="section-subtitle">
              Principi di Protezione dei Dati
            </h3>
            
            <div className="principles-grid">
              <div className="principle-card principle-anonymous">
                <h4 className="principle-title">✓ Anonimato Garantito</h4>
                <p className="principle-text">
                  I tuoi dati personali non verranno mai raccolti o associati alle tue risposte. 
                  Tutte le informazioni saranno completamente anonime.
                </p>
              </div>

              <div className="principle-card principle-no-right-wrong">
                <h4 className="principle-title">✓ Nessuna Risposta Giusta o Sbagliata</h4>
                <p className="principle-text">
                  Non esistono risposte corrette o errate. Siamo interessati solo alla tua 
                  opinione personale e alle tue esperienze.
                </p>
              </div>

              <div className="principle-card principle-gdpr">
                <h4 className="principle-title">✓ Conformità GDPR</h4>
                <p className="principle-text">
                  Questo studio rispetta completamente le normative europee sulla protezione 
                  dei dati personali (GDPR).
                </p>
              </div>

              <div className="principle-card principle-voluntary">
                <h4 className="principle-title">✓ Libertà di Partecipazione</h4>
                <p className="principle-text">
                  La tua partecipazione è completamente volontaria. Puoi ritirarti 
                  in qualsiasi momento senza conseguenze.
                </p>
              </div>
            </div>
          </div>

          <div className="expectations-section">
            <h3 className="section-subtitle">
              Cosa Aspettarsi
            </h3>
            <ul className="expectations-list">
              <li className="expectation-item">
                <span className="expectation-bullet">•</span>
                Compilazione di un breve questionario iniziale
              </li>
              <li className="expectation-item">
                <span className="expectation-bullet">•</span>
                Simulazione di un'esperienza di acquisto online
              </li>
              <li className="expectation-item">
                <span className="expectation-bullet">•</span>
                Questionario finale sui tuoi pensieri e sentimenti
              </li>
              <li className="expectation-item">
                <span className="expectation-bullet">•</span>
                Tempo stimato: circa 10-15 minuti
              </li>
            </ul>
          </div>
        </div>

        <div className="consent-section">
          <div className="consent-checkbox-container">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="consent-checkbox"
            />
            <label htmlFor="consent" className="consent-label">
              <span className="consent-label-title">
                Acconsento
              </span>
              <br />
              <span className="consent-label-text">
                Ho letto e compreso le informazioni sopra riportate. Acconsento a partecipare 
                volontariamente a questo studio universitario, consapevole che i miei dati 
                saranno trattati in forma anonima e nel rispetto delle normative GDPR.
              </span>
            </label>
          </div>
        </div>

        <div className="consent-button-container">
          <button
            onClick={handleConsent}
            disabled={!consentGiven}
            className={`consent-button ${consentGiven ? 'consent-button-active' : 'consent-button-disabled'}`}
          >
            {consentGiven ? 'Inizia lo Studio' : 'Seleziona "Acconsento" per continuare'}
          </button>
        </div>

        <div className="consent-footer">
          <p className="consent-footer-text">
            Per domande o chiarimenti, contatta i ricercatori responsabili dello studio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Consent; 