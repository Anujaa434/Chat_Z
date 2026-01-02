# 🎨 Frontend Detailed Documentation
## AI Multi-Agent Chat Platform - Complete Frontend Guide

---

## 📋 Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Entry Points & Configuration](#entry-points--configuration)
3. [Routing & Navigation](#routing--navigation)
4. [State Management (Contexts)](#state-management-contexts)
5. [API Layer (Complete API Documentation)](#api-layer)
6. [Components (All UI Components Explained)](#components)
7. [Pages (Full Page Components)](#pages)
8. [Utilities & Helpers](#utilities--helpers)
9. [Styling Architecture](#styling-architecture)
10. [Data Flow Diagrams](#data-flow-diagrams)
11. [Best Practices & Patterns](#best-practices--patterns)

---

## 📂 Project Structure Overview

```
frontend/
├── index.html                 # HTML entry point (React mounts here)
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite bundler configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint code quality rules
│
├── public/                   # Static assets (served as-is)
│   └── (images, fonts, etc.)
│
└── src/                      # All source code
    ├── main.jsx              # React entry point (ReactDOM.render)
    ├── App.jsx               # Main app component (routing)
    │
    ├── api/                  # API communication layer
    │   ├── axios.js          # Axios instance with interceptors
    │   ├── auth.axios.js     # Authentication API functions
    │   ├── chat.js           # Chat API functions
    │   └── notes.js          # Notes API functions
    │
    ├── assets/               # Images, icons, media files
    │
    ├── components/           # Reusable UI components
    │   ├── ProtectedRoute.jsx    # Route guard component
    │   ├── StatusCard.tsx        # Status display component
    │   │
    │   ├── chat/                 # Chat-related components
    │   │   ├── ChatHeader.jsx
    │   │   ├── ChatInput.jsx
    │   │   ├── ChatPanel.jsx
    │   │   └── ...
    │   │
    │   ├── dashboard/            # Dashboard components
    │   │   ├── Dashboard.jsx     # Main dashboard (state hub)
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ...
    │   │
    │   ├── notes/                # Note-taking components
    │   │   ├── NotesPanel.jsx
    │   │   ├── NotesListPanel.jsx
    │   │   └── ...
    │   │
    │   └── ui/                   # Shared UI components
    │       ├── lamp.jsx          # Animated lamp effect
    │       ├── DottedGlowBackground.jsx
    │       └── AiLogoStrip.jsx
    │
    ├── contexts/             # React Context providers
    │   └── AuthContext.jsx   # Global authentication state
    │
    ├── hooks/                # Custom React hooks
    │   ├── useChats.js       # Chat state management
    │   ├── useNotes.js       # Notes state management
    │   ├── useFolders.js     # Folders state management
    │   └── useUIState.js     # UI state management
    │
    ├── layouts/              # Layout components (wrappers)
    │
    ├── lib/                  # Utility libraries
    │   └── utils.js          # General utility functions
    │
    ├── pages/                # Full page components
    │   └── auth/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── ForgotPassword.jsx
    │       ├── ResetPassword.jsx
    │       └── VerifyEmail.jsx
    │
    ├── services/             # Service layer (business logic)
    │   └── geminiApi.js      # Direct Gemini API calls
    │
    ├── styles/               # CSS stylesheets
    │   ├── global.css        # Base styles
    │   ├── auth.css          # Authentication pages
    │   ├── dashboard.css     # Dashboard layout
    │   ├── dashboard-chat.css
    │   ├── dashboard-notes.css
    │   └── ...
    │
    └── utils/                # Helper functions
        └── noteHelpers.js    # Note content parsing utilities
```

---

## 🚀 Entry Points & Configuration

### 1. **index.html** - HTML Entry Point

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ChatZ - AI Multi-Agent Platform</title>
  </head>
  <body>
    <!-- React app mounts here -->
    <div id="root"></div>
    
    <!-- Vite injects the bundled JavaScript here -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Purpose:**
- Provides HTML shell for React app
- Defines `#root` div where React renders
- Vite automatically injects bundled JS/CSS during build

**Why needed:** Every React SPA needs an HTML entry point.

---

### 2. **main.jsx** - React Entry Point

**File:** `frontend/src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**What each part does:**

1. **ReactDOM.createRoot()**: Modern React 18 API for rendering
   - Enables concurrent features
   - Better performance than legacy `ReactDOM.render()`

2. **React.StrictMode**: Development helper
   - Highlights potential problems
   - Runs effects twice to catch bugs
   - Only active in development (removed in production build)

3. **BrowserRouter**: Client-side routing
   - Enables SPA navigation without page reloads
   - Manages browser history (back/forward buttons)
   - Uses HTML5 History API

4. **AuthProvider**: Global authentication state
   - Wraps entire app so all components can access auth
   - Provides `useAuth()` hook to any child component

5. **App**: Main application component (contains all routes)

**Why needed:** Bootstrap point that sets up React, routing, and global state.

---

### 3. **vite.config.js** - Build Configuration

**File:** `frontend/vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**What it configures:**

1. **plugins: [react()]**: Enables React Fast Refresh
   - Hot module replacement (HMR) during development
   - Instant updates without losing component state

2. **alias: "@" → "./src"**: Import path shortcut
   - Instead of: `import Something from "../../../components/Something"`
   - Use: `import Something from "@/components/Something"`
   - Cleaner imports, easier to refactor

**Why needed:** Vite is the build tool that bundles your app, this file configures it.

---

### 4. **tailwind.config.js** - CSS Framework

**File:** `frontend/tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**What it configures:**

1. **content**: Files to scan for Tailwind classes
   - Tailwind removes unused CSS from production build
   - Only includes classes you actually use

2. **theme.extend**: Custom design tokens
   - Add custom colors, spacing, fonts
   - Extend default Tailwind theme

**Why needed:** Tailwind generates utility classes based on this config.

---

### 5. **package.json** - Dependencies & Scripts

**File:** `frontend/package.json`

```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite",                  // Start dev server (http://localhost:5173)
    "build": "tsc -b && vite build", // Production build
    "lint": "eslint .",             // Check code quality
    "preview": "vite preview"       // Preview production build locally
  },
  "dependencies": {
    "react": "^19.2.0",             // UI library
    "react-dom": "^19.2.0",         // React DOM renderer
    "react-router-dom": "^7.9.6",   // Client-side routing
    "axios": "^1.13.2",             // HTTP client
    "framer-motion": "^12.23.24",   // Animations
    "lucide-react": "^0.554.0",     // Icon library
    "clsx": "^2.1.1",               // Conditional classNames
    "tailwind-merge": "^3.4.0"      // Merge Tailwind classes
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.0", // Vite React plugin
    "vite": "^7.2.2",                  // Build tool
    "tailwindcss": "^4.1.17",          // CSS framework
    "eslint": "^9.39.1",               // Code linter
    "typescript": "~5.9.3"             // Type checking
  }
}
```

**Key Dependencies Explained:**

- **react**: Core library for building UI components
- **react-dom**: Renders React components to actual DOM
- **react-router-dom**: SPA routing (no page reloads)
- **axios**: Makes HTTP requests to backend API
- **framer-motion**: Smooth animations (page transitions, modals)
- **lucide-react**: Beautiful icon set (search, trash, pin icons)
- **tailwind-merge**: Resolves conflicting Tailwind classes

**Why needed:** Defines all libraries the app uses and how to run it.

---

## 🛤️ Routing & Navigation

### **App.jsx** - Main Router

**File:** `frontend/src/App.jsx`

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

function App() {
  const { token, loading } = useAuth();

  // Show loading state while verifying authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#020617',
        color: '#e5e7eb',
        fontSize: '14px'
      }}>
        Verifying authentication...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* PROTECTED ROUTE - Dashboard requires authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Password reset and verification routes (public) */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Default route - redirect based on auth status */}
      <Route
        path="/"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all for unknown routes */}
      <Route
        path="*"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
```

**Route Protection Strategy:**

1. **PublicRoute**: For login/signup pages
   - If user is authenticated, redirect to `/dashboard`
   - Prevents logged-in users from seeing login page

2. **ProtectedRoute**: For dashboard
   - If user is NOT authenticated, redirect to `/login`
   - Enforces authentication before accessing app

3. **Loading State**: Shows spinner while checking auth
   - Prevents flash of wrong page
   - Validates token on app startup

**Why needed:** Defines all pages/routes and enforces authentication rules.

---

### **ProtectedRoute.jsx** - Route Guard Component

**File:** `frontend/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  // While authentication is being verified, show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#020617',
        color: '#e5e7eb',
        fontSize: '14px'
      }}>
        Verifying authentication...
      </div>
    );
  }

  // No token = No access
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
}

/**
 * PublicRoute - Only accessible when NOT authenticated
 * Redirects to dashboard if user is already logged in
 */
export function PublicRoute({ children }) {
  const { token, loading } = useAuth();

  // While authentication is being verified, show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#020617',
        color: '#e5e7eb',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  // Already authenticated, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated, show the public page (login/signup)
  return children;
}
```

**How it works:**

1. **Check loading state**: Wait for auth verification
2. **Check token**: If no token, user is not logged in
3. **Redirect or render**: 
   - No token → Redirect to login
   - Has token → Render protected content

**Why needed:** Centralizes route protection logic, prevents code duplication.

---

## 🔐 State Management (Contexts)

### **AuthContext.jsx** - Global Authentication State

**File:** `frontend/src/contexts/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, getProfile } from "../api/auth.axios";
import { setAuthToken } from "../api/axios";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  setToken: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          // Validate token by fetching user profile
          const data = await getProfile();
          if (data?.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Invalid response - clear everything
            console.warn("Invalid token - forcing logout");
            localStorage.removeItem("token");
            setAuthToken(null);
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          // Token validation failed - clear everything
          console.error("Token validation failed:", err);
          localStorage.removeItem("token");
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync token with localStorage and axios
  useEffect(() => {
    if (token && !loading) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else if (!token && !loading) {
      localStorage.removeItem("token");
      setAuthToken(null);
      setUser(null);
    }
  }, [token, loading]);

  async function login(email, password) {
    const data = await apiLogin({ email, password });
    if (data?.token) {
      setToken(data.token);
      if (data.user) setUser(data.user);
      return data;
    }
    throw new Error(data?.message || "Login failed");
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() hook - convenient consumer
 */
export function useAuth() {
  return useContext(AuthContext);
}
```

**Key Features:**

1. **Persistent Login**: Token stored in localStorage
   - Survives page refresh
   - Auto-login on app restart

2. **Token Validation**: Checks token on startup
   - Calls `/api/auth/profile` to verify token is valid
   - Clears invalid tokens automatically

3. **Axios Integration**: Sets auth header automatically
   - Every API request includes `Authorization: Bearer <token>`

4. **Global State**: All components can access auth
   - Use `const { user, token, login, logout } = useAuth()`

**State Flow:**

```
App Starts
   ↓
Check localStorage for token
   ↓
If token exists:
   ├─ Set axios auth header
   ├─ Call GET /api/auth/profile
   ├─ If valid: Set user + token
   └─ If invalid: Clear token
   ↓
Set loading = false
   ↓
App renders
```

**Why needed:** 
- Centralizes authentication logic
- Prevents prop drilling (passing user down through components)
- Ensures consistent auth state across app

---

## 🌐 API Layer

### 1. **axios.js** - Base Axios Instance

**File:** `frontend/src/api/axios.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// Request interceptor - automatically attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
```

**What it does:**

1. **Creates axios instance**: Configured for your backend
   - baseURL: Points to backend API (http://localhost:4000)
   - headers: Default JSON content type

2. **setAuthToken()**: Updates auth header
   - Called when user logs in/out
   - Adds `Authorization: Bearer <token>` to all requests

3. **Request Interceptor**: Auto-attaches token
   - Runs before every request
   - Grabs token from localStorage
   - Adds to request headers
   - **Benefit**: You never have to manually add auth headers

**Why needed:** 
- Centralized API configuration
- Automatic auth header injection
- Single place to change API URL

---

### 2. **auth.axios.js** - Authentication API

**File:** `frontend/src/api/auth.axios.js`

```javascript
import api, { setAuthToken } from "./axios";

export async function signup(payload) {
  const res = await api.post("/api/auth/signup", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/api/auth/profile");
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post("/api/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token, password) {
  const res = await api.post("/api/auth/reset-password", { token, password });
  return res.data;
}

export async function verifyEmail(token) {
  const res = await api.get(`/api/auth/verify-email?token=${token}`);
  return res.data;
}

export { setAuthToken };

export default {
  signup,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
```

**API Functions Explained:**

1. **signup({ name, email, password })**: Create new account
   - Backend validates password strength
   - Returns JWT token + user object
   - Auto-login after signup

2. **login({ email, password })**: Authenticate user
   - Backend verifies credentials
   - Returns JWT token + user object
   - Token valid for 7 days

3. **logout()**: End session
   - Clears token from localStorage
   - Removes auth header

4. **getProfile()**: Get current user info
   - Validates token is still valid
   - Returns user object { id, name, email }
   - Used on app startup to verify auth

5. **forgotPassword(email)**: Request password reset
   - Sends reset link to email
   - Backend generates reset token

6. **resetPassword(token, password)**: Complete password reset
   - Uses token from email link
   - Updates user password

7. **verifyEmail(token)**: Confirm email address
   - Uses token from verification email
   - Marks account as verified

**Why needed:** Encapsulates all auth API calls, keeps components clean.

---

### 3. **chat.js** - Chat & Messages API

**File:** `frontend/src/api/chat.js`

```javascript
import api, { setAuthToken } from "./axios";

export function initChatApiAuth() {
  const token = localStorage.getItem("token");
  setAuthToken(token || null);
}

export async function fetchChats() {
  const { data } = await api.get("/api/chats");
  return data;
}

export async function createChat(title = "New Chat") {
  const { data } = await api.post("/api/chats", { title });
  return data;
}

export async function fetchMessages(chatId) {
  const { data } = await api.get(`/api/chats/${chatId}/messages`);
  return data;
}

export async function sendMessage({ chatId, message, model }) {
  const { data } = await api.post("/api/chats/send", { chatId, message, model });
  return data;
}

export async function renameChat(chatId, title) {
  const { data } = await api.put(`/api/chats/${chatId}`, { title });
  return data;
}

export async function deleteChat(chatId) {
  const { data } = await api.delete(`/api/chats/${chatId}`);
  return data;
}

export async function togglePinChat(chatId, pinned) {
  const { data } = await api.patch(`/api/chats/${chatId}/pin`, { pinned });
  return data;
}

export async function deleteMessage(chatId, messageId) {
  const { data } = await api.delete(`/api/chats/${chatId}/messages/${messageId}`);
  return data;
}

export async function togglePinMessage(chatId, messageId, pinned) {
  const { data } = await api.patch(`/api/chats/${chatId}/messages/${messageId}/pin`, { pinned });
  return data;
}
```

**API Functions Explained:**

1. **fetchChats()**: Get all user's chats
   - Returns array of chat objects
   - Sorted by pinned status, then most recent

2. **createChat(title)**: Create new chat
   - **Note**: Backend prevents empty chats
   - Chats are created automatically when sending first message

3. **fetchMessages(chatId)**: Get chat history
   - Returns array of message objects
   - Includes user messages and AI responses

4. **sendMessage({ chatId, message, model })**: Send message to AI
   - chatId: Which chat (null creates new chat)
   - message: User's text
   - model: Which AI to use ("gemini", "groq", etc.)
   - Returns AI response

5. **renameChat(chatId, title)**: Update chat title
   - User can manually rename any chat
   - Marks as manually titled (won't be auto-renamed)

6. **deleteChat(chatId)**: Soft delete chat
   - Doesn't actually remove from database
   - Sets is_deleted = 1 (preserves data)

7. **togglePinChat(chatId, pinned)**: Pin/unpin chat
   - Pinned chats appear at top of sidebar

8. **deleteMessage(chatId, messageId)**: Remove message
   - Soft delete (is_deleted = 1)

9. **togglePinMessage(chatId, messageId, pinned)**: Pin important message
   - Pinned messages highlighted in chat

**Why needed:** All chat-related API calls in one place.

---

### 4. **notes.js** - Notes & Folders API

**File:** `frontend/src/api/notes.js`

```javascript
import api, { setAuthToken } from "./axios";

export function initNotesApiAuth() {
  const token = localStorage.getItem("token");
  setAuthToken(token || null);
}

// Notes API
export async function fetchNotes() {
  const { data } = await api.get("/api/notes");
  return data;
}

export async function fetchNoteById(noteId) {
  const { data } = await api.get(`/api/notes/${noteId}`);
  return data;
}

export async function findNoteByChatAndTitle(chatId, title) {
  try {
    const { data } = await api.get(`/api/notes/find/by-chat`, {
      params: { chatId, title }
    });
    return data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createNote({ 
  title = "Untitled Note", 
  content = "", 
  folderId = null, 
  color = "#5227FF", 
  chatId = null, 
  messageId = null 
}) {
  const { data } = await api.post("/api/notes", { 
    title, content, folderId, color, chatId, messageId 
  });
  return data;
}

export async function updateNote(noteId, { 
  title, content, folderId, color, chatId = null, messageId = null 
}) {
  const { data } = await api.put(`/api/notes/${noteId}`, { 
    title, content, folderId, color, chatId, messageId 
  });
  return data;
}

export async function deleteNote(noteId) {
  const { data } = await api.delete(`/api/notes/${noteId}`);
  return data;
}

export async function togglePinNote(noteId, pinned) {
  const { data } = await api.patch(`/api/notes/${noteId}/pin`, { pinned });
  return data;
}

// Folders API
export async function fetchFolders() {
  const { data } = await api.get("/api/notes/folders/list/all");
  return data;
}

export async function createFolder({ name = "New Folder", color = "#5227FF" }) {
  const { data } = await api.post("/api/notes/folders", { name, color });
  return data;
}

export async function updateFolder(folderId, { name, color }) {
  const { data } = await api.put(`/api/notes/folders/${folderId}`, { name, color });
  return data;
}

export async function deleteFolder(folderId) {
  const { data } = await api.delete(`/api/notes/folders/${folderId}`);
  return data;
}

export async function togglePinFolder(folderId, pinned) {
  const { data } = await api.patch(`/api/notes/folders/${folderId}/pin`, { pinned });
  return data;
}
```

**Notes API Functions:**

1. **fetchNotes()**: Get all user's notes
   - Returns array of note objects
   - Includes metadata (can_show_in_chat)

2. **findNoteByChatAndTitle(chatId, title)**: Check if note exists
   - Prevents duplicate notes when saving from chat
   - Returns existing note or null

3. **createNote()**: Create new note
   - title: Note title
   - content: Note body text
   - folderId: Which folder (null = no folder)
   - color: Visual color code
   - chatId: Source chat (if saved from chat)
   - messageId: Source message (if saved from message)

4. **updateNote()**: Edit existing note
   - Can change title, content, folder, color
   - Preserves chat/message links

5. **deleteNote()**: Remove note (soft delete)

6. **togglePinNote()**: Pin/unpin note

**Folders API Functions:**

1. **fetchFolders()**: Get all user's folders

2. **createFolder()**: New folder with name + color

3. **updateFolder()**: Change folder name/color

4. **deleteFolder()**: Remove folder (notes become unfiled)

5. **togglePinFolder()**: Pin/unpin folder

**Why needed:** All note-taking functionality in one place.

---

### 5. **geminiApi.js** - Direct Gemini Service

**File:** `frontend/src/services/geminiApi.js`

```javascript
import axios from "axios";

const API_BASE = "http://localhost:4000/api";

export async function sendMessageToGemini(message, token) {
  const res = await axios.post(
    `${API_BASE}/gemini/chat`,
    { message },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.reply;
}
```

**What it does:**
- Direct call to Gemini endpoint (bypasses chat flow)
- Useful for testing Gemini integration
- Returns AI response directly

**Difference from chat.js sendMessage():**
- chat.js: Full flow (save user message → AI response → save AI message → return)
- geminiApi.js: Simple flow (send message → return AI response)

**Why needed:** Alternative API for direct Gemini testing.

---

## 🧩 Components

### 1. **Dashboard.jsx** - Main Application Hub

**File:** `frontend/src/components/dashboard/Dashboard.jsx`

**Purpose:** Central orchestration component that manages all app state and UI.

**State Management:**

```javascript
// Chat state
const [chats, setChats] = useState([]);              // All chat threads
const [messages, setMessages] = useState({});        // Messages by chatId
const [activeChat, setActiveChat] = useState(null);  // Currently open chat
const [model, setModel] = useState("gemini");        // Selected AI model

// Notes state
const [notes, setNotes] = useState([]);              // All notes
const [folders, setFolders] = useState([]);          // Note folders
const [activeNote, setActiveNote] = useState(null);  // Currently open note

// UI state
const [currentView, setCurrentView] = useState("chat"); // "chat" or "notes"
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const [messageInput, setMessageInput] = useState("");
const [isAiTyping, setIsAiTyping] = useState(false);
```

**Key Functions:**

```javascript
// Fetch data on component mount
useEffect(() => {
  loadChats();
  loadNotes();
  loadFolders();
}, []);

// Load chats from API
async function loadChats() {
  const data = await fetchChats();
  setChats(data);
}

// Send message to AI
async function handleSendMessage(e) {
  e.preventDefault();
  if (!messageInput.trim()) return;
  
  setIsAiTyping(true);
  
  try {
    const response = await sendMessage({
      chatId: activeChat?.id,
      message: messageInput,
      model: model
    });
    
    // Update local state with new message
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [
        ...(prev[activeChat.id] || []),
        { role: 'user', content: messageInput },
        { role: 'assistant', content: response.reply }
      ]
    }));
    
    setMessageInput("");
  } catch (err) {
    console.error("Send message failed:", err);
  } finally {
    setIsAiTyping(false);
  }
}

// Create new note
async function handleCreateNote() {
  const newNote = await createNote({
    title: "Untitled Note",
    content: "",
    folderId: null,
    color: "#5227FF"
  });
  
  setNotes(prev => [newNote, ...prev]);
  setActiveNote(newNote);
}

// Switch between chat and notes view
function switchView(view) {
  setCurrentView(view);
}
```

**Component Structure:**

```jsx
<div className="dashboard">
  <Header 
    user={user}
    onLogout={logout}
    currentView={currentView}
    onViewChange={switchView}
  />
  
  <div className="dashboard-body">
    <Sidebar
      chats={chats}
      notes={notes}
      folders={folders}
      currentView={currentView}
      activeChat={activeChat}
      activeNote={activeNote}
      onChatSelect={setActiveChat}
      onNoteSelect={setActiveNote}
      onCreateChat={handleCreateChat}
      onCreateNote={handleCreateNote}
    />
    
    {currentView === "chat" ? (
      <ChatPanel
        activeChat={activeChat}
        messages={messages[activeChat?.id] || []}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={handleSendMessage}
        isAiTyping={isAiTyping}
        model={model}
        setModel={setModel}
      />
    ) : (
      <NotesPanel
        activeNote={activeNote}
        onUpdateNote={handleUpdateNote}
        folders={folders}
      />
    )}
  </div>
</div>
```

**Why needed:** 
- Single source of truth for app state
- Coordinates all user interactions
- Manages data flow between components

---

### 2. **ChatPanel.jsx** - Chat Conversation Display

**File:** `frontend/src/components/chat/ChatPanel.jsx`

**Purpose:** Renders the active chat conversation with messages.

**Key Features:**

1. **Message Rendering**: Displays user and AI messages
```jsx
{messages.map((msg, idx) => (
  <div key={idx} className={`message ${msg.role}`}>
    <div className="message-avatar">
      {msg.role === 'user' ? '👤' : '🤖'}
    </div>
    <div className="message-content">
      {msg.content}
    </div>
    <div className="message-actions">
      <button onClick={() => handlePinMessage(msg.id)}>
        📌
      </button>
      <button onClick={() => handleSaveAsNote(msg)}>
        📝 Save as Note
      </button>
    </div>
  </div>
))}
```

2. **Auto-scroll**: Scrolls to newest message
```jsx
const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

return (
  <div className="chat-messages">
    {/* messages... */}
    <div ref={messagesEndRef} />
  </div>
);
```

3. **AI Typing Indicator**: Shows when AI is thinking
```jsx
{isAiTyping && (
  <div className="ai-typing">
    <span>●</span>
    <span>●</span>
    <span>●</span>
  </div>
)}
```

**Why needed:** Visual display of chat conversation.

---

### 3. **ChatInput.jsx** - Message Input Field

**File:** `frontend/src/components/chat/ChatInput.jsx`

```jsx
const ChatInput = ({
  handleSendMessage,
  messageInputRef,
  messageInput,
  setMessageInput,
  handleInputKeyDown,
  model,
  setModel,
}) => {
  return (
    <form className="chat-input-row" onSubmit={handleSendMessage}>
      <div className="chat-input-inner">
        {/* Model selector dropdown */}
        <select
          className="model-select-compact"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          title="Select AI Model"
        >
          <option value="gpt-5.1">ChatGPT 5.1</option>
          <option value="gpt-4o">ChatGPT 4.0</option>
          <option value="gemini">Gemini</option>
          <option value="groq">Groq</option>
          <option value="claude">Claude</option>
        </select>
        
        {/* Message textarea */}
        <textarea
          ref={messageInputRef}
          className="chat-input"
          placeholder="Type your message…"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={1}
        />
        
        {/* Send button */}
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!messageInput.trim()}
        >
          ➤
        </button>
      </div>
    </form>
  );
};
```

**Features:**

1. **Multi-line textarea**: Grows with content
2. **Keyboard shortcuts**: Enter to send, Shift+Enter for newline
3. **Model selector**: Choose which AI to use
4. **Disabled state**: Can't send empty messages

**Why needed:** Primary user input for chat messages.

---

### 4. **Sidebar.jsx** - Navigation Panel

**File:** `frontend/src/components/dashboard/Sidebar.jsx`

**Purpose:** Lists all chats or notes, allows switching between them.

**Features:**

1. **View Toggle**: Switch between chat and notes
```jsx
<div className="sidebar-header">
  <button 
    className={currentView === 'chat' ? 'active' : ''}
    onClick={() => onViewChange('chat')}
  >
    💬 Chats
  </button>
  <button 
    className={currentView === 'notes' ? 'active' : ''}
    onClick={() => onViewChange('notes')}
  >
    📝 Notes
  </button>
</div>
```

2. **Chat List**: Sorted by pinned, then recent
```jsx
{chats
  .sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return new Date(b.updated_at) - new Date(a.updated_at);
  })
  .map(chat => (
    <div 
      key={chat.id}
      className={`sidebar-item ${activeChat?.id === chat.id ? 'active' : ''}`}
      onClick={() => onChatSelect(chat)}
    >
      {chat.pinned && <span className="pin-icon">📌</span>}
      <span className="chat-title">{chat.title}</span>
      <button onClick={() => handleDeleteChat(chat.id)}>🗑️</button>
    </div>
  ))
}
```

3. **Search/Filter**: Find specific chats
```jsx
const [searchQuery, setSearchQuery] = useState("");

const filteredChats = chats.filter(chat =>
  chat.title.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Why needed:** Main navigation for app, allows quick switching between chats/notes.

---

### 5. **NotesPanel.jsx** - Note Editor

**File:** `frontend/src/components/notes/NotesPanel.jsx`

**Purpose:** Rich text editor for creating/editing notes.

**Features:**

1. **Title Input**: Editable note title
```jsx
<input
  type="text"
  className="note-title-input"
  value={activeNote?.title || ""}
  onChange={(e) => handleUpdateTitle(e.target.value)}
  placeholder="Untitled Note"
/>
```

2. **Content Editor**: Multi-line textarea
```jsx
<textarea
  className="note-content-editor"
  value={activeNote?.content || ""}
  onChange={(e) => handleUpdateContent(e.target.value)}
  placeholder="Start typing..."
/>
```

3. **Folder Selector**: Organize note into folder
```jsx
<select
  value={activeNote?.folderId || ""}
  onChange={(e) => handleUpdateFolder(e.target.value)}
>
  <option value="">No Folder</option>
  {folders.map(folder => (
    <option key={folder.id} value={folder.id}>
      {folder.name}
    </option>
  ))}
</select>
```

4. **Color Picker**: Visual organization
```jsx
<div className="color-picker">
  {folderColors.map(color => (
    <button
      key={color}
      style={{ backgroundColor: color }}
      onClick={() => handleUpdateColor(color)}
    />
  ))}
</div>
```

5. **Auto-save**: Saves changes after typing stops
```jsx
useEffect(() => {
  const saveTimer = setTimeout(() => {
    if (activeNote && hasChanges) {
      updateNote(activeNote.id, {
        title: activeNote.title,
        content: activeNote.content,
        folderId: activeNote.folderId,
        color: activeNote.color
      });
    }
  }, 1000); // Save 1 second after typing stops

  return () => clearTimeout(saveTimer);
}, [activeNote]);
```

**Why needed:** Main interface for note-taking.

---

## 📄 Pages

### 1. **Login.jsx** - Login Page

**File:** `frontend/src/pages/auth/Login.jsx`

```jsx
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        
        {error && <p className="error">{error}</p>}
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        
        <div className="password-input">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <Link to="/signup">Don't have an account? Sign up</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </form>
    </div>
  );
}
```

**Features:**
- Email + password fields
- Show/hide password toggle
- Loading state during login
- Error messages
- Links to signup and password reset

**Why needed:** Entry point for existing users.

---

### 2. **Signup.jsx** - Registration Page

**File:** `frontend/src/pages/auth/Signup.jsx`

```jsx
export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pw) => {
    if (!pw) return "";
    const ok = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
    return ok
      ? ""
      : "Min 8 chars, include upper, lower, number, special";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    const pErr = validatePassword(password);
    if (pErr) {
      setError("Password does not meet requirements");
      return;
    }

    setBusy(true);
    try {
      const data = await signup({ name, email, password });

      if (data.token) {
        // Auto-login after signup
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        // Navigate to login
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit}>
        <h1>Sign Up</h1>
        
        {error && <p className="error">{error}</p>}
        
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(validatePassword(e.target.value));
          }}
          required
        />
        
        {passwordError && <p className="hint">{passwordError}</p>}
        
        <button type="submit" disabled={busy || passwordError}>
          {busy ? "Creating account..." : "Sign Up"}
        </button>
        
        <Link to="/login">Already have an account? Login</Link>
      </form>
    </div>
  );
}
```

**Features:**
- Name, email, password fields
- Real-time password validation
- Shows password requirements
- Auto-login after successful signup

**Why needed:** Allows new users to create accounts.

---

## 🛠️ Utilities & Helpers

### **noteHelpers.js** - Note Content Parsing

**File:** `frontend/src/utils/noteHelpers.js`

```javascript
/**
 * Build a preview text from content
 */
export function buildPreview(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= 90) return trimmed;
  return trimmed.slice(0, 90) + "…";
}

/**
 * Build note.content from its entries
 */
export function rebuildNoteContentFromEntries(entries) {
  if (!entries || !entries.length) return "";
  const parts = [];

  entries.forEach((e) => {
    if (e.isManual) {
      parts.push(`Note: ${e.userText}`);
    } else {
      const seg = [];
      if (e.messageId) seg.push(`ID: ${e.messageId}`);
      seg.push(`You: ${e.userText}`);
      if (e.aiText) seg.push(`AI: ${e.aiText}`);
      parts.push(seg.join("\n\n"));
    }
  });

  return parts.join("\n\n---\n\n");
}

/**
 * Parse note.content back into entries
 */
export function parseEntriesFromContent(content) {
  if (!content || !content.trim()) return [];

  const entries = [];
  const blocks = content.split("\n\n---\n\n");

  blocks.forEach((block, idx) => {
    block = block.trim();
    if (!block) return;

    if (block.startsWith("Note: ")) {
      // Manual note entry
      entries.push({
        id: Date.now() + idx,
        messageId: null,
        userText: block.replace(/^Note: /, ""),
        aiText: "",
        isManual: true,
      });
    } else if (block.includes("You: ") && block.includes("AI: ")) {
      // Chat entry with both user and AI
      const lines = block.split("\n\n");
      let userText = "";
      let aiText = "";
      let messageId = null;

      lines.forEach((line) => {
        if (line.startsWith("ID: ")) {
          messageId = parseInt(line.replace(/^ID: /, "").trim(), 10);
        } else if (line.startsWith("You: ")) {
          userText = line.replace(/^You: /, "");
        } else if (line.startsWith("AI: ")) {
          aiText = line.replace(/^AI: /, "");
        }
      });

      if (userText) {
        entries.push({
          id: Date.now() + idx,
          messageId,
          userText,
          aiText,
          isManual: false,
        });
      }
    }
  });

  return entries;
}
```

**Purpose:** 
- Formats note content for storage
- Parses stored content for display
- Preserves chat message links

**Why needed:** Notes can contain multiple entries (user notes + saved chat messages).

---

## 🎨 Styling Architecture

### CSS File Organization:

1. **global.css**: Base styles
   - CSS reset
   - CSS variables (colors, spacing)
   - Typography
   - Utility classes

2. **auth.css**: Authentication pages
   - Login/signup form styles
   - Animated backgrounds
   - Responsive layouts

3. **dashboard.css**: Main layout
   - Grid/flexbox structure
   - Sidebar positioning
   - Panel layouts

4. **dashboard-chat.css**: Chat-specific
   - Message bubbles
   - Avatar styles
   - Chat input

5. **dashboard-notes.css**: Notes-specific
   - Editor styles
   - Folder cards
   - Color picker

6. **dashboard-theme-soft-dark.css**: Dark theme
   - Color overrides
   - Dark mode specific styles

### CSS Variables (Design Tokens):

```css
:root {
  /* Colors */
  --primary-color: #5227FF;
  --bg-dark: #020617;
  --bg-card: #0f172a;
  --text-light: #e5e7eb;
  --text-muted: #94a3b8;
  --border-color: #1e293b;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
}
```

---

## 📊 Data Flow Diagrams

### **Chat Message Flow:**

```
User types message in ChatInput
         ↓
User clicks Send button
         ↓
Dashboard.handleSendMessage()
         ↓
API call: sendMessage({ chatId, message, model })
         ↓
Backend receives request
         ↓
Backend saves user message to database
         ↓
Backend calls AI service (Gemini/Groq)
         ↓
AI returns response
         ↓
Backend saves AI message to database
         ↓
Backend returns response to frontend
         ↓
Dashboard updates local state
         ↓
ChatPanel re-renders with new messages
         ↓
Auto-scroll to newest message
```

### **Note Creation Flow:**

```
User clicks "Save as Note" on chat message
         ↓
Dashboard.handleSaveAsNote(message)
         ↓
Open note creation modal
         ↓
Pre-fill content with message text
         ↓
User selects folder + color
         ↓
User clicks "Save"
         ↓
API call: createNote({ title, content, folderId, chatId, messageId })
         ↓
Backend saves note to database
         ↓
Backend returns new note
         ↓
Dashboard adds note to local state
         ↓
NotesPanel displays new note
```

### **Authentication Flow:**

```
User opens app
         ↓
main.jsx renders AuthProvider
         ↓
AuthProvider.initAuth()
         ↓
Check localStorage for token
         ↓
If token exists:
├─ Set axios auth header
├─ Call GET /api/auth/profile
├─ If valid: Set user + token
└─ If invalid: Clear token
         ↓
Set loading = false
         ↓
App.jsx renders based on auth state
         ↓
If authenticated: Show Dashboard
If not: Show Login
```

---

## ✅ Best Practices & Patterns

### 1. **Component Composition**

Break down complex UIs into smaller components:

```jsx
// ❌ Bad: Everything in one component
function Dashboard() {
  return (
    <div>
      {/* 1000 lines of JSX... */}
    </div>
  );
}

// ✅ Good: Composed of smaller components
function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <Sidebar />
      <MainPanel />
    </div>
  );
}
```

### 2. **State Management**

Keep state close to where it's used:

```jsx
// ❌ Bad: All state at top level
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pass down through many components...
}

