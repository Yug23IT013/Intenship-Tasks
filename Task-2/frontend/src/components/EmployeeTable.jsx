import { format } from 'date-fns';
import { FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DEPT_COLORS = {
  Engineering: '#6366f1',
  HR: '#ec4899',
  Finance: '#f59e0b',
  Marketing: '#10b981',
  Sales: '#3b82f6',
  Operations: '#8b5cf6',
  Legal: '#ef4444',
  Design: '#06b6d4',
};

const STATUS_CONFIG = {
  Active: { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  Inactive: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  'On Leave': { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
};

const EmployeeTable = ({ employees, onEdit, onDelete, onView, pagination, onPageChange, loading }) => {
  if (loading) {
    return (
      <div className="table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton skeleton-avatar"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-badge"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No Employees Found</h3>
        <p>Try adjusting your search or filters, or add a new employee.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>ID</th>
              <th>Department</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="table-row">
                <td>
                  <div className="employee-info">
                    <div
                      className="emp-avatar"
                      style={{ background: `${DEPT_COLORS[emp.department] || '#6366f1'}33`, color: DEPT_COLORS[emp.department] || '#6366f1' }}
                    >
                      {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="emp-name">{emp.firstName} {emp.lastName}</div>
                      <div className="emp-email">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="emp-id-badge">{emp.employeeId}</span>
                </td>
                <td>
                  <span
                    className="dept-badge"
                    style={{
                      color: DEPT_COLORS[emp.department] || '#6366f1',
                      background: `${DEPT_COLORS[emp.department] || '#6366f1'}22`,
                    }}
                  >
                    {emp.department}
                  </span>
                </td>
                <td className="position-cell">{emp.position}</td>
                <td className="salary-cell">
                  ₹{Number(emp.salary).toLocaleString('en-IN')}
                </td>
                <td className="date-cell">
                  {emp.joinDate ? format(new Date(emp.joinDate), 'dd MMM yyyy') : '—'}
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      color: STATUS_CONFIG[emp.status]?.color || '#888',
                      background: STATUS_CONFIG[emp.status]?.bg || 'transparent',
                    }}
                  >
                    <span className="status-dot" style={{ background: STATUS_CONFIG[emp.status]?.color }}></span>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      title="View Details"
                      id={`view-btn-${emp._id}`}
                      onClick={() => onView(emp)}
                    >
                      <FiEye />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      title="Edit Employee"
                      id={`edit-btn-${emp._id}`}
                      onClick={() => onEdit(emp)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Delete Employee"
                      id={`delete-btn-${emp._id}`}
                      onClick={() => onDelete(emp)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {((pagination.currentPage - 1) * 10) + 1}–{Math.min(pagination.currentPage * 10, pagination.totalEmployees)} of {pagination.totalEmployees}
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              id="prev-page-btn"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                id={`page-btn-${i + 1}`}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              id="next-page-btn"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
