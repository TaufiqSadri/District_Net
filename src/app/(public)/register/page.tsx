import RegisterForm from '@/app/(public)/register/RegisterForm'
import Navbar from '@/components/Navbar'
import { getLandingAreas, getLandingPackages } from '@/lib/data/landing'

export default async function RegisterPage() {
  const [paketList, areaList] = await Promise.all([
    getLandingPackages(),
    getLandingAreas(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 justify-center px-4 py-12">
        <RegisterForm paketList={paketList} areaList={areaList} />
      </main>
    </div>
  )
}
