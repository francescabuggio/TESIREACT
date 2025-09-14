import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SurveyData, Product, ProductInteraction } from '../types';
import { products } from '../data/surveyData';

interface EcommerceProps {
  onNext: () => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  surveyData: Partial<SurveyData>;
}

const Ecommerce = ({ updateSurveyData }: EcommerceProps) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productInteractions, setProductInteractions] = useState<{ [key: number]: ProductInteraction }>({});

  const handleProductClick = (product: Product) => {
    const now = new Date().toISOString();
    
    if (!productInteractions[product.id]) {
      setProductInteractions(prev => ({
        ...prev,
        [product.id]: {
          firstClickAt: now,
          clickCount: 1
        }
      }));
    } else {
      setProductInteractions(prev => ({
        ...prev,
        [product.id]: {
          ...prev[product.id],
          clickCount: prev[product.id].clickCount + 1
        }
      }));
    }
    
    setSelectedProduct(product);
  };

  const handleGoToCheckout = (product: Product) => {
    updateSurveyData({
      productInteractions
    });
    navigate('/checkout', { state: { product } });
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  if (selectedProduct) {
    return (
      <>
        <header>
          <h1>Terracotta Dreams</h1>
        </header>
        <div className="container">
          <div className="product-detail">
            <button className="btn btn-secondary" onClick={handleBackToProducts}>
              ← Torna ai prodotti
            </button>
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.title} 
              className="product-detail-image"
            />
            <h2 className="product-detail-title">{selectedProduct.title}</h2>
            <div className="product-detail-price">{selectedProduct.price}</div>
            <p className="product-detail-desc">{selectedProduct.description}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => handleGoToCheckout(selectedProduct)}
            >
              Vai al checkout
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <h1>Terracotta Dreams</h1>
      </header>
      <div className="container">
        <h2 className="page-title">🏺 Ceramiche Artigianali</h2>
        <div className="products">
          {products.map(product => (
            <div 
              key={product.id}
              className="product-card" 
              onClick={() => handleProductClick(product)}
            >
              <img 
                src={product.image} 
                alt={product.title} 
                className="product-image"
              />
              <div className="product-title">{product.title}</div>
              <div className="product-price">{product.price}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Ecommerce; 