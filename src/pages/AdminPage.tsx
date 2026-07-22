import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw } from "lucide-react";
import { API_URL } from "../utils/api";

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
  const navigate = useNavigate();

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
    if (!confirm(`Delete user "${username}"? This cannot be undone!`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setUsers(users.filter((u) => u._id !== id));
        alert("✅ User deleted successfully!");
      } else {
        alert("❌ " + (data.error || "Failed to delete"));
      }
    } catch (err) {
      alert("❌ Network error");
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

  // Loading
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

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const thisMonth = users.filter((u) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

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
                <p className="admin-subtitle">Manage all registered users</p>
              </div>
            </div>
          </div>
          <button onClick={fetchUsers} className="admin-refresh-btn" title="Refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#cab9ff' }}>Total Users</span>
              <Users size={22} color="#7c5cff" />
            </div>
            <p className="stat-card-value">{users.length}</p>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#93c5fd' }}>Regular Users</span>
              <Users size={22} color="#3b82f6" />
            </div>
            <p className="stat-card-value">{userCount}</p>
          </div>

          <div className="stat-card stat-card-yellow">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#fde68a' }}>Admins</span>
              <Shield size={22} color="#eab308" />
            </div>
            <p className="stat-card-value">{adminCount}</p>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-card-header">
              <span className="stat-card-label" style={{ color: '#86efac' }}>This Month</span>
              <Calendar size={22} color="#22c55e" />
            </div>
            <p className="stat-card-value">{thisMonth}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">All Users</h2>
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
                {users.map((user, index) => (
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
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteUser(user._id, user.username)}
                        className="delete-btn"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              No users registered yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}