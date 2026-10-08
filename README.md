# B.Tech Course Registration System

A modern, full-stack B.Tech Academic Course Registration Portal built with a pure backend API (Node.js/Express + MongoDB) and an ultra-premium, white-faced collegiate React frontend.

---

## 🏛️ System Overview

- **Backend**: Modular Express REST API (Config, Models, Controllers, Routes, Middleware) in `backend/`.
- **Frontend**: Premium white collegiate UI in React + Tailwind CSS (Vite) in `frontend/`.
- **Port**:
  - Backend API: `http://localhost:5000`
  - Frontend App: `http://localhost:5173`

---

## 📁 Project Structure

```text
course-registration-system/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── index.css
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── Student.js
│   │   ├── Course.js
│   │   └── schemas.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   └── registrationController.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── courseRoutes.js
│   │   └── registrationRoutes.js
│   │
│   └── middleware/
│       └── auth.js
│
└── README.md
```

---

## 🔑 Default Administrator Credentials

- **Admin Email**: `admin@university.edu`
- **Admin Password**: `Admin@123`

---

## 🚀 Running the Project

### Run Both Frontend & Backend Concurrently (Recommended)

From the project root:

```bash
npm run dev
```

This concurrently runs:
- **Backend API**: `nodemon server.js` on port `5000`
- **Frontend App**: Vite development server on port `5173`

---

### Run Individually (Optional)

#### 1. Backend Only
```bash
cd backend
npm run dev
```

#### 2. Frontend Only
```bash
cd frontend
npm run dev
```

---

## 📋 Features

### Student Portal
- Student Registration & Authentication with live password requirement validation.
- Live Course Catalog with real-time seat availability meters, prerequisites, department filters, and search.
- One-click Course Registration and Drop with 24-credit maximum rule enforcement.
- Enrolled Courses View with total credit progress bar and timetable breakdown.
- Printable Official University Course Registration Slip with signatures and academic seal.

### Administrator Portal
- Executive KPI Metrics: Enrolled Students, Active Courses, Total Registrations, Seat Occupancy Rate.
- Course Management: Add new course modules, monitor live seats, and delete courses.
- Student Directory: Search students by Roll No / Name, filter by department, review registered modules, credit count, and delete records.
