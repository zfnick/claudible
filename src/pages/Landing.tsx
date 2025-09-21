import { useState } from "react";
import { motion } from "framer-motion";
import ComplianceLanding from "@/components/ComplianceLanding";
import ComplianceDashboard from "@/components/ComplianceDashboard";

export default function Landing() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [scanPrompt, setScanPrompt] = useState("");

  const handleStartScan = (prompt: string) => {
    setScanPrompt(prompt);
    setShowDashboard(true);
  };

  const handleEndSession = () => {
    setShowDashboard(false);
    setScanPrompt("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {showDashboard ? (
        <ComplianceDashboard onEndSession={handleEndSession} />
      ) : (
        <ComplianceLanding onStartScan={handleStartScan} />
      )}
    </motion.div>
  );
}