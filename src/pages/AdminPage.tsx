import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw, TrendingUp, UserCheck } from "lucide-react";
import { API_URL } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 403) {
        setError("Access denied. You are not an admin.");
        return;
      }

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string, username: string) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete "${username}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setUsers(users.filter((u) => u._id !== id));
        showToast("User deleted successfully", "success");
      } else {
        showToast(data.error || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Loading users...</p>
        </div>
      </div>
    );
  }

  // Access Denied
  if (error) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">
            <Shield size={40} color="#ef4444" />
          </div>
          <h2 className="access-denied-title">Access Denied</h2>
          <p className="access-denied-text">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="access-denied-btn"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Real calculated stats
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  
  const now = new Date();
  const thisMonth = users.filter((u) => {
    const created = new Date(u.createdAt);
    return created.getMonth() === now.getMonth() && 
           created.getFullYear() === now.getFullYear();
  }).length;

  const today = users.filter((u) => {
    const created = new Date(u.createdAt);
    return created.toDateString() === now.toDateString();
  }).length;

  const thisWeek = users.filter((u) => {
    const created = new Date(u.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;

  // Filter users by search
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        
        {/* Header */}
        <div className="admin-header">
          <div>
            <button onClick={() => navigate("/dashboard")} className="admin-back-btn">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div className="admin-title-wrapper">
              <div className="admin-icon-box">
                <Shield size={26} color="white" />
              </div>
              <div>
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">
                  Managing {users.length} registered {users.length === 1 ? "user" : "users"}
                </p>
              </div>
            </div>
          </div>
          <button onClick={fetchUsers} className="admin-refresh-btn" title="Refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Real Stats Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#cab9ff' }}>Total Users</span>
              <Users size={22} color="#7c5cff" />
            </div>
            <p className="stat-card-value">{users.length}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {today > 0 ? `+${today} today` : "No new users today"}
            </p>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#93c5fd' }}>Regular Users</span>
              <UserCheck size={22} color="#3b82f6" />
            </div>
            <p className="stat-card-value">{userCount}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {users.length > 0 ? `${Math.round((userCount / users.length) * 100)}% of total` : "0%"}
            </p>
          </div>

          <div className="stat-card stat-card-yellow">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#fde68a' }}>Admins</span>
              <Shield size={22} color="#eab308" />
            </div>
            <p className="stat-card-value">{adminCount}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {users.length > 0 ? `${Math.round((adminCount / users.length) * 100)}% of total` : "0%"}
            </p>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#86efac' }}>This Week</span>
              <TrendingUp size={22} color="#22c55e" />
            </div>
            <p className="stat-card-value">{thisWeek}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {thisMonth} this month
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">
              {searchTerm ? `Search Results (${filteredUsers.length})` : "All Users"}
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td style={{ color: '#94a3b8' }}>{index + 1}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="user-name">{user.username}</p>
                          <p className="user-id">{user._id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                        <Mail size={14} />
                        <span style={{ fontSize: '13px' }}>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      {user.role === "admin" ? (
                        <span className="role-badge role-badge-admin">
                          <Shield size={12} />
                          ADMIN
                        </span>
                      ) : (
                        <span className="role-badge role-badge-user">USER</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                      <div>
                        <div>{getRelativeTime(user.createdAt)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteUser(user._id, user.username)}
                        className="delete-btn"
                        title="Delete user"
                        disabled={user.role === "admin"}
                        style={{ 
                          opacity: user.role === "admin" ? 0.4 : 1,
                          cursor: user.role === "admin" ? "not-allowed" : "pointer"
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              {searchTerm ? `No users found matching "${searchTerm}"` : "No users registered yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}