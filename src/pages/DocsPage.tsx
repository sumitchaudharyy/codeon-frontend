import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { BookOpen, Play, BarChart3, Code2, Zap, Rocket } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-100 font-sans relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.18),transparent_65%)] blur-2xl" />
      </div>

      <SiteNav />

      <section className="relative max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pt-[90px] pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11.5px] font-[600] text-[#cab9ff] bg-[#7c5cff]/[0.11] border border-[#7c5cff]/25 mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          Documentation
        </div>

        <h1 className="text-[40px] sm:text-[52px] font-[800] tracking-[-0.028em] leading-[1.05] mb-6">
          <span className="bg-gradient-to-r from-[#b7a7ff] to-[#7c5cff] bg-clip-text text-transparent">CodeOn</span>{' '}
          <span className="text-white">Documentation</span>
        </h1>

        <p className="text-[16px] text-zinc-400 max-w-[720px] mx-auto mb-10">
          Complete guides and examples for every supported language.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/compiler" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0a14] font-[650] text-[14px]">
            <Play className="w-4 h-4" /> Open Compiler
          </Link>
          <Link to="/analyzer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.2] text-white font-[550] text-[14px]">
            <BarChart3 className="w-4 h-4" /> Open Analyzer
          </Link>
        </div>
      </section>

      {/* Languages */}
      <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-[800] text-white mb-3">Supported Languages</h2>
          <p className="text-[15px] text-zinc-400">6 languages supported with full execution</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'JavaScript', desc: 'Runs locally in browser', color: '#f7df1e', icon: 'JS' },
            { name: 'Python', desc: 'Python 3.8 via Judge0', color: '#3776ab', icon: 'PY' },
            { name: 'Java', desc: 'OpenJDK 13 support', color: '#ed8b00', icon: 'JV' },
            { name: 'C++', desc: 'GCC 9.2 compiler', color: '#00599c', icon: 'C++' },
            { name: 'C', desc: 'GCC 9.2 compiler', color: '#a8b9cc', icon: 'C' },
            { name: 'HTML / CSS', desc: 'Live preview iframe', color: '#e34c26', icon: '</>' },
          ].map(lang => (
            <div key={lang.name} className="rounded-[18px] border border-white/[0.08] bg-[#11111b] p-6 hover:bg-[#141423] transition-colors">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold mb-4"
                style={{ background: lang.color, color: lang.color === '#f7df1e' || lang.color === '#a8b9cc' ? '#000' : '#fff' }}
              >
                {lang.icon}
              </div>
              <h3 className="text-[17px] font-[700] text-white mb-1">{lang.name}</h3>
              <p className="text-[13px] text-zinc-400">{lang.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-20 border-t border-white/[0.07]">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-[800] text-white mb-3">Key Features</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Code2 />, title: 'Multi-Language', desc: 'Support for 6+ languages' },
            { icon: <Zap />, title: 'Fast Execution', desc: 'Under 1 second' },
            { icon: <BarChart3 />, title: 'Complexity Analysis', desc: 'Time & space breakdown' },
            { icon: <Rocket />, title: 'Live Preview', desc: 'Real-time HTML/CSS' },
            { icon: <Play />, title: 'Online Compiler', desc: 'No setup needed' },
            { icon: <BookOpen />, title: 'Full Documentation', desc: 'Comprehensive guides' },
          ].map(feat => (
            <div key={feat.title} className="rounded-[18px] border border-white/[0.08] bg-[#11111b] p-6">
              <div className="w-10 h-10 rounded-full bg-[#7c5cff]/10 flex items-center justify-center text-[#a78bfa] mb-4">
                {feat.icon}
              </div>
              <h3 className="text-[16px] font-[700] text-white mb-2">{feat.title}</h3>
              <p className="text-[13px] text-zinc-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[990px] mx-auto px-6 sm:px-10 lg:px-14 py-20 text-center">
        <h2 className="text-[32px] font-[800] text-white mb-4">Ready to Start Coding?</h2>
        <p className="text-[16px] text-zinc-400 mb-8">Jump into the compiler with zero setup required.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/compiler" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0b0b14] font-[650] text-[15px]">
            <Rocket className="w-4 h-4" /> Launch Compiler
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}