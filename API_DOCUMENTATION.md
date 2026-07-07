# CampusResolve API Documentation

Base URL: `http://localhost:5000/api`

## Authentication API (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new Student | No |
| `POST` | `/auth/login` | Login and receive tokens | No |
| `POST` | `/auth/logout` | Clear refresh token cookie | Yes |
| `POST` | `/auth/refresh-token` | Generate new access token | No (Uses Cookie) |
| `GET`  | `/auth/me` | Get current user profile | Yes |
| `POST` | `/auth/forgot-password` | Generate OTP for password reset | No |
| `POST` | `/auth/verify-otp` | Verify the 6-digit OTP | No |
| `POST` | `/auth/reset-password` | Reset password using OTP | No |
| `GET`  | `/auth/google` | Initiate Google OAuth | No |

---

## User Profile API (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `PUT`  | `/users/profile` | Update profile details | Yes |
| `PUT`  | `/users/avatar` | Upload new avatar (Cloudinary) | Yes |

---

## Complaint API (`/api/complaints`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/complaints` | Create a new complaint | Yes (Student) |
| `GET`  | `/complaints` | Get paginated complaints list | Yes |
| `GET`  | `/complaints/:id` | Get specific complaint details | Yes |
| `PATCH`| `/complaints/:id/cancel` | Cancel a pending complaint | Yes (Student) |
| `PATCH`| `/complaints/:id/status` | Update complaint status | Yes (Warden/Staff) |
| `POST` | `/complaints/:id/comments`| Add a comment | Yes |
| `GET`  | `/complaints/:id/comments`| Get comments for a complaint | Yes |

---

## Warden API (`/api/warden`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/warden/dashboard` | Get high-level stats | Yes (Warden) |
| `POST` | `/warden/staff` | Register a new Staff member | Yes (Warden) |
| `GET`  | `/warden/staff` | Get list of staff members | Yes (Warden) |
| `PATCH`| `/warden/staff/:id/status`| Activate/Deactivate staff | Yes (Warden) |
| `PATCH`| `/warden/complaints/:id/assign` | Assign complaint to staff | Yes (Warden) |

---

## Staff API (`/api/staff`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/staff/dashboard` | Get staff metrics | Yes (Staff) |
| `GET`  | `/staff/assignments` | Get assigned complaints | Yes (Staff) |
| `PATCH`| `/staff/complaints/:id/accept` | Accept an assignment | Yes (Staff) |
| `PATCH`| `/staff/complaints/:id/resolve`| Resolve a complaint with proof | Yes (Staff) |

---

## Notification API (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/notifications` | Get user notifications | Yes |
| `PATCH`| `/notifications/read-all` | Mark all as read | Yes |
| `PATCH`| `/notifications/:id/read` | Mark specific notification as read | Yes |

---

## Analytics API (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/analytics/overview` | Get system overview stats | Yes (Warden) |
| `GET`  | `/analytics/staff-performance`| Get staff resolution metrics | Yes (Warden) |
| `GET`  | `/analytics/trends` | Get weekly/monthly trends | Yes (Warden) |

---

## 🔒 Authorization Headers
For all endpoints where **Auth Required** is `Yes`, you must pass the Access Token in the request header:
```
Authorization: Bearer <your_jwt_access_token>
```
