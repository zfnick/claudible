import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

const logos: Record<string, string> = {
  aws: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg",
  azure: "https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg",
  gcp: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
  alibaba: "https://www.vectorlogo.zone/logos/alibabacloud/alibabacloud-icon.svg",
};

export default function BeforeStart() {
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState("");

  const providerName = useMemo(() => {
    switch (provider) {
      case "aws": return "AWS";
      case "azure": return "Azure";
      case "gcp": return "Google Cloud";
      case "alibaba": return "Alibaba Cloud";
      default: return "Cloud";
    }
  }, [provider]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/680f6340-5118-48fd-990f-c89cecd311ef"
              alt="Claudible logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold tracking-wide">CLAUDIBLE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm underline">Return to Home Page</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 flex-1">
        <div className="flex items-start gap-10">
          <img src={logos[provider ?? "aws"]} alt={providerName} className="h-16 w-16" />
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl tracking-tight font-bold text-stone-800 mb-6"
            >
              Before we start....
            </motion.h2>
            <p className="text-lg">
              Create an IAM access and allow <span className="font-semibold">ReadAccessOnly</span> for this account ID
            </p>

            <Card className="mt-6 max-w-xl bg-white border-stone-200">
              <CardContent className="p-6">
                <label className="text-stone-700 text-sm block mb-2">Account ID:</label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="bg-white"
                  />
                  <Button
                    onClick={() => navigate("/summary")}
                    className="bg-stone-700 hover:bg-stone-800"
                  >
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}