import { motion } from "framer-motion";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full grid place-items-center border border-stone-300">
              <span className="text-xs">✳</span>
            </div>
            <span className="font-semibold tracking-wide">CLAUDIBLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-stone-500">Already have an account?</span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-stone-700 text-stone-50 text-sm"
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
            <h1 className="text-5xl md:text-6xl tracking-tight font-bold">
              Is Your Cloud
              <span className="block">Audit-Ready?</span>
            </h1>
            <p className="text-lg text-stone-700">
              Auditing compliance is time consuming, not beginner friendly and not cost effective.
              Claudible aims to mitigate these challenges and ensure your cloud providers are audit ready.
            </p>
            <Link
              to="/providers"
              className="inline-flex items-center rounded-md bg-stone-700 hover:bg-stone-800 text-stone-50 px-6 py-3 font-semibold transition-colors"
            >
              START NOW
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-6 place-items-center"
          >
            <img
              src="https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg"
              alt="AWS"
              className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
            />
            <img
              src="https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg"
              alt="Azure"
              className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
            />
            <img
              src="https://www.vectorlogo.zone/logos/alibabacloud/alibabacloud-icon.svg"
              alt="Alibaba Cloud"
              className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
            />
            <img
              src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg"
              alt="Google Cloud"
              className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}