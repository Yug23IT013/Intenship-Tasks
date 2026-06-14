# EMS Pro — Employee Management System

A full-stack **MERN Stack** web application for managing employee records with JWT authentication and complete CRUD operations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` — update `MONGO_URI` if using MongoDB Atlas:
```env
MONGO_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_super_secret_key_here
```

Start backend:
```bash
npm run dev   # Runs on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev   # Runs on http://localhost:5173
```

### 3. Open App
Go to: **http://localhost:5173**

1. Click **Create account** to register as admin
2. Login and start managing employees!

---

## 📁 Project Structure

```
task 2/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT middleware
│   ├── models/
│   │   ├── User.js            # Admin user model
│   │   └── Employee.js        # Employee model
│   ├── routes/
│   │   ├── auth.js            # Auth routes (login/register)
│   │   └── employees.js       # CRUD routes
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js       # Axios + interceptors
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EmployeeTable.jsx
        │   ├── EmployeeModal.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            └── Employees.jsx
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure login/register with bcrypt hashing |
| 👥 CRUD | Create, Read, Update, Delete employees |
| 🔍 Search | Real-time search by name/email/ID |
| 🎛️ Filters | Filter by department and status |
| 📄 Pagination | Paginated table (8 per page) |
| 📊 Dashboard | Stats, department breakdown, recent employees |
| 📥 Export | CSV export of employees |
| ✅ Validation | Full frontend + backend validation |
| 📱 Responsive | Works on mobile, tablet, desktop |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Employees (all protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List all (search/filter/paginate) |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/stats/summary` | Get statistics |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite, React Router v6, Axios, React Hot Toast, React Icons
- **Backend**: Node.js, Express.js, express-validator
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Styling**: Vanilla CSS (dark glassmorphism)
