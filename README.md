# CampusResolve 🎓

**Smart Campus Complaint & Maintenance Management System**

![CampusResolve Banner](https://via.placeholder.com/1200x400.png?text=CampusResolve+-+Smart+Campus+Management)

CampusResolve is a modern, production-ready SaaS application designed to streamline maintenance and complaint management across university hostels and campus facilities. It connects Students, Wardens, and Maintenance Staff in a unified ecosystem with real-time tracking, analytics, and automated workflows.

---

## 🌟 Features

- **Role-Based Workflows**: Tailored dashboards for Students, Wardens, and Staff.
- **Google OAuth & JWT**: Secure authentication with HttpOnly refresh tokens and Role-Based Access Control (RBAC).
- **Complaint Lifecycle Management**: Track complaints from creation, to assignment, in-progress, and final resolution.
- **Automated Notifications**: Event-driven alerts for status changes, assignments, and resolution.
- **Analytics Dashboard**: High-level metrics for Wardens to monitor overall system health, resolution times, and staff performance.
- **Cloudinary Integration**: Seamlessly upload and preview complaint images and resolution proofs.
- **Modern UI/UX**: Built with React 19, Tailwind CSS, and robust React components featuring dynamic data tables, debounced search, and fully responsive layouts.

---

## 🛠️ Technology Stack

### Frontend
- **React 19** (Vite)
- **Tailwind CSS** (Styling)
- **React Router DOM v7** (Routing with React.lazy for code splitting)
- **Axios** (API requests & interceptors)
- **React Hook Form** (Form validation)
- **Chart.js & React-Chartjs-2** (Analytics)
- **date-fns** (Date formatting)

### Backend
- **Node.js & Express.js**
- **PostgreSQL** (Relational Database)
- **Prisma** (ORM)
- **Passport.js** (Google OAuth)
- **JWT & bcryptjs** (Auth & Security)
- **Nodemailer** (Email notifications)
- **express-validator** (Input validation)
- **Helmet, CORS, Express Rate Limit** (Security)

---

## 📂 Project Architecture

```
CampusResolve/
├── backend/                  # Express.js REST API
│   ├── config/               # Database, CORS, Passport configs
│   ├── controllers/          # HTTP request/response handlers
│   ├── middlewares/          # Auth, Validation, Global Error Handler
│   ├── prisma/               # Schema and Migrations
│   ├── routes/               # API endpoint definitions
│   ├── services/             # Core Business Logic
│   └── utils/                # JWT, Email, AppError helpers
│
└── frontend/                 # React SPA
    ├── src/
    │   ├── components/       # Reusable UI (Button, DataTable, Modal, etc.)
    │   ├── context/          # React Context (Auth, Notifications)
    │   ├── layouts/          # Topbar, Sidebar, Dashboard wrappers
    │   ├── pages/            # Role-based views (Student, Warden, Staff)
    │   └── services/         # Global API client (Axios)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Neon)
- Cloudinary Account
- Google Cloud Console (OAuth Credentials)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/CampusResolve.git
cd CampusResolve
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/campusresolve?schema=public

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Emails
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run Database Migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the Backend Server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Frontend Dev Server:
```bash
npm run dev
```

---

## 📸 Screenshots

> [!NOTE]
> Screenshots Placeholder: Add high-quality images of the Student Dashboard, Warden Analytics, and Mobile View here.

---

## 🚀 Future Improvements
- **Mobile Application**: Port the React web application to React Native.
- **WebSocket Real-Time Chat**: Add a direct messaging system between Staff and Students.
- **AI Triage**: Automatically assign complaints to the appropriate staff category based on description.

---

## 🛡️ License
This project is licensed under the MIT License.
