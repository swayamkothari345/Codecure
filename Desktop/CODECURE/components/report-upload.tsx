"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  X, 
  Brain, 
  AlertTriangle, 
  CheckCircle2,
  FileImage,
  Loader2,
  Eye,
} from "lucide-react"
import { Report, addReport, generateReportAISummary } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReportUploadProps {
  patientId: string
  reports: Report[]
  onReportAdded: () => void
}

export function ReportUpload({ patientId, reports, onReportAdded }: ReportUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Create blob URL for preview
    const url = URL.createObjectURL(file)
    const type = file.type.includes("pdf") ? "pdf" : "image"
    
    // Generate AI summary
    const aiSummary = generateReportAISummary()

    addReport(patientId, {
      name: file.name,
      type: type as "pdf" | "image",
      uploadedAt: new Date().toISOString(),
      url,
      aiSummary,
    })

    setIsUploading(false)
    onReportAdded()
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Medical Reports
            </span>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <FileImage className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No reports uploaded yet</p>
              <p className="text-xs text-muted-foreground">Upload PDF or images</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-xl border p-3 transition-all hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {report.type === "pdf" ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : (
                      <FileImage className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.aiSummary && (
                    <Badge variant="secondary" className="gap-1">
                      <Brain className="h-3 w-3" />
                      AI Analyzed
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedReport?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport?.aiSummary && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Analysis Summary
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Problem Identified</p>
                    <p className="text-sm">{selectedReport.aiSummary.problem}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Abnormal Values</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedReport.aiSummary.abnormalValues.map((value, i) => (
                        <Badge key={i} variant="outline" className="gap-1 border-warning text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                    <ul className="mt-1 space-y-1">
                      {selectedReport.aiSummary.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {selectedReport.type === "image" && (
                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-sm font-medium">Report Preview</p>
                  <img
                    src={selectedReport.url}
                    alt={selectedReport.name}
                    className="max-h-[300px] rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
