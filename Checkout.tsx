import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SurveyData, Product, CheckoutData, OrderData } from '../types';

interface CheckoutProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const Checkout = ({ updateSurveyData, surveyData }: CheckoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product as Product;
  
  const [checkoutStartTime] = useState(Date.now());
  const [variantNumber] = useState(Math.floor(Math.random() * 8) + 1);
  const [isPreSelectedCC] = useState(variantNumber > 4);
  const [selectedDelivery, setSelectedDelivery] = useState(isPreSelectedCC ? 'cc' : 'home');
  const [formData, setFormData] = useState({
    address: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Funzione per convertire il numero della variante nel tipo
  const getVariantType = (variant: number): string => {
    const baseVariant = variant > 4 ? variant - 4 : variant;
    const isPreSelected = variant > 4;
    
    let variantType = '';
    switch (baseVariant) {
      case 1:
        variantType = 'Standard';
        break;
      case 2:
        variantType = 'Scelta ecologica';
        break;
      case 3:
        variantType = 'Emissioni CO₂ ridotte';
        break;
      case 4:
        variantType = 'Dettagli CO₂ completi';
        break;
      default:
        variantType = 'Standard';
    }
    
    return isPreSelected ? `${variantType} (CC pre-selezionato)` : variantType;
  };

  // Stabilizza la funzione updateSurveyData per evitare loop infiniti
  const stableUpdateSurveyData = useCallback(updateSurveyData, []);

  useEffect(() => {
    if (!product) {
      navigate('/shop');
      return;
    }

    // Store checkout data with variant type instead of number
    const checkoutData: CheckoutData = {
      product,
      variant: getVariantType(variantNumber),
      checkoutStartedAt: new Date().toISOString(),
      productClickData: surveyData.productInteractions?.[product.id]
    };

    stableUpdateSurveyData({ checkoutData });
  }, [product, variantNumber, stableUpdateSurveyData, navigate, surveyData.productInteractions]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Only validate address if home delivery is selected
    if (selectedDelivery === 'home' && !formData.address.trim()) {
      newErrors.address = 'L\'indirizzo è obbligatorio per la consegna a domicilio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOrder = () => {
    if (!validateForm()) return;

    const checkoutTimeSpent = Date.now() - checkoutStartTime;
    const deliveryMethod = selectedDelivery === 'home' ? 'Consegna a domicilio' : 'Click & Collect';

    const orderData: OrderData = {
      firstName: 'Anonimo',
      lastName: 'Partecipante',
      shippingAddress: selectedDelivery === 'home' ? formData.address : 'Click & Collect - Punto di raccolta',
      productTitle: product.title,
      productPrice: product.price,
      productId: product.id,
      deliveryMethod,
      deliveryValue: selectedDelivery,
      checkoutTimeSpent,
      orderCompletedAt: new Date().toISOString()
    };

    updateSurveyData({ orderData });
    navigate('/success', { state: { orderData } });
  };

  const getExtraContent = () => {
    const baseVariant = variantNumber > 4 ? variantNumber - 4 : variantNumber;
    
    if (baseVariant === 2) {
      return <div className="eco-badge">Scelta ecologica</div>;
    } else if (baseVariant === 3) {
      return <div className="eco-badge">-15% emissioni CO₂: urbane · -5% rurali vs Consegna a domicilio</div>;
    } else if (baseVariant === 4) {
      return (
        <div className="co2-details">
          <h5>Calcolo emissioni CO₂e (kg per collo)</h5>
          <div>
            <strong>Scenario urbano</strong><br />
            Tratta hub → pickup point: 4,1 km · 0,158 kg/km = 0,65 kg<br />
            <strong>C&C:</strong> 0,65 kg ÷ 2 pacchi = <strong>0,33 kg</strong><br />
            <strong>Delivery:</strong> furgone casa-per-casa (4,1 km) = <strong>0,41 kg</strong><br /><br />
            
            <strong>Scenario rurale</strong><br />
            Tratta hub → borgo: 16 km · 0,158 kg/km = 2,53 kg<br />
            <strong>C&C:</strong> 2,53 kg ÷ 6 pacchi = <strong>0,42 kg</strong><br />
            <strong>Delivery:</strong> percorso singolo casa (16 km) = <strong>0,50 kg</strong><br /><br />
            
            Fattore emissione: 0,158 kg·km⁻¹ (furgone diesel Euro 6)
          </div>
        </div>
      );
    }
    return null;
  };

  if (!product) return null;

  return (
    <>
      <header>
        <h1>Terracotta Dreams</h1>
      </header>
      <div className="container">
        <button className="btn btn-secondary" onClick={() => navigate('/shop')}>
          ← Indietro
        </button>
        <div className="checkout-container">
          <div className="checkout-header">
            <img src={product.image} alt={product.title} className="checkout-image" />
            <div className="checkout-info">
              <h3>{product.title}</h3>
              <p className="price">{product.price}</p>
            </div>
          </div>
          
          <div className="delivery-section">
            <h4>Metodo di consegna</h4>
            <div 
              className={`delivery-option ${selectedDelivery === 'home' ? 'selected' : ''}`}
              onClick={() => setSelectedDelivery('home')}
            >
              <div className="delivery-title">Consegna a domicilio</div>
              <div className="delivery-subtitle">1–2 giorni – Standard</div>
            </div>
            <div 
              className={`delivery-option ${selectedDelivery === 'cc' ? 'selected' : ''}`}
              onClick={() => setSelectedDelivery('cc')}
            >
              <div className="delivery-title">
                <span className="eco-icon">◆</span> Click & Collect
              </div>
              <div className="delivery-subtitle">2–3 giorni – Ritira al punto di raccolta</div>
              {getExtraContent()}
            </div>
          </div>
          
          <div className="shipping-form">
            <h4>Dati di spedizione</h4>
            
            {selectedDelivery === 'home' ? (
              <div className="form-group">
                <label htmlFor="address">Indirizzo di spedizione * (per mantenere l'anonimato puoi inserire un indirizzo inventato)</label>
                <input 
                  type="text" 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={errors.address ? 'error' : ''}
                  placeholder="Via, numero civico, città"
                  style={{ color: '#333' }}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
            ) : (
              <div className="pickup-info">
                <div className="pickup-message">
                  <strong>Invieremo l'ordine al punto di raccolta più vicino a casa tua</strong><br />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Massima distanza: 350m dal tuo indirizzo
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={handleCompleteOrder}
          >
            Conferma ordine
          </button>
        </div>
      </div>
    </>
  );
};

export default Checkout; 