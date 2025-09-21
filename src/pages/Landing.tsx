import { motion } from "framer-motion";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8f4ec] text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-[#f8f4ec]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/680f6340-5118-48fd-990f-c89cecd311ef"
              alt="Claudible logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold tracking-wide text-[#6b4f2a]">CLAUDIBLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-stone-700">Already have an account?</span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-[#7b5a36] hover:bg-[#6b4f2a] text-white text-sm border border-[#6b4f2a]/30 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-serif text-5xl md:text-6xl tracking-tight font-bold text-[#6b4f2a]">
              Is Your Cloud
              <span className="block">Audit-Ready?</span>
            </h1>
            <p className="text-lg text-stone-700">
              Auditing compliance is time consuming, not beginner friendly and not cost effective.
              Claudible aims to mitigate these challenges and ensure your cloud providers are audit ready.
            </p>
            <Link
              to="/providers"
              className="inline-flex items-center rounded-md bg-[#7b5a36] hover:bg-[#6b4f2a] text-white px-6 py-3 font-semibold tracking-wide uppercase transition-colors border border-[#6b4f2a]/30 shadow-sm"
            >
              START NOW
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-2 gap-10 sm:gap-12 place-items-center"
          >
            {/* Provider icon cards: bigger, rounded, subtle shadow */}
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/95 border border-stone-200 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition">
              <img
                src="https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg"
                alt="AWS"
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/95 border border-stone-200 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition">
              <img
                src="https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg"
                alt="Azure"
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/95 border border-stone-200 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition">
              <img
                src="https://www.vectorlogo.zone/logos/alibabacloud/alibabacloud-icon.svg"
                alt="Alibaba Cloud"
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/95 border border-stone-200 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition">
              <img
                src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg"
                alt="Google Cloud"
                className="h-16 sm:h-20 w-auto"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-[#f8f4ec] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-stone-600">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}