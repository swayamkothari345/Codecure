"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { translations } from "./translations"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem("curaithm-language") as Language | null
    if (saved === "en" || saved === "hi") {
      setLanguage(saved)
    }
  }, [])

  // Change + save language
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("curaithm-language", lang)
  }

  // Translation function
const t = (key: string): string => {
  return translations[key as keyof typeof translations]?.[language] || key
}
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

