"use client"

import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Menu } from "lucide-react"

interface HeaderProps {
  userName: string
  role: "patient" | "doctor"
  onMenuClick?: () => void
  onLogout?: () => void
}

export function Header({ userName, role, onMenuClick, onLogout }: HeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Curaithm</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {role === "doctor" && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              3
            </span>
          )}
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              {userName.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium">{userName}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t("logout")}
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
