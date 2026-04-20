'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { NOTES_OPTIONS } from '@/app/(crm)/quotations/new/terms'

interface NotesSelectorProps {
  selectedIds: string[]
  customNote: string
  onToggle: (id: string) => void
  onCustomNoteChange: (note: string) => void
}

export function NotesSelector({
  selectedIds,
  customNote,
  onToggle,
  onCustomNoteChange,
}: NotesSelectorProps) {
  const [showNote, setShowNote] = useState(false)

  // 按勾選順序（在 selectedIds 陣列中的位置）排列輸出
  const selectedTexts = selectedIds
    .map((id) => NOTES_OPTIONS.find((o) => o.id === id)?.text)
    .filter((t): t is string => !!t)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {NOTES_OPTIONS.map((option) => {
          const checked = selectedIds.includes(option.id)
          return (
            <div
              key={option.id}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                checked
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/40'
              }`}
              onClick={() => onToggle(option.id)}
            >
              <Checkbox
                id={`note-${option.id}`}
                checked={checked}
                onCheckedChange={() => onToggle(option.id)}
                className="mt-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`note-${option.id}`}
                  className="text-sm font-medium text-foreground cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {option.label}
                </Label>
                {checked && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {option.text}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 自由備註 */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-sm text-muted-foreground hover:text-foreground px-0 h-auto py-0"
          onClick={() => setShowNote((v) => !v)}
        >
          {showNote ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          加上備註
        </Button>

        {showNote && (
          <Textarea
            className="mt-2"
            placeholder="補充其他備註說明（選填）..."
            value={customNote}
            onChange={(e) => onCustomNoteChange(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {/* 輸出預覽 */}
      {(selectedTexts.length > 0 || customNote) && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            輸出預覽
          </p>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {[...selectedTexts, customNote].filter(Boolean).join('\n')}
          </p>
        </div>
      )}
    </div>
  )
}