// ✅ Good: State in component that uses it
function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  // Use directly here
}
```

### 3. **API Error Handling**

Always handle errors gracefully:

```jsx
// ❌ Bad: No error handling
async function loadChats() {
  const data = await fetchChats();
  setChats(data);
}

// ✅ Good: Proper error handling
async function loadChats() {
  try {
    const data = await fetchChats();
    setChats(data);
  } catch (err) {
    console.error("Failed to load chats:", err);
    showToast("Failed to load chats. Please try again.");
  }
}
```

### 4. **Avoid Prop Drilling**

Use Context for deeply nested data:

```jsx
// ❌ Bad: Passing through many levels
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <UserProfile user={user} />
    </Sidebar>
  </Dashboard>
</App>

// ✅ Good: Use Context
<AuthProvider>
  <App>
    <Dashboard>
      <Sidebar>
        <UserProfile />  {/* Gets user from useAuth() */}
      </Sidebar>
    </Dashboard>
  </App>
</AuthProvider>
```

### 5. **Conditional Rendering**

Handle loading and empty states:

```jsx
// ✅ Good: Show loading, empty, and data states
function ChatList({ chats, loading }) {
  if (loading) {
    return <div>Loading chats...</div>;
  }
  
  if (chats.length === 0) {
    return <div>No chats yet. Start a conversation!</div>;
  }
  
  return (
    <div>
      {chats.map(chat => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
```

### 6. **Cleanup in useEffect**

Always cleanup subscriptions/timers:

```jsx
// ✅ Good: Cleanup timeout
useEffect(() => {
  const timer = setTimeout(() => {
    saveNote();
  }, 1000);
  
  return () => clearTimeout(timer); // Cleanup
}, [noteContent]);
```

---

## 🎯 Summary

### Key Frontend Technologies:
- **React 19**: Modern UI library
- **Vite**: Fast build tool (HMR, optimized builds)
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Lucide React**: Icon library

### Architecture Patterns:
- **Component Composition**: Small, reusable components
- **Context API**: Global state (auth, theme)
- **Custom Hooks**: Reusable logic
- **API Layer**: Centralized API calls
- **Route Guards**: Protected/public routes

### State Management:
- **Local State**: Component-specific (useState)
- **Global State**: Auth context (useContext)
- **Server State**: API data (stored in component state)

### Performance Optimizations:
- **Code Splitting**: React.lazy() for routes
- **Memoization**: useMemo, useCallback for expensive calculations
- **Virtual Scrolling**: For long lists (react-window)
- **Debouncing**: For search inputs, auto-save

---

**This documentation covers every frontend file in detail with explanations of what each file does, why it's needed, and how it works together.**

**Created for MCA Semester 1 Project**  
**Last Updated:** December 23, 2025
