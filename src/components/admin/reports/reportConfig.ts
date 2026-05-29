export const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

export const monthOptions = [
  { value: 'semua', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const currentYear = new Date().getFullYear()

export const yearOptions = [
  { value: 'semua', label: 'Semua Tahun' },
  ...Array.from({ length: 5 }, (_, index) => {
    const year = currentYear - index
    return { value: String(year), label: String(year) }
  }),
]

export const reportStatusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'belum_bayar', label: 'Belum Dibayar' },
  { value: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
  { value: 'lunas', label: 'Lunas' },
]

export const reportExportOptions = [
  { label: 'Tagihan', type: 'tagihan' },
  { label: 'Pembayaran', type: 'pembayaran' },
  { label: 'Pelanggan', type: 'pelanggan' },
  { label: 'Komplain', type: 'komplain' },
]

export interface ReportSearchParams {
  bulan?: string
  tahun?: string
  status?: string
}

export function parseReportMonth(value?: string) {
  const month = Number(value)
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null
}

export function parseReportYear(value?: string) {
  const year = Number(value)
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null
}

export function parseReportStatus(value?: string) {
  return reportStatusOptions.some((item) => item.value === value && item.value !== 'semua')
    ? value ?? null
    : null
}
