import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, SendHorizonal, Download, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Message = { role: "user" | "assistant" | "system"; content: string };

const onTopicKeywords: Array<string> = [
  "security","compliance","iso","27001","gdpr","hipaa","soc","pci","nist","risk","vulnerability","audit","policy","access","encryption","iam","s3","bucket","firewall","network","logging","monitoring"
] as const;

function isOnTopic(input: string) {
  const q = input.toLowerCase();
  return onTopicKeywords.some(k => q.includes(k));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockAnalysis(prompt: string) {
  // Convincing but dummy content, seeded by prompt length for variety
  const passed = randomInt(20, 60);
  const failed = randomInt(3, 12);
  const warnings = randomInt(2, 10);
  const total = passed + failed + warnings;

  // Categorize into Security, Governance, Risk
  const securityScore = randomInt(40, 92);
  const governanceScore = randomInt(35, 90);
  const riskScorePct = randomInt(20, 75);

  const standards = [
    { name: "ISO 27001", issues: randomInt(0, 8), riskScore: Number((Math.random() * 9 + 1).toFixed(1)), group: "security" as const },
    { name: "GDPR", issues: randomInt(0, 6), riskScore: Number((Math.random() * 7 + 1).toFixed(1)), group: "governance" as const },
    { name: "HIPAA", issues: randomInt(0, 7), riskScore: Number((Math.random() * 8 + 1).toFixed(1)), group: "risk" as const },
    { name: "SOC 2", issues: randomInt(0, 5), riskScore: Number((Math.random() * 6 + 1).toFixed(1)), group: "security" as const },
  ];

  const summaries = [
    { label: "Security", percent: securityScore, icon: Shield, color: "text-emerald-500" },
    { label: "Governance", percent: governanceScore, icon: CheckCircle, color: "text-blue-400" },
    { label: "Risk", percent: riskScorePct, icon: AlertTriangle, color: "text-amber-500" },
  ];

  const recs = [
    "Enforce MFA for all privileged IAM roles and automate periodic access reviews.",
    "Enable encryption at rest and in transit for data stores containing sensitive information.",
    "Tighten security group ingress rules to allow only known CIDRs and required ports.",
    "Turn on CloudTrail/CloudWatch retention with immutable log storage for at least 365 days.",
    "Implement automated S3 public access blocks and bucket policy guardrails."
  ];

  const selected = recs.sort(() => 0.5 - Math.random()).slice(3);

  return {
    prompt,
    summary: summaries,
    scanSummary: { passed, failed, warnings, total },
    standards,
    recommendations: selected,
  };
}

// Define a type for viz state
type Viz = ReturnType<typeof generateMockAnalysis>;

export default function Summary() {
  const [messages, setMessages] = useState<Array<Message>>([
    { role: "assistant", content: "Hi, need any security/compliance insights? Ask me anything about audits, risks, or controls." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Visualization state: start EMPTY until a valid question arrives
  const [viz, setViz] = useState<Viz | null>(null);

  const pieData = useMemo(
    () => viz ? ([
      { name: "Passed", value: viz.scanSummary.passed, color: "#10b981" },
      { name: "Failed", value: viz.scanSummary.failed, color: "#ef4444" },
      { name: "Warnings", value: viz.scanSummary.warnings, color: "#f59e0b" },
    ]) : [],
    [viz]
  );

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    // Guardrail
    if (!isOnTopic(trimmed)) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm focused on security and compliance topics (e.g., ISO 27001, SOC 2, GDPR, HIPAA, IAM, encryption, audit logs). Please rephrase your question in that scope."
          }
        ]);
        setLoading(false);
      }, 900);
      return;
    }

    // Simulated, convincing staged analysis (20–30s) with progressive status updates.
    const steps: Array<string> = [
      "Initializing compliance engine…",
      "Gathering recent audit logs…",
      "Checking IAM roles, policies & MFA posture…",
      "Scanning storage buckets for public access & encryption…",
      "Reviewing network ACLs, security groups & firewall rules…",
      "Validating logging & monitoring (CloudTrail/CloudWatch)…",
      "Cross-referencing with ISO 27001, SOC 2, GDPR, HIPAA controls…",
      "Computing risk scores and mapping to Security/Governance/Risk…",
      "Preparing visualizations and remediation guidance…"
    ];

    const totalDelay = 20000 + Math.random() * 10000; // 20–30s
    const stepInterval = Math.floor(totalDelay / (steps.length + 1));

    // Push staged updates
    steps.forEach((s, i) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: s }]);
      }, stepInterval * (i + 1));
    });

    // Finalize after long delay
    setTimeout(() => {
      const result = generateMockAnalysis(trimmed);
      setViz(result);

      const response = [
        "Analysis complete.",
        `High-level view: ${result.scanSummary.passed} passed, ${result.scanSummary.failed} failed, ${result.scanSummary.warnings} warnings.`,
        `Top risks detected around: ${result.standards
          .filter(s => s.issues > 0)
          .slice(0, 2)
          .map(s => s.name)
          .join(", ") || "no major standards"}.`,
        "Updated the left panel with KPIs, charts, and recommendations."
      ].join(" ");

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, totalDelay);
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  const barData = useMemo(
    () => viz ? viz.standards.map(s => ({ name: s.name, issues: s.issues, riskScore: s.riskScore })) : [],
    [viz]
  );

  const downloadReport = () => {
    if (!viz) return;
    const blob = new Blob([JSON.stringify(viz, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-summary-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
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
          <Link to="/" className="text-sm underline">Return to Home Page</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Visualization (fixed height + scrollable; initially empty) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <Card className="bg-amber-200/60 border-stone-300 h-[78vh] flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-3xl tracking-tight">Summary</CardTitle>
                <Button
                  variant="outline"
                  onClick={downloadReport}
                  className="gap-2 disabled:opacity-50"
                  disabled={!viz}
                >
                  <Download className="h-4 w-4" /> Download JSON
                </Button>
              </CardHeader>

              {/* Scrollable content area */}
              <CardContent className="flex-1 overflow-y-auto space-y-6">
                {!viz ? null : (
                  <>
                    {/* KPI pills: Security, Governance, Risk */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {viz.summary.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/60 border border-stone-200 rounded-xl p-4">
                          <s.icon className={`h-5 w-5 ${s.color}`} />
                          <div className="flex-1">
                            <div className="text-sm text-stone-600">{s.label}</div>
                            <div className="font-semibold">{s.percent}%</div>
                          </div>
                          <Badge className="bg-stone-800 text-stone-100">{s.percent}%</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/70 border-stone-200">
                        <CardHeader>
                          <CardTitle className="text-base">Compliance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                {pieData.map((e, i) => (
                                  <Cell key={i} fill={e.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/70 border-stone-200">
                        <CardHeader>
                          <CardTitle className="text-base">Issues by Standard</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={barData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="issues" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="bg-white/70 border-stone-200">
                      <CardHeader>
                        <CardTitle className="text-base">What you should do</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-stone-800">
                          {viz.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Chatbot (unchanged height) */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <Card className="bg-white border-stone-200 h-[78vh] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Assistant</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl border ${
                        m.role === "user"
                          ? "bg-stone-800 text-stone-50 border-stone-700"
                          : "bg-amber-200/80 text-stone-900 border-stone-300"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl border bg-amber-200/80 text-stone-900 border-stone-300 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking…
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="p-4 border-t border-stone-200">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask me anything about security & compliance..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) send();
                    }}
                  />
                  <Button onClick={send} disabled={loading || !input.trim()} className="gap-1 bg-stone-800 hover:bg-stone-900">
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Guardrails on: off-topic questions will be declined.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-stone-500">
          2026 Claudible. All rights reserved.
        </div>
      </footer>
    </div>
  );
}