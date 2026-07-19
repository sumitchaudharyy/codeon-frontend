import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
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
        toast.success("Users loaded", `Found ${data.count} registered users`);
      } else {
        setError(data.error || "Failed to fetch users");
        toast.error("Failed to load users", data.error);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error", "Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string, username: string) => {
    const confirmed = await confirm({
      title: "Delete User?",
      message: `Are you sure you want to delete "${username}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
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
        toast.success("User deleted", `${username} has been removed`);
      } else {
        toast.error("Delete failed", data.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("Network error", "Unable to delete user");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
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
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-gray-400 mt-2">Manage all registered users</p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-medium">Total Users</p>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-sm font-medium">Regular Users</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{userCount}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-300 text-sm font-medium">Admins</p>
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{adminCount}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-300 text-sm font-medium">This Month</p>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{thisMonth}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">#</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Joined</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition"
                  >
                    <td className="p-4 text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {user._id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === "admin" ? (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold w-fit inline-block">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteUser(user._id, user.username)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No users registered yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}