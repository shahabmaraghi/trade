"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SaveChartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  isLoading: boolean
}

export function SaveChartDialog({ open, onOpenChange, onSave, isLoading }: SaveChartDialogProps) {
  const [name, setName] = useState("")

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
      setName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ذخیره چارت</DialogTitle>
          <DialogDescription>نام چارت را وارد کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chart-name">نام چارت</Label>
            <Input
              id="chart-name"
              placeholder="مثال: تحلیل بیت کوین - تاریخ تحلیل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleSave()
                }
              }}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
            {isLoading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
