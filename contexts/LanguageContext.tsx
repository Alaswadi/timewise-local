import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

console.log('LanguageContext.tsx loaded');

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
  console.log('LanguageProvider component mounted');
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ en?: any; ar?: any }>(translationCache);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        console.log('🔄 Starting translation fetch...');

        // Test fetch with detailed logging
        const enResponse = await fetch('/locales/en.json');
        console.log('📥 EN Response received:', {
          status: enResponse.status,
          statusText: enResponse.statusText,
          contentType: enResponse.headers.get('content-type'),
          url: enResponse.url,
          ok: enResponse.ok
        });

        if (!enResponse.ok) {
          throw new Error(`EN fetch failed: ${enResponse.status} ${enResponse.statusText}`);
        }

        const enText = await enResponse.text();
        console.log('📄 EN Text received (length:', enText.length, ')');
        console.log('📄 EN Text preview:', enText.substring(0, 100));

        // Check if it's actually JSON
        if (!enText.trim().startsWith('{')) {
          console.error('❌ EN response is not JSON! First 500 chars:', enText.substring(0, 500));
          throw new Error('EN response is not JSON');
        }

        const enData = JSON.parse(enText);
        console.log('✅ EN JSON parsed successfully');

        // Now try Arabic
        const arResponse = await fetch('/locales/ar.json');
        console.log('📥 AR Response received:', {
          status: arResponse.status,
          statusText: arResponse.statusText,
          contentType: arResponse.headers.get('content-type'),
          url: arResponse.url,
          ok: arResponse.ok
        });

        if (!arResponse.ok) {
          throw new Error(`AR fetch failed: ${arResponse.status} ${arResponse.statusText}`);
        }

        const arText = await arResponse.text();
        console.log('📄 AR Text received (length:', arText.length, ')');
        console.log('📄 AR Text preview:', arText.substring(0, 100));

        // Check if it's actually JSON
        if (!arText.trim().startsWith('{')) {
          console.error('❌ AR response is not JSON! First 500 chars:', arText.substring(0, 500));
          throw new Error('AR response is not JSON');
        }

        const arData = JSON.parse(arText);
        console.log('✅ AR JSON parsed successfully');

        // Store in cache and state
        translationCache.en = enData;
        translationCache.ar = arData;
        setTranslations({ en: enData, ar: arData });

        console.log('🎉 All translations loaded successfully!');

      } catch (error) {
        console.error("💥 Failed to load translations:", error);
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
