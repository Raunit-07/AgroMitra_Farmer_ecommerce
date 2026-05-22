import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();
const SUPPORTED_LANGUAGES = ['en', 'hi'];

const normalizeLanguage = (lang) => {
  const shortLang = String(lang || 'en').split('-')[0];
  return SUPPORTED_LANGUAGES.includes(shortLang) ? shortLang : 'en';
};

export const LanguageProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() =>
    normalizeLanguage(localStorage.getItem('i18nextLng') || i18n.resolvedLanguage || i18n.language)
  );

  const changeLanguage = useCallback((lang) => {
    const nextLanguage = normalizeLanguage(lang);
    localStorage.setItem('i18nextLng', nextLanguage);
    return i18n.changeLanguage(nextLanguage).then(() => {
      setLanguage(nextLanguage);
      document.documentElement.lang = nextLanguage;
    });
  }, [i18n]);

  useEffect(() => {
    const handleLanguageChanged = (lang) => {
      const nextLanguage = normalizeLanguage(lang);
      setLanguage(nextLanguage);
      localStorage.setItem('i18nextLng', nextLanguage);
      document.documentElement.lang = nextLanguage;
    };

    i18n.on('languageChanged', handleLanguageChanged);

    const savedLanguage = normalizeLanguage(localStorage.getItem('i18nextLng') || i18n.resolvedLanguage || i18n.language);
    localStorage.setItem('i18nextLng', savedLanguage);
    document.documentElement.lang = savedLanguage;

    if (savedLanguage !== normalizeLanguage(i18n.language)) {
      i18n.changeLanguage(savedLanguage);
    }

    return () => i18n.off('languageChanged', handleLanguageChanged);
  }, [i18n]);

  const value = useMemo(
    () => ({ t, language, changeLanguage, supportedLanguages: SUPPORTED_LANGUAGES }),
    [t, language, changeLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
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
