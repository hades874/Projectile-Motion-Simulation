import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateUrlParams } from '../lib/urlParams';
import { getTranslations } from '../content/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Priority: URL > localStorage > default
    // HashRouter-aware check
    const href = window.location.href;
    const qIndex = href.indexOf('?');
    const urlParams = new URLSearchParams(qIndex !== -1 ? href.slice(qIndex) : '');
    const urlLang = urlParams.get('lang');
    if (urlLang === 'bn' || urlLang === 'en') return urlLang;
    return localStorage.getItem('app_language') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
    
    // Update document title
    const t = getTranslations(language);
    if (t.home && t.home.metaTitle) {
      document.title = t.home.metaTitle;
    }

    // Sync to URL
    updateUrlParams({ lang: language });
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const setLang = (lang) => {
    if (lang === 'bn' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
