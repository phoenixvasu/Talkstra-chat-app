# Talkstra - Real-Time MERN Chat App

A modern, production-grade real-time chat application built with the MERN stack, Socket.io, TailwindCSS, and DaisyUI. Features WhatsApp-style UI/UX, private and group chats, emoji reactions, robust authentication, and real-time updates.

---

## 🚀 Features

- **Real-Time Messaging:** Instant private and group chat with Socket.io.
- **WhatsApp-Style UI/UX:** Modern, responsive, and visually appealing interface with reactions and message bubbles.
- **Group Chats:** Create, join, and manage group conversations with admin controls.
- **Emoji Reactions:** React to messages with emojis, see who reacted, and remove your reaction (horizontal bar, WhatsApp-style, never cut off).
- **Authentication:** JWT-based login/register, secure session management, protected routes.
- **User Presence:** Online status indicators, show who is online in sidebar.
- **Profile Avatars:** User and group avatars, with fallback images.
- **Image Attachments:** Send and view images in chat.
- **Robust Error Handling:** Defensive checks, user-friendly toasts, and production-grade error flows.
- **Mobile Responsive:** Fully responsive for desktop and mobile.
- **Modern Tech Stack:** MERN, Zustand, TailwindCSS, DaisyUI, Socket.io, Cloudinary.
- **Optimistic UI Updates:** Instant feedback for sent messages and reactions.
- **State Consistency:** Robust handling of deleted messages and race conditions.
- **Accessibility:** Keyboard navigation, focus states, ARIA labels.

---

## 🛡️ Key Fixes & Robustness

- **Race Condition Handling:** Defensive checks and versioning prevent reactions from running on stale or invalid messages, eliminating “Message not found” errors.
- **Consistent State:** addReaction and removeReaction never remove messages from state on error, ensuring frontend-backend consistency.
- **Optimistic UI:** Message sending and reactions are reflected instantly, with backend confirmation syncing state.
- **Socket Robustness:** Socket handlers always update messages by stringified \_id, and reaction updates are emitted to both sender and receiver (all devices/tabs).
- **Error Handling:** Toasts for 404s are suppressed, and only truly stale messages are removed from state.

---

## 🛠️ Tech Stack

- **Frontend:** React, Zustand, TailwindCSS, DaisyUI, Socket.io-client
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Authentication:** JWT, HTTP-only cookies
- **File Uploads:** Cloudinary
- **Styling:** TailwindCSS, DaisyUI

---

## 📁 Project Structure

```
Talkstra-Chat-App/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── ...
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── lib/
│   │   └── ...
│   └── ...
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/Talkstra-Chat-App.git
cd Talkstra-Chat-App
```

### 2. **Backend Setup**

```bash
cd backend
npm install
cp .env.example .env # Fill in your environment variables
npm run dev
```

#### **Backend Environment Variables (.env):**

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
```

### 3. **Frontend Setup**

```bash
cd frontend
npm install
cp .env.example .env # (if needed)
npm run dev
```

#### **Frontend Environment Variables (.env):**

```
VITE_API_URL=http://localhost:5001/api
```

---

## 🏗️ Architecture & Flow

### **Frontend**

- **State Management:** Zustand for chat, user, and group state.
- **Socket.io:** Real-time events for messages, reactions, and presence.
- **UI/UX:** WhatsApp-style message bubbles, reactions bar, avatars, and responsive design.
- **Components:**
  - `ChatContainer`: Main chat view, message list, reactions.
  - `Sidebar`: User and group list, online status, group creation.
  - `MessageInput`: Send text/images, emoji picker.
  - `ChatHeader`: Chat/group info, member management.
  - `ReactionBar`: Emoji reactions, tooltips, picker.

### **Backend**

- **REST API:** Express routes for users, messages, groups, reactions.
- **Socket.io:** Real-time messaging and reaction events.
- **MongoDB Models:**
  - `User`: Auth, profile, online status.
  - `Message`: Text, image, sender, receiver/group, reactions.
  - `Group`: Name, members, admins.
- **Authentication:** JWT, HTTP-only cookies, protected routes.
- **File Uploads:** Cloudinary for image attachments.

---

## 💡 UI/UX Details & Features

- **WhatsApp-Style Reactions:**
  - Horizontal emoji bar below each message, always visible if reactions exist, appears on hover otherwise.
  - Tooltip shows who reacted.
  - Add/remove your reaction with a click.
  - Reaction bar and picker are never cut off, always visible for both left and right aligned messages.
- **Message Bubbles:**
  - Sent: Primary color, right-aligned. Received: Neutral color, left-aligned.
  - Subtle shadow, rounded corners, timestamp inside bubble.
- **Sidebar:**
  - Online status, unread badges, last message preview, active chat highlight.
- **Group Management:**
  - Create groups, add/remove members (admin only), view members modal.
- **Image Attachments:**
  - Preview before sending, view in chat.
- **Mobile Responsive:**
  - Fully responsive layout, touch-friendly UI.
- **Accessibility:**
  - Keyboard navigation, focus states, ARIA labels where appropriate.
- **Optimistic UI:**
  - Messages and reactions appear instantly, even before backend confirmation.
- **Robust Error Handling:**
  - User-friendly toasts, suppressed 404s, and defensive checks for all async actions.

---

## 🧑‍💻 Contributing

1. Fork the repo and create your branch.
2. Make your changes and add tests if needed.
3. Submit a pull request with a clear description.

---

## 🚢 Deployment

- **Backend:** Deploy to services like Heroku, Render, or DigitalOcean. Set environment variables securely.
- **Frontend:** Deploy to Vercel, Netlify, or your preferred static host. Set VITE_API_URL to your backend API.
- **Cloudinary:** Ensure your Cloudinary credentials are set in production.
- **CORS:** Update backend CORS config to allow your frontend domain.

---

## 🛠️ Troubleshooting & FAQ

- **Q: Messages or reactions not updating in real-time?**
  - A: Ensure both backend and frontend are running, and sockets are connected. Restart the backend after any socket-related code changes.
- **Q: Seeing 404 errors or "Message not found" toasts?**
  - A: The app now suppresses 404 toasts and never removes messages from state on reaction errors. If you see persistent issues, clear your local state and refresh.
- **Q: Optimistic UI not syncing with backend?**
  - A: Check your API and socket logs. The app uses robust syncing, but network issues may cause temporary mismatches.
- **Q: How to add analytics or logging?**
  - A: Integrate tools like LogRocket, Sentry, or Google Analytics in the frontend, and use Winston or Morgan in the backend.
- **Q: How to enable mobile PWA support?**
  - A: The UI is mobile-friendly. For full PWA, add a manifest and service worker in the frontend.

---

## 📚 Further Reading & Resources

- [MERN Stack Docs](https://www.mongodb.com/mern-stack)
- [Socket.io Docs](https://socket.io/docs/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Cloudinary](https://cloudinary.com/)

---

## 📣 Credits

- Built by [Your Name] and contributors.
- Inspired by WhatsApp, Discord, and other modern chat apps.

---

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.
