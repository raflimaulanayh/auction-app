import { formatThousands, parseRupiah } from '../../lib/money'

export function MoneyInput({
  value,
  onChange,
  label,
  id,
}: {
  value: number
  onChange: (value: number) => void
  label: string
  id: string
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-11 items-center rounded-xl border border-border bg-field px-3 focus-within:border-foreground">
        <span className="mr-2 text-sm font-semibold text-muted">Rp</span>
        <input
          id={id}
          inputMode="numeric"
          value={formatThousands(value)}
          onChange={(e) => onChange(parseRupiah(e.target.value))}
          className="tabular w-full bg-transparent text-base font-semibold outline-none"
        />
      </div>
    </label>
  )
}
