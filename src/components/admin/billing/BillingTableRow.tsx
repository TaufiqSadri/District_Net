import type {
  TagihanInstalasiWithRelations,
  TagihanStatus,
  TagihanWithRelations,
} from '@/lib/data/tagihan'
import ActionMenuButton from '@/components/admin/billing/ActionMenuButton'
import ProofButton from '@/components/admin/billing/ProofButton'
import AdminStatusBadge from '@/components/admin/shared/AdminStatusBadge'
import { billingStatusConfig } from '@/constants/admin-status-styles'

export type BillingVariant = 'bulanan' | 'instalasi'
export type BillingRow = TagihanWithRelations | TagihanInstalasiWithRelations

interface BillingTableRowProps {
  row: BillingRow
  variant: BillingVariant
  status: TagihanStatus
  onMarkPaid: (id: string) => void
  onDelete: (id: string) => void
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
]

const currencyFormatter = new Intl.NumberFormat('id-ID')
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export default function BillingTableRow({
  row,
  variant,
  status,
  onMarkPaid,
  onDelete,
}: BillingTableRowProps) {
  const proofUrl = row.pembayaran?.[0]?.bukti_pembayaran ?? null

  return (
    <tr className="border-t border-[#e5e7eb] transition hover:bg-slate-50/50">
      <td className="px-6 py-5 first:px-8">
        <CustomerIdentity row={row} />
      </td>
      <td className="px-6 py-5 text-[15px] font-medium text-slate-900">
        {getPeriodLabel(row, variant)}
      </td>
      <td className="px-6 py-5 text-[15px] font-semibold text-slate-900">
        {formatCurrency(row.jumlah_tagihan)}
      </td>
      <td className="px-6 py-5 text-[15px] font-normal text-slate-700">
        {formatDate(row.jatuh_tempo)}
      </td>
      <td className="px-6 py-5">
        <BillingStatusBadge status={status} />
      </td>
      <td className="px-6 py-5">
        <ProofButton proofUrl={proofUrl} />
      </td>
      <td className="px-6 py-5 text-right last:px-8">
        {variant === 'instalasi' ? (
          <ActionMenuButton
            variant="instalasi"
            row={row as TagihanInstalasiWithRelations}
            onMarkPaid={onMarkPaid}
            onDelete={onDelete}
          />
        ) : (
          <ActionMenuButton
            variant="bulanan"
            row={row as TagihanWithRelations}
            onMarkPaid={onMarkPaid}
            onDelete={onDelete}
          />
        )}
      </td>
    </tr>
  )
}

export function BillingMobileRow({
  row,
  variant,
  status,
  onMarkPaid,
  onDelete,
}: BillingTableRowProps) {
  const proofUrl = row.pembayaran?.[0]?.bukti_pembayaran ?? null

  return (
    <div className="border-t border-[#e5e7eb] px-5 py-5 first:border-t-0">
      <div className="flex items-start gap-3">
        <Avatar name={row.pelanggan?.nama_lengkap ?? '?'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-slate-900">
                {row.pelanggan?.nama_lengkap ?? '—'}
              </p>
              <p className="truncate text-xs font-normal text-slate-500">
                {row.pelanggan?.email ?? 'Email belum tersedia'}
              </p>
            </div>
            {variant === 'instalasi' ? (
              <ActionMenuButton
                variant="instalasi"
                row={row as TagihanInstalasiWithRelations}
                onMarkPaid={onMarkPaid}
                onDelete={onDelete}
              />
            ) : (
              <ActionMenuButton
                variant="bulanan"
                row={row as TagihanWithRelations}
                onMarkPaid={onMarkPaid}
                onDelete={onDelete}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <MobileField label="Periode" value={getPeriodLabel(row, variant)} />
            <MobileField label="Nominal" value={formatCurrency(row.jumlah_tagihan)} strong />
            <MobileField label="Jatuh Tempo" value={formatDate(row.jatuh_tempo)} />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Status
              </p>
              <BillingStatusBadge status={status} />
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Bukti
            </p>
            <ProofButton proofUrl={proofUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingStatusBadge({ status }: { status: TagihanStatus }) {
  const config = billingStatusConfig[status]

  return (
    <AdminStatusBadge
      className={config.className}
      dotClassName={config.dotClassName}
      minWidthClass="min-w-[112px]"
      textClassName="text-[11px] leading-none"
      uppercase
      centered
      ring={false}
    >
      {config.label}
    </AdminStatusBadge>
  )
}

function CustomerIdentity({ row }: { row: BillingRow }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <Avatar name={row.pelanggan?.nama_lengkap ?? '?'} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-slate-900">
          {row.pelanggan?.nama_lengkap ?? '—'}
        </p>
        <p className="truncate text-xs font-normal text-slate-500">
          {row.pelanggan?.email ?? 'Email belum tersedia'}
        </p>
      </div>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const index = name.charCodeAt(0) % avatarColors.length

  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${avatarColors[index]}`}
    >
      {initials || '?'}
    </div>
  )
}

function MobileField({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className={`text-sm ${strong ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
        {value}
      </p>
    </div>
  )
}

function getPeriodLabel(row: BillingRow, variant: BillingVariant) {
  if (variant === 'instalasi') return 'Biaya instalasi'

  const monthlyRow = row as TagihanWithRelations
  return `${monthLabels[monthlyRow.bulan - 1] ?? monthlyRow.bulan} ${monthlyRow.tahun}`
}

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return dateFormatter.format(new Date(value))
}
