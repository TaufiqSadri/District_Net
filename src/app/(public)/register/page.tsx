import RegisterForm from '@/app/(public)/register/RegisterForm'
import Navbar from '@/components/Navbar'
import { getPaketAktif } from '@/lib/data/paket'

export default async function RegisterPage() {
  const paketList = await getPaketAktif()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <RegisterForm paketList={paketList} />
      </main>
    </div>
  )
}
