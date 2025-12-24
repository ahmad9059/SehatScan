"use client";

import { useState, useRef, useEffect } from "react";
import { LanguageIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useSimpleLanguage } from "./SimpleLanguageContext";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useSimpleLanguage();

  const selectedLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (selectedLang: Language) => {
    setLanguage(selectedLang.code);
    setIsOpen(false);
    console.log(
      `Language changed to: ${selectedLang.name} (${selectedLang.code})`
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-150 hover:-translate-y-[1px]"
        title={`Current language: ${selectedLanguage.name}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedLanguage.flag}</span>
          <LanguageIcon className="h-4 w-4 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors duration-150" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card)] rounded-xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] z-50 animate-fade-in max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-heading)]">
              {t("language.select")}
            </h3>
            <p className="text-xs text-[var(--color-subtle)] mt-1">
              {t("language.choose")}
            </p>
          </div>

          {/* Language List */}
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className="w-full px-4 py-3 text-left hover:bg-[var(--color-surface)] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {language.name}
                    </p>
                    <p className="text-xs text-[var(--color-subtle)]">
                      {language.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage.code === language.code && (
                  <CheckIcon className="h-4 w-4 text-[var(--color-primary)]" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="text-xs text-[var(--color-subtle)]">
              {t("language.saved")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
