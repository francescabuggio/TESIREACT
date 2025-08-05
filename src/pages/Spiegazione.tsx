import React from 'react';

const Spiegazione: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Spiegazione Tecnica del Sito
          </h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                React e Vite
              </h2>
              <p className="mb-3">
                Il sito è stato creato usando React e Vite.
              </p>
              <p className="mb-3">
                React è uno strumento che serve per costruire siti web moderni e interattivi, come quelli con cui puoi cliccare, muoverti tra pagine, scrivere in moduli, ecc.
              </p>
              <p>
                Vite è un programma che aiuta a far partire il sito in modo veloce durante lo sviluppo, così chi lo sta creando può vedere subito le modifiche mentre lavora.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-3">
                GitHub
              </h2>
              <p className="mb-3">
                Il sito è pubblicato su GitHub.
              </p>
              <p>
                GitHub è come un archivio online dove si tengono salvati i file del sito, con la possibilità di vedere tutte le versioni precedenti e condividere il progetto con altri. È molto usato dai programmatori.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-3">
                Vercel
              </h2>
              <p className="mb-3">
                Il sito è visibile su internet grazie a Vercel, che è collegato a GitHub.
              </p>
              <p>
                Vercel è un servizio che prende i file del sito da GitHub e li mette online, così chiunque può visitare il sito scrivendo l'indirizzo nel browser.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-orange-800 mb-3">
                Supabase (Database)
              </h2>
              <p className="mb-3">
                Il sito è anche collegato a un database su Supabase.
              </p>
              <p className="mb-3">
                Un database è come una tabella o un foglio Excel, dove vengono salvati dati importanti (per esempio nomi, messaggi, preferenze degli utenti, ecc.).
              </p>
              <p>
                Supabase è il servizio online che tiene questo database. In questo caso, ho creato una sola tabella dove vengono salvate le informazioni necessarie per far funzionare il sito.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Torna alla Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spiegazione; 