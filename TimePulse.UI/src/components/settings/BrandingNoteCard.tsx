import { Info } from 'lucide-react'

export function BrandingNoteCard() {
  return (
    <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3.5 flex items-start gap-2.5">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          Note
        </h4>
        <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
          Some elements may vary slightly in the actual application depending on the context.
        </p>
      </div>
    </div>
  )
}
