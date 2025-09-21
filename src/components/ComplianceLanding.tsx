import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Scan, Zap, Lock, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router";

interface ComplianceLandingProps {
  onStartScan: (prompt: string) => void;
}

export default function ComplianceLanding({ onStartScan }: ComplianceLandingProps) {
  const [prompt, setPrompt] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scanInputRef = useRef<HTMLInputElement | null>(null);

  const handleScan = () => {
    if (!prompt.trim()) return;
    
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      onStartScan(prompt);
      setIsScanning(false);
    }, 2000);
  };

  const scrollToScan = () => {
    const el = document.getElementById("scan-section");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    // focus input after scroll
    setTimeout(() => scanInputRef.current?.focus(), 400);
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: "Multi-Standard Compliance",
      description: "Supports ISO 27001, GDPR, HIPAA, SOC 2, and more"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "Real-time Analysis",
      description: "Instant compliance scanning with AI-powered insights"
    },
    {
      icon: <Lock className="h-8 w-8 text-green-400" />,
      title: "Security First",
      description: "Enterprise-grade security with zero data retention"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      title: "Actionable Reports",
      description: "Detailed recommendations with risk prioritization"
    }
  ];

  const examplePrompts = [
    "Check AWS Security Compliance for ISO 27001",
    "Audit GDPR compliance for cloud infrastructure",
    "Scan HIPAA compliance for healthcare data",
    "Evaluate SOC 2 Type II readiness"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - light, minimal, with login */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/70 rounded-md">
              <Shield className="h-5 w-5 text-amber-800" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-amber-200">CLAUDIBLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:inline">Already have an account?</span>
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full bg-amber-900/80 hover:bg-amber-900 text-amber-100 border border-white/10 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* New Hero Section to match reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 rounded-xl border border-white/10 bg-amber-50/90 text-stone-800 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl tracking-tight font-bold">
                  Is Your Cloud
                  <span className="block">Audit-Ready?</span>
                </h1>
                <p className="text-lg text-stone-700">
                  Auditing compliance is time consuming, not beginner friendly and not cost effective.
                  Claudible aims to mitigate these challenges and ensure your cloud providers are audit ready.
                </p>
                <button
                  onClick={scrollToScan}
                  className="inline-flex items-center rounded-md bg-stone-700 hover:bg-stone-800 text-amber-50 px-6 py-3 font-semibold transition-colors"
                >
                  START NOW
                </button>
              </div>

              {/* Provider logos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-6 place-items-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                  alt="AWS"
                  className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg"
                  alt="Azure"
                  className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Cloud_logo.svg"
                  alt="Google Cloud"
                  className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Alibaba_Cloud_logo.svg"
                  alt="Alibaba Cloud"
                  className="h-16 w-auto bg-white rounded-md p-3 border border-stone-200"
                />
              </div>
            </div>
          </motion.div>

          {/* Scan Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
            id="scan-section"
          >
            <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-white mb-2">Start Your Compliance Scan</h2>
                    <p className="text-white/70">Describe what you'd like to audit and we'll analyze it instantly</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        ref={scanInputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Check AWS Security Compliance for ISO 27001"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md h-14 text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                      />
                    </div>
                    <Button
                      onClick={handleScan}
                      disabled={!prompt.trim() || isScanning}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 h-14 text-lg font-semibold"
                    >
                      {isScanning ? (
                        <>
                          <Scan className="h-5 w-5 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Scan className="h-5 w-5 mr-2" />
                          Scan Now
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Example Prompts */}
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm text-center">Try these examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {examplePrompts.map((example, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          onClick={() => setPrompt(example)}
                          className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-sm transition-all duration-200 hover:scale-105"
                        >
                          "{example}"
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose ComplianceAI?</h2>
              <p className="text-white/70 text-lg">Advanced features designed for modern compliance teams</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-white/70 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Comprehensive Compliance Coverage</h2>
                    <div className="space-y-4">
                      {[
                        "Automated security control validation",
                        "Risk-based prioritization of findings", 
                        "Detailed remediation guidance",
                        "Export-ready compliance reports",
                        "Multi-framework support"
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/80">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                      <div className="text-center space-y-4">
                        <div className="text-4xl font-bold text-white">99.9%</div>
                        <div className="text-white/70">Accuracy Rate</div>
                        <div className="text-2xl font-bold text-white">&lt; 2min</div>
                        <div className="text-white/70">Average Scan Time</div>
                        <div className="text-2xl font-bold text-white">50+</div>
                        <div className="text-white/70">Compliance Standards</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="relative z-10 p-6 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">
            © 2024 ComplianceAI. Built for hackathon demonstration purposes.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}