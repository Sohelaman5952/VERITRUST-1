import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  ArrowRight,
  Github,
  Twitter,
  ExternalLink,
  Upload,
  Sun,
  Moon,
  X,
  Code,
  BookOpen,
  Users,
  Cpu,
  Globe,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult, ContentType } from './types';

import Antigravity from './Antigravity';

type ModalType = 'how-it-works' | 'resources' | 'about' | 'login' | null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    setUser({
      name: 'Aman Sohel',
      email: 'sohelaman62@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman'
    });
    setIsLoggedIn(true);
    setActiveModal(null);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeContent(activeTab, input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setInput(base64String);
      if (file.type.startsWith('image/')) setActiveTab('image');
      else if (file.type.startsWith('video/')) setActiveTab('video');
    };
    reader.readAsDataURL(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50';
    if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50';
    return 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50';
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Authentic': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'Suspicious': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'Likely Fake': return <ShieldAlert className="w-6 h-6 text-rose-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const Modal = ({ type, onClose }: { type: ModalType; onClose: () => void }) => {
    if (!type) return null;

    if (type === 'login') {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Antigravity Background */}
            <div className="absolute inset-0 z-0 bg-slate-950">
              <Antigravity
                count={300}
                magnetRadius={6}
                ringRadius={7}
                waveSpeed={0.4}
                waveAmplitude={1}
                particleSize={1.5}
                lerpSpeed={0.05}
                color="#5227FF"
                autoAnimate
                particleVariance={1}
                rotationSpeed={0}
                depthFactor={1}
                pulseSpeed={3}
                particleShape="capsule"
                fieldStrength={10}
              />
            </div>

            {/* Login Form Content */}
            <div className="relative z-10 p-10 bg-white/5 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-sky-500" />
                  <h2 className="text-2xl font-bold text-white">Login</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@company.com"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                    <input type="checkbox" className="rounded bg-white/5 border-white/10" />
                    Remember me
                  </label>
                  <a href="#" className="text-sky-400 hover:underline">Forgot password?</a>
                </div>
                <button type="submit" className="w-full bg-sky-600 text-white py-4 rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/20">
                  Sign In
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                  Don't have an account? <a href="#" className="text-sky-400 font-bold hover:underline">Sign up</a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    const content = {
      'how-it-works': {
        title: 'How VeriTrust Works',
        icon: Cpu,
        sections: [
          {
            title: 'Multimodal Ingestion',
            text: 'Our system accepts text, images, videos, and URLs. Each input type is processed through specialized preprocessing pipelines to extract forensic markers.',
            icon: Upload
          },
          {
            title: 'AI Forensic Engine',
            text: 'Powered by Gemini 3 Flash, our engine analyzes semantic consistency, visual artifacts (like blending issues in deepfakes), and metadata integrity.',
            icon: Search
          },
          {
            title: 'Global Fact-Check Sync',
            text: 'We cross-reference claims against a real-time database of verified news and known misinformation patterns from global fact-checking organizations.',
            icon: Globe
          }
        ]
      },
      'resources': {
        title: 'Integrity Resources',
        icon: BookOpen,
        sections: [
          {
            title: 'Fact-Checking Tools',
            text: 'Access our curated list of external verification tools including reverse image search, domain age checkers, and bot detection scripts.',
            icon: Search
          },
          {
            title: 'Educational Guides',
            text: 'Learn how to spot deepfakes manually and understand the psychological triggers used in misinformation campaigns.',
            icon: BookOpen
          }
        ]
      },
      'about': {
        title: 'About VeriTrust',
        icon: Users,
        sections: [
          {
            title: 'Our Mission',
            text: 'VeriTrust was founded to restore digital integrity. In an era of generative AI, we provide the shield necessary to protect the truth.',
            icon: ShieldCheck
          },
          {
            title: 'The Technology',
            text: 'Built on a foundation of ethical AI and transparent forensic reporting. We don\'t just give a score; we explain the "why" behind every analysis.',
            icon: Cpu
          }
        ]
      }
    }[type];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl p-8 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                <content.icon className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            {content.sections.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-700 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
        <AnimatePresence>
          {activeModal && <Modal type={activeModal} onClose={() => setActiveModal(null)} />}
        </AnimatePresence>

        {/* Full Page Antigravity Background */}
        <div className="absolute inset-0 z-0">
          <Antigravity
            count={500}
            magnetRadius={12}
            ringRadius={15}
            waveSpeed={0.5}
            waveAmplitude={2}
            particleSize={2}
            lerpSpeed={0.08}
            color="#0ea5e9"
            autoAnimate
            particleVariance={2}
            rotationSpeed={0.1}
            depthFactor={2}
            pulseSpeed={2}
            particleShape="capsule"
            fieldStrength={15}
          />
        </div>

        {/* Landing Content */}
        <nav className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-sky-500" />
            <span className="text-2xl font-bold text-white tracking-tight">VeriTrust</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('about')} className="text-white/60 hover:text-white transition-colors text-sm font-medium">About</button>
            <button onClick={() => setActiveModal('login')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all border border-white/10 backdrop-blur-md">
              Sign In
            </button>
          </div>
        </nav>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <Cpu className="w-4 h-4" />
              Next-Gen Content Verification
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
              The Shield Against <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Digital Deception</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              VeriTrust empowers organizations and individuals to verify the authenticity of news, images, and videos using state-of-the-art AI forensics.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => setActiveModal('login')}
                className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-sky-900/40 flex items-center gap-3 group"
              >
                Get Started Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveModal('how-it-works')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg backdrop-blur-md transition-all"
              >
                How it Works
              </button>
            </div>
          </motion.div>
        </main>

        <footer className="relative z-10 p-8 text-center text-white/40 text-xs font-medium">
          © 2026 VeriTrust AI Forensic Systems. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence>
        {activeModal && <Modal type={activeModal} onClose={() => setActiveModal(null)} />}
      </AnimatePresence>

      {/* Dashboard Navigation */}
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-sky-600 p-1.5 rounded-lg shadow-lg shadow-sky-200 dark:shadow-sky-900/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">VeriTrust</span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-80">
                <button onClick={() => setActiveModal('how-it-works')} className="hover:text-sky-600 transition-colors">How it works</button>
                <button onClick={() => setActiveModal('resources')} className="hover:text-sky-600 transition-colors">Resources</button>
              </div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-current"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">{user?.name}</p>
                  <p className="text-[10px] opacity-50">{user?.email}</p>
                </div>
                <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 border border-white/20" />
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors"
                  title="Logout"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black mb-2">Analysis Dashboard</h2>
            <p className="opacity-60 font-medium">Welcome back, {user?.name.split(' ')[0]}. Ready for verification?</p>
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Total Scans</p>
              <p className="text-xl font-black">1,284</p>
            </div>
            <div className="glass-card px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Trust Avg</p>
              <p className="text-xl font-black text-sky-600">92%</p>
            </div>
          </div>
        </div>

        {/* Analyzer Section */}
        <section id="analyzer" className="glass-panel rounded-3xl overflow-hidden scroll-mt-24">
          <div className="flex border-b border-white/20">
            {[
              { id: 'text', icon: FileText, label: 'News & Text' },
              { id: 'image', icon: ImageIcon, label: 'Images' },
              { id: 'video', icon: Video, label: 'Videos' },
              { id: 'url', icon: LinkIcon, label: 'URL' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ContentType);
                  setInput('');
                  setResult(null);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === tab.id 
                    ? "text-sky-700 dark:text-sky-400 border-sky-600 bg-white/20 dark:bg-sky-900/20" 
                    : "text-current opacity-60 border-transparent hover:opacity-100 hover:bg-white/10"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <div className="relative group">
              {activeTab === 'text' ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste news article, claim, or social media post here..."
                  className="w-full h-48 p-4 text-current bg-white/20 dark:bg-black/20 border border-white/20 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none placeholder:opacity-50"
                />
              ) : activeTab === 'url' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://example.com/news-article"
                    className="flex-1 p-4 text-current bg-white/20 dark:bg-black/20 border border-white/20 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:opacity-50"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-sky-400 hover:bg-white/10 transition-all group"
                >
                  {input ? (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      {activeTab === 'image' ? (
                        <img src={input} alt="Preview" className="max-h-full rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-medium">
                          <Video className="w-6 h-6" />
                          <span>Video file ready for analysis</span>
                        </div>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setInput(''); }}
                        className="absolute top-2 right-2 bg-white/20 p-1 rounded-full hover:bg-white/40 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors">
                        <Upload className="w-6 h-6 opacity-60 group-hover:opacity-100 group-hover:text-sky-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold opacity-80">Click to upload or drag and drop</p>
                        <p className="text-xs opacity-50 mt-1">PNG, JPG, MP4 up to 10MB</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-medium opacity-60">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Encrypted & Private Analysis</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input.trim()}
                className={cn(
                  "w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                  isAnalyzing || !input.trim()
                    ? "bg-white/10 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-sky-600 text-white hover:bg-sky-700 active:scale-95 shadow-sky-200 dark:shadow-sky-900/20"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run Analysis
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-4 bg-rose-50/60 backdrop-blur-md border border-rose-200/50 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-medium"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score Card */}
                <div className={cn("md:col-span-2 p-8 rounded-3xl border backdrop-blur-xl flex flex-col justify-between", getScoreColor(result.score))}>
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {getLabelIcon(result.label)}
                        <h3 className="text-2xl font-bold">{result.label}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-black">{result.score}%</span>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Truth Score</p>
                      </div>
                    </div>
                    <p className="text-lg font-medium leading-relaxed mb-6">
                      {result.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-current/10">
                    <div className="flex-1 h-2 bg-current/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        className="h-full bg-current"
                      />
                    </div>
                    <span className="text-sm font-bold">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Red Flags Card */}
                <div className="glass-card p-8 rounded-3xl">
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-6">Detected Anomalies</h4>
                  <ul className="space-y-4">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                    {result.redFlags.length === 0 && (
                      <li className="text-sm opacity-50 italic">No major anomalies detected.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="glass-card p-8 md:p-12 rounded-3xl">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <Search className="w-6 h-6 text-sky-700 dark:text-sky-400" />
                  Forensic Breakdown
                </h4>
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-sky-700 dark:prose-strong:text-sky-400">
                  <ReactMarkdown>{result.details}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        {!result && !isAnalyzing && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Deepfake Detection', 
                desc: 'Identifies AI-generated faces, voices, and visual artifacts in images and videos.',
                icon: Video
              },
              { 
                title: 'Fact Checking', 
                desc: 'Cross-references claims against a massive database of verified information.',
                icon: FileText
              },
              { 
                title: 'Source Analysis', 
                desc: 'Evaluates the credibility and bias of news outlets and social media accounts.',
                icon: LinkIcon
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl glass-card hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-sky-100/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-sky-700 dark:text-sky-400" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed font-medium opacity-80">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-nav py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-sky-700 dark:text-sky-400" />
            <span className="text-xl font-bold">VeriTrust</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-medium opacity-70">
            <button onClick={() => setActiveModal('login')} className="hover:text-sky-600 transition-colors">Login</button>
            <button onClick={() => setActiveModal('how-it-works')} className="hover:text-sky-600 transition-colors">How it works</button>
            <button onClick={() => setActiveModal('resources')} className="hover:text-sky-600 transition-colors">Resources</button>
            <button onClick={() => setActiveModal('about')} className="hover:text-sky-600 transition-colors">About</button>
          </div>
          <p className="text-sm mb-8 max-w-md mx-auto font-medium opacity-80">
            Empowering citizens and organizations with the tools to navigate the age of digital misinformation.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="opacity-50 hover:opacity-100 hover:text-sky-700 transition-all"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="opacity-50 hover:opacity-100 hover:text-sky-700 transition-all"><Github className="w-5 h-5" /></a>
            <a href="#" className="opacity-50 hover:opacity-100 hover:text-sky-700 transition-all"><ExternalLink className="w-5 h-5" /></a>
          </div>
          <p className="text-xs font-bold opacity-40">
            © 2026 VeriTrust AI. All rights reserved. Built for truth.
          </p>
        </div>
      </footer>
    </div>
  );
}
