"use client"

import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Clock,
  Activity,
  CalendarDays,
  FileText,
  Users,
  AlertTriangle,
  BarChart3,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  role: "patient" | "doctor"
  activeItem: string
  onItemClick: (item: string) => void
  isOpen: boolean
  onClose: () => void
}

const patientMenuItems = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { id: "timeline", icon: Clock, labelKey: "timeline" },
  { id: "recovery", icon: Activity, labelKey: "recoveryTracker" },
  { id: "calendar", icon: CalendarDays, labelKey: "calendar" },
  { id: "reports", icon: FileText, labelKey: "reports" },
]

const doctorMenuItems = [
  { id: "patients", icon: Users, labelKey: "patients" },
  { id: "alerts", icon: AlertTriangle, labelKey: "alerts" },
  { id: "overview", icon: BarChart3, labelKey: "overview" },
]

export function Sidebar({ role, activeItem, onItemClick, isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage()
  const menuItems = role === "patient" ? patientMenuItems : doctorMenuItems

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-lg font-semibold">Curaithm</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden h-16 items-center border-b px-4 lg:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-lg font-semibold">Curaithm</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id)
                  onClose()
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-xs text-muted-foreground">
              {role === "patient" ? t("needHelp") : t("quickStats")}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {role === "patient" ? t("contactSupport") : `5 ${t("patientsToday")}`}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
