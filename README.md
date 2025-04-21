# Talkstra - Real-Time Chat Application

Talkstra is a modern, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) that enables seamless communication between users. The application features a responsive design, real-time messaging, and user authentication.

## Features

- 🔐 User authentication and authorization
- 💬 Real-time messaging using Socket.IO
- 🎨 Modern UI with Tailwind CSS and DaisyUI
- 📱 Responsive design for all devices
- 🖼️ Image upload support with Cloudinary
- 🔒 Secure password handling with bcrypt
- 🎯 State management using Zustand

## Tech Stack

### Frontend

- React.js
- Vite
- Socket.IO Client
- Tailwind CSS
- DaisyUI
- Zustand for state management
- React Router DOM
- Axios for API calls
- React Hot Toast for notifications

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage
- Cookie Parser
- CORS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account (for image uploads)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/talkstra.git
cd talkstra
```

2. Install dependencies for both frontend and backend:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:

```env
PORT=your_port
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development servers:

For development:

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

For production:

```bash
npm run build
npm start
```

## Project Structure

```
talkstra/
├── frontend/           # React frontend
│   ├── src/           # Source files
│   ├── public/        # Public assets
│   └── dist/          # Production build
├── backend/           # Node.js backend
│   └── src/           # Source files
└── package.json       # Root package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- React.js team for the amazing frontend library
- Socket.IO team for real-time communication capabilities
- Tailwind CSS and DaisyUI for the beautiful UI components
