import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";

const providers = [
  {
    key: "aws",
    name: "Amazon",
    logo: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-ar21.svg",
  },
  {
    key: "azure",
    name: "Azure",
    logo: "https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-ar21.svg",
  },
  {
    key: "alibaba",
    name: "Alibaba",
    logo: "https://www.vectorlogo.zone/logos/alibabacloud/alibabacloud-ar21.svg",
  },
  {
    key: "gcp",
    name: "Google",
    logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-ar21.svg",
  },
] as const;

export default function ProviderSelect() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Claudible logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold tracking-wide">CLAUDIBLE</span>
          </div>
          <Link to="/login" className="px-4 py-1.5 rounded-full bg-stone-700 text-stone-50 text-sm">Login</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl tracking-tight font-bold text-stone-800 mb-8"
        >
          Choose your cloud provider
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((p, i) => (
            <motion.button
              key={p.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => navigate(`/before-start/${p.key}`)}
              className="group text-left"
            >
              <Card className="h-full bg-amber-200/60 border-stone-300 hover:bg-amber-200 transition-colors">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <img src={p.logo} alt={p.name} className="h-16 object-contain" />
                  <div className="text-stone-800 font-medium">{p.name}</div>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-sm text-stone-600 mt-8">
          Do not see your cloud provider? <a className="underline" href="#">Click here</a>
        </p>
      </main>

      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}