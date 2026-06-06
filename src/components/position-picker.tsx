"use client"

/** Multi-select chips for positions (one instance per sport). */
export function PositionPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  function toggle(pos: string) {
    onChange(value.includes(pos) ? value.filter((p) => p !== pos) : [...value, pos])
  }
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((pos) => {
          const on = value.includes(pos)
          return (
            <button
              key={pos}
              type="button"
              onClick={() => toggle(pos)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                on ? "border-accent bg-accent text-ink" : "border-border bg-background text-foreground hover:border-accent/60"
              }`}
            >
              {pos}
            </button>
          )
        })}
      </div>
    </div>
  )
}
