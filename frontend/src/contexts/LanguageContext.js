'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { en } from '../i18n/locales/en';
import { hi } from '../i18n/locales/hi';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'agrimart_lang';
const dictionaries = { en, hi };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'hi') return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  }, [language, setLanguage]);

  const activeDict = useMemo(() => {
    return dictionaries[language] || en;
  }, [language]);

  /**
   * Translate a nested key path with optional fallback and parameter interpolation
   * Example: t('nav.helpline') or t('categories.varietiesCount', { count: 320 })
   */
  const t = useCallback(
    (keyPath, paramsOrFallback, maybeFallback) => {
      let params = null;
      let fallback = undefined;

      if (paramsOrFallback && typeof paramsOrFallback === 'object') {
        params = paramsOrFallback;
        fallback = maybeFallback;
      } else if (typeof paramsOrFallback === 'string') {
        fallback = paramsOrFallback;
      }

      const getNested = (dict, path) => {
        if (!dict || !path) return undefined;
        const parts = path.split('.');
        let curr = dict;
        for (const p of parts) {
          if (curr && typeof curr === 'object' && p in curr) {
            curr = curr[p];
          } else {
            return undefined;
          }
        }
        return typeof curr === 'string' ? curr : undefined;
      };

      // 1. Try active language dictionary
      let result = getNested(activeDict, keyPath);

      // 2. If missing in active language, try English dictionary
      if (result === undefined && language !== 'en') {
        result = getNested(en, keyPath);
      }

      // 3. If still missing, use provided fallback or keyPath itself
      if (result === undefined) {
        result = fallback !== undefined ? fallback : keyPath;
      }

      // 4. Interpolate parameters if any (e.g. {count})
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, val]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return result;
    },
    [activeDict, language]
  );

  /**
   * Helper specifically for Category names
   */
  const translateCategory = useCallback(
    (categoryName) => {
      if (!categoryName) return '';
      if (language === 'en') return categoryName;
      return t(`categories.${categoryName}`, categoryName);
    },
    [language, t]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isHindi: language === 'hi',
      isEnglish: language === 'en',
      t,
      translateCategory,
      mounted,
    }),
    [language, setLanguage, toggleLanguage, t, translateCategory, mounted]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe default if rendered outside provider (e.g. in standalone isolated tests)
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isHindi: false,
      isEnglish: true,
      t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
      translateCategory: (name) => name,
      mounted: true,
    };
  }
  return context;
}
