import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiUserCheck, FiDollarSign, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { MdOutlineGroupWork } from 'react-icons/md';

const DEPT_COLORS = {
  Engineering: '#6366f1', HR: '#ec4899', Finance: '#f59e0b',
  Marketing: '#10b981', Sales: '#3b82f6', Operations: '#8b5cf6',
  Legal: '#ef4444', Design: '#06b6d4',
};

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-icon-wrap" style={{ background: `${color}22` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {trend && <span className="stat-trend">{trend}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, listRes] = await Promise.all([
          API.get('/employees/stats/summary'),
          API.get('/employees?limit=5&sortBy=createdAt&sortOrder=desc'),
        ]);
        setStats(summaryRes.data.data.overview);
        setDeptStats(summaryRes.data.data.byDepartment || []);
        setRecentEmployees(listRes.data.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatSalary = (num) =>
    num ? `₹${(num / 1000).toFixed(1)}K` : '₹0';

  return (
    <div className="dashboard-page">
      {/* Hero greeting */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-greeting">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="dashboard-subtitle">Here's your employee management overview</p>
        </div>
        <button className="btn btn-primary" id="add-employee-dashboard-btn" onClick={() => navigate('/employees')}>
          <FiUsers /> Manage Employees <FiArrowRight />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard icon={<FiUsers size={22} />} label="Total Employees" color="#6366f1"
          value={loading ? '—' : stats?.total ?? 0} trend="All time" />
        <StatCard icon={<FiUserCheck size={22} />} label="Active Employees" color="#10b981"
          value={loading ? '—' : stats?.active ?? 0} trend="Currently working" />
        <StatCard icon={<FiDollarSign size={22} />} label="Avg. Salary" color="#f59e0b"
          value={loading ? '—' : formatSalary(stats?.avgSalary)} trend="Per month" />
        <StatCard icon={<FiTrendingUp size={22} />} label="Total Payroll" color="#ec4899"
          value={loading ? '—' : `₹${stats?.totalPayroll ? (stats.totalPayroll / 100000).toFixed(1) + 'L' : '0'}`} trend="Monthly" />
      </div>

      <div className="dashboard-grid">
        {/* Department breakdown */}
        <div className="dashboard-card dept-card">
          <div className="card-header">
            <h2 className="card-title"><MdOutlineGroupWork /> Departments</h2>
          </div>
          {loading ? (
            <div className="card-loading">{[...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton-dept"></div>)}</div>
          ) : deptStats.length === 0 ? (
            <p className="card-empty">No department data yet</p>
          ) : (
            <ul className="dept-list">
              {deptStats.map((d) => {
                const max = Math.max(...deptStats.map(x => x.count));
                return (
                  <li key={d._id} className="dept-item">
                    <div className="dept-info">
                      <span className="dept-dot" style={{ background: DEPT_COLORS[d._id] || '#6366f1' }}></span>
                      <span className="dept-name">{d._id}</span>
                      <span className="dept-count">{d.count}</span>
                    </div>
                    <div className="dept-bar-bg">
                      <div className="dept-bar-fill" style={{ width: `${(d.count / max) * 100}%`, background: DEPT_COLORS[d._id] || '#6366f1' }}></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent Employees */}
        <div className="dashboard-card recent-card">
          <div className="card-header">
            <h2 className="card-title"><FiUsers /> Recent Employees</h2>
            <button className="link-btn" id="view-all-btn" onClick={() => navigate('/employees')}>View all →</button>
          </div>
          {loading ? (
            <div className="card-loading">{[...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton-emp"></div>)}</div>
          ) : recentEmployees.length === 0 ? (
            <p className="card-empty">No employees yet. <button className="link-btn" onClick={() => navigate('/employees')}>Add one →</button></p>
          ) : (
            <ul className="recent-list">
              {recentEmployees.map((emp) => (
                <li key={emp._id} className="recent-item">
                  <div
                    className="recent-avatar"
                    style={{ background: `${DEPT_COLORS[emp.department] || '#6366f1'}33`, color: DEPT_COLORS[emp.department] || '#6366f1' }}
                  >
                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{emp.firstName} {emp.lastName}</span>
                    <span className="recent-role">{emp.position} · {emp.department}</span>
                  </div>
                  <span className={`mini-badge ${emp.status === 'Active' ? 'active' : emp.status === 'On Leave' ? 'leave' : 'inactive'}`}>
                    {emp.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
