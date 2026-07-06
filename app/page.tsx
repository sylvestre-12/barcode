import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">

      {/* HEADER */}
      <header className="w-full px-6 py-4 flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-md bg-white/70 dark:bg-black/40 sticky top-0 z-50">

        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          CheckIn<span className="text-blue-600">AI</span>
        </h1>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            Login
          </Link>

          <Link
            href="/auth/signup"
            className="px-5 py-2 text-sm rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">

        <div className="max-w-3xl">

          <p className="text-blue-600 font-medium mb-3">
            Smart Attendance • AI Powered • Secure
          </p>

          <h2 className="text-5xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
            Modern Barcode Attendance System for Organizations
          </h2>

          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            CheckInAI automates attendance using fast barcode scanning,
            real-time tracking, and AI-powered anomaly detection to improve
            transparency, security, and efficiency in workplaces and schools.
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link
              href="/auth/login"
              className="px-7 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium hover:scale-105 transition"
            >
              Get Started
            </Link>

            <Link
  href="/supervisor/scan"
  className="px-7 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
>
  Scan Attendance
</Link>

          </div>

          {/* TRUST LINE */}
          <p className="mt-6 text-sm text-zinc-500">
            Trusted for schools, offices, hospitals & enterprises
          </p>

        </div>

        {/* FEATURES */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">⚡ Fast Barcode Scan</h3>
            <p className="text-sm text-zinc-500">
              Scan attendance instantly using any smartphone camera.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">🧠 AI Detection</h3>
            <p className="text-sm text-zinc-500">
              Detect unusual behavior and prevent attendance fraud automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">📊 Live Dashboard</h3>
            <p className="text-sm text-zinc-500">
              Real-time analytics for admins, supervisors, and staff.
            </p>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
        © {new Date().getFullYear()} CheckInAI • Built for Smart Organizations
      </footer>

    </div>
  );
}