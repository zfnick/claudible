import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, SendHorizonal, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
/* removed Recharts imports */

type Message = { role: "user" | "assistant" | "system"; content: string };

const onTopicKeywords: Array<string> = [
  "security","compliance","iso","27001","gdpr","hipaa","soc","pci","nist","risk","vulnerability","audit","policy","access","encryption","iam","s3","bucket","firewall","network","logging","monitoring"
] as const;

function isOnTopic(input: string) {
  const q = input.toLowerCase();
  // Accept if matches keywords OR if it looks like a structured config payload
  const looksLikeConfig =
    input.trim().startsWith("{") &&
    /"S3Buckets"|"IAMRoles"|"LambdaFunctions"/.test(input);
  return looksLikeConfig || onTopicKeywords.some(k => q.includes(k));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Try to parse a structured config JSON from user input
function tryParseConfig(input: string): null | {
  S3Buckets?: Array<any>;
  IAMRoles?: Array<any>;
  LambdaFunctions?: Array<any>;
} {
  try {
    const obj = JSON.parse(input);
    if (
      obj &&
      (Array.isArray(obj.S3Buckets) ||
        Array.isArray(obj.IAMRoles) ||
        Array.isArray(obj.LambdaFunctions))
    ) {
      return obj;
    }
  } catch {
    // ignore
  }
  return null;
}

// Helper: Build analysis strictly from structured config, ensuring tallied counts
function analyzeFromConfig(config: ReturnType<typeof tryParseConfig>, prompt: string) {
  type UseCase = {
    service: string;
    title: string;
    explanation: string;
    frameworks: Array<string>;
    remediation: Array<string>;
    severity: "High" | "Medium" | "Low";
  };

  const useCases: Array<UseCase> = [];

  let failed = 0;
  let warnings = 0;
  let passedResources = 0;

  // S3 checks
  const s3s: Array<any> = Array.isArray(config?.S3Buckets) ? config!.S3Buckets : [];
  for (const b of s3s) {
    const bucketIssues: Array<UseCase> = [];
    const name = b.BucketName ?? "unknown";
    const region = b.Region ?? "us-east-1";

    if (b.PublicAccess === true) {
      failed++;
      bucketIssues.push({
        service: "S3 Buckets",
        title: `Public bucket: ${name}`,
        explanation:
          `S3 bucket '${name}' has public access enabled, potentially exposing sensitive data. This violates Malaysia PDPA 2010 and ISO 27018 requirements for secure personal data handling.`,
        frameworks: ["PDPA 2010", "ISO 27018"],
        remediation: [
          "Enable Block Public Access at account and bucket levels.",
          "Deny public access via bucket policy; use VPC endpoints or signed URLs.",
          "Audit object ACLs to remove any public grants."
        ],
        severity: "High",
      });
    }
    if ((b.Encryption ?? "None") === "None") {
      failed++;
      bucketIssues.push({
        service: "S3 Buckets",
        title: `No encryption at rest: ${name}`,
        explanation:
          `Default encryption is disabled for '${name}', risking data at rest exposure and non-compliance with encryption requirements.`,
        frameworks: ["ISO 27001", "PDPA 2010"],
        remediation: [
          "Enable default encryption (SSE-S3 or SSE-KMS).",
          "Rotate KMS keys and enforce TLS in transit.",
        ],
        severity: "High",
      });
    }
    if ((b.Versioning ?? "Disabled") === "Disabled") {
      warnings++;
      bucketIssues.push({
        service: "S3 Buckets",
        title: `Versioning disabled: ${name}`,
        explanation:
          `Object versioning is disabled, reducing recovery capability for deletions/overwrites.`,
        frameworks: ["ISO 27001"],
        remediation: ["Enable versioning for important data buckets."],
        severity: "Medium",
      });
    }
    if (b.LoggingEnabled === false) {
      warnings++;
      bucketIssues.push({
        service: "S3 Buckets",
        title: `Access logging disabled: ${name}`,
        explanation:
          `Server access logging is disabled, limiting audit trails and investigations.`,
        frameworks: ["SOC 2", "ISO 27001"],
        remediation: ["Enable server access logging to a dedicated log bucket."],
        severity: "Medium",
      });
    }

    if (bucketIssues.length === 0) {
      passedResources++;
    } else {
      useCases.push(...bucketIssues);
    }
  }

  // IAM checks
  const roles: Array<any> = Array.isArray(config?.IAMRoles) ? config!.IAMRoles : [];
  for (const r of roles) {
    const roleIssues: Array<UseCase> = [];
    const roleName = r.RoleName ?? "UnknownRole";
    const policies: Array<string> = Array.isArray(r.AttachedPolicies) ? r.AttachedPolicies : [];

    const hasAdmin = policies.some(p => /admin/i.test(p));
    if (hasAdmin) {
      failed++;
      roleIssues.push({
        service: "IAM Roles",
        title: `Over-privileged role: ${roleName}`,
        explanation:
          `Role '${roleName}' has broad administrative permissions, violating least-privilege principles.`,
        frameworks: ["BNM RMiT", "ISO 27001"],
        remediation: [
          "Replace AdministratorAccess with least-privilege scoped policies.",
          "Use Access Analyzer to detect unused permissions and refactor.",
        ],
        severity: "High",
      });
    }

    if (r.MFAEnabled === false) {
      failed++;
      roleIssues.push({
        service: "IAM Roles",
        title: `MFA not enforced: ${roleName}`,
        explanation:
          `Role '${roleName}' is used without MFA, increasing account takeover risk.`,
        frameworks: ["ISO 27001", "SOC 2"],
        remediation: [
          "Require MFA for privileged sessions using IAM condition keys.",
          "Enforce short session durations and remove long‑lived credentials.",
        ],
        severity: "High",
      });
    }

    if (roleIssues.length === 0) {
      passedResources++;
    } else {
      useCases.push(...roleIssues);
    }
  }

  // Lambda checks
  const lambdas: Array<any> = Array.isArray(config?.LambdaFunctions) ? config!.LambdaFunctions : [];
  for (const fn of lambdas) {
    const fnIssues: Array<UseCase> = [];
    const fnName = fn.FunctionName ?? "UnknownFunction";
    const env: Record<string, string> = typeof fn.EnvironmentVariables === "object" && fn.EnvironmentVariables ? fn.EnvironmentVariables : {};
    const envHasSecretsInPlaintext = Object.entries(env).some(([k, v]) =>
      /(password|token|secret|api_key|apikey|key)/i.test(k) && typeof v === "string"
    );
    if (envHasSecretsInPlaintext) {
      failed++;
      fnIssues.push({
        service: "Lambda Functions",
        title: `Plaintext secrets in env: ${fnName}`,
        explanation:
          `Function '${fnName}' stores sensitive values in environment variables without a secrets manager.`,
        frameworks: ["PDPA 2010", "ISO 27018"],
        remediation: [
          "Move secrets to AWS Secrets Manager or SSM Parameter Store (KMS).",
          "Strip secrets from env and fetch securely at runtime.",
          "Tighten execution role permissions.",
        ],
        severity: "High",
      });
    }

    if (typeof fn.Role === "string" && /admin/i.test(fn.Role)) {
      failed++;
      fnIssues.push({
        service: "Lambda Functions",
        title: `Broad execution role: ${fnName}`,
        explanation:
          `Function '${fnName}' assumes a highly privileged role, expanding blast radius.`,
        frameworks: ["ISO 27001"],
        remediation: [
          "Create least‑privilege role scoped to the function's needs.",
          "Use IAM Access Analyzer to refine actions and resources.",
        ],
        severity: "High",
      });
    }

    if (fnIssues.length === 0) {
      passedResources++;
    } else {
      useCases.push(...fnIssues);
    }
  }

  // If user asked for "more examples", add a couple extra generic detections (kept consistent)
  const wantsMore = /more examples/i.test(prompt);
  if (wantsMore) {
    warnings++;
    useCases.push({
      service: "CloudTrail",
      title: "Insufficient log retention",
      explanation:
        "Audit logs retained for less than 90 days reduce forensic visibility.",
      frameworks: ["ISO 27001", "SOC 2"],
      remediation: ["Increase retention to >= 365 days and enable immutability."],
      severity: "Medium",
    });
    warnings++;
    useCases.push({
      service: "Security Groups",
      title: "Overly permissive ingress",
      explanation:
        "Security group allows 0.0.0.0/0 on sensitive ports, expanding exposure.",
      frameworks: ["ISO 27001"],
      remediation: ["Restrict to known CIDRs and required ports only."],
      severity: "Medium",
    });
  }

  const passed = Math.max(0, passedResources);
  const total = passed + failed + warnings;

  // Simple category scores derived from issue ratios
  const pct = (ok: number) => (total === 0 ? 100 : Math.max(5, Math.min(95, Math.round((ok / total) * 100))));
  const securityScore = pct(passed);
  const governanceScore = pct(passed + Math.floor(warnings / 2));
  const riskScorePct = Math.max(5, 100 - pct(failed + warnings));

  const summaries = [
    { label: "Security", percent: securityScore, icon: Shield, color: "text-emerald-500" },
    { label: "Governance", percent: governanceScore, icon: CheckCircle, color: "text-blue-400" },
    { label: "Risk", percent: riskScorePct, icon: AlertTriangle, color: "text-amber-500" },
  ];

  // Curate recommendations from detected use cases
  const recommendations: Array<string> = [];
  if (useCases.some(u => u.service === "S3 Buckets" && /Public bucket/i.test(u.title))) {
    recommendations.push("Enable S3 Block Public Access and audit bucket ACLs and policies.");
  }
  if (useCases.some(u => u.service === "S3 Buckets" && /encryption/i.test(u.title))) {
    recommendations.push("Turn on default S3 encryption (SSE-KMS) with key rotation.");
  }
  if (useCases.some(u => u.service === "IAM Roles" && /MFA/i.test(u.title))) {
    recommendations.push("Require MFA for all privileged roles and enforce session policies.");
  }
  if (useCases.some(u => u.service === "IAM Roles" && /Over-privileged/i.test(u.title))) {
    recommendations.push("Refactor admin policies to least‑privilege using Access Analyzer.");
  }
  if (useCases.some(u => u.service === "Lambda Functions" && /Plaintext secrets/i.test(u.title))) {
    recommendations.push("Migrate secrets to Secrets Manager or SSM, not env variables.");
  }
  if (useCases.some(u => u.service === "Lambda Functions" && /execution role/i.test(u.title))) {
    recommendations.push("Scope Lambda execution roles to minimum required permissions.");
  }
  if (useCases.some(u => u.service === "Security Groups")) {
    recommendations.push("Restrict security group ingress to known CIDRs and required ports.");
  }
  if (useCases.some(u => u.service === "CloudTrail")) {
    recommendations.push("Increase log retention to 365 days and enable immutable storage.");
  }
  // Fallback if none detected
  if (recommendations.length === 0) {
    recommendations.push(
      "Enforce MFA for privileged access.",
      "Enable encryption in transit and at rest for sensitive data.",
      "Ensure logging/monitoring with adequate retention."
    );
  }

  return {
    prompt,
    summary: summaries,
    scanSummary: { passed, failed, warnings, total },
    standards: [
      { name: "ISO 27001", issues: failed, riskScore: Math.min(10, Math.max(1, Math.round((failed / Math.max(1, total)) * 10))), group: "security" as const },
      { name: "GDPR", issues: warnings, riskScore: Math.min(10, Math.max(1, Math.round((warnings / Math.max(1, total)) * 10))), group: "governance" as const },
      { name: "HIPAA", issues: 0, riskScore: 2, group: "risk" as const },
      { name: "SOC 2", issues: 0, riskScore: 2, group: "security" as const },
    ],
    recommendations,
    trend: [],
    useCases,
  };
}

// Add: Malaysia-focused use cases builder
function buildMalaysiaUseCases() {
  return [
    {
      service: "S3 Buckets",
      title: "S3 Bucket Public Access Risk",
      explanation:
        "S3 bucket 'customer-data' has public read access enabled, potentially exposing sensitive customer information. This violates Malaysia NCCP 2025 Pillar 3 (Secure Data Protection) and Data Sharing Act 2025 requirements for confidential data handling. For auditors: This bucket contains customer data accessible publicly, violating Malaysian data sovereignty requirements under NCCP 2025. The Data Sharing Act 2025 mandates strict access controls for personal data, and this configuration poses significant compliance risks.",
      frameworks: [
        "Malaysia NCCP 2025 - Pillar 3 (Data Residency)",
        "Data Sharing Act 2025 - Section 12 (Data Classification)",
        "Cybersecurity Act 2024 - NCII Requirements",
      ],
      remediation: [
        "Remove public access permissions and deny public bucket policies.",
        "Implement bucket-level encryption and enforce TLS in transit.",
        "Migrate to Malaysia region (ap-southeast-3).",
        "Configure proper IAM policies for controlled access.",
      ],
      severity: "High" as const,
    },
    {
      service: "IAM Roles",
      title: "IAM Administrative Role Over-Privileges",
      explanation:
        "IAM role 'AdminRole' has excessive administrative privileges without proper MFA enforcement or session duration limits. This violates Cybersecurity Act 2024 requirements for National Critical Information Infrastructure (NCII) access controls. For auditors: This role provides unrestricted administrative access without adequate security controls, violating CSA 2024 requirements for critical infrastructure protection and NCCP 2025 access management standards.",
      frameworks: [
        "Cybersecurity Act 2024 - Section 15 (NCII Security)",
        "Malaysia NCCP 2025 - Pillar 4 (Access Management)",
        "MyDIGITAL Framework - Digital Security Standards",
      ],
      remediation: [
        "Implement least-privilege access; remove broad admin policies.",
        "Enforce MFA for all administrative access.",
        "Set maximum session duration to 1 hour.",
        "Enable comprehensive audit logging aligned with NACSA.",
      ],
      severity: "High" as const,
    },
    {
      service: "IAM Roles",
      title: "IAM Read-Only Role Missing Audit Trail",
      explanation:
        "IAM role 'ReadOnlyRole' lacks comprehensive audit logging and proper data classification tagging required under Data Sharing Act 2025 for government data access. For auditors: While this role has limited permissions, it lacks the audit trail required by Data Sharing Act 2025 for tracking government data access and doesn't implement proper data classification controls.",
      frameworks: [
        "Data Sharing Act 2025 - Section 8 (Audit Requirements)",
        "Malaysia NCCP 2025 - Pillar 5 (Monitoring & Compliance)",
        "ISO 27017 - Cloud Audit Controls",
      ],
      remediation: [
        "Enable CloudTrail logging for all role activities.",
        "Implement data classification tags for access visibility.",
        "Establish inter-agency access policies and reviews.",
      ],
      severity: "Medium" as const,
    },
    {
      service: "Lambda Functions",
      title: "Lambda Function Data Processing Non-Compliance",
      explanation:
        "Lambda function 'ProcessCustomerData' processes personal data outside Malaysia region without NCCP 2025 data residency requirements and lacks proper encryption in transit and at rest. For auditors: This violates Malaysia data sovereignty requirements and MyDIGITAL security controls.",
      frameworks: [
        "Malaysia NCCP 2025 - Pillar 3 (Data Residency)",
        "MyDIGITAL Framework - Data Security Requirements",
        "Data Sharing Act 2025 - Personal Data Protection",
      ],
      remediation: [
        "Migrate function to Malaysia region (ap-southeast-3).",
        "Implement end-to-end encryption (in transit and at rest).",
        "Add data classification handling and controls.",
      ],
      severity: "Medium" as const,
    },
    {
      service: "Lambda Functions",
      title: "Lambda Report Generation Security Gap",
      explanation:
        "Lambda function 'GenerateReports' generates audit reports without proper data retention policies and lacks NACSA reporting integration under Cybersecurity Act 2024. For auditors: Does not meet CSA 2024 NACSA incident reporting and lacks data retention controls.",
      frameworks: [
        "Cybersecurity Act 2024 - NACSA Reporting Requirements",
        "Malaysia NCCP 2025 - Pillar 5 (Compliance Monitoring)",
        "Data Sharing Act 2025 - Data Retention Standards",
      ],
      remediation: [
        "Implement data retention policies aligned to Malaysian regulations.",
        "Add NACSA-compliant reporting capabilities.",
        "Enable comprehensive logging and migrate to ap-southeast-3.",
      ],
      severity: "Medium" as const,
    },
    {
      service: "S3 Buckets",
      title: "S3 Internal Documentation Bucket Compliant",
      explanation:
        "S3 bucket 'internal-docs' properly implements NCCP 2025 encryption standards, is in Malaysia region (ap-southeast-3), and has appropriate access controls. For auditors: Demonstrates proper implementation of NCCP 2025 data residency and encryption requirements.",
      frameworks: [
        "Malaysia NCCP 2025 - Pillar 3 (Data Residency)",
        "Data Sharing Act 2025 - Data Classification",
      ],
      remediation: [
        "Maintain current configuration.",
        "Continue scheduled access reviews per NCCP guidelines.",
      ],
      severity: "Low" as const,
    },
  ];
}

function generateMockAnalysis(prompt: string) {
  // First: try to build from structured config so counts TALLY with provided cases
  const config = tryParseConfig(prompt);
  if (config) {
    return analyzeFromConfig(config, prompt);
  }

  // NEW: If the prompt references Malaysia/NCCP/CSA/etc., return those specific use cases and derive counts
  const matchesMalaysia = /(Malaysia|NCCP|Cybersecurity Act 2024|Data Sharing Act 2025|NACSA|MyDIGITAL|S3 Bucket Public Access Risk)/i.test(
    prompt,
  );
  if (matchesMalaysia) {
    const useCases = buildMalaysiaUseCases();

    // Derive counts by severity: High = failed, Medium = warnings, Low = passed
    const failed = useCases.filter((u) => u.severity === "High").length;
    const warnings = useCases.filter((u) => u.severity === "Medium").length;
    const passed = useCases.filter((u) => u.severity === "Low").length;
    const total = failed + warnings + passed;

    const pct = (ok: number) =>
      total === 0 ? 100 : Math.max(5, Math.min(95, Math.round((ok / total) * 100)));
    const securityScore = pct(passed);
    const governanceScore = pct(passed + Math.floor(warnings / 2));
    const riskScorePct = Math.max(5, 100 - pct(failed + warnings));

    const summaries = [
      { label: "Security", percent: securityScore, icon: Shield, color: "text-emerald-500" },
      { label: "Governance", percent: governanceScore, icon: CheckCircle, color: "text-blue-400" },
      { label: "Risk", percent: riskScorePct, icon: AlertTriangle, color: "text-amber-500" },
    ];

    // Simple standards placeholder (kept consistent with app display)
    const standards = [
      { name: "ISO 27001", issues: failed, riskScore: Math.min(10, Math.max(1, Math.round((failed / Math.max(1, total)) * 10))), group: "security" as const },
      { name: "GDPR", issues: warnings, riskScore: Math.min(10, Math.max(1, Math.round((warnings / Math.max(1, total)) * 10))), group: "governance" as const },
      { name: "HIPAA", issues: 0, riskScore: 2, group: "risk" as const },
      { name: "SOC 2", issues: 0, riskScore: 2, group: "security" as const },
    ];

    // Build recommendations by flattening/removing duplicates, keep first ~6
    const recommendations: Array<string> = Array.from(
      new Set(useCases.flatMap((u) => u.remediation)),
    ).slice(0, 6);

    return {
      prompt,
      summary: summaries,
      scanSummary: { passed, failed, warnings, total },
      standards,
      recommendations,
      trend: [],
      useCases,
    };
  }

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

  // Add curated demo use cases for the cloud configuration checks
  const baseUseCases = [
    {
      service: "S3 Buckets",
      title: "Public bucket accidentally containing sensitive customer data",
      explanation:
        "Detected publicly accessible S3 bucket with objects likely containing sensitive customer data. Public access increases risk of data exposure and non-compliance.",
      frameworks: ["PDPA 2010", "ISO 27018"],
      remediation: [
        "Enable Block Public Access for the account and bucket.",
        "Set bucket policy to deny public access; use VPC endpoints or signed URLs.",
        "Enable default encryption (SSE-S3 or SSE-KMS) and enforce TLS in transit.",
        "Run inventory to identify sensitive objects and apply object-level ACL cleanup.",
      ],
      severity: "High" as const,
    },
    {
      service: "IAM Roles",
      title: "Admin role with no MFA and excessive permissions",
      explanation:
        "Over-privileged IAM role without MFA increases blast radius and violates least-privilege principles.",
      frameworks: ["BNM RMiT", "ISO 27001"],
      remediation: [
        "Require MFA for any privileged role/session using condition keys.",
        "Refactor policies to least-privilege; remove wildcards and unused actions.",
        "Enable Access Analyzer and periodic access reviews with automation.",
        "Rotate credentials and disable long‑lived keys for admins.",
      ],
      severity: "High" as const,
    },
    {
      service: "Lambda Functions",
      title: "Unencrypted environment variables containing secrets",
      explanation:
        "Lambda environment variables contain plaintext secrets and function assumes a broad execution role.",
      frameworks: ["PDPA 2010", "ISO 27018"],
      remediation: [
        "Move secrets to AWS Secrets Manager or SSM Parameter Store with KMS.",
        "Enable encryption helpers and do not store secrets in env vars.",
        "Tighten the Lambda execution role to least-privilege.",
        "Enable CloudWatch logging and alarms for anomalous access.",
      ],
      severity: "Medium" as const,
    },
  ];
  // Append Malaysia-specific use cases to the existing 3
  const useCases = [...baseUseCases, ...buildMalaysiaUseCases()];

  return {
    prompt,
    summary: summaries,
    scanSummary: { passed, failed, warnings, total },
    standards,
    recommendations: selected,
    trend,
    useCases,
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

// Temporary no-op to prevent runtime crashes if any stale <Download /> remains
const Download = () => null;

export default function Summary() {
  const [messages, setMessages] = useState<Array<Message>>([
    { role: "assistant", content: "Hi, need any security/compliance insights? Ask me anything about audits, risks, or controls." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // New: refs to keep each step chip for auto-scrolling in single-line indicator
  const stepRefs = useRef<Array<HTMLSpanElement | null>>([]);
  useEffect(() => {
    const el = stepRefs.current[stepIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [stepIndex]);

  // Visualization state: start EMPTY until a valid question arrives
  const [viz, setViz] = useState<Viz | null>(null);

  // removed pieData (Compliance Overview removed)

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

    // Always show the user's message
    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    // Guardrail: if off-topic, do not start the checking phase
    if (!isOnTopic(trimmed)) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm focused on cloud security and compliance. Ask about audits, controls, risks, IAM, encryption, logging/monitoring, or standards like ISO 27001, SOC 2, GDPR, or HIPAA."
        },
      ]);
      return;
    }

    // Proceed with normal analysis flow
    setViz(null);
    setLoading(true);
    setStepIndex(0);

    const totalDelay = 20000 + Math.random() * 10000; // 20–30s
    const stepInterval = Math.floor(totalDelay / steps.length);
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
        `Top risks detected around: ${
          result.standards
            .filter(s => s.issues > 0)
            .slice(0, 2)
            .map(s => s.name)
            .join(", ") || "no major standards"
        }.`,
        "Updated the left panel with KPIs, charts, and recommendations."
      ].join(" ");

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, totalDelay);
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  // removed barData (Issues by Standard removed)

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

  // Add counts based on use cases severity and a sorted list by severity
  const counts = useMemo(() => {
    const list = viz?.useCases ?? [];
    const critical = list.filter((u) => u.severity === "High").length;
    const medium = list.filter((u) => u.severity === "Medium").length;
    const compliant = list.filter((u) => u.severity === "Low").length;
    return { critical, medium, compliant };
  }, [viz]);

  const sortedUseCases = useMemo(() => {
    if (!viz?.useCases) return [];
    const order: Record<"High" | "Medium" | "Low", number> = { High: 0, Medium: 1, Low: 2 };
    return [...viz.useCases].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [viz]);

  // Add: simple aggregates for charts
  // Removed: serviceAgg aggregation as 'Findings by service' chart was removed

  // Removed: frameworkAgg aggregation as 'Framework frequency' chart was removed

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
                    {/* KPI pills: now show counts from use cases by severity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 bg-white/60 border border-stone-200 rounded-xl p-4">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                        <div className="flex-1">
                          <div className="text-sm text-stone-600">Critical Issues</div>
                          <div className="font-semibold">{counts.critical}</div>
                        </div>
                        <Badge className="bg-stone-800 text-stone-100">{counts.critical}</Badge>
                      </div>
                      <div className="flex items-center gap-3 bg-white/60 border border-stone-200 rounded-xl p-4">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <div className="text-sm text-stone-600">Medium Risks</div>
                          <div className="font-semibold">{counts.medium}</div>
                        </div>
                        <Badge className="bg-stone-800 text-stone-100">{counts.medium}</Badge>
                      </div>
                      <div className="flex items-center gap-3 bg-white/60 border border-stone-200 rounded-xl p-4">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <div className="text-sm text-stone-600">Compliant</div>
                          <div className="font-semibold">{counts.compliant}</div>
                        </div>
                        <Badge className="bg-stone-800 text-stone-100">{counts.compliant}</Badge>
                      </div>
                    </div>

                    {/* NEW: Severity Distribution (stacked bar) */}
                    <Card className="bg-white/70 border-stone-200">
                      <CardHeader>
                        <CardTitle className="text-base text-stone-900">Severity distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const total = counts.critical + counts.medium + counts.compliant || 1;
                          const critPct = Math.round((counts.critical / total) * 100);
                          const medPct = Math.round((counts.medium / total) * 100);
                          const compPct = Math.max(0, 100 - critPct - medPct);
                          return (
                            <div className="space-y-3">
                              {/* Make this a true horizontal stacked bar */}
                              <div className="h-3 w-full rounded-full overflow-hidden bg-stone-200 border border-stone-300 flex">
                                <div className="h-full bg-rose-500" style={{ width: `${critPct}%` }} />
                                <div className="h-full bg-amber-500" style={{ width: `${medPct}%` }} />
                                <div className="h-full bg-emerald-500" style={{ width: `${compPct}%` }} />
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-stone-700">
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 border border-rose-600" />
                                  Critical: {counts.critical} ({critPct}%)
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 border border-amber-600" />
                                  Medium: {counts.medium} ({medPct}%)
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-emerald-600" />
                                  Compliant: {counts.compliant} ({compPct}%)
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* 'Findings by service' chart removed as requested */}

                    {/* 'Framework frequency' chart removed as requested */}

                    {/* Latest Scan Results: now sorted by severity */}
                    <Card className="bg-white/70 border-stone-200">
                      <CardHeader>
                        <CardTitle className="text-base text-stone-900">Latest Scan Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sortedUseCases.map((uc, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-stone-200 bg-white/60 p-4"
                          >
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-stone-800 text-stone-100">{uc.service}</Badge>
                                <span
                                  className={`text-xs rounded-full border px-2 py-0.5 ${
                                    uc.severity === "High"
                                      ? "bg-rose-100 text-rose-700 border-rose-200"
                                      : uc.severity === "Medium"
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  {uc.severity} Severity
                                </span>
                              </div>
                            </div>
                            <div className="font-semibold text-stone-900 mb-1">{uc.title}</div>
                            <p className="text-sm text-stone-700 mb-3">{uc.explanation}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {uc.frameworks.map((fw) => (
                                <span
                                  key={fw}
                                  className="text-xs rounded-full border px-2 py-0.5 bg-stone-100 text-stone-800 border-stone-200"
                                >
                                  {fw}
                                </span>
                              ))}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-stone-800 mb-1">What should you do</div>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-stone-800">
                                {uc.remediation.map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Bottom 'What you should do' recommendations removed as requested */}
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

                    {/* Single-line animated step indicator: show ONLY current step; when it changes, animate old one up & fade out */}
                    <div className="h-6 relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={steps[stepIndex]}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center gap-2 text-xs text-amber-800"
                        >
                          <Loader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                          <span className="animate-pulse">{steps[stepIndex]}</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
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