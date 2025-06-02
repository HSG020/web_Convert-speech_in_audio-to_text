"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface LanguageToggleProps {
  language: string
  onChange: (lang: string) => void
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => onChange(language === "en" ? "zh" : "en")}
      className="w-20"
    >
      {language === "en" ? "中文" : "English"}
    </Button>
  )
}