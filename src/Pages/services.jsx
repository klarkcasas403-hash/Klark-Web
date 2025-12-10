import Section from "../components/Section.jsx";
import '../index.css';
import '../components/dropdown1.css';
import '../components/Services.css';
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { useTranslation } from "../context/TranslationContext.jsx";

export function Services() {
  const { t } = useTranslation();
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Refs for animation
  const wheelRef = useRef(null);
  const categoryGridRef = useRef(null);
  const rafRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartXRef = useRef(0);
  const categoryDragStartXRef = useRef(0);
  const categoryScrollStartXRef = useRef(0);
  const isCategoryDraggingRef = useRef(false);

  // Idle resume timing
  const IDLE_RESUME_MS = 1500;
  const HOVER_INFO_MS = 2200;

  // Categories with translations and descriptions
  const categories = [
    { 
      id: "Hair Cut", 
      title: t('hairCut'), 
      img: "https://www.larisasalon.com/wp-content/uploads/2024/06/womens-medium-layered-haircut-with-blowout.webp",
      description: t('hairCutDesc')
    },
    { 
      id: "Highlights", 
      title: t('highlights'), 
      img: "https://i0.wp.com/lush-hair-folk.com/wp-content/uploads/2025/06/Honey-Balayage-Hair-Color.jpg?fit=800%2C800&ssl=1",
      description: t('highlightsDesc')
    },
    { 
      id: "Color", 
      title: t('color'), 
      img: "https://cdn.shopify.com/s/files/1/0464/9074/7036/files/goo_goo_hair_extensions_sew_in_weft_color1000_pure_platinum_blonde_5_400x400.jpg?v=1752028030",
      description: t('colorDesc')
    },
    { 
      id: "Treatments", 
      title: t('treatments'), 
      img: "https://hellojupiter.com/cdn/shop/articles/95fb7836ae0e6f128a0322e622c16ee8_614611ae-2570-44f3-a7a9-a0b6c2cdb854.jpg?v=1763668460",
      description: t('treatmentsDesc')
    } 
  ];

  // Services with translations
  const servicesByCategory = {
    "Hair Cut": [
      { name: t('basicCut'), price: 25, info: t('basicCutDesc') },
      { name: t('layeredCut'), price: 40, info: t('layeredCutDesc') },
      { name: t('kidsCut'), price: 18, info: t('kidsCutDesc') }
    ],
    "Color": [
      { name: t('fullColor'), price: 70, info: t('fullColorDesc') },
      { name: t('rootTouchUp'), price: 45, info: t('rootTouchUpDesc') },
      { name: t('glossToner'), price: 30, info: t('glossTonerDesc') },
      { name: t('colorCorrection'), price: 140, info: t('colorCorrectionDesc') }
    ],
    "Highlights": [
      { name: t('partialHighlights'), price: 60, info: t('partialHighlightsDesc') },
      { name: t('fullHighlights'), price: 90, info: t('fullHighlightsDesc') },
      { name: t('balayage'), price: 120, info: t('balayageDesc') },
      { name: t('babylights'), price: 110, info: t('babylightsDesc') }
    ],
    "Treatments": [
      { name: t('deepConditioning'), price: 35, info: t('deepConditioningDesc') },
      { name: t('keratinSmoothing'), price: 180, info: t('keratinSmoothingDesc') },
      { name: t('scalpDetox'), price: 45, info: t('scalpDetoxDesc') },
      { name: t('proteinRebuild'), price: 55, info: t('proteinRebuildDesc') }
    ]
  };

  // Handle mouse move on category cards for interactive effect
  const handleCardMouseMove = (e, index) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    setHoveredCardIndex(null);
  };

  // Auto-scroll loop for services wheel
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel || !isWheelOpen) return;

    const speedPxPerSec = 80;
    const step = (tsPrevRef => (now) => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      const tsPrev = tsPrevRef.current ?? now;
      const dt = (now - tsPrev) / 1000;

      const idle = Date.now() - lastInteractionRef.current > IDLE_RESUME_MS;
      const shouldScroll = autoScrollEnabled && !isDraggingRef.current && idle;

      if (shouldScroll) {
        wheel.scrollLeft += speedPxPerSec * dt;
        if (wheel.scrollLeft >= wheel.scrollWidth - wheel.clientWidth - 2) {
          wheel.scrollLeft = 0;
        }
      }

      tsPrevRef.current = now;
      rafRef.current = requestAnimationFrame(step(tsPrevRef));
    })({ current: null });

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoScrollEnabled, isWheelOpen]);

  // Hover info timer
  useEffect(() => {
    if (hoveredIndex === null) return;
    const timer = setTimeout(() => setHoveredIndex(null), HOVER_INFO_MS);
    return () => clearTimeout(timer);
  }, [hoveredIndex]);

  // Cart total
  useEffect(() => {
    setCartTotal(cart.reduce((sum, item) => sum + item.price, 0));
  }, [cart]);

  // Interaction helpers
  const markInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  // Category swipe handlers
  const onCategoryMouseDown = (e) => {
    if (!categoryGridRef.current) return;
    isCategoryDraggingRef.current = true;
    categoryDragStartXRef.current = e.clientX;
    categoryScrollStartXRef.current = categoryGridRef.current.scrollLeft;
    if (categoryGridRef.current) {
      categoryGridRef.current.style.cursor = 'grabbing';
    }
  };

  const onCategoryMouseMove = (e) => {
    if (!isCategoryDraggingRef.current || !categoryGridRef.current) return;
    const dx = e.clientX - categoryDragStartXRef.current;
    categoryGridRef.current.scrollLeft = categoryScrollStartXRef.current - dx;
  };

  const onCategoryMouseUp = () => {
    if (!categoryGridRef.current) return;
    isCategoryDraggingRef.current = false;
    categoryGridRef.current.style.cursor = 'grab';
  };

  // Services wheel handlers
  const onMouseDownWheel = (e) => {
    if (!wheelRef.current) return;
    isDraggingRef.current = true;
    setAutoScrollEnabled(false);
    markInteraction();
    dragStartXRef.current = e.clientX;
    scrollStartXRef.current = wheelRef.current.scrollLeft;
    wheelRef.current.classList.add("grabbing");
  };

  const onMouseMoveWheel = (e) => {
    if (!isDraggingRef.current || !wheelRef.current) return;
    markInteraction();
    const dx = e.clientX - dragStartXRef.current;
    wheelRef.current.scrollLeft = scrollStartXRef.current - dx;
  };

  const onMouseUpWheel = () => {
    if (!wheelRef.current) return;
    isDraggingRef.current = false;
    wheelRef.current.classList.remove("grabbing");
    markInteraction();
    setAutoScrollEnabled(true);
  };

  const onMouseLeaveWheel = () => {
    if (!wheelRef.current) return;
    if (isDraggingRef.current) onMouseUpWheel();
    markInteraction();
    setAutoScrollEnabled(true);
  };

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      if (wheelRef.current) {
        wheelRef.current.scrollLeft += e.deltaY;
      }
      markInteraction();
      setAutoScrollEnabled(false);
    }
  };

  const selectCategory = (catId) => {
    setSelectedCategory(catId);
    setIsWheelOpen(true);
    markInteraction();
  };

  const addToCart = (service) => {
    setAutoScrollEnabled(false);
    markInteraction();
    setCart((prev) => [...prev, service]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    setSelectedCartItem(null);
  };

  const formatPrice = (n) => `$${n.toFixed(2)}`;

  return (
    <div className="services-page">
      {/* Checkout bar */}
      <div className="checkout-bar" aria-live="polite">
        <div className="cart-items">
          <strong>{t('cart')}</strong>
          {cart.length === 0 ? (
            <span className="empty"> {t('noItems')}</span>
          ) : (
            cart.map((item, i) => (
              <span 
                key={`${item.name}-${i}`} 
                className="cart-chip"
                onClick={() => setSelectedCartItem(selectedCartItem === i ? null : i)}
                style={{ cursor: 'pointer' }}
              >
                {item.name} — {formatPrice(item.price)}
                <button
                  className="chip-remove"
                  aria-label={`Remove ${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(i);
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="cart-total">
          <strong>{t('total')}</strong> {formatPrice(cartTotal)}
        </div>
        <button
          className="checkout-action"
          disabled={cart.length === 0}
          onClick={() => {
            setAutoScrollEnabled(false);
            alert("Proceeding to checkout… (wire up your flow here)");
          }}
        >
          {t('goToCheckout')}
        </button>
      </div>

      {/* Cart item info modal */}
      {selectedCartItem !== null && cart[selectedCartItem] && (
        <div className="cart-item-info-modal" onClick={() => setSelectedCartItem(null)}>
          <div className="cart-item-info-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedCartItem(null)}>×</button>
            <h3>{cart[selectedCartItem].name}</h3>
            <p className="cart-item-price">{formatPrice(cart[selectedCartItem].price)}</p>
            <p className="cart-item-description">{cart[selectedCartItem].info}</p>
          </div>
        </div>
      )}

      <Header />

      {/* Category grid - swipeable */}
      <section className="category-grid-section">
        <h2>{t('browseCategories')}</h2>
        <div 
          className="category-grid swipeable"
          ref={categoryGridRef}
          onMouseDown={onCategoryMouseDown}
          onMouseMove={onCategoryMouseMove}
          onMouseUp={onCategoryMouseUp}
          onMouseLeave={onCategoryMouseUp}
        >
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              className={`category-card ${selectedCategory === cat.id ? "selected" : ""}`}
              onClick={() => selectCategory(cat.id)}
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseMove={(e) => handleCardMouseMove(e, index)}
              onMouseLeave={handleCardMouseLeave}
              aria-pressed={selectedCategory === cat.id}
            >
              <div className="category-image-wrapper">
                <img src={cat.img} alt={cat.title} className="category-image" />
              </div>
              <div className="category-text">
                <h3 className="category-title">{cat.title}</h3>
              </div>
              
              {/* Hover info box */}
              <div className={`category-info-box ${hoveredCardIndex === index ? "show" : ""}`}>
                <p className="category-info-text">{cat.description}</p>
                <button
                  className="category-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCategory(cat.id);
                  }}
                >
                  {t('viewServices')}
                </button>
              </div>
            </button>
          ))}
        </div>

        {/* Animated reveal of wheel under grid */}
        <div className={`wheel-reveal ${isWheelOpen ? "open" : ""}`}>
          {selectedCategory && (
            <>
              <h3 className="wheel-heading">
                {categories.find(c => c.id === selectedCategory)?.title} {t('services')}
              </h3>
              <div
                className="services-wheel"
                ref={wheelRef}
                onMouseDown={onMouseDownWheel}
                onMouseMove={onMouseMoveWheel}
                onMouseUp={onMouseUpWheel}
                onMouseLeave={onMouseLeaveWheel}
                onWheel={onWheel}
                role="listbox"
                aria-label={`${selectedCategory} services`}
              >
                {servicesByCategory[selectedCategory].map((svc, idx) => (
                  <div
                    key={`${svc.name}-${idx}`}
                    className="wheel-item"
                    role="option"
                    aria-selected={hoveredIndex === idx}
                    onMouseEnter={() => {
                      setHoveredIndex(idx);
                      setAutoScrollEnabled(false);
                      markInteraction();
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      markInteraction();
                      setAutoScrollEnabled(true);
                    }}
                  >
                    <div className="wheel-item-body">
                      <span className="wheel-item-name">{svc.name}</span>
                      <span className="wheel-item-price">{formatPrice(svc.price)}</span>
                    </div>

                    <div className={`wheel-item-info ${hoveredIndex === idx ? "show" : ""}`}>
                      <p className="info-text">{svc.info}</p>
                      <button
                        className="checkout-btn"
                        onClick={() => addToCart(svc)}
                        aria-label={`Add ${svc.name} to cart`}
                      >
                        {t('addToCart')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
