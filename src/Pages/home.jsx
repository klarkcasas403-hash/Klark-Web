import React from "react";
import { Link } from "react-router-dom";
import Section from "../components/Section.jsx";
import { Header } from "../components/Header.jsx";
import { useTranslation } from "../context/TranslationContext.jsx";
import '../index.css';
import '../components/home.css';
import { useState, useEffect, useRef } from 'react';

export function Home() {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  const images = [
    'https://www.larisasalon.com/wp-content/uploads/2024/06/womens-medium-layered-haircut-with-blowout.webp',
    'https://i0.wp.com/lush-hair-folk.com/wp-content/uploads/2025/06/Honey-Balayage-Hair-Color.jpg?fit=800%2C800&ssl=1',
    'https://cdn.shopify.com/s/files/1/0464/9074/7036/files/goo_goo_hair_extensions_sew_in_weft_color1000_pure_platinum_blonde_5_400x400.jpg?v=1752028030',
    'https://hellojupiter.com/cdn/shop/articles/95fb7836ae0e6f128a0322e622c16ee8_614611ae-2570-44f3-a7a9-a0b6c2cdb854.jpg?v=1763668460',
  ];

  const stats = [
    { number: 5000, label: t('happyClients') || 'Happy Clients', icon: '👥' },
    { number: 15, label: t('yearsExperience') || 'Years Experience', icon: '⭐' },
    { number: 100, label: t('awards') || 'Awards', icon: '🏆' },
    { number: 98, label: t('satisfactionRate') || '% Satisfaction', icon: '💯' },
  ];

  const features = [
    { icon: '✂️', title: t('expertStylists') || 'Expert Stylists', desc: t('expertStylistsDesc') },
    { icon: '💆', title: t('premiumProducts') || 'Premium Products', desc: t('premiumProductsDesc') || 'We use only the finest products for your hair' },
    { icon: '✨', title: t('modernTechniques') || 'Modern Techniques', desc: t('modernTechniquesDesc') || 'Latest trends and techniques in cosmetology' },
    { icon: '💅', title: t('personalizedService') || 'Personalized Service', desc: t('personalizedServiceDesc') || 'Tailored to your unique style and needs' },
  ];

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + 90);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach((counter) => {
              const target = parseInt(counter.getAttribute('data-target'));
              const duration = 2000;
              const increment = target / (duration / 16);
              let current = 0;

              const updateCounter = () => {
                current += increment;
                if (current < target) {
                  counter.textContent = Math.floor(current).toLocaleString();
                  requestAnimationFrame(updateCounter);
                } else {
                  counter.textContent = target.toLocaleString();
                }
              };
              updateCounter();
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const handleDotClick = (index) => {
    setRotation(index * 90);
  };

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section with Particles */}
      <div className="hero-section" ref={heroRef}>
        <div className="particles-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }} />
          ))}
        </div>
        <div className="hero-overlay">
          <h1 className="hero-title">{t('welcomeTitle')}</h1>
          <p className="hero-subtitle">{t('welcomeSubtitle')}</p>
          <Link to="/services" className="hero-cta-button">
            {t('exploreServices')}
            <span className="button-shine"></span>
          </Link>
        </div>
        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section animate-on-scroll" ref={statsRef} id="stats">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number" data-target={stat.number}>0</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="features-section animate-on-scroll" id="features">
        <h2 className="section-title">{t('whyChooseUs') || 'Why Choose Us'}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${isVisible['features'] ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="container">
        <Section id="hair-services" title={t('hairServices')} className="animate-on-scroll">
          {t('hairServicesDesc')}
        </Section>
        <Section id="treatments" title={t('hairTreatments')} className="animate-on-scroll">
          {t('hairTreatmentsDesc')}
        </Section>
        <Section id="expertise" title={t('expertStylists')} className="animate-on-scroll">
          {t('expertStylistsDesc')}
        </Section>
      </main>

      {/* Gallery Section with Enhanced Carousel */}
      <div className="gallery-section animate-on-scroll" id="gallery">
        <h2 className="section-title">{t('ourWork')}</h2>
        <div className="gallery-wrapper">
          <div className="carousel-container">
            <div
              className="carousel-inner"
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              {images.map((img, index) => (
                <div key={index} className="carousel-item">
                  <img src={img} alt={`Beauty service ${index + 1}`} />
                  <div className="carousel-overlay">
                    <span>View Details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-controls">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`carousel-dot ${
                  rotation % 360 === index * 90 ? 'active' : ''
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-6 text-gray-600 text-sm">
            {t('scrollCarousel')}
          </div>
        </div>
      </div>

      {/* Location Section with Parallax */}
      <div className="location-section animate-on-scroll" id="location">
        <h2 className="section-title">{t('visitSalon')}</h2>
        <div className="map-container" style={{
          transform: `translateY(${Math.min(scrollY * 0.1, 50)}px)`,
          opacity: Math.max(1 - scrollY / 2000, 0.5)
        }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3457.1031915350645!2d-95.6313514!3d29.947710299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640d3e26b2c4c65%3A0x536bb2a1f4273b39!2s12005%20Old%20Huffmeister%20Rd%2C%20Cypress%2C%20TX%2077429!5e0!3m2!1sen!2sus!4v1764548589018!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <Link to="/finale" className="fab">
        <span className="fab-icon">📅</span>
        <span className="fab-text">{t('bookNow') || 'Book Now'}</span>
      </Link>

      <footer className="site-footer">
        <p>{t('footerRights')}</p>
        <p className="footer-tagline">{t('footerTagline')}</p>
      </footer>
    </div>
  );
}