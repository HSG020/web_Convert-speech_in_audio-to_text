"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LANGUAGES } from "@/lib/language-options"

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  options?: { value: string; label: string; labelEn: string }[]
  langMode?: 'zh' | 'en'
}

export function LanguageSelector({ value, onChange, disabled = false, label, options = LANGUAGES, langMode = 'zh' }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">
        {label || (langMode === 'zh' ? "输出语言" : "Output Language")}
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="language" className="w-full">
          <SelectValue placeholder={langMode === 'zh' ? "选择语言" : "Select language"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {langMode === 'zh' ? lang.label : lang.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}