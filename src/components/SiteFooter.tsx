import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-[#0b0b13] border-t border-white/[0.07]">
      <div className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16">
        <div className="text-center">
          <h3 className="text-[22px] font-[700] text-white mb-2">
            Code(<span className="text-[#a78bfa]">O</span>)n
          </h3>
          <p className="text-zinc-400 text-[14px] mb-8">Build. Analyze. Optimize.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13.5px] text-zinc-400 mb-10">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/compiler" className="hover:text-white">Compiler</Link>
            <Link to="/analyzer" className="hover:text-white">Analyzer</Link>
            <Link to="/docs" className="hover:text-white">Docs</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/signup" className="hover:text-white">Get Started</Link>
          </div>

          <p className="text-[12.5px] text-zinc-500">© 2026 CodeOn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}