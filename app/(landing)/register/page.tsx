import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pendaftaran Baru | Distric Internet",
  description: "Lengkapi data diri untuk memulai layanan Distric Net.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white px-5 py-10 sm:px-8 md:py-12">
      <section className="mx-auto w-full max-w-[430px] rounded-lg border border-[#eadff0] bg-white px-6 py-9 shadow-[0_18px_44px_rgba(26,10,46,0.12)] sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-wide text-[#1f1c29]">New Register</h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-gray-600">
            Complete your personal data to start the District Net service.
          </p>
        </div>

        <form className="mt-8">
          <div>
            <label htmlFor="full-name" className="text-sm font-bold text-[#374151]">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              placeholder="Your Name"
              required
              className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base text-[#2d2634] outline-none transition placeholder:text-gray-500 focus:border-[#68247B] focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="register-email" className="text-sm font-bold text-[#374151]">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="name@email.com"
                required
                className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base text-[#2d2634] outline-none transition placeholder:text-gray-500 focus:border-[#68247B] focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-bold text-[#374151]">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0812x-xx"
                required
                className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base text-[#2d2634] outline-none transition placeholder:text-gray-500 focus:border-[#68247B] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="installation-address" className="text-sm font-bold text-[#374151]">
              Installation Adress
            </label>
            <textarea
              id="installation-address"
              rows={3}
              placeholder="Jl. Raya, No. 123..."
              required
              className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-[#2d2634] outline-none transition placeholder:text-gray-500 focus:border-[#68247B] focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="internet-package" className="text-sm font-bold text-[#374151]">
              Select Package
            </label>
            <div className="relative mt-2">
              <select
                id="internet-package"
                required
                defaultValue=""
                className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-11 text-base text-[#2d2634] outline-none transition focus:border-[#68247B] focus:ring-2 focus:ring-purple-100"
              >
                <option value="" disabled>
                  Select an Internet Package
                </option>
                <option value="basic">Paket 25 Mbps</option>
                <option value="family">Paket 35 Mbps</option>
                <option value="pro">Paket 50 Mbps</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            </div>
          </div>

          <label className="mt-7 flex items-start gap-3 text-xs leading-relaxed text-gray-500">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#68247B] focus:ring-[#68247B]"
            />
            <span>
              I agree to{" "}
              <Link href="#" className="font-semibold text-[#68247B] transition hover:text-purple-950">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-semibold text-[#68247B] transition hover:text-purple-950">
                Privacy Policy
              </Link>{" "}
              applicable to Distric Net.
            </span>
          </label>

          <button
            type="submit"
            className="mt-5 h-14 w-full rounded-lg bg-[#7000c4] text-lg font-semibold text-white shadow-[0_14px_26px_rgba(112,0,196,0.22)] transition hover:bg-[#5c009f]"
          >
            Register Now
          </button>
        </form>

        <div className="mt-7 border-t border-[#eee7f2] pt-6 text-center text-base text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#68247B] transition hover:text-purple-950">
            Sign in here
          </Link>
        </div>
      </section>
    </main>
  );
}
