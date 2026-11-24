import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { en } from '../i18n/locales/en';
import { hi } from '../i18n/locales/hi';

describe('LanguageContext & Hindi i18n System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English with isEnglish=true and isHindi=false', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    expect(result.current.language).toBe('en');
    expect(result.current.isEnglish).toBe(true);
    expect(result.current.isHindi).toBe(false);
  });

  it('translates keys correctly in English by default', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    expect(result.current.t('nav.helpline')).toBe('Kisan Helpline: 1800-AGRI-MART');
    expect(result.current.t('filters.title')).toBe('Filters');
    expect(result.current.translateCategory('Vegetable Seeds')).toBe('Vegetable Seeds');
  });

  it('switches to Hindi on toggleLanguage and persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe('hi');
    expect(result.current.isHindi).toBe(true);
    expect(result.current.isEnglish).toBe(false);
    expect(localStorage.getItem('agrimart_lang')).toBe('hi');

    // Translates to Hindi
    expect(result.current.t('nav.helpline')).toBe('किसान हेल्पलाइन: 1800-AGRI-MART');
    expect(result.current.t('filters.title')).toBe('फ़िल्टर');
    expect(result.current.translateCategory('Vegetable Seeds')).toBe('सब्जी के बीज');
    expect(result.current.translateCategory('Organic Manure & Compost')).toBe('जैविक खाद एवं कम्पोस्ट');
  });

  it('interpolates parameters correctly in translation strings', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    // English parameter interpolation
    expect(result.current.t('categories.varietiesCount', { count: 320 })).toBe('320+ Varieties');

    // Switch to Hindi
    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.t('categories.varietiesCount', { count: 320 })).toBe('320+ किस्में');
  });

  it('falls back gracefully to fallback or key when translation key is unknown', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });

    expect(result.current.t('nonexistent.key', 'Custom Fallback')).toBe('Custom Fallback');
    expect(result.current.t('another.unknown.key')).toBe('another.unknown.key');
  });

  it('contains matching keys in both English and Hindi dictionaries', () => {
    const enSections = Object.keys(en);
    const hiSections = Object.keys(hi);

    expect(hiSections).toEqual(expect.arrayContaining(enSections));

    // Verify critical subkeys match
    expect(Object.keys(hi.nav)).toEqual(expect.arrayContaining(Object.keys(en.nav)));
    expect(Object.keys(hi.categories)).toEqual(expect.arrayContaining(Object.keys(en.categories)));
    expect(Object.keys(hi.filters)).toEqual(expect.arrayContaining(Object.keys(en.filters)));
  });
});

describe('UI Language Switcher Component Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function LanguageToggleTester() {
    const { language, toggleLanguage, t, isHindi } = useLanguage();
    return (
      <div>
        <span data-testid="current-lang">{language}</span>
        <span data-testid="cart-label">{t('nav.cart')}</span>
        <button data-testid="lang-btn" onClick={toggleLanguage}>
          {isHindi ? 'EN' : 'हिंदी'}
        </button>
      </div>
    );
  }

  it('toggles UI text from English to Hindi on button click', () => {
    render(
      <LanguageProvider>
        <LanguageToggleTester />
      </LanguageProvider>
    );

    // Initial state: English
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('cart-label')).toHaveTextContent('Cart');
    expect(screen.getByTestId('lang-btn')).toHaveTextContent('हिंदी');

    // Click toggle to switch to Hindi
    fireEvent.click(screen.getByTestId('lang-btn'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('hi');
    expect(screen.getByTestId('cart-label')).toHaveTextContent('कार्ट');
    expect(screen.getByTestId('lang-btn')).toHaveTextContent('EN');

    // Click toggle to switch back to English
    fireEvent.click(screen.getByTestId('lang-btn'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('cart-label')).toHaveTextContent('Cart');
  });
});
