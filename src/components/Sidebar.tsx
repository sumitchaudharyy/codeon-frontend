import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, BarChart3, BookOpen, LogOut, ExternalLink } from 'lucide-react';

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const dashboardLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  const toolLinks = [
    { to: '/compiler', label: 'Compiler', icon: <Code2 size={18} /> },
    { to: '/analyzer', label: 'Analyzer', icon: <BarChart3 size={18} /> },
    { to: '/docs', label: 'Docs', icon: <BookOpen size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-[240px] bg-[#111827] border-r border-[#1e293b] flex flex-col p-6">
      <Link to="/dashboard" className="text-xl font-bold text-white mb-8 hover:text-[#a78bfa] transition-colors">
        code(<span className="text-[#a78bfa]">O</span>)n
      </Link>

      <div className="mb-6">
        <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-2 px-3">Main</p>
        <nav className="flex flex-col gap-1">
          {dashboardLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === link.to
                  ? 'bg-[#7c5cff]/10 text-white border border-[#7c5cff]/20'
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-2 px-3">Tools</p>
        <nav className="flex flex-col gap-1">
          {toolLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                pathname === link.to
                  ? 'bg-[#7c5cff]/10 text-white border border-[#7c5cff]/20'
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {link.icon}
              <span className="flex-1">{link.label}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-4"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}