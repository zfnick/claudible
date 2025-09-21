import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  RotateCcw,
  TrendingUp,
  FileText
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import mockData from "@/data/mockData.json";

interface ComplianceDashboardProps {
  onEndSession: () => void;
}

export default function ComplianceDashboard({ onEndSession }: ComplianceDashboardProps) {
  const { scanSummary, standards, recommendations } = mockData;

  const pieData = [
    { name: "Passed", value: scanSummary.passed, color: "#10b981" },
    { name: "Failed", value: scanSummary.failed, color: "#ef4444" },
    { name: "Warnings", value: scanSummary.warnings, color: "#f59e0b" }
  ];

  const barData = standards.map(standard => ({
    name: standard.name,
    issues: standard.issues,
    riskScore: standard.riskScore
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pass": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Fail": return <XCircle className="h-4 w-4 text-red-500" />;
      case "Warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Pass: "bg-green-500/20 text-green-300 border-green-500/30",
      Fail: "bg-red-500/20 text-red-300 border-red-500/30", 
      Warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      High: "bg-red-500/20 text-red-300 border-red-500/30",
      Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      Low: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    };
    return variants[priority as keyof typeof variants] || "";
  };

  const handleDownloadReport = () => {
    const reportData = JSON.stringify(mockData, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-audit-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Audit Results</h1>
          <p className="text-white/70">Comprehensive security and compliance analysis</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleDownloadReport}
            className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button 
            onClick={onEndSession}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Checks</p>
                  <p className="text-2xl font-bold text-white">{scanSummary.totalChecks}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Passed</p>
                  <p className="text-2xl font-bold text-green-400">{scanSummary.passed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{scanSummary.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-400">{scanSummary.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Issues by Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="issues" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Compliance Standards Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Standard</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Issues Found</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {standards.map((standard, index) => (
                    <motion.tr
                      key={standard.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-medium">{standard.name}</td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusBadge(standard.status)} border`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(standard.status)}
                            {standard.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-white">{standard.issues}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{standard.riskScore}</span>
                          <Progress 
                            value={standard.riskScore * 10} 
                            className="w-20 h-2 bg-white/20"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Explanations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Explanations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {standards.filter(s => s.explanations.length > 0).map((standard) => (
              <div key={standard.name} className="space-y-3">
                <h4 className="text-lg font-semibold text-white">{standard.name}</h4>
                {standard.explanations.map((explanation, index) => (
                  <motion.div
                    key={explanation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-white font-medium">{explanation.description}</p>
                        <p className="text-white/70 text-sm">{explanation.justification}</p>
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-md p-3">
                          <p className="text-blue-200 text-sm font-medium">Recommendation:</p>
                          <p className="text-blue-100 text-sm">{explanation.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Action Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">{rec.title}</h4>
                      <Badge className={`${getPriorityBadge(rec.priority)} border text-xs`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-white/80">{rec.description}</p>
                    <p className="text-white/60 text-sm">{rec.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">Effort</p>
                    <p className="text-white font-medium">{rec.effort}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
