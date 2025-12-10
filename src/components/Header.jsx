import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext.jsx';
import '../components/dropdown1.css';

export function Header() {
  const { t, changeLanguage, language } = useTranslation();

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  return (
    <header className="site-header">
      <div className="logo">
        <h1 className="logo-text">Yanet Cosmetology</h1>
      </div>
      <nav className="nav-right">
        <button>
          <Link to="/home">{t('home')}</Link>
        </button>
        <button>
          <Link to="/services">{t('services')}</Link>
        </button>
        <button>
          <Link to="/reviews">{t('reviews')}</Link>
        </button>
        <button>
          <Link to="/finale">{t('bookAppointment')}</Link>
        </button>
      </nav>
      
      <div className="dropdown">
        <button>{t('translations')}</button>
        <div className="content">
          <nav className="nav-drop">
            <a 
              href="#spanish" 
              onClick={(e) => {
                e.preventDefault();
                handleLanguageChange('es');
              }}
              style={{ fontWeight: language === 'es' ? 'bold' : 'normal' }}
            >
              {t('spanish')}
            </a>
            <a 
              href="#portuguese" 
              onClick={(e) => {
                e.preventDefault();
                handleLanguageChange('pt');
              }}
              style={{ fontWeight: language === 'pt' ? 'bold' : 'normal' }}
            >
              {t('portuguese')}
            </a>
            <a 
              href="#english" 
              onClick={(e) => {
                e.preventDefault();
                handleLanguageChange('en');
              }}
              style={{ fontWeight: language === 'en' ? 'bold' : 'normal' }}
            >
              English
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}