import React from 'react';
import '../App.css';

const sections = [
  {
    icon: '⚛️',
    title: 'React e Vite',
    colorClass: 'spiegazione-react',
    content: [
      'Il sito è stato creato usando React e Vite.',
      'React è uno strumento che serve per costruire siti web moderni e interattivi, come quelli con cui puoi cliccare, muoverti tra pagine, scrivere in moduli, ecc.',
      'Vite è un programma che aiuta a far partire il sito in modo veloce durante lo sviluppo, così chi lo sta creando può vedere subito le modifiche mentre lavora.'
    ]
  },
  {
    icon: '🐙',
    title: 'GitHub',
    colorClass: 'spiegazione-github',
    content: [
      'Il sito è pubblicato su GitHub.',
      'GitHub è come un archivio online dove si tengono salvati i file del sito, con la possibilità di vedere tutte le versioni precedenti e condividere il progetto con altri. È molto usato dai programmatori.'
    ]
  },
  {
    icon: '▲',
    title: 'Vercel',
    colorClass: 'spiegazione-vercel',
    content: [
      'Il sito è visibile su internet grazie a Vercel, che è collegato a GitHub.',
      'Vercel è un servizio che prende i file del sito da GitHub e li mette online, così chiunque può visitare il sito scrivendo l’indirizzo nel browser.'
    ]
  },
  {
    icon: '🗄️',
    title: 'Supabase (Database)',
    colorClass: 'spiegazione-supabase',
    content: [
      'Il sito è anche collegato a un database su Supabase.',
      'Un database è come una tabella o un foglio Excel, dove vengono salvati dati importanti (per esempio nomi, messaggi, preferenze degli utenti, ecc.).',
      'Supabase è il servizio online che tiene questo database. In questo caso, ho creato una sola tabella dove vengono salvate le informazioni necessarie per far funzionare il sito.'
    ]
  }
];

const Spiegazione: React.FC = () => {
  return (
    <div className="spiegazione-bg">
      <div className="spiegazione-container">
        <h1 className="spiegazione-title">Spiegazione Tecnica del Sito</h1>
        <div className="spiegazione-sections">
          {sections.map((section, idx) => (
            <div className={`spiegazione-box ${section.colorClass}`} key={section.title}>
              <div className="spiegazione-icon">{section.icon}</div>
              <h2 className="spiegazione-section-title">{section.title}</h2>
              {section.content.map((p, i) => (
                <p className="spiegazione-text" key={i}>{p}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{textAlign: 'center', marginTop: 32}}>
          <a href="/" className="btn btn-primary">Torna alla Home</a>
        </div>
      </div>
    </div>
  );
};

export default Spiegazione;

/*
CSS DA AGGIUNGERE IN APP.CSS:

.spiegazione-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 50%, #d4c4b0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}
.spiegazione-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(60,46,38,0.15);
  padding: 2.5rem 2rem;
}
.spiegazione-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: #3c2e26;
}
.spiegazione-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
@media (max-width: 900px) {
  .spiegazione-sections {
    grid-template-columns: 1fr;
  }
}
.spiegazione-box {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(60,46,38,0.10);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  background: #f8f6f3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 260px;
  position: relative;
  border-left: 8px solid #e8ddd4;
  transition: transform 0.2s;
}
.spiegazione-box:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 32px rgba(60,46,38,0.18);
}
.spiegazione-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  margin-left: -0.2rem;
}
.spiegazione-section-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #6d4c36;
}
.spiegazione-text {
  font-size: 1.05rem;
  color: #3c2e26;
  margin-bottom: 0.7rem;
  line-height: 1.6;
}
.spiegazione-react { border-left-color: #61dafb; }
.spiegazione-github { border-left-color: #333; }
.spiegazione-vercel { border-left-color: #000; }
.spiegazione-supabase { border-left-color: #3ecf8e; }
*/ 