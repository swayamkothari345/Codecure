"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Camera, 
  Upload, 
  Loader2,
  X,
  ZoomIn,
} from "lucide-react"
import { ConditionImage, addConditionImage } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageUploadProps {
  patientId: string
  images: ConditionImage[]
  onImageAdded: () => void
}

export function ImageUpload({ patientId, images, onImageAdded }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [note, setNote] = useState("")
  const [selectedImage, setSelectedImage] = useState<ConditionImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create blob URL for preview
    const url = URL.createObjectURL(file)

    addConditionImage(patientId, {
      url,
      uploadedAt: new Date().toISOString(),
      note: note || "Condition photo",
    })

    setIsUploading(false)
    setNote("")
    onImageAdded()
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-primary" />
            Condition Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Add a note (e.g., 'Skin condition day 5')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full gap-2"
              variant="outline"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center">
              <Camera className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No images uploaded</p>
              <p className="text-xs text-muted-foreground">Track visual progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(0, 6).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative aspect-square overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={image.url}
                    alt={image.note}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-5 w-5 text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </p>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.note}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={selectedImage?.url}
              alt={selectedImage?.note}
              className="w-full rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
              Uploaded: {selectedImage && new Date(selectedImage.uploadedAt).toLocaleString()}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Timeline */}
      {images.length > 1 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progress Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div key={image.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-primary"
                  >
                    <img
                      src={image.url}
                      alt={image.note}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Day {images.length - index}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
