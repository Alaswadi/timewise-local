import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// No longer importing JSON directly. We will fetch it.

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// A simple in-memory cache to prevent re-fetching on re-renders.
const translationCache: { en?: any; ar?: any } = {};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ en?: any; ar?: any }>(translationCache);

  useEffect(() => {
    const fetchTranslations = async () => {
      // Only fetch if not already in cache
      if (!translationCache.en || !translationCache.ar) {
        try {
          const [enRes, arRes] = await Promise.all([
            fetch('./locales/en.json'),
            fetch('./locales/ar.json')
          ]);
          const enData = await enRes.json();
          const arData = await arRes.json();
          
          // Store in cache and state
          translationCache.en = enData;
          translationCache.ar = arData;
          setTranslations({ en: enData, ar: arData });

        } catch (error) {
          console.error("Failed to load translations:", error);
        }
      }
    };
    fetchTranslations();
  }, []); // Run only once on mount

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'ar'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (language === 'ar') {
        document.body.style.fontFamily = "'Cairo', 'Public Sans', sans-serif";
    } else {
        document.body.style.fontFamily = "'Public Sans', sans-serif";
    }
  }, [language]);
  
  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    
    const langTranslations = translations[language];
    
    let result = langTranslations as any;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in the current language
        let fallbackResult = translations['en'] as any;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        result = fallbackResult || key; // If not in English either, use the key
        break;
      }
    }
    
    let finalString = result || key;

    if (options) {
      Object.keys(options).forEach(optKey => {
        finalString = finalString.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return finalString;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
