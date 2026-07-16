import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const typingCode = `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target)
        return [i, j];
    }
  }
}`;

export default function HomePage() {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= typingCode.length) {
        setTyped(typingCode.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-100 font-sans relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.18),transparent_65%)] blur-2xl" />
        <div className="absolute top-[70px] right-[-120px] w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.17),transparent_66%)] blur-2xl" />
      </div>

      <SiteNav />

      <header className="relative max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pt-[84px] sm:pt-[108px] pb-16">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11.5px] font-[600] text-[#cab9ff] bg-[#7c5cff]/[0.11] border border-[#7c5cff]/25 mb-6">
              <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa] animate-pulse" />
              Smart Code Analysis Platform
            </div>

            <h1 className="text-[46px] sm:text-[62px] lg:text-[70px] font-[800] tracking-[-0.028em] leading-[0.93] mb-5">
              <span className="block bg-gradient-to-r from-[#b7a7ff] via-[#9e8bff] to-[#7c5cff] bg-clip-text text-transparent">Build.</span>
              <span className="block bg-gradient-to-r from-[#b7a7ff] via-[#9e8bff] to-[#7c5cff] bg-clip-text text-transparent">Analyze.</span>
              <span className="block bg-gradient-to-r from-[#b7a7ff] via-[#9e8bff] to-[#7c5cff] bg-clip-text text-transparent">Optimize.</span>
              <span className="block text-[26px] sm:text-[32px] lg:text-[35px] font-[700] text-zinc-200 mt-3">All In One Workspace.</span>
            </h1>

            <p className="text-[15.5px] sm:text-[16.5px] text-zinc-400 leading-relaxed max-w-[560px] mb-8">
              Write code, run programs, analyze complexity, detect bugs, and optimize algorithms with powerful developer tools.
            </p>

            <div className="flex flex-wrap gap-3 mb-9">
              <Link to="/analyzer" className="group inline-flex items-center gap-2 px-[22px] py-[13px] rounded-full bg-white text-[#0a0a14] font-[650] text-[14.5px] hover:shadow-[0_14px_50px_rgba(124,92,255,0.32)] transition-all">
                Start Analyzing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/compiler" className="inline-flex items-center px-[22px] py-[13px] rounded-full border border-white/[0.16] text-[14.5px] font-[560] text-zinc-200 hover:border-white/[0.33] hover:bg-white/[0.04] transition-colors">
                Open Compiler
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-[470px]">
              <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.032] px-4 py-4 text-center">
                <div className="text-[22px] font-[800] text-white">6+</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Languages</div>
              </div>
              <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.032] px-4 py-4 text-center">
                <div className="text-[22px] font-[800] text-white">Smart</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Analysis</div>
              </div>
              <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.032] px-4 py-4 text-center">
                <div className="text-[22px] font-[800] text-white">Live</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Results</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[26px] border border-white/[0.11] bg-[#11111d]/90 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#161625]/80">
                <div className="flex items-center gap-[9px]">
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f56]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]" />
                  <span className="w-[11px] h-[11px] rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[12px] text-zinc-400">analyzer.js</div>
                <div className="text-[10.5px] px-2 py-[3px] rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">Live</div>
              </div>

              <div className="px-5 py-5 min-h-[248px] font-mono text-[12.5px] leading-[1.8] text-[#d6d8ef]">
                <pre className="whitespace-pre-wrap m-0">
                  {typed}
                  <span className="inline-block w-[8px] h-[16px] bg-[#a78bfa] ml-[1px] animate-pulse" />
                </pre>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-[16px] bg-[#19192a] border border-white/[0.07] px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10.5px] text-zinc-500">Time Complexity</div>
                    <div className="text-[16px] font-[700] text-white">O(n²)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] text-zinc-500">Suggestion</div>
                    <div className="text-[14px] font-[600] text-[#a78bfa]">Use HashMap</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-[88px]">
        <div className="text-center mb-12">
          <h2 className="text-[34px] sm:text-[44px] font-[800] text-white">Why Choose CodeOn?</h2>
          <p className="text-[15.5px] text-zinc-400 mt-3">Everything you need to write better code.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {[
            { icon: '⚡', title: 'Online Compiler', desc: 'Run Python, Java, C++, JavaScript directly in browser.' },
            { icon: '📊', title: 'Complexity Analysis', desc: 'Understand time and space complexity with insights.' },
            { icon: '🧠', title: 'Smart Insights', desc: 'AI-powered suggestions to improve your code.' },
            { icon: '🐛', title: 'Bug Detection', desc: 'Identify errors before deployment.' },
            { icon: '🔧', title: 'Code Refactoring', desc: 'Get recommendations to clean your code.' },
            { icon: '🚀', title: 'Fast Execution', desc: 'Lightning-fast code execution engine.' },
          ].map(card => (
            <div key={card.title} className="rounded-[22px] border border-white/[0.08] bg-[#11111b] hover:bg-[#141423] transition-colors p-[24px]">
              <div className="text-[24px] mb-3">{card.icon}</div>
              <h3 className="text-[17px] font-[700] text-white mb-2">{card.title}</h3>
              <p className="text-[13.5px] text-zinc-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}