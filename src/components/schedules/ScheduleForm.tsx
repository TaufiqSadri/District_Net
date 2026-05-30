'use client'

import type { FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import PanelFieldLabel from '@/components/panel/shared/PanelFieldLabel'
import {
  scheduleStatusOptions,
  scheduleTypeOptions,
} from '@/components/schedules/scheduleOptions'
import type { JenisJadwalLayanan, StatusJadwalInstalasi } from '@/types/database'

export interface ScheduleCustomerOption {
  id: string
  nama_lengkap: string
  no_hp?: string | null
}

export interface ScheduleFormValues {
  pelanggan_id?: string | null
  jenis_jadwal?: JenisJadwalLayanan
  status?: StatusJadwalInstalasi
  tanggal_jadwal?: string | null
  teknisi?: string | null
  catatan?: string | null
  catatan_pelanggan?: string | null
  catatan_internal?: string | null
}

interface ScheduleFormProps {
  mode: 'ticket' | 'manual' | 'edit'
  values?: ScheduleFormValues
  customers?: ScheduleCustomerOption[]
  pending?: boolean
  submitLabel?: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export default function ScheduleForm({
  mode,
  values,
  customers = [],
  pending,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const isTicket = mode === 'ticket'
  const showCustomer = mode === 'manual'
  const showStatus = mode === 'edit'
  const typeOptions = scheduleTypeOptions.filter((item) => {
    if (item.value === 'semua') return false
    return isTicket ? item.value !== 'instalasi' : true
  })
  const defaultType = values?.jenis_jadwal ?? (isTicket ? 'perbaikan' : 'pengecekan')

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="catatan" value={values?.catatan ?? ''} />

      <div className="grid gap-4 sm:grid-cols-2">
        {showCustomer ? (
          <PanelFieldLabel label="Pelanggan" className="sm:col-span-2">
            <select
              name="pelanggan_id"
              required
              defaultValue={values?.pelanggan_id ?? ''}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
            >
              <option value="" disabled>
                Pilih pelanggan
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nama_lengkap}{customer.no_hp ? ` - ${customer.no_hp}` : ''}
                </option>
              ))}
            </select>
          </PanelFieldLabel>
        ) : null}

        <PanelFieldLabel label="Jenis Jadwal">
          <select
            name="jenis_jadwal"
            defaultValue={defaultType}
            className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          >
            {typeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </PanelFieldLabel>

        {showStatus ? (
          <PanelFieldLabel label="Status">
            <select
              name="status"
              defaultValue={values?.status ?? 'terjadwal'}
              className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
            >
              {scheduleStatusOptions.filter((item) => item.value !== 'semua').map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </PanelFieldLabel>
        ) : null}

        <PanelFieldLabel label="Tanggal">
          <input
            type="date"
            name="tanggal_jadwal"
            required={mode !== 'edit'}
            defaultValue={toDateInput(values?.tanggal_jadwal ?? null)}
            className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          />
        </PanelFieldLabel>

        <PanelFieldLabel label="Jam">
          <input
            type="time"
            name="jam_jadwal"
            required={mode !== 'edit'}
            defaultValue={toTimeInput(values?.tanggal_jadwal ?? null)}
            className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          />
        </PanelFieldLabel>

        <PanelFieldLabel label="Teknisi" className={showStatus ? 'sm:col-span-2' : undefined}>
          <input
            name="teknisi"
            defaultValue={values?.teknisi ?? ''}
            placeholder="Nama teknisi"
            className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          />
        </PanelFieldLabel>

        <PanelFieldLabel label="Catatan Pelanggan" className="sm:col-span-2">
          <textarea
            name="catatan_pelanggan"
            defaultValue={values?.catatan_pelanggan ?? values?.catatan ?? ''}
            rows={3}
            placeholder="Catatan yang boleh dilihat pelanggan."
            className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[14px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          />
        </PanelFieldLabel>

        <PanelFieldLabel label="Catatan Internal" className="sm:col-span-2">
          <textarea
            name="catatan_internal"
            defaultValue={values?.catatan_internal ?? ''}
            rows={3}
            placeholder="Catatan khusus admin atau teknisi."
            className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[14px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6741f5] focus:ring-2 focus:ring-[#6741f5]/20"
          />
        </PanelFieldLabel>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#dfe5ef] px-5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6741f5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] active:scale-[0.98] disabled:opacity-70"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function toDateInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function toTimeInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)
  return localDate.toISOString().slice(11, 16)
}
