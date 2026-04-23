import { LockKeyhole, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | Distric Internet",
  description: "Masuk ke akun Distric Net untuk mengelola layanan internet.",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white px-5 py-14 sm:px-8 md:py-20">
      <section className="mx-auto w-full max-w-[496px] rounded-lg border border-[#eadff0] bg-white px-6 py-10 shadow-[0_18px_44px_rgba(26,10,46,0.12)] sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-wide text-[#1f1c29]">Welcome</h1>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-gray-600">
            Log in to your District Net account to manage your internet service.
          </p>
        </div>

        <form className="mt-9">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white text-lg font-bold text-gray-700 transition hover:border-[#68247B] hover:bg-purple-50"
          >
            <span className="text-xl font-black text-[#4285F4]" aria-hidden="true">
              G
            </span>
            Login with Google
          </button>

          <div className="my-8 flex items-center gap-5 text-base font-semibold text-gray-500">
            <span className="h-px flex-1 bg-[#e3d8ea]" />
            or
            <span className="h-px flex-1 bg-[#e3d8ea]" />
          </div>

          <div>
            <label htmlFor="email" className="text-lg font-semibold text-[#2d2634]">
              Email Adress
            </label>
            <div className="mt-3 flex h-14 items-center gap-4 rounded-lg border border-[#d9c9e1] px-4 focus-within:border-[#68247B] focus-within:ring-2 focus-within:ring-purple-100">
              <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@email.com"
                className="h-full min-w-0 flex-1 bg-transparent text-lg text-[#2d2634] outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-lg font-semibold text-[#2d2634]">
                Password
              </label>
              <Link href="#" className="text-base font-bold text-[#68247B] transition hover:text-purple-950">
                Forgot Password?
              </Link>
            </div>
            <div className="mt-3 flex h-14 items-center gap-4 rounded-lg border border-[#d9c9e1] px-4 focus-within:border-[#68247B] focus-within:ring-2 focus-within:ring-purple-100">
              <LockKeyhole className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                className="h-full min-w-0 flex-1 bg-transparent text-lg text-[#2d2634] outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 h-16 w-full rounded-lg bg-[#7000c4] text-xl font-semibold text-white shadow-[0_14px_26px_rgba(112,0,196,0.22)] transition hover:bg-[#5c009f]"
          >
            Login
          </button>
        </form>

        <div className="mt-9 border-t border-[#eee7f2] pt-8 text-center text-lg text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-[#68247B] transition hover:text-purple-950">
            Register Now
          </Link>
        </div>
      </section>
    </main>
  );
}
