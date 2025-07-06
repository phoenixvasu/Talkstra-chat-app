# Talkstra - Real-Time Chat Application

## Overview

Talkstra is a modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js), Socket.io for real-time communication, and TailwindCSS/DaisyUI for a beautiful, responsive UI. It supports instant messaging, user presence, image sharing, authentication, and a seamless user experience across devices.

---

## Features

- **Real-time Messaging:** Instant one-on-one chat with Socket.io
- **User Authentication:** Secure signup, login, logout with JWT and HTTP-only cookies
- **User Presence:** Online/offline status tracking in real-time
- **Media Sharing:** Send images in chat (stored securely via Cloudinary)
- **Profile Management:** Update profile picture and user info
- **Responsive UI:** Built with TailwindCSS and DaisyUI, supporting light/dark themes
- **Persistent Chat History:** All messages are stored in MongoDB
- **Error Handling & Notifications:** User-friendly feedback with React Hot Toast
- **Production-ready:** Easily deployable to Vercel or any Node/React hosting

---

## Tech Stack

- **Frontend:** React, Vite, Zustand, TailwindCSS, DaisyUI, Socket.io-client, Axios, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, JWT, bcryptjs, Cloudinary
- **Dev Tools:** ESLint, PostCSS, Vercel, dotenv

---

## Architecture

### Backend

- **Express.js** REST API with modular MVC structure
- **MongoDB** for data storage (users, messages)
- **Socket.io** for real-time communication
- **JWT** for stateless authentication (stored in HTTP-only cookies)
- **Cloudinary** for image uploads

**Main Collections:**

- `users`: Stores user info (name, email, hashed password, profilePic, timestamps)
- `messages`: Stores chat messages (senderId, receiverId, text, image, timestamps)

### Frontend

- **React** SPA with component-based architecture
- **Zustand** for state management (auth, chat, theme)
- **Socket.io-client** for real-time updates
- **Axios** for API requests
- **TailwindCSS/DaisyUI** for styling and themes

---

## Project Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── lib/            # DB, socket, cloudinary, utils
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   └── index.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Axios, utils
│   │   └── App.jsx, main.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Cloudinary account (for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/phoenixvasu/Talkstra-chat-app.git
cd Talkstra-chat-app
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create a .env file with the following variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# FRONTEND_URL=http://localhost:5173
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:3000` by default.

---

## Environment Variables

### Backend (`backend/.env`)

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend

- No sensitive variables required; API base URL is auto-configured for dev/prod.

---

## Usage

- Register a new account or log in with existing credentials
- Start chatting with any user from the sidebar
- Send text or image messages in real-time
- Update your profile picture in settings
- See online/offline status of users
- Enjoy a responsive, themeable UI

---

## Deployment

### Vercel (Recommended)

- Both frontend and backend are ready for Vercel deployment
- See `vercel.json` in each folder for configuration
- Set environment variables in Vercel dashboard for backend
- Update `FRONTEND_URL` and API endpoints as needed

### Other Platforms

- You can deploy backend to any Node.js host and frontend to any static host (Netlify, Vercel, etc.)
- Make sure to update environment variables and CORS settings accordingly

---

## Contribution Guidelines

- Fork the repository
- Create a new branch for your feature or bugfix
- Commit your changes with clear messages
- Open a pull request describing your changes
- Ensure code is linted and tested before submitting

---

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Socket.io](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
