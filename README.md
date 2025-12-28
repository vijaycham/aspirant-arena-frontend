# Aspirant Arena - Frontend 🎨

The sleek, modern, and highly interactive frontend for **Aspirant Arena**. Built with React and Vite, it delivers a premium productivity experience with smooth animations and intuitive task management.

---

## 🏗 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Toasts**: [React Hot Toast](https://react-hot-toast.com/) & [React Toastify](https://fkhadra.github.io/react-toastify/)
- **HTTP Client**: [Axios](https://axios-http.com/) (Centralized instance in `src/utils/api.js`)
- **Routing**: [React Router v7](https://reactrouter.com/)

---

## 🪐 Key Features

- **Dynamic To-Do List**: Manage tasks with priority levels (Low/Medium/High) and due dates.
- **Premium UI**: Custom "Outfit" typography, glassmorphism effects, and vibrant gradient themes.
- **Vercel Optimized**: Integrated with `@vercel/speed-insights` for performance tracking.
- **Google OAuth**: One-tap sign-in integrated with Firebase and the custom backend.
- **Production-Ready Communication**: Centralized API utility with automatic response interceptors for clean data handling.

---

## 🚦 Getting Started

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:8888
   VITE_FIREBASE_API_KEY=your_key
   # ... other firebase vars
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

---

## 🛠 Git Workflow

We maintain a clean and scalable project structure using the **Feature Branch Workflow**:

1.  **main**: Protected production branch.
2.  **feature/x**: Dedicated branches for specific features (e.g., `feature/shimmer-ui`, `feature/notes`).
3.  **Process**:
    - Commit small, meaningful changes to your feature branch.
    - Merge into `main` after local verification.
    - Pull latest changes from `main` before starting new work.

---

## 📦 Project Structure

- `src/utils/api.js`: Centralized Axios instance for all v1 API calls.
- `src/pages/`: Contains all main view components (ToDo, Profile, Home, etc.).
- `src/redux/`: Global state management logic.
- `src/components/`: Reusable UI elements (Header, OAuth, etc.).
