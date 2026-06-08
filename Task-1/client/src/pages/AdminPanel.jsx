import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/protected/admin');
      setUsers(data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId + '-role');
    try {
      await api.patch(`/protected/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (userId, username) => {
    if (!window.confirm(`Deactivate user "${username}"?`)) return;
    setActionLoading(userId + '-del');
    try {
      await api.delete(`/protected/admin/users/${userId}`);
      toast.success(`User "${username}" deactivated`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: false } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="welcome-badge admin-badge">⚡ Admin Only</div>
        <h1 className="page-title">
          Admin <span className="gradient-text-admin">Panel</span>
        </h1>
        <p className="page-subtitle">
          Manage users, roles, and account status across the platform.
        </p>
      </div>

      <div className="admin-meta-bar">
        <div className="meta-item">
          <span className="meta-val">{users.length}</span>
          <span className="meta-key">Total Users</span>
        </div>
        <div className="meta-item">
          <span className="meta-val">{users.filter((u) => u.isActive).length}</span>
          <span className="meta-key">Active</span>
        </div>
        <div className="meta-item">
          <span className="meta-val">{users.filter((u) => u.role === 'admin').length}</span>
          <span className="meta-key">Admins</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-placeholder">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : (
        <div className="table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                      {u._id === adminUser?._id && (
                        <span className="you-badge">You</span>
                      )}
                    </div>
                  </td>
                  <td className="mono text-muted">{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'status-active' : 'status-inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {u._id !== adminUser?._id && u.isActive && (
                        <>
                          <button
                            className="btn-action btn-role"
                            disabled={!!actionLoading}
                            onClick={() =>
                              handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')
                            }
                            title={`Make ${u.role === 'admin' ? 'User' : 'Admin'}`}
                          >
                            {actionLoading === u._id + '-role' ? '⏳' : u.role === 'admin' ? '⬇️ Demote' : '⬆️ Promote'}
                          </button>
                          <button
                            className="btn-action btn-deactivate"
                            disabled={!!actionLoading}
                            onClick={() => handleDeactivate(u._id, u.username)}
                            title="Deactivate user"
                          >
                            {actionLoading === u._id + '-del' ? '⏳' : '🚫 Deactivate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
