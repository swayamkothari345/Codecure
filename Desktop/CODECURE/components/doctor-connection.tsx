"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, MessageCircle, Stethoscope } from "lucide-react"

interface DoctorConnectionProps {
  doctor: {
    name: string
    specialization: string
    status: string
  }
}

export function DoctorConnection({ doctor }: DoctorConnectionProps) {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("doctorConnection")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">
              {doctor.specialization}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("status")}:</span>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {doctor.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button className="rounded-xl">
            <Video className="mr-2 h-4 w-4" />
            Video Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
