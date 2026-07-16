import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { 
  ArrowRight, CheckCircle2, AlertTriangle, Info, Lightbulb, 
  AlertCircle, Zap, Code2, Globe, Play, Square, TrendingUp 
} from 'lucide-react';

interface OptimizationTip {
  title: string;
  issue: string;
  suggestion: string;
  before?: string;
  after?: string;
  impact: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  language: string;
  loops: number;
  nestedLoops: boolean;
  recursion: boolean;
  sorting: boolean;
  hashmap: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  score: number;
  suggestions: string[];
  optimizationTips: OptimizationTip[];
  resultMessages: { type: 'success' | 'warning' | 'info'; text: string }[];
}

interface StressTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  breakingPoint: number | null;
  testDuration: number;
}

function analyzeCode(code: string): AnalysisResult | null {
  if (!code.trim()) return null;

  let loops = 0;
  const forMatches = code.match(/for\s*\(/g);
  const whileMatches = code.match(/while\s*\(/g);
  if (forMatches) loops += forMatches.length;
  if (whileMatches) loops += whileMatches.length;

  let language = 'Unknown';
  if (/public\s+class|System\.out|import\s+java/.test(code)) language = 'Java';
  else if (/#include|std::|cout|cin/.test(code)) language = 'C++';
  else if (/def\s+\w+\(|print\s*\(/.test(code)) language = 'Python';
  else if (/function\s+\w+\(|console\.log|const\s+|let\s+/.test(code)) language = 'JavaScript';

  const nestedLoops = /for\s*\([^)]*\)\s*\{[\s\S]*?(for|while)\s*\(/.test(code);
  
  let recursion = false;
  const funcs = [...code.matchAll(/(?:def|function)\s+(\w+)\s*\(/g)];
  funcs.forEach(match => {
    const name = match[1];
    const count = [...code.matchAll(new RegExp(name + '\\s*\\(', 'g'))].length;
    if (count > 1) recursion = true;
  });

  const sorting = /\.sort\(|sorted\(|Arrays\.sort|std::sort/.test(code);
  const hashmap = /HashMap|Map<|unordered_map|dict\(|new\s+Map\(/.test(code);

  let timeComplexity = 'O(1)';
  if (sorting) timeComplexity = 'O(n log n)';
  else if (nestedLoops) timeComplexity = 'O(n²)';
  else if (recursion) timeComplexity = 'Recursive';
  else if (loops >= 1) timeComplexity = 'O(n)';

  let spaceComplexity = 'O(1)';
  if (hashmap) spaceComplexity = 'O(n)';
  if (recursion) spaceComplexity = 'O(n) call stack';

  const suggestions: string[] = [];
  if (nestedLoops) suggestions.push('Avoid nested loops. Use HashMap for O(1) lookups.');
  if (hashmap) suggestions.push('HashMap detected. Good choice!');
  if (sorting) suggestions.push('Sorting takes O(n log n).');
  if (recursion) suggestions.push('Consider iterative solution.');
  if (!suggestions.length) suggestions.push('Code looks efficient!');

  const optimizationTips: OptimizationTip[] = [];
  if (nestedLoops && !hashmap) {
    optimizationTips.push({
      title: 'Replace Nested Loop with HashMap',
      issue: 'Nested loops cause O(n²) time complexity.',
      suggestion: 'Use HashMap for O(1) lookup.',
      before: `for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    if (arr[i] + arr[j] === target)
      return [i, j];
  }
}`,
      after: `const map = new Map();
for (let i = 0; i < n; i++) {
  const complement = target - arr[i];
  if (map.has(complement))
    return [map.get(complement), i];
  map.set(arr[i], i);
}`,
      impact: 'high'
    });
  }

  if (recursion && !code.includes('memo')) {
    optimizationTips.push({
      title: 'Add Memoization',
      issue: 'Recursion without memoization can be exponential.',
      suggestion: 'Cache results using HashMap.',
      impact: 'high'
    });
  }

  if (!optimizationTips.length) {
    optimizationTips.push({
      title: 'Code Well Optimized',
      issue: 'No major issues detected.',
      suggestion: 'Consider profiling with real data.',
      impact: 'low'
    });
  }

  let score = 100;
  if (nestedLoops) score -= 25;
  if (recursion) score -= 10;
  if (loops > 3) score -= 15;
  if (score < 0) score = 0;

  const resultMessages: AnalysisResult['resultMessages'] = [];
  if (language !== 'Unknown') resultMessages.push({ type: 'success', text: `${language} detected.` });
  if (nestedLoops) resultMessages.push({ type: 'warning', text: 'Nested loops found.' });
  if (sorting) resultMessages.push({ type: 'info', text: 'Sorting detected: O(n log n).' });
  if (recursion) resultMessages.push({ type: 'info', text: 'Recursion detected.' });
  if (hashmap) resultMessages.push({ type: 'info', text: 'HashMap detected: O(1) lookups.' });
  if (!nestedLoops && !recursion) resultMessages.push({ type: 'success', text: 'No issues found.' });

  return {
    language, loops, nestedLoops, recursion, sorting, hashmap,
    timeComplexity, spaceComplexity, score, suggestions, optimizationTips, resultMessages,
  };
}

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'stresstest'>('analyzer');
  
  // Analyzer state
  const [code, setCode] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stress test state
  const [testUrl, setTestUrl] = useState('');
  const [concurrentUsers, setConcurrentUsers] = useState(50);
  const [totalRequests, setTotalRequests] = useState(500);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [stressError, setStressError] = useState('');
  const [stressProgress, setStressProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleAnalyze = () => {
    setError('');
    if (!code.trim()) { setError('Please enter code.'); return; }
    if (code.trim().length < 10) { setError('Enter valid code.'); return; }

    const analysis = analyzeCode(code);
    if (analysis?.language === 'Unknown') {
      setError("Not valid code (Java/C++/Python/JS).");
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(analysis);
      setIsAnalyzing(false);
    }, 400);
  };

  const runStressTest = async () => {
    if (!testUrl.trim()) { setStressError('Enter a URL.'); return; }

    let url = testUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    setStressError('');
    setStressResult(null);
    setIsStressTesting(true);
    setStressProgress(0);

    const controller = new AbortController();
    setAbortController(controller);

    let successful = 0;
    let failed = 0;
    let totalLatency = 0;
    let minLatency = Infinity;
    let maxLatency = 0;
    let breakingPoint: number | null = null;
    let consecutiveFailures = 0;

    const startTime = performance.now();
    const waves = Math.ceil(totalRequests / concurrentUsers);

    const makeRequest = async (num: number) => {
      const start = performance.now();
      try {
        await fetch(url, { method: 'GET', mode: 'no-cors', signal: controller.signal });
        const latency = performance.now() - start;
        successful++;
        totalLatency += latency;
        minLatency = Math.min(minLatency, latency);
        maxLatency = Math.max(maxLatency, latency);
        consecutiveFailures = 0;
      } catch {
        failed++;
        consecutiveFailures++;
        if (consecutiveFailures >= 10 && !breakingPoint) {
          breakingPoint = num - 9;
        }
      }
    };

    for (let w = 0; w < waves && !controller.signal.aborted; w++) {
      const batchSize = Math.min(concurrentUsers, totalRequests - w * concurrentUsers);
      const promises: Promise<void>[] = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(makeRequest(w * concurrentUsers + i + 1));
      }
      await Promise.all(promises);
      setStressProgress(Math.min(Math.round(((w + 1) * concurrentUsers / totalRequests) * 100), 100));
    }

    const duration = (performance.now() - startTime) / 1000;

    setStressResult({
      totalRequests: successful + failed,
      successfulRequests: successful,
      failedRequests: failed,
      avgResponseTime: successful > 0 ? totalLatency / successful : 0,
      minResponseTime: minLatency === Infinity ? 0 : minLatency,
      maxResponseTime: maxLatency,
      requestsPerSecond: (successful + failed) / duration,
      breakingPoint,
      testDuration: duration,
    });

    setIsStressTesting(false);
    setAbortController(null);
  };

  const stopStressTest = () => {
    abortController?.abort();
    setIsStressTesting(false);
  };

  const scoreColor = result && result.score >= 75 ? 'from-emerald-400 to-green-500' 
    : result && result.score >= 50 ? 'from-[#7c5cff] to-[#a78bfa]' 
    : 'from-rose-500 to-red-500';

  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-100">
      <SiteNav />

      {/* Hero */}
      <section className="relative max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pt-[70px] pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11.5px] font-[600] text-[#cab9ff] bg-[#7c5cff]/[0.11] border border-[#7c5cff]/25 mb-6">
          <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa] animate-pulse" />
          Code Analysis & Testing
        </div>

        <h1 className="text-[38px] sm:text-[54px] font-[800] leading-[1] mb-5">
          <span className="bg-gradient-to-r from-[#b7a7ff] to-[#7c5cff] bg-clip-text text-transparent">Analyze.</span>{' '}
          <span className="bg-gradient-to-r from-[#b7a7ff] to-[#7c5cff] bg-clip-text text-transparent">Optimize.</span>{' '}
          <span className="text-white">Test.</span>
        </h1>

        <p className="text-[15.5px] text-zinc-400 max-w-[680px] mx-auto">
          Analyze code complexity or stress test your website.
        </p>
      </section>

      {/* Tab Switcher */}
      <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-8">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-white/[0.05] border border-white/[0.1] p-1">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-[600] transition-all ${
                activeTab === 'analyzer' ? 'bg-white text-[#0a0a14]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Code Analyzer
            </button>
            <button
              onClick={() => setActiveTab('stresstest')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-[600] transition-all ${
                activeTab === 'stresstest' ? 'bg-white text-[#0a0a14]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Stress Test
            </button>
          </div>
        </div>
      </section>

      {/* ANALYZER TAB */}
      {activeTab === 'analyzer' && (
        <>
          <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-10">
            <div className="rounded-[26px] border border-white/[0.11] bg-[#11111d]/90 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#161625]/80">
                <div className="flex items-center gap-[9px]">
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f56]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[12px] text-zinc-400">code-analyzer</div>
                <div className="text-[10.5px] px-2 py-[3px] rounded-full bg-[#7c5cff]/10 text-[#cab9ff] border border-[#7c5cff]/20">Paste & Analyze</div>
              </div>

              <div className="p-5">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here... (Java, Python, C++, JavaScript)"
                  spellCheck={false}
                  className="w-full h-[300px] bg-[#0c0c1a] text-[#d6d8ef] border border-white/[0.07] rounded-[16px] p-5 resize-none font-mono text-[13.5px] leading-[1.8] focus:outline-none focus:border-[#7c5cff]/40"
                />
              </div>

              <div className="px-5 pb-5 flex flex-wrap gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-full bg-white text-[#0a0a14] font-[650] text-[14.5px] hover:shadow-lg disabled:opacity-60"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setCode(''); setResult(null); setError(''); }}
                  className="px-[22px] py-[13px] rounded-full border border-white/[0.16] text-zinc-200 hover:bg-white/[0.04]"
                >
                  Clear
                </button>
              </div>
            </div>
          </section>

          {error && (
            <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-6">
              <div className="rounded-[18px] border border-rose-500/30 bg-rose-500/[0.08] px-6 py-4 text-center text-rose-200 font-[600]">
                {error}
              </div>
            </section>
          )}

          {result && (
            <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-20 animate-fade-in">
              {/* Analysis Messages */}
              <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-6 mb-8 border-l-4 border-l-[#7c5cff]">
                <h3 className="text-[17px] font-[700] text-white mb-4">Analysis Result</h3>
                <div className="space-y-3">
                  {result.resultMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {msg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                      {msg.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                      {msg.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                      <p className={`text-[14px] ${
                        msg.type === 'success' ? 'text-emerald-300' :
                        msg.type === 'warning' ? 'text-amber-200' : 'text-zinc-300'
                      }`}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Language</div>
                  <div className="text-[22px] font-[800] text-white">{result.language}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Loops</div>
                  <div className="text-[22px] font-[800] text-white">{result.loops}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Nested</div>
                  <div className={`text-[22px] font-[800] ${result.nestedLoops ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.nestedLoops ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Recursion</div>
                  <div className={`text-[22px] font-[800] ${result.recursion ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.recursion ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              {/* Complexity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-3">Time</div>
                  <div className="text-[36px] font-[800] bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {result.timeComplexity}
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-3">Space</div>
                  <div className="text-[32px] font-[800] text-white">{result.spaceComplexity}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 flex flex-col items-center justify-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-4">Score</div>
                  <div className={`w-[100px] h-[100px] rounded-full bg-gradient-to-br ${scoreColor} flex items-center justify-center`}>
                    <div className="w-[82px] h-[82px] rounded-full bg-[#11111b] flex flex-col items-center justify-center">
                      <span className="text-[26px] font-[800] text-white">{result.score}</span>
                      <span className="text-[10px] text-zinc-400">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimization Tips */}
              <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-6 mb-8">
                <h3 className="text-[17px] font-[700] text-white mb-5 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Optimization Suggestions
                </h3>
                <div className="space-y-5">
                  {result.optimizationTips.map((tip, i) => (
                    <div key={i} className="rounded-[18px] bg-white/[0.028] border border-white/[0.055] p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h4 className="text-[15px] font-[700] text-white">{tip.title}</h4>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-[600] uppercase ${
                          tip.impact === 'high' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' :
                          tip.impact === 'medium' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                          'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20'
                        }`}>{tip.impact} impact</span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <p className="text-[13px] text-rose-200">{tip.issue}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-[13px] text-emerald-200">{tip.suggestion}</p>
                        </div>
                      </div>
                      {tip.before && tip.after && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                          <div className="rounded-[12px] bg-rose-500/[0.06] border border-rose-500/20 p-3">
                            <div className="text-[10px] text-rose-300 font-[600] uppercase mb-2">❌ Before</div>
                            <pre className="text-[11px] text-rose-100/80 font-mono overflow-x-auto whitespace-pre-wrap">{tip.before}</pre>
                          </div>
                          <div className="rounded-[12px] bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
                            <div className="text-[10px] text-emerald-300 font-[600] uppercase mb-2">✓ After</div>
                            <pre className="text-[11px] text-emerald-100/80 font-mono overflow-x-auto whitespace-pre-wrap">{tip.after}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <h3 className="text-[17px] font-[700] text-white mb-1">Want to run this code?</h3>
                  <p className="text-[13.5px] text-zinc-400">Open the compiler.</p>
                </div>
                <Link to="/compiler" className="inline-flex items-center gap-2 px-[22px] py-[12px] rounded-full bg-white text-[#0a0a14] font-[650]">
                  Open Compiler <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          )}
        </>
      )}

      {/* STRESS TEST TAB */}
      {activeTab === 'stresstest' && (
        <>
          <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-10">
            <div className="rounded-[26px] border border-white/[0.11] bg-[#11111d]/90 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#161625]/80">
                <div className="flex items-center gap-[9px]">
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f56]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[12px] text-zinc-400">stress-tester</div>
                <div className="text-[10.5px] px-2 py-[3px] rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">High Load</div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-[12px] text-zinc-400 uppercase mb-2">Target URL</label>
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#0c0c1a] text-[#d6d8ef] border border-white/[0.07] rounded-[12px] px-4 py-3 text-[14px] focus:outline-none focus:border-[#7c5cff]/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[12px] text-zinc-400 uppercase mb-2">Concurrent Users</label>
                    <input
                      type="number"
                      value={concurrentUsers}
                      onChange={(e) => setConcurrentUsers(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                      min="1"
                      max="500"
                      className="w-full bg-[#0c0c1a] text-[#d6d8ef] border border-white/[0.07] rounded-[12px] px-4 py-3"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">1-500 concurrent</p>
                  </div>
                  <div>
                    <label className="block text-[12px] text-zinc-400 uppercase mb-2">Total Requests</label>
                    <input
                      type="number"
                      value={totalRequests}
                      onChange={(e) => setTotalRequests(Math.max(10, Math.min(10000, parseInt(e.target.value) || 10)))}
                      min="10"
                      max="10000"
                      className="w-full bg-[#0c0c1a] text-[#d6d8ef] border border-white/[0.07] rounded-[12px] px-4 py-3"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">10-10,000 requests</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[12px] text-zinc-400 uppercase mb-2">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setConcurrentUsers(50); setTotalRequests(500); }} className="px-3 py-1.5 rounded-full text-[11px] font-[500] bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.1]">Light (500)</button>
                    <button onClick={() => { setConcurrentUsers(100); setTotalRequests(2000); }} className="px-3 py-1.5 rounded-full text-[11px] font-[500] bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.1]">Medium (2K)</button>
                    <button onClick={() => { setConcurrentUsers(200); setTotalRequests(5000); }} className="px-3 py-1.5 rounded-full text-[11px] font-[500] bg-amber-500/10 border border-amber-500/20 text-amber-300">Heavy (5K)</button>
                    <button onClick={() => { setConcurrentUsers(500); setTotalRequests(10000); }} className="px-3 py-1.5 rounded-full text-[11px] font-[500] bg-rose-500/10 border border-rose-500/20 text-rose-300">Extreme (10K)</button>
                  </div>
                </div>

                <div className="rounded-[14px] bg-rose-500/[0.08] border border-rose-500/20 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] text-rose-200 font-[500] mb-1">⚠️ Warning</p>
                      <p className="text-[12px] text-rose-200/70">Only test websites you own. High volumes can trigger DDoS protection.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {!isStressTesting ? (
                    <button onClick={runStressTest} className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-full bg-white text-[#0a0a14] font-[650]">
                      <Play className="w-4 h-4" /> Start Stress Test
                    </button>
                  ) : (
                    <button onClick={stopStressTest} className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-full bg-rose-500 text-white font-[650]">
                      <Square className="w-4 h-4" /> Stop Test
                    </button>
                  )}
                  {isStressTesting && (
                    <div className="text-center">
                      <div className="text-[20px] font-[700] text-white">{stressProgress}%</div>
                      <div className="text-[10px] text-zinc-500">complete</div>
                    </div>
                  )}
                </div>

                {isStressTesting && (
                  <div className="mt-6">
                    <div className="h-[10px] rounded-full bg-white/[0.07] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] transition-all" style={{ width: `${stressProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {stressError && (
            <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-6">
              <div className="rounded-[18px] border border-rose-500/30 bg-rose-500/[0.08] px-6 py-4 text-center text-rose-200 font-[600]">
                {stressError}
              </div>
            </section>
          )}

          {stressResult && (
            <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pb-20 animate-fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Total</div>
                  <div className="text-[28px] font-[800] text-white">{stressResult.totalRequests}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Success</div>
                  <div className="text-[28px] font-[800] text-emerald-400">{stressResult.successfulRequests}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Failed</div>
                  <div className="text-[28px] font-[800] text-rose-400">{stressResult.failedRequests}</div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-5 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-2">Success Rate</div>
                  <div className={`text-[28px] font-[800] ${
                    stressResult.successfulRequests / stressResult.totalRequests >= 0.95 ? 'text-emerald-400' :
                    stressResult.successfulRequests / stressResult.totalRequests >= 0.8 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {((stressResult.successfulRequests / stressResult.totalRequests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-3">Avg Response</div>
                  <div className="text-[36px] font-[800] text-white">{stressResult.avgResponseTime.toFixed(0)}<span className="text-[18px] text-zinc-400">ms</span></div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-3">Requests/Sec</div>
                  <div className="text-[36px] font-[800] bg-gradient-to-r from-[#b7a7ff] to-[#7c5cff] bg-clip-text text-transparent">
                    {stressResult.requestsPerSecond.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/[0.08] bg-[#11111b] p-7 text-center">
                  <div className="text-[11px] text-zinc-500 uppercase mb-3">Breaking Point</div>
                  <div className={`text-[36px] font-[800] ${stressResult.breakingPoint ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {stressResult.breakingPoint ? `~${stressResult.breakingPoint}` : 'None'}
                  </div>
                </div>
              </div>

              <div className={`rounded-[22px] border p-6 ${
                stressResult.successfulRequests / stressResult.totalRequests >= 0.95
                  ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                  : stressResult.successfulRequests / stressResult.totalRequests >= 0.8
                    ? 'border-amber-500/20 bg-amber-500/[0.06]'
                    : 'border-rose-500/20 bg-rose-500/[0.06]'
              }`}>
                <h3 className={`text-[17px] font-[700] mb-2 ${
                  stressResult.successfulRequests / stressResult.totalRequests >= 0.95 ? 'text-emerald-400' :
                  stressResult.successfulRequests / stressResult.totalRequests >= 0.8 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {stressResult.successfulRequests / stressResult.totalRequests >= 0.95 ? '✅ Excellent!' :
                   stressResult.successfulRequests / stressResult.totalRequests >= 0.8 ? '⚠️ Moderate' : '❌ Poor Performance'}
                </h3>
                <p className="text-[14px] text-zinc-300">
                  Test duration: {stressResult.testDuration.toFixed(1)}s. Response times: {stressResult.minResponseTime.toFixed(0)}ms - {stressResult.maxResponseTime.toFixed(0)}ms.
                </p>
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </div>
  );
}