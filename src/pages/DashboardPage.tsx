import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Zap, FileText, TrendingUp, Clock, Award } from "lucide-react";
import { API_URL } from "../utils/api";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: "Good Morning", emoji: "🌅" };
    } else if (hour >= 12 && hour < 17) {
      return { text: "Good Afternoon", emoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { text: "Good Evening", emoji: "🌆" };
    } else {
      return { text: "Good Night", emoji: "🌙" };
    }
  };

  // Calculate days since joined
  const getDaysSinceJoined = () => {
    if (!user?.createdAt) return 0;
    const joined = new Date(user.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - joined.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Get formatted current date
  const getFormattedDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get formatted time
  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting();
  const daysSinceJoined = getDaysSinceJoined();
  const firstName = user?.username?.split(" ")[0] || "Developer";

  return (
    <div style={{ padding: "24px", maxWidth: "1220px", margin: "0 auto" }}>
      
      {/* Greeting Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(124,92,255,0.15), rgba(79,70,229,0.05))",
        border: "1px solid rgba(124,92,255,0.2)",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "32px" }}>{greeting.emoji}</span>
              <h1 style={{ 
                fontSize: "28px", 
                fontWeight: 700, 
                color: "#fff", 
                margin: 0,
                background: "linear-gradient(135deg, #fff, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {greeting.text}, {firstName}!
              </h1>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
              Ready to write some amazing code today?
            </p>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              color: "#cbd5e1",
              fontSize: "14px",
              marginBottom: "4px",
            }}>
              <Clock size={16} />
              {getFormattedTime()}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              {getFormattedDate()}
            </p>
          </div>
        </div>
      </div>

      {/* Real User Info Card */}
      <div style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c5cff, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: 700,
          color: "#fff",
        }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#fff", fontSize: "20px", margin: "0 0 4px 0", fontWeight: 600 }}>
            {user?.username}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 8px 0" }}>
            {user?.email}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 10px",
              background: user?.role === "admin" ? "rgba(234,179,8,0.15)" : "rgba(124,92,255,0.15)",
              color: user?.role === "admin" ? "#eab308" : "#a78bfa",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              {user?.role}
            </span>
            <span style={{
              padding: "4px 10px",
              background: "rgba(34,197,94,0.15)",
              color: "#22c55e",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
            }}>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Real Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <StatCard
          icon={<Clock size={22} color="#7c5cff" />}
          label="Member Since"
          value={daysSinceJoined === 0 ? "Today" : `${daysSinceJoined} ${daysSinceJoined === 1 ? "day" : "days"}`}
          subtitle={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
          color="#7c5cff"
        />
        <StatCard
          icon={<Award size={22} color="#eab308" />}
          label="Account Type"
          value={user?.role === "admin" ? "Admin" : "Free"}
          subtitle={user?.role === "admin" ? "Full access" : "Standard features"}
          color="#eab308"
        />
        <StatCard
          icon={<TrendingUp size={22} color="#22c55e" />}
          label="Status"
          value="Active"
          subtitle="All systems go"
          color="#22c55e"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}>
          <ActionCard
            icon={<Code2 size={24} />}
            title="Compiler"
            description="Write and run code in 6+ languages"
            onClick={() => navigate("/compiler")}
            gradient="linear-gradient(135deg, #7c5cff, #4f46e5)"
          />
          <ActionCard
            icon={<Zap size={24} />}
            title="Analyzer"
            description="Analyze code complexity"
            onClick={() => navigate("/analyzer")}
            gradient="linear-gradient(135deg, #eab308, #ea580c)"
          />
          <ActionCard
            icon={<FileText size={24} />}
            title="Documentation"
            description="Browse language guides"
            onClick={() => navigate("/docs")}
            gradient="linear-gradient(135deg, #22c55e, #16a34a)"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, subtitle, color }: any) {
  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1e293b",
      borderRadius: "12px",
      padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
        <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>{label}</span>
        {icon}
      </div>
      <p style={{ color: "#fff", fontSize: "24px", fontWeight: 700, margin: "0 0 4px 0" }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Action Card Component
function ActionCard({ icon, title, description, onClick, gradient }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.2s",
        color: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7c5cff";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1e293b";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "12px",
        color: "#fff",
      }}>
        {icon}
      </div>
      <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 600, margin: "0 0 4px 0" }}>
        {title}
      </h3>
      <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
        {description}
      </p>
    </button>
  );
}