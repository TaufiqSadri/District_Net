import { ChevronDown } from 'lucide-react'

interface PanelFilterSelectProps {
  name: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  widthClass?: string
  light?: boolean
}

export default function PanelFilterSelect({
  name,
  label,
  value,
  options,
  widthClass = 'lg:w-[154px]',
  light,
}: PanelFilterSelectProps) {
  return (
    <label className={`relative w-full flex-shrink-0 ${widthClass}`}>
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className={`h-12 w-full appearance-none rounded-xl border-0 py-0 pl-4 pr-10 text-[15px] font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25 ${
          light ? 'bg-white ring-1 ring-[#e5e7eb]' : 'bg-[#f1f4fc]'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </label>
  )
}
