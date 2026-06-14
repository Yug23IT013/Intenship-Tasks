import { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser } from 'react-icons/fi';

const DEPARTMENTS = ['HR', 'Engineering', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Design'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  department: '', position: '', salary: '', joinDate: '',
  status: 'Active', address: '',
};

const EmployeeModal = ({ isOpen, onClose, onSubmit, employee, mode }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee && (mode === 'edit' || mode === 'view')) {
      setForm({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary || '',
        joinDate: employee.joinDate ? employee.joinDate.slice(0, 10) : '',
        status: employee.status || 'Active',
        address: employee.address || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [employee, mode, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim() || form.firstName.length < 2) errs.firstName = 'First name must be at least 2 characters';
    if (!form.lastName.trim() || form.lastName.length < 2) errs.lastName = 'Last name must be at least 2 characters';
    if (!form.email || !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone || !/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.department) errs.department = 'Department is required';
    if (!form.position.trim()) errs.position = 'Position is required';
    if (form.salary === '' || isNaN(form.salary) || Number(form.salary) < 0) errs.salary = 'Valid salary is required';
    if (!form.joinDate) errs.joinDate = 'Join date is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, salary: Number(form.salary) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;
  const isView = mode === 'view';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon"><FiUser /></div>
            <div>
              <h2 className="modal-title">
                {mode === 'create' ? 'Add New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details'}
              </h2>
              {employee && <p className="modal-subtitle">ID: {employee.employeeId}</p>}
            </div>
          </div>
          <button className="modal-close" id="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName" name="firstName" type="text"
                  value={form.firstName} onChange={handleChange}
                  disabled={isView} className={errors.firstName ? 'input-error' : ''}
                  placeholder="John"
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName" name="lastName" type="text"
                  value={form.lastName} onChange={handleChange}
                  disabled={isView} className={errors.lastName ? 'input-error' : ''}
                  placeholder="Doe"
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  disabled={isView} className={errors.email ? 'input-error' : ''}
                  placeholder="john.doe@company.com"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone" name="phone" type="tel"
                  value={form.phone} onChange={handleChange}
                  disabled={isView} className={errors.phone ? 'input-error' : ''}
                  placeholder="9876543210"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group full">
              <label htmlFor="address">Address</label>
              <textarea
                id="address" name="address" rows="2"
                value={form.address} onChange={handleChange}
                disabled={isView} placeholder="Enter address (optional)"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Job Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department" name="department"
                  value={form.department} onChange={handleChange}
                  disabled={isView} className={errors.department ? 'input-error' : ''}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="field-error">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="position">Position *</label>
                <input
                  id="position" name="position" type="text"
                  value={form.position} onChange={handleChange}
                  disabled={isView} className={errors.position ? 'input-error' : ''}
                  placeholder="Software Engineer"
                />
                {errors.position && <span className="field-error">{errors.position}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary">Salary (₹) *</label>
                <input
                  id="salary" name="salary" type="number" min="0"
                  value={form.salary} onChange={handleChange}
                  disabled={isView} className={errors.salary ? 'input-error' : ''}
                  placeholder="50000"
                />
                {errors.salary && <span className="field-error">{errors.salary}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="joinDate">Join Date *</label>
                <input
                  id="joinDate" name="joinDate" type="date"
                  value={form.joinDate} onChange={handleChange}
                  disabled={isView} className={errors.joinDate ? 'input-error' : ''}
                />
                {errors.joinDate && <span className="field-error">{errors.joinDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} disabled={isView}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {!isView && (
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" id="cancel-modal-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="submit-modal-btn" disabled={submitting}>
                <FiSave />
                {submitting ? 'Saving...' : mode === 'create' ? 'Add Employee' : 'Save Changes'}
              </button>
            </div>
          )}

          {isView && (
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" id="close-view-btn" onClick={onClose}>Close</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
