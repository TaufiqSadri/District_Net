export interface ComplaintSearchParams {
  pelanggan?: string
  search?: string
  status?: string
  sort?: string
  page?: string
  success?: string
  error?: string
}

export const complaintStatusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'selesai', label: 'Selesai' },
]

export const complaintSortOptions = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terlama', label: 'Terlama' },
]

export function parseComplaintStatus(value?: string) {
  return value === 'menunggu' || value === 'selesai' ? value : 'semua'
}

export function parseComplaintSort(value?: string) {
  return value === 'terlama' ? 'terlama' : 'terbaru'
}
