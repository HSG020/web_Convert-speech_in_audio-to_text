"use client"

import { useEffect, useState } from "react"
import { Headphones } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/layout/language-toggle"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12 flex items-center justify-between ${
      scrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
    }`}>
      <Link href="/" className="flex items-center space-x-2">
        <Headphones className="h-8 w-8" />
        <span className="font-medium text-xl">VoiceScribe</span>
      </Link>
      <div className="flex items-center space-x-4">
        <LanguageToggle 
          language={language} 
          onChange={setLanguage}
        />
        <ThemeToggle />
      </div>
    </header>
  )
}