# 🎓 Coaching Management System - Backend

A robust RESTful API backend for managing coaching institutes, built with **Node.js**, **Express 5**, and **MongoDB (Mongoose)**.

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Models Overview](#-models-overview)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

##  Features

- **Role-Based Access Control** — Three distinct user roles: `SUPER_ADMIN`, `Teacher`, and `Student`
- **JWT Authentication** — Secure token-based authentication with 7-day expiry
- **OTP Verification** — Email-based OTP for user verification (4-digit, 5-min expiry)
- **Batch Management** — Create, update, and manage student batches with enrolled students
- **Class Scheduling** — Schedule classes with meeting links and timings
- **Task & Submission System** — Teachers assign tasks, students submit work, teachers review and grade
- **Academic Profile** — Students can maintain academic records
- **Guardian Management** — Students can add and manage guardian details
- **Notification System** — In-app notifications with read/unread tracking
- **Enrollment Tracking** — Track student enrollments across batches
- **File Upload** — Profile picture and file uploads via Cloudinary
- **Email Service** — OTP and notification emails via Nodemailer
- **Admin Dashboard** — Dashboard stats for admin overview
- **Global Error Handling** — Centralized error middleware with dev/prod modes
- **CORS Configuration** — Configurable allowed origins
- **Soft Delete** — Users are soft-deleted (not permanently removed)

---

##  Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Cloudinary** | File/image storage |
| **Nodemailer** | Email service |
| **Firebase Admin** | Push notifications |
| **express-fileupload** | File upload handling |
| **Nodemon** | Development auto-reload |

---

##  Project Structure

```
backend/
├── config/
│   ├── cloudinary.js          # Cloudinary configuration
│   └── db.config.js           # MongoDB connection
├── controller/
│   ├── auth.controller.js     # Login, OTP, profile (users)
│   ├── admin/
│   │   ├── auth.controller.js      # Admin login & profile
│   │   ├── batch.controller.js     # Batch CRUD + student enrollment
│   │   ├── class.controller.js     # Class CRUD
│   │   ├── dashboard.controller.js # Dashboard statistics
│   │   └── user.controller.js      # User management (CRUD)
│   ├── teacher/
│   │   ├── enrollment.controller.js # Student enrollment
│   │   ├── students.controller.js   # View students & review submissions
│   │   └── task.controller.js       # Task CRUD
│   └── user/
│       ├── academic.controller.js    # Academic details CRUD
│       ├── course.controller.js      # View enrolled courses
│       ├── guardian.controller.js    # Guardian details CRUD
│       ├── notification.controller.js # Notifications
│       └── task.controller.js        # View tasks & submit work
├── middlewares/
│   ├── auth.middleware.js     # JWT verification & role restriction
│   └── error.middleware.js    # Global error handler (dev/prod)
├── models/
│   ├── academic_model.js      # Academic records
│   ├── admin_model.js         # Admin users
│   ├── announcement_model.js  # Announcements
│   ├── batch_model.js         # Batches with enrolled students
│   ├── class_model.js         # Scheduled classes
│   ├── enrollment_model.js    # Enrollment tracking
│   ├── guardian_model.js      # Guardian information
│   ├── notification_model.js  # Notifications
│   ├── otp_model.js           # OTP records
│   ├── student_model.js       # Student profiles
│   ├── submission_model.js    # Task submissions
│   ├── task_model.js          # Tasks/assignments
│   ├── user_model.js          # Users (teachers & students)
│   └── index.js               # Model barrel export
├── routes/
│   ├── index.js               # Main router (mounts /api/v1)
│   ├── auth/                  # Public auth routes
│   ├── admin/                 # Admin routes (SUPER_ADMIN only)
│   ├── teacher/               # Teacher routes
│   └── user/                  # Student/user routes
├── scripts/
│   └── seedAdmin.js           # Seed initial admin user
├── services/
│   ├── emailManager.js        # Email sending via Nodemailer
│   └── notification_manager.js # Push notification service
├── templates/
│   └── email/                 # Email HTML templates (OTP)
├── utils/
│   ├── appError.js            # Custom AppError class
│   └── catchAsync.js          # Async error wrapper
├── index.js                   # App entry point
├── package.json
└── .env
```

---

##  Models Overview

| Model | Description |
|---|---|
| **User** | Teachers & Students — email, password, role (`teacher`/`student`), status, profile picture |
| **Admin** | Platform admins — role (`SUPER_ADMIN`/`ADMIN`), username, email |
| **Batch** | Groups of students for a subject — teacher, enrolled students, date range, status |
| **Class** | Scheduled classes — linked to batch, meeting link, schedule |
| **Student** | Extended student profile — linked to User and Batch, guardian info |
| **Enrollment** | Tracks which students are enrolled in which batches |
| **Task** | Assignments created by teachers for specific batches |
| **Submission** | Student submissions for tasks — uploaded files, teacher reviews, marks |
| **Academic** | Student academic records |
| **Guardian** | Guardian/parent details linked to students |
| **Announcement** | System-wide or batch-specific announcements |
| **Notification** | In-app notifications with read/unread status |
| **Otp** | One-Time Passwords for email verification |

### Core Relationships

```
Admin ──manages──▶ Platform (Users, Batches, Classes)
Teacher (User) ──creates──▶ Batches, Classes, Tasks, Announcements
Student (User) ──enrolls in──▶ Batches
Student ──submits──▶ Submissions for Tasks
Student ──has──▶ Guardians, Academic Records
```

---

##  API Endpoints

**Base URL:** `/api/v1`

###  Authentication (Public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | User login (teacher/student) |
| `POST` | `/auth/send-otp` | Send OTP to email |
| `POST` | `/auth/verify-otp` | Verify OTP |

---

###  Admin Routes (`/admin`) — Requires `SUPER_ADMIN` role

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/auth/login` | Admin login |
| `GET` | `/admin/auth/profile` | Get admin profile |

#### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Get dashboard statistics |

#### User Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/users` | Create a new user |
| `GET` | `/admin/users` | Get all users |
| `GET` | `/admin/users/:id` | Get user by ID |
| `PATCH` | `/admin/users/:id` | Update user |
| `PATCH` | `/admin/users/status/:id` | Update user status |
| `DELETE` | `/admin/users/:id` | Delete user (soft delete) |

#### Batch Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/batches` | Create a new batch |
| `GET` | `/admin/batches` | Get all batches (search, filter, paginate) |
| `GET` | `/admin/batches/:id` | Get batch by ID |
| `PATCH` | `/admin/batches/:id` | Update batch (supports `add_students` / `remove_students`) |
| `DELETE` | `/admin/batches/:id` | Delete batch |

#### Class Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/classes` | Create a new class |
| `GET` | `/admin/classes` | Get all classes |
| `GET` | `/admin/classes/:id` | Get class by ID |
| `PATCH` | `/admin/classes/:id` | Update class |
| `DELETE` | `/admin/classes/:id` | Delete class |
| `GET` | `/admin/classes/teacher/:teacher_id` | Get classes by teacher |

---

###  Teacher Routes (`/teacher`) — Requires `teacher` role

#### Enrollment
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/teacher/enroll/students` | Enroll students in a batch |
| `GET` | `/teacher/enroll/students/:batch_id` | Get students by batch |

#### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/teacher/tasks` | Create a task |
| `GET` | `/teacher/tasks` | Get all tasks |
| `GET` | `/teacher/tasks/:id` | Get task by ID |
| `PATCH` | `/teacher/tasks/:id` | Update task |
| `DELETE` | `/teacher/tasks/:id` | Delete task |

#### Students
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/teacher/students` | Get my students |
| `GET` | `/teacher/students/:student_id` | Get student detail |
| `GET` | `/teacher/students/submissions` | Get task submissions |
| `PATCH` | `/teacher/students/submissions/review/:submission_id` | Review a submission |

---

###  User/Student Routes (`/user`) — Requires authentication

#### Profile
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user/profile` | Get my profile |
| `PATCH` | `/user/profile` | Update my profile |

#### Courses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user/courses` | Get my enrolled courses |

#### Tasks & Submissions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user/tasks` | Get my tasks |
| `GET` | `/user/tasks/:id` | Get task by ID |
| `GET` | `/user/tasks/submissions` | Get all my submissions |
| `POST` | `/user/tasks/submit/:task_id` | Submit a task |
| `GET` | `/user/tasks/submission/:task_id` | Get my submission for a task |
| `PATCH` | `/user/tasks/submission/:task_id` | Update my submission |

#### Academic Details
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user/academic` | Create academic detail |
| `GET` | `/user/academic` | Get my academic details |
| `GET` | `/user/academic/:id` | Get academic detail by ID |
| `PATCH` | `/user/academic/:id` | Update academic detail |
| `DELETE` | `/user/academic/:id` | Delete academic detail |

#### Guardians
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user/guardian` | Add a guardian |
| `GET` | `/user/guardian` | Get my guardians |
| `GET` | `/user/guardian/:id` | Get guardian by ID |
| `PATCH` | `/user/guardian/:id` | Update guardian |
| `DELETE` | `/user/guardian/:id` | Delete guardian |

#### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user/notifications` | Get my notifications |
| `PATCH` | `/user/notifications/read/:id` | Mark notification as read |
| `PATCH` | `/user/notifications/read-all` | Mark all as read |

---

##  Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for file uploads)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Seed the admin user
npm run seed

# 5. Start the development server
npm start
```

The server will start at `http://localhost:<PORT>` (default: `3022`).

---

##  Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3022
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database
MONGODB_URL=mongodb://localhost:27017/coaching_management

# Authentication
SECRET_KEY=your_jwt_secret_key

# Email Service (Nodemailer)
EMAIL_SERVICES=gmail
HOST=smtp.gmail.com
EMAIL_PORT=587
USER_EMAIL=your_email@gmail.com
USER_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
```

---

##  Scripts

| Script | Command | Description |
|---|---|---|
| **Start** | `npm start` | Run dev server with Nodemon |
| **Seed Admin** | `npm run seed` | Create initial SUPER_ADMIN user |

---

##  Authentication Flow

1. **User/Teacher** — Login via `POST /api/v1/auth/login` → receives JWT token
2. **Admin** — Login via `POST /api/v1/admin/auth/login` → receives JWT token
3. Include token in all protected requests:
   ```
   Authorization: Bearer <token>
   ```
4. Middleware validates token and attaches user info to `req.user`
5. Role-based middleware (`restrictTo`) restricts access per route group

---

##  Error Handling

All errors follow a consistent JSON response format:

```json
{
  "status": false,
  "message": "Error description here"
}
```

- **Development mode** — Returns full error stack trace
- **Production mode** — Returns only operational error messages

---

##  License

ISC
