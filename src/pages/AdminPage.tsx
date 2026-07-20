import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw, Search } from "lucide-react";
import { API_URL } from "../utils/api";
import { useToast } from "../context/ToastContext";

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
  const toast = useToast();

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
        toast.success("User Deleted", `${username} has been removed`);
      } else {
        toast.error("Delete Failed", data.error || "Failed to delete user");
      }
    } catch (err) {
      toast.error("Network Error", "Please try again");
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

  // Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a14 0%, #111827 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(124, 92, 255, 0.2)',
            borderTopColor: '#7c5cff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>Loading users...</p>
        </div>
      </div>
    );
  }

  // Error State (Access Denied)
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a14 0%, #111827 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '450px',
          width: '100%',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Shield size={40} color="#ef4444" />
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '10px',
          }}>
            Access Denied
          </h2>
          <p style={{
            color: '#fca5a5',
            fontSize: '15px',
            marginBottom: '30px',
            lineHeight: 1.6,
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #7c5cff 0%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Stats
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const thisMonth = users.filter((u) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a14 0%, #111827 100%)',
      color: 'white',
      padding: '30px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px',
        }}>
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '15px',
                padding: '5px 0',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #7c5cff 0%, #4f46e5 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={26} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  margin: 0,
                  background: 'linear-gradient(135deg, #b7a7ff 0%, #7c5cff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Admin Panel
                </h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>
                  Manage all registered users
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchUsers}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #7c5cff 0%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {/* Total Users */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)',
            border: '1px solid rgba(124, 92, 255, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#cab9ff', fontSize: '13px', fontWeight: 500 }}>Total Users</span>
              <Users size={22} color="#7c5cff" />
            </div>
            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{users.length}</p>
          </div>

          {/* Regular Users */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 500 }}>Regular Users</span>
              <Users size={22} color="#3b82f6" />
            </div>
            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{userCount}</p>
          </div>

          {/* Admins */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#fde68a', fontSize: '13px', fontWeight: 500 }}>Admins</span>
              <Shield size={22} color="#eab308" />
            </div>
            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{adminCount}</p>
          </div>

          {/* This Month */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.15) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ color: '#86efac', fontSize: '13px', fontWeight: 500 }}>This Month</span>
              <Calendar size={22} color="#22c55e" />
            </div>
            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{thisMonth}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Search size={20} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '14px',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Users Table */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              All Users {searchTerm && `(${filteredUsers.length} found)`}
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Joined</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '15px 20px', color: '#94a3b8', fontSize: '14px' }}>{index + 1}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 700,
                        }}>
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{user.username}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                            {user._id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                        <Mail size={14} />
                        <span style={{ fontSize: '13px' }}>{user.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      {user.role === "admin" ? (
                        <span style={{
                          padding: '5px 12px',
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#fde68a',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                        }}>
                          <Shield size={12} />
                          ADMIN
                        </span>
                      ) : (
                        <span style={{
                          padding: '5px 12px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#93c5fd',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}>
                          USER
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: '13px', color: '#94a3b8' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <button
                        onClick={() => deleteUser(user._id, user.username)}
                        style={{
                          padding: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
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

          {filteredUsers.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b',
            }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>{searchTerm ? 'No users match your search' : 'No users registered yet'}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}