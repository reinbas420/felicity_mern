# Felicity 2026 - MERN Event Management System

A premium, full-stack event management platform designed for college festivals, featuring a sleek neon aesthetic and advanced role-based functionalities.

## 🚀 Experience the App
- **Live Frontend:** [[Vercel Deployment URL](https://felicity-mern.vercel.app)]
- **Live Backend:** [[Render Deployment URL](https://felicity-mern.onrender.com)]

---

## ✨ Key Features

### 👤 For Participants
- **Dynamic Event Discovery:** Browse events with advanced filtering by Genre (Tech, Cultural, Sports, etc.), Time (Upcoming/Past), and Organizing Club.
- **Smart Registration:** Seamlessly register for events. Includes support for **Manual Approval flows** where organisers review custom forms.
- **Custom Form Support:** Fill out dynamic forms designed by organizers specific to each event (e.g., Team details, T-shirt sizes).
- **Personalized Dashboard:** 
  - Manage followed clubs and see their latest events.
  - View "Trending Events" based on popularity.
  - Access registration history and status.
- **QR Code Attendance:** Instant generation of personalized QR codes for event check-ins.
- **IIIT-Only Restrictions:** Automatic domain verification ensuring certain sensitive events are only visible to authorized participants.

### 🏢 For Organizers (Clubs)
- **Comprehensive Event Management:** Create, Edit, and Delete events. Supports **Draft mode** for preparation and **Publish mode** for visibility.
- **Custom Form Builder:** A drag-and-drop style interface to create specific registration forms for every event (Text, Number, Date, Single/Multi Select).
- **Registration Approval Flow:** Review participant responses for events with custom forms and choose to **Approve** or **Reject** registrations.
- **Attendance Tracking:** Real-time attendance marking system with participant search.
- **Analytics Dashboard:** Visual summary of total registrations, capacity, revenue earned, and attendance percentages.
- **Secure Profile Management:** Request password changes with mandatory justification for admin review.

### 🔑 For Admins
- **Global Control:** Monitor all events across all clubs from a single dashboard.
- **Club Management:** Onboard new clubs/organizers and manage their lifecycle.
- **Approval System:** Mediate and approve/reject password reset requests from organizers to maintain security.
- **Communication Hub:** Search and send high-priority system emails directly to any participant.
- **System Stats:** Overview of total organizers, events, and participation levels across the platform.

---

## 🛠 Tech Stack
- **Frontend:** React.js, Vite, Axios, JWT-Decode, QRcode.react.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose).
- **Authentication:** JWT (JSON Web Tokens) with secure password hashing (Bcrypt).
- **Styling:** Premium Neon Design System using Vanilla CSS (Glassmorphism, Vibrant Gradients).
- **Deployment:** Vercel (Frontend), Render (Backend).

---

## 💻 Local Setup

### 1. Prerequisite
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### 2. Clone and Install
```bash
git clone https://github.com/reinbas420/felicity_mern.git
cd felicity_mern

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_APP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173 
```
#For local setup

### 4. Run Locally
```bash
# In backend folder
npm run dev

# In frontend folder
npm run dev
```

---

## 🛡 Security & Design
- **Role-Based Access Control (RBAC):** Strict middleware checks for Admin, Organizer, and Participant routes.
- **Dynamic CORS:** Configurable origin whitelisting for local and production environments.
- **Premium Aesthetics:** Tailored HSL color palettes, micro-animations, and responsive layouts for a wowed user experience.
