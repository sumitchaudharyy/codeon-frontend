import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SiteNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUsername(user.username || 'User');
      } catch {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/compiler', label: 'Compiler' },
    { to: '/analyzer', label: 'Analyzer' },
    { to: '/docs', label: 'Docs' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0b15]/80 border-b border-white/[0.07]">
      <div className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-[74px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#6d5cff] to-[#4f46e5] flex items-center justify-center shadow-lg">
              <Code2 className="w-[19px] h-[19px] text-white" />
            </div>
            <div className="text-[19px] font-[700] text-white">
              code(<span className="text-[#a78bfa]">O</span>)n
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-9">
            {navItems.map(item => (
              <li key={item.to}>
                <Link 
                  to={item.to}
                  className={`text-[14px] font-[500] transition-colors ${
                    isActive(item.to) ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Show different buttons based on login status */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 text-[14px] font-[500] text-zinc-300 hover:text-white px-4 py-2 rounded-full border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#4f46e5] flex items-center justify-center text-white text-xs font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] text-white font-[500]">{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[14px] text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[14px] text-zinc-300 hover:text-white px-4 py-2">
                  Login
                </Link>
                <Link to="/signup" className="text-[13.5px] font-[600] text-white bg-white/[0.09] hover:bg-white/[0.14] border border-white/[0.13] px-[18px] py-[9px] rounded-full">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-5 border-t border-white/[0.07] pt-4">
            <div className="flex flex-col gap-3">
              {navItems.map(item => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setMobileOpen(false)} 
                  className="text-[15px] text-zinc-300 py-1"
                >
                  {item.label}
                </Link>
              ))}
              
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileOpen(false)}
                    className="text-[15px] text-white font-medium py-1 flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="text-[15px] text-red-400 py-1 flex items-center gap-2 text-left"
                  >
                    <LogOut size={16} /> Logout ({username})
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-[14px] text-zinc-300">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-[14px] text-white font-medium">Get Started →</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}