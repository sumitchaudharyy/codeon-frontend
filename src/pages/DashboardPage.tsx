import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { Code2, BarChart3, BookOpen, Zap, Clock, TrendingUp } from "lucide-react";
import { API_URL } from "../utils/api";

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-[#7c5cff]/30 border-t-[#7c5cff] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Projects", value: "12", icon: <Code2 className="w-5 h-5" />, color: "text-blue-400" },
    { label: "Code Runs", value: "247", icon: <Zap className="w-5 h-5" />, color: "text-yellow-400" },
    { label: "Analyses", value: "38", icon: <BarChart3 className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Hours Coded", value: "156", icon: <Clock className="w-5 h-5" />, color: "text-emerald-400" },
  ];

  const quickActions = [
    { title: "Open Compiler", desc: "Write and run code", link: "/compiler", icon: <Code2 />, color: "from-blue-500 to-blue-600" },
    { title: "Analyze Code", desc: "Check complexity", link: "/analyzer", icon: <BarChart3 />, color: "from-purple-500 to-purple-600" },
    { title: "Read Docs", desc: "Learn CodeOn", link: "/docs", icon: <BookOpen />, color: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username || "Developer"}! 👋
        </h1>
        <p className="text-zinc-400">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-zinc-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            className="group bg-[#111827] border border-[#1e293b] rounded-xl p-6 hover:border-[#7c5cff]/30 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 text-white group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
            <p className="text-sm text-zinc-400">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Profile Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#4f46e5] flex items-center justify-center text-2xl font-bold text-white">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{user?.username}</h3>
            <p className="text-sm text-zinc-400">{user?.email}</p>
          </div>
          <div className="text-right">
            <TrendingUp className="w-5 h-5 text-emerald-400 inline mr-1" />
            <span className="text-sm text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}