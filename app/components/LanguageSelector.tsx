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
        className="group relative p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        title={`Current language: ${selectedLanguage.name}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedLanguage.flag}</span>
          <LanguageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-colors duration-300" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl z-50 animate-fade-in max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("language.select")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("language.choose")}
            </p>
          </div>

          {/* Language List */}
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {language.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage.code === language.code && (
                  <CheckIcon className="h-4 w-4 text-[#037BFC]" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("language.saved")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
