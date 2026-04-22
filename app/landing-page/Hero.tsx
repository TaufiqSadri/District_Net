import { LocateFixed, MapPin, RadioTower } from "lucide-react";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:py-14">
        <div>
          <p className="text-sm font-extrabold text-black">Internet Broadband Unlimited</p>
          <h1 className="mt-1 max-w-2xl text-3xl font-black leading-tight text-[#111111] sm:text-4xl md:text-5xl">
            Pasang <span className="text-brand-purple">Wi-Fi</span> di Rumah, Nikmati Internet Tanpa Batas!!
          </h1>

          <div className="mt-9 grid max-w-2xl grid-cols-3 gap-5 text-center">
            <div>
              <strong className="block text-3xl font-black sm:text-4xl">90+</strong>
              <span className="text-[11px] text-gray-600 sm:text-xs">Pelanggan Aktif</span>
            </div>
            <div>
              <strong className="block text-3xl font-black sm:text-4xl">24/7</strong>
              <span className="text-[11px] text-gray-600 sm:text-xs">Akses Portal</span>
            </div>
            <div>
              <strong className="block text-3xl font-black sm:text-4xl">100%</strong>
              <span className="text-[11px] text-gray-600 sm:text-xs">Data Aman</span>
            </div>
          </div>

          <form className="mt-6 max-w-xl rounded border border-gray-200 bg-white p-3 shadow-sm">
            <label className="mb-2 flex items-center gap-1 text-xs font-extrabold text-black">
              <MapPin className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              Check Location
            </label>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input className="h-8 rounded border border-gray-300 px-3 text-sm outline-brand-purple" aria-label="City" />
              <input className="h-8 rounded border border-gray-300 px-3 text-sm outline-brand-purple" aria-label="Address" />
              <button className="h-8 rounded bg-brand-purple px-4 text-xs font-bold text-white" type="button">
                Search
              </button>
              <button className="h-8 rounded bg-brand-purple px-4 text-xs font-bold text-white" type="button">
                My Location
              </button>
            </div>
          </form>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-sm">
          <div className="absolute bottom-10 left-5 right-5 h-24 rotate-[-7deg] bg-[#ececf6] shadow-sm" />
          <div className="absolute bottom-14 left-8 right-8 grid h-20 rotate-[-7deg] grid-cols-4 gap-2 opacity-70">
            <span className="bg-[#d7d6e8]" />
            <span className="bg-[#d7d6e8]" />
            <span className="bg-[#d7d6e8]" />
            <span className="bg-[#d7d6e8]" />
          </div>
          <div className="absolute left-12 top-24 h-14 w-10 bg-[#33345b]" />
          <div className="absolute right-12 top-24 h-14 w-10 bg-[#33345b]" />
          <div className="absolute left-24 top-32 h-10 w-28 rounded-t bg-[#ececf6]" />
          <div className="absolute right-24 top-32 h-10 w-28 rounded-t bg-[#ececf6]" />
          <span className="absolute left-24 top-40 h-6 w-6 rounded-full bg-brand-purple-light" />
          <span className="absolute right-24 top-40 h-6 w-6 rounded-full bg-brand-purple-light" />
          <div className="absolute left-1/2 top-8 flex h-40 w-40 -translate-x-1/2 items-center justify-center rounded-full bg-brand-purple text-white shadow-xl">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-brand-purple">
              <RadioTower className="h-12 w-12" />
            </div>
          </div>
          <div className="absolute left-1/2 top-44 h-24 w-1 -translate-x-1/2 rotate-[-18deg] bg-gray-300" />
          <LocateFixed className="absolute left-1/2 top-[7.6rem] h-7 w-7 -translate-x-1/2 text-brand-pink" />
        </div>
      </div>
    </section>
  );
}
