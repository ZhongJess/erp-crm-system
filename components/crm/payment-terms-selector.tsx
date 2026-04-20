'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PAYMENT_TERMS } from '@/app/(crm)/quotations/new/terms'

interface PaymentTermsSelectorProps {
  value: string | null
  customNote: string
  onChange: (termId: string | null) => void
  onCustomNoteChange: (note: string) => void
}

export function PaymentTermsSelector({
  value,
  customNote,
  onChange,
  onCustomNoteChange,
}: PaymentTermsSelectorProps) {
  const [showNote, setShowNote] = useState(false)

  const selectedTerm = PAYMENT_TERMS.find((t) => t.id === value)

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value ?? ''}
        onValueChange={(v) => onChange(v || null)}
        className="space-y-2"
      >
        {PAYMENT_TERMS.map((term) => (
          <div
            key={term.id}
            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              value === term.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/40'
            }`}
            onClick={() => onChange(term.id === value ? null : term.id)}
          >
            <RadioGroupItem
              value={term.id}
              id={`payment-${term.id}`}
              className="mt-0.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={`payment-${term.id}`}
                className="text-sm font-medium text-foreground cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {term.label}
              </Label>
              {value === term.id && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {term.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

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
            placeholder="補充付款相關備註（選填）..."
            value={customNote}
            onChange={(e) => onCustomNoteChange(e.target.value)}
            rows={3}
          />
        )}
      </div>

      {/* 輸出預覽 */}
      {(selectedTerm || customNote) && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            輸出預覽
          </p>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {[selectedTerm?.text, customNote].filter(Boolean).join('\n')}
          </p>
        </div>
      )}
    </div>
  )
}
