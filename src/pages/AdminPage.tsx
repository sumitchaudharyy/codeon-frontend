import { useEffect, useState } from 'react';
import { Users, Trash2, Mail, Calendar, User as UserIcon } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone!`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
        alert('User deleted!');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage all registered users</p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total Users</p>
                <p className="text-4xl font-bold mt-1">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">This Month</p>
                <p className="text-4xl font-bold mt-1">
                  {users.filter(u => {
                    const created = new Date(u.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Latest User</p>
                <p className="text-lg font-bold mt-1 truncate">
                  {users[0]?.username || 'None'}
                </p>
              </div>
              <UserIcon className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">#</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Avatar</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Username</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">User ID</th>
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{user.username}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">
                      {user._id.slice(0, 8)}...
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

        {/* Refresh Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={fetchUsers}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}