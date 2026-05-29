import {
  CreditCard,
  MessageSquare,
  Users,
  Wrench,
} from 'lucide-react'

export interface RecentActivityItem {
  id: string
  title: string
  meta: string
  type: 'payment' | 'schedule' | 'registration' | 'complaint'
}

interface RecentActivityCardProps {
  items: RecentActivityItem[]
}

const activityConfig = {
  payment: {
    icon: CreditCard,
    className: 'bg-emerald-100 text-emerald-600',
  },
  schedule: {
    icon: Wrench,
    className: 'bg-violet-100 text-[#5427e6]',
  },
  registration: {
    icon: Users,
    className: 'bg-blue-100 text-blue-600',
  },
  complaint: {
    icon: MessageSquare,
    className: 'bg-red-100 text-red-600',
  },
}

export default function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <aside className="overflow-hidden rounded-[18px] border border-[#dfe5ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[#e2e8f0] px-6 py-7 sm:px-8">
        <h2 className="text-[22px] font-normal text-slate-800">Aktivitas Terbaru</h2>
      </div>
      <div className="max-h-[390px] overflow-y-auto p-6 sm:p-8">
        {items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item, index) => {
              const config = activityConfig[item.type]
              const Icon = config.icon
              const showLine = index < items.length - 1

              return (
                <div key={item.id} className="relative flex gap-4">
                  <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.className}`}>
                    <Icon size={15} />
                  </div>
                  {showLine ? (
                    <span className="absolute bottom-[-24px] left-[18px] top-9 w-px bg-[#e2e8f0]" />
                  ) : null}
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[15px] font-normal leading-6 text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-xs font-normal leading-5 text-slate-500">
                      {item.meta}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">
            Belum ada aktivitas terbaru.
          </p>
        )}
      </div>
    </aside>
  )
}
