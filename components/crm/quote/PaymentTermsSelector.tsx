'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PAYMENT_TERMS, type PaymentTermId } from './terms'

interface PaymentTermsSelectorProps {
  value: PaymentTermId | null
  onChange: (id: PaymentTermId) => void
  customNote: string
  onCustomNoteChange: (note: string) => void
}

export function PaymentTermsSelector({
  value,
  onChange,
  customNote,
  onCustomNoteChange,
}: PaymentTermsSelectorProps) {
  const [showNote, setShowNote] = useState(false)

  return (
    <div className="space-y-1">
      <RadioGroup
        value={value ?? ''}
        onValueChange={(v) => onChange(v as PaymentTermId)}
        className="space-y-1"
      >
        {PAYMENT_TERMS.map((term) => (
          <div key={term.id} className="rounded-md px-3 py-2 hover:bg-muted/40 transition-colors">
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value={term.id}
                id={`payment-${term.id}`}
                className="mt-0.5 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <Label
                  htmlFor={`payment-${term.id}`}
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  {term.label}
                </Label>
                {/* 選中時展開條款全文 */}
                {value === term.id && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {term.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      {/* 自由備註 */}
      <div className="pt-2 px-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-muted-foreground hover:text-foreground px-0 text-xs"
          onClick={() => setShowNote((v) => !v)}
        >
          {showNote
            ? <><Minus className="h-3 w-3" />收起備註</>
            : <><Plus className="h-3 w-3" />加上備註</>
          }
        </Button>
        {showNote && (
          <Textarea
            placeholder="補充付款條件說明..."
            value={customNote}
            onChange={(e) => onCustomNoteChange(e.target.value)}
            rows={3}
            className="mt-2 text-sm"
          />
        )}
      </div>
    </div>
  )
}
