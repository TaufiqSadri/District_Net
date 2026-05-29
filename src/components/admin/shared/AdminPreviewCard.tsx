import type { ReactNode } from 'react'

interface AdminPreviewCardProps {
  title: string
  icon: ReactNode
  items: Array<{ id: string; title: string; description: string }>
  emptyText: string
}

export default function AdminPreviewCard({
  title,
  icon,
  items,
  emptyText,
}: AdminPreviewCardProps) {
  return (
    <section className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eee8ff] text-[#6741f5]">
          {icon}
        </div>
        <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9ddea] bg-[#f8faff] px-4 py-6 text-center text-[14px] text-slate-500">
            {emptyText}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-[14px]"
            >
              <p className="font-semibold text-[#111827]">{item.title}</p>
              <p className="mt-1 line-clamp-2 font-normal text-slate-500">
                {item.description}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
