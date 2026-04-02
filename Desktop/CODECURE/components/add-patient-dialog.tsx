"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserPlus, 
  Copy, 
  Check,
  Loader2,
  QrCode,
} from "lucide-react"
import { generateDoctorCode, connectDoctorToPatient } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddPatientDialogProps {
  doctorId: string
  onPatientAdded: () => void
}

export function AddPatientDialog({ doctorId, onPatientAdded }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [patientCode, setPatientCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGenerateCode = () => {
    const code = generateDoctorCode(doctorId)
    setGeneratedCode(code)
  }

  const copyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleConnectPatient = async () => {
    if (!patientCode.trim()) return
    
    setIsLoading(true)
    setError("")
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = connectDoctorToPatient(doctorId, patientCode.toUpperCase())
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setPatientCode("")
        onPatientAdded()
      }, 1500)
    } else {
      setError(result.error || "Failed to connect to patient")
    }
    
    setIsLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closing
      setGeneratedCode(null)
      setPatientCode("")
      setError("")
      setSuccess(false)
      setActiveTab("generate")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Patient
          </DialogTitle>
          <DialogDescription>
            Connect with patients using codes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Code</TabsTrigger>
            <TabsTrigger value="enter">Enter Patient Code</TabsTrigger>
          </TabsList>

          {/* Generate Code Tab */}
          <TabsContent value="generate" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a unique code that patients can use to connect with you.
            </p>

            {!generatedCode ? (
              <Button onClick={handleGenerateCode} className="w-full gap-2">
                <QrCode className="h-4 w-4" />
                Generate Connection Code
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your Connection Code</p>
                  <code className="text-3xl font-bold tracking-[0.3em] text-primary">
                    {generatedCode}
                  </code>
                </div>
                
                <Button 
                  onClick={copyCode} 
                  variant="outline" 
                  className="w-full gap-2"
                >
                  {codeCopied ? (
                    <>
                      <Check className="h-4 w-4 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    Share this code with your patient. They can enter it in their dashboard to connect with you.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Enter Patient Code Tab */}
          <TabsContent value="enter" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a patient code to connect with them directly.
            </p>

            <div className="space-y-2">
              <Label htmlFor="patient-code">Patient Code</Label>
              <Input
                id="patient-code"
                placeholder="Enter patient code (e.g., ABC123)"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest"
                disabled={success}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button 
              onClick={handleConnectPatient}
              disabled={isLoading || !patientCode.trim() || success}
              className="w-full gap-2"
            >
              {success ? (
                <>
                  <Check className="h-4 w-4" />
                  Patient Connected!
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to Patient"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
