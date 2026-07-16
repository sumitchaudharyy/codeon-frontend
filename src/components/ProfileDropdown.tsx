import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function ProfileDropdown() {
  const navigate = useNavigate();

  let user: { username?: string; email?: string } = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/30 flex items-center justify-center">
        <User size={18} className="text-[#a78bfa]" />
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-white">{user.username || "User"}</p>
        <p className="text-xs text-zinc-400">{user.email || ""}</p>
      </div>
      <button
        onClick={handleLogout}
        className="ml-4 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}