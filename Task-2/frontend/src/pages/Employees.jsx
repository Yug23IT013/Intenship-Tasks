import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';

const DEPARTMENTS = ['All', 'HR', 'Engineering', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Design'];
const STATUSES = ['All', 'Active', 'Inactive', 'On Leave'];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', employee: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters & search
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 8,
        ...(search && { search }),
        ...(deptFilter !== 'All' && { department: deptFilter }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        sortBy: 'createdAt', sortOrder: 'desc',
      });
      const { data } = await API.get(`/employees?${params}`);
      setEmployees(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [page, search, deptFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, deptFilter, statusFilter]);

  const openCreate = () => setModal({ open: true, mode: 'create', employee: null });
  const openEdit = (emp) => setModal({ open: true, mode: 'edit', employee: emp });
  const openView = (emp) => setModal({ open: true, mode: 'view', employee: emp });
  const closeModal = () => setModal({ open: false, mode: 'create', employee: null });

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === 'create') {
        await API.post('/employees', formData);
        toast.success('Employee added successfully! 🎉');
      } else {
        await API.put(`/employees/${modal.employee._id}`, formData);
        toast.success('Employee updated successfully! ✅');
      }
      closeModal();
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await API.delete(`/employees/${deleteConfirm._id}`);
      toast.success(`${deleteConfirm.firstName} ${deleteConfirm.lastName} deleted successfully`);
      setDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    if (!employees.length) { toast.error('No employees to export'); return; }
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Join Date', 'Status'];
    const rows = employees.map((e) => [
      e.employeeId, e.firstName, e.lastName, e.email, e.phone,
      e.department, e.position, e.salary,
      e.joinDate ? e.joinDate.slice(0, 10) : '', e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div className="employees-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {pagination ? `${pagination.totalEmployees} total employees` : 'Manage your team'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost icon-only" id="export-btn" onClick={exportCSV} title="Export CSV">
            <FiDownload />
          </button>
          <button className="btn btn-ghost icon-only" id="refresh-btn" onClick={fetchEmployees} title="Refresh">
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
          <button className="btn btn-primary" id="add-employee-btn" onClick={openCreate}>
            <FiPlus /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            id="employee-search"
            type="text"
            className="search-input"
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" id="clear-search" onClick={() => setSearch('')}>×</button>
          )}
        </div>
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select
            id="dept-filter"
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
          <select
            id="status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        onEdit={openEdit}
        onDelete={setDeleteConfirm}
        onView={openView}
        pagination={pagination}
        onPageChange={setPage}
        loading={loading}
      />

      {/* Add/Edit Modal */}
      <EmployeeModal
        isOpen={modal.open}
        onClose={closeModal}
        onSubmit={handleSubmit}
        employee={modal.employee}
        mode={modal.mode}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete Employee</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?</p>
            <p className="confirm-warning">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button
                className="btn btn-ghost"
                id="cancel-delete-btn"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                id="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
