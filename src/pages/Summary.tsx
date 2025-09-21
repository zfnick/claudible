import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, SendHorizonal, Download, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

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

  // Add a weekly trend for interactivity
  const trendDays = 7;
  const trend = Array.from({ length: trendDays }, (_, i) => {
    const base = 30 + Math.random() * 20;
    return {
      day: `Day ${i + 1}`,
      Security: Number((base + Math.random() * 10).toFixed(1)),
      Governance: Number((base * 0.8 + Math.random() * 8).toFixed(1)),
      Risk: Number((base * 0.6 + Math.random() * 6).toFixed(1)),
    };
  });

  return {
    prompt,
    summary: summaries,
    scanSummary: { passed, failed, warnings, total },
    standards,
    recommendations: selected,
    trend,
  };
}

// Define a type for viz state
type Viz = ReturnType<typeof generateMockAnalysis>;

// Add helper to extract the High-level view stats from assistant text
function extractHighLevelStats(text: string) {
  const re = /High-level view:\s*(\d+)\s+passed,\s*(\d+)\s+failed,\s*(\d+)\s+warnings\./i;
  const match = text.match(re);
  if (!match) return null;
  const rest = text.replace(re, "").trim();
  return {
    passed: Number(match[1]),
    failed: Number(match[2]),
    warnings: Number(match[3]),
    rest,
  };
}

export default function Summary() {
  const [messages, setMessages] = useState<Array<Message>>([
    { role: "assistant", content: "Hi, need any security/compliance insights? Ask me anything about audits, risks, or controls." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

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

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setViz(null);
    setLoading(true);
    setStepIndex(0);

    const totalDelay = 20000 + Math.random() * 10000; // 20–30s
    const stepInterval = Math.floor(totalDelay / steps.length);
    // Drive a visual loader instead of pushing step messages
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, stepInterval);

    setTimeout(() => {
      clearInterval(interval);
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

  // Derive progress percent for loader
  const progressPercent = Math.min(100, Math.round(((stepIndex + 1) / steps.length) * 100));

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
                <CardTitle className="text-3xl tracking-tight text-stone-900">Summary</CardTitle>
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
                {/* Loading skeleton visuals while thinking */}
                {loading && !viz ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="h-20 bg-white/50 border border-stone-200 rounded-xl" />
                      <div className="h-20 bg-white/50 border border-stone-200 rounded-xl" />
                      <div className="h-20 bg-white/50 border border-stone-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-72 bg-white/60 border border-stone-200 rounded-xl" />
                      <div className="h-72 bg-white/60 border border-stone-200 rounded-xl" />
                    </div>
                    <div className="h-64 bg-white/60 border border-stone-200 rounded-xl" />
                  </div>
                ) : null}

                {/* Render visualizations when ready */}
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
                          <CardTitle className="text-base text-stone-900">Compliance Overview</CardTitle>
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
                          <CardTitle className="text-base text-stone-900">Issues by Standard</CardTitle>
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

                    {/* New: Weekly Trend line chart */}
                    <Card className="bg-white/70 border-stone-200">
                      <CardHeader>
                        <CardTitle className="text-base text-stone-900">Weekly Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={viz.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Security" stroke="#10b981" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Governance" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Risk" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="bg-white/70 border-stone-200">
                      <CardHeader>
                        <CardTitle className="text-base text-stone-900">What you should do</CardTitle>
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
            <Card className="bg-white/60 backdrop-blur-md border-stone-300 shadow-sm h-[78vh] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg text-stone-900">Assistant</CardTitle>
              </CardHeader>

              {/* Glassy message container & bubbles */}
              <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  const stats = !isUser ? extractHighLevelStats(m.content) : null;
                  return (
                    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl border ${
                          isUser
                            ? "bg-stone-800 text-stone-50 border-stone-700"
                            : "bg-white/60 backdrop-blur-sm text-stone-900 border-stone-300 shadow-sm"
                        }`}
                      >
                        {stats ? (
                          <>
                            {/* Remaining assistant text without the High-level view sentence */}
                            {stats.rest && <div>{stats.rest}</div>}

                            {/* Pretty pills for High-level stats */}
                            <div className={`mt-2 flex flex-wrap items-center gap-2 ${stats.rest ? "" : ""}`}>
                              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 border-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {stats.passed} Passed
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 border-rose-200">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                {stats.failed} Failed
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                {stats.warnings} Warnings
                              </span>
                            </div>
                          </>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Make the loader glassy as well */}
                {loading && (
                  <div className="border rounded-2xl bg-white/60 backdrop-blur-sm text-stone-900 border-stone-300 p-4 shadow-sm">
                    <div className="mb-2 text-sm font-medium">Analyzing your request…</div>
                    
                    <div className="flex items-center justify-between mb-1 text-xs text-stone-600">
                      <span>Progress</span>
                      <span className="font-semibold">{progressPercent}%</span>
                    </div>

                    <Progress value={progressPercent} className="h-2 mb-3" />

                    <ul className="space-y-1 text-sm">
                      {steps.map((s, i) => (
                        <li key={i} className={`flex items-center gap-2 ${i <= stepIndex ? "text-stone-900" : "text-stone-400"}`}>
                          {i < stepIndex ? (
                            <span className="inline-flex items-center justify-center h-3 w-3 rounded-full bg-emerald-500" />
                          ) : i === stepIndex ? (
                            <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-stone-300" />
                          )}
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* Keep input readable; leave white input but place it on glass card */}
              <div className="p-3 border-t border-stone-200/70">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask me anything about security & compliance..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) send();
                    }}
                    className="bg-white text-stone-900 placeholder:text-stone-500"
                  />
                  <Button onClick={send} disabled={loading || !input.trim()} className="gap-1 bg-stone-800 hover:bg-stone-900">
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
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