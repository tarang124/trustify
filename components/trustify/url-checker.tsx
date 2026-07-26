import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle, 
  Activity, Info, ArrowRight, Clock, X, Terminal, Zap,
  Database, Globe, Cpu, FileText, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeUrl, AnalysisResult } from '@/lib/gemini';

// --- Types ---
interface ScanHistoryItem {
  url: string;
  status: string;
  riskScore: number;
  timestamp: number;
}

// --- Components ---

/**
 * Animated number counter for the Risk Score
 */
const AnimatedScore = ({ value, colorClass }: { value: number; colorClass: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return <span className={`text-5xl font-bold ${colorClass}`}>{displayValue}</span>;
};

/**
 * Main URL Analyzer Component
 */
export default function UrlAnalyzer() {
  // State
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Scanning steps for animation
  const scanningSteps = [
    { text: "Checking domain reputation databases...", icon: <Database className="w-5 h-5" /> },
    { text: "Analyzing URL structure for phishing patterns...", icon: <Globe className="w-5 h-5" /> },
    { text: "Running heuristic analysis on target content...", icon: <Cpu className="w-5 h-5" /> },
    { text: "Compiling Trustify threat report...", icon: <FileText className="w-5 h-5" /> }
  ];

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('trustify_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Cycle through scanning steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev + 1) % scanningSteps.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let urlToAnalyze = url.trim();
    if (!/^https?:\/\//i.test(urlToAnalyze)) {
      urlToAnalyze = 'http://' + urlToAnalyze;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeUrl(urlToAnalyze);
      setResult(analysis);

      // Update history
      const newHistoryItem: ScanHistoryItem = {
        url: urlToAnalyze,
        status: analysis.status,
        riskScore: analysis.riskScore,
        timestamp: Date.now()
      };
      
      const updatedHistory = [newHistoryItem, ...history.filter(h => h.url !== urlToAnalyze)].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('trustify_history', JSON.stringify(updatedHistory));
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Suspicious': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Malicious': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Safe': return <ShieldCheck className="w-10 h-10 text-emerald-400" />;
      case 'Suspicious': return <AlertTriangle className="w-10 h-10 text-amber-400" />;
      case 'Malicious': return <ShieldAlert className="w-10 h-10 text-rose-400" />;
      default: return <Shield className="w-10 h-10 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden pt-8">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 mb-12 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30 group-hover:border-indigo-500/50 transition-colors">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-100 transition-colors">Trustify <span className="text-indigo-400 font-medium">URL Checker</span></h1>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <button 
            onClick={() => setShowEduModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
          >
            <Info className="w-4 h-4" />
            How it Works
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 pb-20 z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> AI-Powered URL Analysis
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Is that link <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">actually safe?</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Trustify uses advanced Artificial Intelligence to inspect URLs for hidden dangers before you click. Learn how to stay safe in the digital world!
          </p>
        </motion.div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-20">
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
              <div className="pl-6 pr-3 py-4">
                <Search className="w-7 h-7 text-slate-500" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a suspicious URL here..."
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-slate-600 py-6 w-full font-mono"
                disabled={isAnalyzing}
              />
              <div className="pr-4 pl-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || !url.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? "Analyzing..." : "Check Safety"}
                  {!isAnalyzing && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </form>
          
          {/* Deep Scanning Animation */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 overflow-hidden"
              >
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                  {/* Radar Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-1 bg-indigo-500/20 blur-sm animate-scan-line" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-indigo-500/20 rounded-full animate-ping" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6" />
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={scanStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 text-indigo-300 font-medium text-lg"
                      >
                        {scanningSteps[scanStep].icon}
                        <span>{scanningSteps[scanStep].text}</span>
                      </motion.div>
                    </AnimatePresence>
                    
                    <div className="mt-8 w-full max-w-md bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="bg-indigo-500 h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3 shadow-lg"
            >
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Status Card */}
              <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                {/* Status Background Glow */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${
                  result.status === 'Safe' ? 'bg-emerald-500' : 
                  result.status === 'Suspicious' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <motion.div 
                      initial={{ rotate: -20, scale: 0.5 }}
                      animate={{ rotate: 0, scale: 1 }}
                      className={`p-5 rounded-3xl shadow-inner ${getStatusColor(result.status)}`}
                    >
                      {getStatusIcon(result.status)}
                    </motion.div>
                    <div>
                      <h3 className="text-4xl font-black text-white mb-2">{result.status}</h3>
                      <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-black/20 px-3 py-1 rounded-lg border border-white/5 break-all max-w-md">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {url}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end bg-black/20 p-6 rounded-3xl border border-white/5 min-w-[180px]">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Trustify Risk Score</div>
                    <div className="flex items-baseline gap-2">
                      <AnimatedScore value={result.riskScore} colorClass={getScoreColor(result.riskScore)} />
                      <span className="text-slate-600 font-bold text-xl">/100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-inner">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" /> Threat Classification
                    </div>
                    <div className="text-white font-bold text-xl">{result.threatType}</div>
                  </div>
                  
                  <div className="md:col-span-2 bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-inner">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-400" /> Safety Recommendation
                    </div>
                    <div className="text-slate-200 font-medium leading-relaxed">{result.recommendation}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis & Impact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-xl">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-xl">
                      <Info className="w-5 h-5 text-indigo-400" />
                    </div>
                    Threat Analysis
                  </h4>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {result.analysis}
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-xl">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="bg-rose-500/20 p-2 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    Potential Impact
                  </h4>
                  <div className="bg-rose-500/5 rounded-2xl p-6 border border-rose-500/10">
                    <p className="text-rose-200/90 leading-relaxed text-lg font-medium">
                      {result.userImpact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Intelligence Sources - Terminal Style */}
              {result.intelligenceSources && result.intelligenceSources.length > 0 && (
                <div className="bg-black border border-emerald-500/20 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/50 flex items-center px-4 gap-1.5 border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    <div className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Intelligence_Feed_v2.4</div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-emerald-400 font-mono text-sm mb-4 flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      $ QUERY_THREAT_SOURCES --VERBOSE
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {result.intelligenceSources.map((source, idx) => (
                         <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="px-4 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400/80 font-mono text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        >
                          <span className="text-emerald-500/40 mr-2">{'>'}</span>
                          {source}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trustify CTA */}
              {(result.status === 'Suspicious' || result.status === 'Malicious') && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-white/10 rounded-[2rem] p-8 text-center"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Not sure what to do next?</h3>
                  <p className="text-slate-300 mb-6 text-lg">If you clicked a malicious link or feel your data is compromised, we can help you take action.</p>
                  <Link 
                    href="/report" 
                    className="inline-flex items-center gap-2 bg-white text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors shadow-lg"
                  >
                    Get your Recovery Action Plan
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scans History */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto mt-24 pt-12 border-t border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-bold text-white flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                Recent Scans
              </h4>
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('trustify_history');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Clear History
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setUrl(item.url)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-white/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                      item.status === 'Safe' ? 'bg-emerald-500 shadow-emerald-500/40' : 
                      item.status === 'Suspicious' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-rose-500 shadow-rose-500/40'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-slate-200 font-mono text-sm truncate max-w-md">{item.url}</div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getScoreColor(item.riskScore)}`}>
                        {item.riskScore}/100
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Risk</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Education Modal */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEduModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <button 
                onClick={() => setShowEduModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-500/20 p-3 rounded-2xl">
                  <Zap className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black text-white">How Trustify Works</h3>
              </div>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    1. URL Deconstruction
                  </h4>
                  <p className="leading-relaxed">
                    Trustify doesn't just look at the link; it breaks it down into pieces. It looks for "typosquatting" (like <span className="text-indigo-400 font-mono">g00gle.com</span> instead of <span className="text-indigo-400 font-mono">google.com</span>) and suspicious subdomains that hackers use to hide.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    2. Reputation Intelligence
                  </h4>
                  <p className="leading-relaxed">
                    We instantly query global databases of known malicious websites. If a domain has been reported for phishing or malware in the last few minutes, Trustify will know.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    3. AI Heuristics
                  </h4>
                  <p className="leading-relaxed">
                    This is the magic part! Our AI model has been trained on millions of safe and dangerous links. It can spot patterns that humans miss, predicting if a site is dangerous even if it's brand new and hasn't been reported yet.
                  </p>
                </section>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-4">
                  <p className="text-indigo-300 font-medium flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                    The best part? Trustify analyzes the link safely in our cloud, so you don't have to risk your own computer!
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowEduModal(false)}
                className="w-full mt-10 bg-white text-slate-950 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Animations for Radar/Scan */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}} />
    </div>
  );
}
