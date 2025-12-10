import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/translations.js';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Safely get language from localStorage after component mounts
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es' || savedLanguage === 'pt')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Save language preference to localStorage
    if (isReady) {
      try {
        localStorage.setItem('language', language);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [language, isReady]);

  const t = (key) => {
    if (!isReady) {
      // Return English translation while loading
      return translations.en[key] || key;
    }
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'es' || lang === 'pt') {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};