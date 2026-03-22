# Coaching Management System - Backend

This is the robust backend for the Coaching Management System, built using Node.js, Express, and MongoDB.

## Models Overview

The database schema is organized under the `models/` directory using Mongoose. The core entities include:

* **User**: Represents users in the system (Teachers, Students). Profiles basic authentication details like email, phone, password hash, role, and active status.
* **Admin**: Represents administrative users managing the platform, including Super Admins and standard Admins.
* **Batch**: Organizes students into batches for a specific subject, managed by a teacher.
* **Class**: Details scheduled classes associated with a batch, including meeting links and schedules.
* **Student**: Profiles enrolled students, associating a User with a specific Batch and storing guardian details.
* **Task**: Defines assignments or tasks created by teachers for specific batches.
* **Submission**: Tracks student submissions for assigned tasks, including uploaded files and teacher reviews/marks.
* **Announcement**: System-wide or batch-specific announcements broadcasted by teachers or admins.
* **Otp**: Manages One-Time Passwords for authentication and verification purposes.

## Core Relationships

- **User** acts as the base identity for `Student`, `Teacher` (via role field), and `Admin` users.
- A **Teacher** (User) creates and manages **Batches**, schedules **Classes**, assigns **Tasks**, and broadcasts **Announcements**.
- A **Student** enrolls in **Batches**, submits **Submissions** for **Tasks**, and attends **Classes**.

## Getting Started

1. Clone the repository and navigate to the `coaching_management_system_backend` directory.
2. Run `npm install` to install dependencies.
3. Set up the `.env` file with the following variables:
   - `PORT`
   - `MONGODB_URL`
   - `SECRET_KEY`
   - `EMAIL_SERVICES`
   - `HOST`
   - `EMAIL_PORT`
   - `USER_EMAIL`
   - `USER_PASSWORD`
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_SECRET_KEY`
4. Run `npm start` to run the development server.

