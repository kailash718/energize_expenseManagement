# University Expense Submission & Multi-Level Approval System (MERN Stack)

An enterprise academic ERP application for managing university-wide expense submissions, multi-tiered hierarchical approvals, department budgets, and sponsored research grant allocations.

---

## 🏛️ System Architecture & Workflow

```
Faculty / Staff
       ↓ (Submit Expense + Receipts)
  HOD Review (Scoped to Department: Approve / Reject)
       ↓ (Approved)
Finance Officer (Audit Receipts, Duplicate Check, Verify)
       ↓
Registrar / Executive Management (Final Sanction for Claims > ₹25,000)
       ↓
Reimbursement Disbursal (Payment Recorded + UTR Generated)
       ↓
Department & Research Budgets Auto-Reconciled
```

---

## 👥 User Roles & Stakeholder Capabilities

| Role | Test Persona | Key Responsibilities |
| :--- | :--- | :--- |
| **Faculty / Staff** | `arun.kumar@university.edu` | Submit claims with receipt invoices, tag research projects, track real-time approval stages. |
| **HOD (Head of Dept)** | `hod.cs@university.edu` | Scoped to departmental expenditures. Review claim cards, add review feedback, Approve/Reject. |
| **Finance Officer** | `finance@university.edu` | Audits tax invoices, detects duplicate claims, executes disbursements via NEFT/UPI, generates UTR vouchers. |
| **Registrar / Management** | `registrar@university.edu` | High-value expenditure sanction (> ₹25,000), university-wide fiscal overview. |
| **System Admin** | `admin@university.edu` | Department creation, academic year allocations, user role management. |

---

## 🚀 Key Features

* **Auto-Generated Immutable Expense IDs**: Format `EXP-YYYY-#####` (e.g. `EXP-2026-00125`) protected against client modification.
* **17+ Granular Expense Categories**: Covering conferences, lab equipment, books & journals, software licenses, travel, utilities, student events, and more.
* **Research Project Grant Tracking**: Dedicated sub-budget allocations (Equipment, Software, Travel, Research Assistance, Other) matching the project specification (e.g. *AI-Based Medical Image Analysis*).
* **Department Budget Management**: Real-time tracking of Annual Budget, Amount Spent, Pending Expenses, and Remaining Balance.
* **Interactive Data Visualizations (Recharts)**:
  * Monthly university expenditure run-rate area charts.
  * Department spend vs allocation comparative bar charts.
  * Category distribution donut charts.
* **Receipt Audit Viewer**: Built-in modal for inspecting attached bills and digital verification stamps.
* **1-Click Quick Demo Switcher**: Instant switching between all 5 roles in header or login page for seamless testing and review.

---

## 🛠️ Technology Stack

* **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React, Recharts, Axios, React Router v6.
* **Backend**: Node.js, Express.js (ES Modules), Mongoose, Multer (file uploads), JWT Authentication, bcryptjs.
* **Database**: MongoDB (Local or Atlas) on `mongodb://127.0.0.1:27017/university_expense_db`.

---

## 📦 Getting Started

### 1. Database Seed
To populate all initial departments, demo users, budgets, and sample expenses:
```bash
cd backend
node seed/seedData.js
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

### 3. Start Frontend App
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Faculty (Dr. Arun Kumar)** | `arun.kumar@university.edu` | `FacultyUser@2026` |
| **HOD (Prof. Ramesh Sharma)** | `hod.cs@university.edu` | `HodUser@2026` |
| **Finance Officer (Mr. Rajesh Gupta)** | `finance@university.edu` | `FinanceUser@2026` |
| **Registrar (Prof. V. Raman)** | `registrar@university.edu` | `RegistrarUser@2026` |
| **System Admin** | `admin@university.edu` | `AdminUser@2026` |

*(Note: You can also use the **1-Click Quick Switcher** buttons in the app header or on the login screen to jump into any role instantly).*
