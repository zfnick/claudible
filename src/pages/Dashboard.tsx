import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";

type CloudItem = {
  key: string;
  name: string;
  env: "Prod" | "Dev" | "DB";
  logo: string;
};

const clouds: Array<CloudItem> = [
  {
    key: "aws",
    name: "Amazon Web Services",
    env: "Prod",
    logo: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg",
  },
  {
    key: "azure",
    name: "Microsoft Azure",
    env: "Dev",
    logo: "https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg",
  },
  {
    key: "gcp",
    name: "Google Cloud Platform",
    env: "DB",
    logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
  },
];

const notifications: Array<{ title: string; body: string; time: string }> = [
  {
    title: "AWS IAM",
    body: "Root access key detected. Recommendation: Remove and use IAM role.",
    time: "2h ago",
  },
  {
    title: "Azure Policy",
    body: "New policy initiative assigned to Dev subscription.",
    time: "5h ago",
  },
  {
    title: "GCP Storage",
    body: "Public bucket discovered in project db-core.",
    time: "Yesterday",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/680f6340-5118-48fd-990f-c89cecd311ef"
              alt="Claudible logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold tracking-wide">CLAUDIBLE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm underline">Home</Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-700">Terry Ong</span>
              <div className="h-8 w-8 rounded-full bg-stone-200 border border-stone-300" />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Your Cloud Platforms */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-amber-200/60 border-stone-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl tracking-tight font-bold">Your cloud platforms</h2>
                  <button
                    className="text-sm inline-flex items-center gap-2 text-stone-800 hover:opacity-80"
                    onClick={() => navigate("/providers")}
                  >
                    <span className="text-xl">+</span> Add another cloud platform
                  </button>
                </div>

                <div className="space-y-4">
                  {clouds.map((c, idx) => (
                    <motion.button
                      key={c.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      onClick={() => navigate("/summary")}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-4 bg-white text-stone-900 border border-stone-200 rounded-2xl px-4 py-4 hover:bg-stone-50 transition-colors">
                        <div className="relative">
                          <img src={c.logo} alt={c.name} className="h-10 w-10 rounded-md bg-white" />
                          <span className="absolute -bottom-2 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-stone-900 border border-stone-300">
                            {c.env}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-stone-500">Click to view summary</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="bg-amber-200/60 border-stone-300">
              <CardContent className="p-6">
                <h2 className="text-2xl tracking-tight font-bold mb-4">Notifications</h2>

                <div className="bg-white/90 border border-stone-200 rounded-2xl p-4">
                  {notifications.length === 0 ? (
                    <div className="h-40 grid place-items-center text-stone-600 text-sm">
                      No notifications
                    </div>
                  ) : (
                    <ul className="divide-y divide-stone-200">
                      {notifications.map((n, i) => (
                        <li key={i} className="py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-stone-900">{n.title}</div>
                              <div className="text-sm text-stone-700">{n.body}</div>
                            </div>
                            <span className="text-xs text-stone-500 whitespace-nowrap">{n.time}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
