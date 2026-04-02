"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, User, Stethoscope } from "lucide-react"

interface Message {
  id: string
  sender: "patient" | "doctor"
  content: string
  timestamp: string
}

interface ChatPanelProps {
  messages: Message[]
  patientName: string
  role: "patient" | "doctor"
  onSendMessage?: (content: string) => void
  className?: string
}

export function ChatPanel({
  messages,
  patientName,
  role,
  onSendMessage,
  className,
}: ChatPanelProps) {
  const { t } = useLanguage()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    onSendMessage?.(newMessage)
    setNewMessage("")
  }

  return (
    <div
      className={cn(
        "flex flex-col h-[500px] max-h-[500px] min-h-0 overflow-hidden rounded-2xl border bg-card shadow",
        className
      )}
    >
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3">
        <p className="text-sm font-semibold">
          {t("communication")} - {patientName}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noMessages")}
            </p>
          ) : (
            messages.map((msg) => {
              const isOwn =
                (role === "doctor" && msg.sender === "doctor") ||
                (role === "patient" && msg.sender === "patient")

              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-2", isOwn && "flex-row-reverse")}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      msg.sender === "doctor"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.sender === "doctor" ? (
                      <Stethoscope className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 break-words",
                      isOwn
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-card p-3 sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1 rounded-xl"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}