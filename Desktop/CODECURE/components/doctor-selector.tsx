"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Stethoscope, 
  Plus, 
  Check,
  UserPlus,
  Copy,
  Loader2,
} from "lucide-react"
import { connectPatientToDoctor } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Doctor {
  id: string
  name: string
  email: string
}

interface DoctorSelectorProps {
  patientId: string
  patientCode: string
  doctors: Doctor[]
  selectedDoctorId: string | null
  onDoctorSelect: (doctorId: string) => void
  onDoctorAdded: () => void
}

export function DoctorSelector({
  patientId,
  patientCode,
  doctors,
  selectedDoctorId,
  onDoctorSelect,
  onDoctorAdded,
}: DoctorSelectorProps) {
  const { t } = useLanguage()
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [doctorCode, setDoctorCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)

  const handleAddDoctor = async () => {
    if (!doctorCode.trim()) {
      setError(t("errorRequired"))
      return
    }
    
    setIsLoading(true)
    setError("")
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = connectPatientToDoctor(patientId, doctorCode.toUpperCase())
    
    if (result.success) {
      setShowAddDoctor(false)
      setDoctorCode("")
      onDoctorAdded()
    } else {
      setError(result.error || t("errorConnection"))
    }
    
    setIsLoading(false)
  }

  const copyPatientCode = async () => {
    await navigator.clipboard.writeText(patientCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleOpenChange = (open: boolean) => {
    setShowAddDoctor(open)
    if (!open) {
      setDoctorCode("")
      setError("")
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {t("myDoctors")}
            </span>
            <Button size="sm" variant="outline" onClick={() => setShowAddDoctor(true)} className="gap-1">
              <Plus className="h-3 w-3" />
              {t("add")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Patient Code */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">{t("yourPatientCode")}</p>
            <div className="mt-1 flex items-center justify-between">
              <code className="text-lg font-bold tracking-wider text-primary">{patientCode}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyPatientCode}
                className="gap-1"
              >
                {codeCopied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("shareCodeWithDoctor")}
            </p>
          </div>

          {/* Doctor List */}
          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center">
              <UserPlus className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("noDoctorsConnected")}</p>
              <p className="text-xs text-muted-foreground">{t("addDoctorUsingCode")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("connectedDoctors")}</p>
              <Select value={selectedDoctorId || ""} onValueChange={onDoctorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectDoctor")} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        {doctor.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDoctorId && doctors.find(d => d.id === selectedDoctorId) && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {doctors.find(d => d.id === selectedDoctorId)?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {doctors.find(d => d.id === selectedDoctorId)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doctors.find(d => d.id === selectedDoctorId)?.email}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-primary/10 text-primary">
                      {t("connected")}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {t("connectToDoctor")}
            </DialogTitle>
            <DialogDescription>
              {t("enterDoctorCode")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={`${t("doctorCode")} (${t("enterPatientCode").replace("Patient", "Doctor")})`}
                value={doctorCode}
                onChange={(e) => {
                  setDoctorCode(e.target.value.toUpperCase())
                  setError("")
                }}
                className="text-center text-lg font-mono tracking-widest"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            
            <Button 
              onClick={handleAddDoctor} 
              disabled={isLoading || !doctorCode.trim()}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("connect")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
