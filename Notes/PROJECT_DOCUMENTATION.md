# 📚 Complete Project Documentation
## AI Multi-Agent Chat Platform - MCA Semester 1

---

## 🎯 Project Overview

**Project Name:** AI Multi-Agent Chat Platform  
**Tech Stack:** MERN Stack (MySQL, Express, React, Node.js)  
**Purpose:** A full-stack web application that allows users to interact with multiple AI models (Gemini, Groq) through a chat interface, with integrated note-taking capabilities.

### Key Features:
- 🤖 Multi-AI chat (Google Gemini, Groq SDK)
- 💬 Real-time conversation management
- 📝 Integrated note-taking system with folders
- 🔐 JWT-based authentication
- 📌 Pin/unpin chats, messages, and notes
- 🎨 Color-coded organization system
- 🔄 Auto-title generation for chats
- 📧 Email verification & password reset

---

## 📂 Project Structure

```
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers (business logic)
│   │   ├── middlewares/       # Auth & validation middleware
│   │   ├── models/            # Database models (data layer)
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # External service integrations (AI APIs)
│   │   ├── utils/             # Helper functions (JWT, email, title generation)
│   │   ├── app.js             # Express app setup (TypeScript version)
│   │   └── server.js          # Server entry point (JavaScript version - ACTIVE)
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/               # API client functions (axios, fetch)
│   │   ├── components/        # React components (UI building blocks)
│   │   ├── contexts/          # React Context providers (global state)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Full page components
│   │   ├── services/          # Frontend service functions
│   │   ├── styles/            # CSS stylesheets
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx            # Main app component (routing)
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite build configuration
│
├── database/
│   └── schema.sql             # MySQL database schema
│
├── package.json               # Root package.json (shared dependencies)
└── README.md                  # Project overview
```

---

## 🗄️ Database Architecture

### Database: `chatz_db`

#### 1. **users** table
Stores user account information.
```sql
- id (BIGINT, PRIMARY KEY): Unique user identifier
- name (VARCHAR(100)): User's full name
- email (VARCHAR(255), UNIQUE): Login email
- password_hash (VARCHAR(255)): Bcrypt-hashed password
- is_verified (BOOLEAN): Email verification status
- email_verify_token (VARCHAR(255)): Token for email verification
- reset_password_token (VARCHAR(255)): Token for password reset
- created_at, updated_at (TIMESTAMP): Audit timestamps
```

**Why needed:** Foundation for user authentication, authorization, and personalized data access.

#### 2. **ai_models** table
Catalog of available AI models for chat.
```sql
- id (INT, PRIMARY KEY): Model identifier
- name (VARCHAR(100)): Display name (e.g., "Gemini Flash")
- provider (VARCHAR(50)): AI provider (e.g., "google", "groq")
- model_key (VARCHAR(100)): API model identifier
- is_active (TINYINT): Enable/disable model
- created_at (TIMESTAMP): When model was added
```

**Why needed:** Allows dynamic model selection and tracking which AI responded.

#### 3. **chats** table
Stores conversation threads.
```sql
- id (BIGINT, PRIMARY KEY): Chat identifier
- user_id (BIGINT, FOREIGN KEY): Owner of the chat
- title (VARCHAR(255)): Chat name/description
- pinned (TINYINT): Pin to top of sidebar
- is_deleted (TINYINT): Soft delete flag
- is_auto_title_generated (TINYINT): Track if title is AI-generated
- created_at, updated_at (TIMESTAMP): Audit timestamps
```

**Why needed:** Organizes conversations into separate threads for easy navigation.

#### 4. **messages** table
Stores individual messages within chats.
```sql
- id (BIGINT, PRIMARY KEY): Message identifier
- chat_id (BIGINT, FOREIGN KEY): Parent chat
- user_id (BIGINT, FOREIGN KEY): User who sent (NULL for AI)
- model_id (INT, FOREIGN KEY): AI model that responded
- role (ENUM: 'user', 'assistant', 'system'): Message sender type
- content (TEXT): Message text
- pinned (TINYINT): Pin important messages
- is_deleted (TINYINT): Soft delete flag
- created_at (TIMESTAMP): When message was sent
```

**Why needed:** Preserves conversation history and context for AI interactions.

#### 5. **note_folders** table
Organizes notes into categories.
```sql
- id (BIGINT, PRIMARY KEY): Folder identifier
- user_id (BIGINT, FOREIGN KEY): Folder owner
- name (VARCHAR(255)): Folder name
- color (VARCHAR(20)): Visual color code (e.g., "#5227FF")
- pinned (TINYINT): Pin to top
- is_deleted (TINYINT): Soft delete flag
- created_at, updated_at (TIMESTAMP): Audit timestamps
```

**Why needed:** Provides visual organization for notes similar to physical folders.

#### 6. **notes** table
Stores user notes (can be linked to chat messages).
```sql
- id (BIGINT, PRIMARY KEY): Note identifier
- user_id (BIGINT, FOREIGN KEY): Note owner
- note_folder_id (BIGINT, FOREIGN KEY): Parent folder (optional)
- message_id (BIGINT, FOREIGN KEY): Source chat message (optional)
- title (VARCHAR(255)): Note title
- content (TEXT): Note body
- pinned (TINYINT): Pin to top
- is_deleted (TINYINT): Soft delete flag
- created_at, updated_at (TIMESTAMP): Audit timestamps
```

**Why needed:** Allows users to save important information from chats or create standalone notes.

---

## 🔧 Backend Architecture

### Entry Point: `backend/src/server.js`

**Purpose:** Starts the Express server and configures middleware.

**Key Components:**
```javascript
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
```

**What it does:**
1. **CORS Configuration:** Allows frontend (localhost:5173/5174) to access API
2. **Express Middleware:** Parses JSON requests, logs HTTP activity
3. **Route Mounting:** Connects API endpoints to controllers
4. **Database Health Check:** `/api/status` endpoint verifies DB connection
5. **Server Start:** Listens on port 4000 (default)

**Why needed:** Central orchestration point for all backend operations.

---

### Configuration: `backend/src/config/db.js`

**Purpose:** MySQL database connection pool.

```javascript
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "chatz_db",
  connectionLimit: 10,
});
```

**Why needed:** 
- Manages database connections efficiently
- Connection pooling prevents resource exhaustion
- Supports async/await with promises
- Environment variables for secure configuration

---

### Controllers (Business Logic)

#### 1. **auth.controller.js**
Handles user authentication and account management.

**Functions:**
- `signup()`: Creates new user account
  - Validates strong password (8+ chars, uppercase, lowercase, number, special char)
  - Hashes password with bcrypt (10 rounds)
  - Returns JWT token for immediate login
  
- `login()`: Authenticates existing user
  - Verifies email exists
  - Compares password with stored hash
  - Returns JWT token + user profile
  
- `verifyEmail()`: Confirms user's email address
  - Uses email_verify_token from URL
  - Sets is_verified = true
  
- `forgotPassword()`: Initiates password reset
  - Generates reset token
  - Sends email with reset link
  
- `resetPassword()`: Completes password reset
  - Validates reset token
  - Updates password_hash

**Why needed:** Secure user authentication prevents unauthorized access.

---

#### 2. **chat.controller.js**
Manages chat sessions and message flow.

**Functions:**
- `getChats()`: Fetches all user's chat threads
  - Filters out soft-deleted chats
  - Sorts by pinned status, then recent activity
  
- `createChat()`: **Deprecated** - prevents empty chat creation
  - Chats are now created lazily when first message is sent
  
- `getMessages()`: Retrieves all messages in a chat
  - Includes user messages and AI responses
  - Preserves conversation order
  
- `sendMessage()`: **Core function** - handles user→AI→save flow
  ```javascript
  1. Validate message (non-empty)
  2. Create chat if doesn't exist (lazy creation)
  3. Save user message to database
  4. Call AI service (Gemini/Groq)
  5. Save AI response to database
  6. Auto-generate chat title (async, non-blocking)
  7. Return AI response to frontend
  ```
  
- `renameChat()`: Updates chat title
  - Marks is_auto_title_generated = 0 (manual override)
  
- `deleteChat()`: Soft deletes chat
  - Sets is_deleted = 1 (preserves data)
  
- `togglePinChat()`: Pins/unpins chat to top

**Why needed:** Orchestrates the entire chat workflow from user input to AI response.

---

#### 3. **gemini.controller.js**
Simple wrapper for Gemini AI API.

```javascript
exports.chatWithGemini = async (req, res) => {
  const { message } = req.body;
  const reply = await getGeminiResponse(message);
  res.json({ success: true, reply });
};
```

**Why needed:** Provides direct endpoint for testing Gemini integration.

---

#### 4. **note.controller.js**
Manages note creation, editing, and organization.

**Functions:**
- `getNotes()`: Fetches all user's notes
  - Includes folder associations
  - Returns metadata (can_show_in_chat flag)
  
- `getNoteById()`: Retrieves single note
  
- `findNoteByChatAndTitle()`: Prevents duplicate notes
  - Used when saving chat messages as notes
  
- `createNote()`: Creates new note
  - Can link to chat/message (chat_id, message_id)
  - Assigns to folder (optional)
  - Sets color for visual organization
  
- `updateNote()`: Modifies existing note
  - Title, content, folder, color
  - Validates title is not empty
  
- `deleteNote()`: Soft deletes note
  
- `togglePinNote()`: Pins/unpins note

**Why needed:** Allows users to capture important information from chats or create standalone notes.

---

### Models (Data Layer)

#### 1. **chat.model.js**
Database queries for chat operations.

**Key Functions:**
- `getUserChats()`: SELECT all user's chats (filtered, sorted)
- `getChatById()`: SELECT single chat by ID
- `createChat()`: INSERT new chat
- `renameChat()`: UPDATE chat title
- `updateAutoTitle()`: UPDATE auto-generated title (if not manually set)
- `deleteChat()`: UPDATE is_deleted = 1
- `togglePinChat()`: UPDATE pinned status

**Why needed:** Separates SQL queries from business logic (MVC pattern).

---

#### 2. **message.model.js**
Database queries for message operations.

**Key Functions:**
- `getMessagesByChat()`: SELECT all messages in a chat
- `createMessage()`: INSERT new message (user or AI)
- `deleteMessage()`: UPDATE is_deleted = 1
- `togglePinMessage()`: UPDATE pinned status

**Why needed:** Manages conversation history persistence.

---

#### 3. **note.model.js**
Database queries for note operations.

**Special Query:**
```sql
-- Determines if "Show in Chat" button should be enabled
SELECT n.*, 
  CASE 
    WHEN n.chat_id IS NOT NULL 
      AND n.message_id IS NOT NULL
      AND c.id IS NOT NULL 
      AND c.is_deleted = 0 
      AND m.id IS NOT NULL 
    THEN 1 
    ELSE 0 
  END AS can_show_in_chat
FROM notes n
LEFT JOIN chats c ON c.id = n.chat_id
LEFT JOIN messages m ON m.id = n.message_id
```

**Why needed:** Validates that source chat/message still exists before allowing navigation.

---

#### 4. **user.model.js**
Database queries for user operations.

**Why needed:** Manages user profile data (though mostly handled by auth controller).

---

#### 5. **folder.model.js**
Database queries for note folder operations.

**Key Functions:**
- `getFoldersByUserId()`: Get all user's folders
- `createFolder()`: Create new folder
- `updateFolder()`: Update folder name/color
- `deleteFolder()`: Soft delete folder
- `togglePinFolder()`: Pin/unpin folder

**Why needed:** Organizes notes into visual categories.

---

### Services (External APIs)

#### 1. **gemini.service.js**
Google Gemini AI integration.

**Purpose:** Communicates with Google's Gemini API to generate AI responses.

```javascript
async function getGeminiResponse(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
  });
  return response.text || "";
}
```

**Features:**
- Supports both old and new Gemini SDK versions
- Automatic fallback between SDK versions
- Error handling for API failures

**Why needed:** Provides intelligent, context-aware AI responses to user questions.

---

#### 2. **groq.service.js**
Groq SDK integration (alternative AI provider).

**Why needed:** Offers faster inference speeds as an alternative to Gemini.

---

#### 3. **ai.service.js**
Centralized AI routing service.

```javascript
async function handleAIResponse(model, message) {
  const normalized = normalizeModel(model);
  
  if (normalized === "gemini") {
    return await getGeminiResponse(message);
  } else if (normalized === "groq") {
    return await getGroqResponse(message);
  }
  
  return "⚠️ AI provider not available";
}
```

**Why needed:** 
- Single entry point for all AI providers
- Graceful fallback when providers fail
- Easy to add new AI models

---

### Utilities

#### 1. **jwt.js**
JSON Web Token management.

```javascript
const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
```

**Why needed:** 
- Stateless authentication (no server-side sessions)
- Secure token-based auth
- 7-day expiration for security

---

#### 2. **generateTitle.js**
Creates placeholder chat titles from first message.

```javascript
function generateTitleFromMessage(message) {
  const trimmed = message.trim();
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 40) + "...";
}
```

**Why needed:** Provides immediate title while AI generates better one.

---

#### 3. **generateAutoTitle.js**
Uses AI to generate meaningful chat titles.

```javascript
async function generateAutoTitle(messages, model) {
  // Takes first few messages from chat
  // Asks AI: "Generate a short 3-5 word title for this conversation"
  // Returns AI-generated title
}
```

**Why needed:** Creates descriptive titles that summarize chat content (better UX than "New Chat").

---

#### 4. **sendEmail.js**
Email service for verification/password reset.

```javascript
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
}
```

**Why needed:** Sends verification emails and password reset links securely.

---

### Middlewares

#### 1. **auth.middleware.js**
Protects routes requiring authentication.

```javascript
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user data to request
    next(); // Proceed to controller
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

**Why needed:** 
- Prevents unauthorized API access
- Automatically extracts user ID from token
- Adds `req.user` for controllers to use

---

### Routes (API Endpoints)

#### **auth.routes.js**
```
POST   /api/auth/signup           → auth.controller.signup
POST   /api/auth/login            → auth.controller.login
GET    /api/auth/verify-email     → auth.controller.verifyEmail
POST   /api/auth/forgot-password  → auth.controller.forgotPassword
POST   /api/auth/reset-password   → auth.controller.resetPassword
GET    /api/auth/profile          → auth.controller.getProfile (requireAuth)
```

#### **chat.routes.js**
```
GET    /api/chats                 → chat.controller.getChats (requireAuth)
POST   /api/chats                 → chat.controller.createChat (requireAuth)
GET    /api/chats/:chatId/messages → chat.controller.getMessages (requireAuth)
POST   /api/chats/send            → chat.controller.sendMessage (requireAuth)
PUT    /api/chats/:chatId/rename  → chat.controller.renameChat (requireAuth)
DELETE /api/chats/:chatId         → chat.controller.deleteChat (requireAuth)
PUT    /api/chats/:chatId/pin     → chat.controller.togglePinChat (requireAuth)
DELETE /api/messages/:messageId   → chat.controller.deleteMessage (requireAuth)
PUT    /api/messages/:messageId/pin → chat.controller.togglePinMessage (requireAuth)
```

#### **note.routes.js**
```
GET    /api/notes                 → note.controller.getNotes (requireAuth)
GET    /api/notes/:noteId         → note.controller.getNoteById (requireAuth)
POST   /api/notes                 → note.controller.createNote (requireAuth)
PUT    /api/notes/:noteId         → note.controller.updateNote (requireAuth)
DELETE /api/notes/:noteId         → note.controller.deleteNote (requireAuth)
PUT    /api/notes/:noteId/pin     → note.controller.togglePinNote (requireAuth)

GET    /api/folders               → folder.controller.getFolders (requireAuth)
POST   /api/folders               → folder.controller.createFolder (requireAuth)
PUT    /api/folders/:folderId     → folder.controller.updateFolder (requireAuth)
DELETE /api/folders/:folderId     → folder.controller.deleteFolder (requireAuth)
PUT    /api/folders/:folderId/pin → folder.controller.togglePinFolder (requireAuth)
```

#### **gemini.routes.js**
```
POST   /api/gemini/chat           → gemini.controller.chatWithGemini (requireAuth)
```

#### **health.route.js**
```
GET    /api/status                → Returns database health status
```

---

## 🎨 Frontend Architecture

### Entry Point: `frontend/src/main.jsx`

```jsx
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

**What it does:**
1. **ReactDOM:** Mounts React app to `#root` div
2. **BrowserRouter:** Enables client-side routing (SPA navigation)
3. **AuthProvider:** Wraps entire app with authentication context
4. **Global CSS:** Loads base styles

**Why needed:** Bootstrap point for entire React application.

---

### App Component: `frontend/src/App.jsx`

**Purpose:** Defines application routes and navigation logic.

```jsx
<Routes>
  {/* Public routes (redirect if authenticated) */}
  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
  <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
  
  {/* Protected routes (require authentication) */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
  {/* Utility routes */}
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
  
  {/* Redirect to login or dashboard based on auth */}
  <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
</Routes>
```

**Why needed:** 
- Implements route protection
- Prevents authenticated users from seeing login page
- Redirects unauthenticated users to login

---

### Context: `frontend/src/contexts/AuthContext.jsx`

**Purpose:** Global authentication state management.

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setAuthToken(storedToken);
      // Validate token by fetching user profile
      getProfile().then(data => {
        if (data?.user) {
          setUser(data.user);
          setToken(storedToken);
        }
      });
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await apiLogin({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Why needed:**
- Persists authentication across page refreshes (localStorage)
- Validates token on app startup
- Provides auth state to all components (no prop drilling)
- Centralized login/logout logic

---

### API Layer: `frontend/src/api/`

#### **axios.js**
Base axios instance with auth header injection.

```javascript
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/api",
});

export function setAuthToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
}

export default instance;
```

**Why needed:** 
- Automatic auth header on all requests
- Centralized API URL configuration
- DRY principle (don't repeat yourself)

---

#### **auth.axios.js**
Authentication API functions.

```javascript
export async function login({ email, password }) {
  const { data } = await axios.post("/auth/login", { email, password });
  return data;
}

export async function signup({ name, email, password }) {
  const { data } = await axios.post("/auth/signup", { name, email, password });
  return data;
}

export async function getProfile() {
  const { data } = await axios.get("/auth/profile");
  return data;
}
```

**Why needed:** Clean separation of API logic from components.

---

#### **chat.js**
Chat and message API functions.

```javascript
export async function fetchChats() {
  const { data } = await axios.get("/chats");
  return data;
}

export async function sendMessage({ chatId, message, model }) {
  const { data } = await axios.post("/chats/send", { chatId, message, model });
  return data;
}

export async function fetchMessages(chatId) {
  const { data } = await axios.get(`/chats/${chatId}/messages`);
  return data;
}
```

**Why needed:** Encapsulates chat API calls, making components cleaner.

---

#### **notes.js**
Notes and folders API functions.

```javascript
export async function fetchNotes() {
  const { data } = await axios.get("/notes");
  return data;
}

export async function createNote({ title, content, folderId, color }) {
  const { data } = await axios.post("/notes", { title, content, folderId, color });
  return data;
}

export async function updateNote(noteId, { title, content, folderId, color }) {
  const { data } = await axios.put(`/notes/${noteId}`, { title, content, folderId, color });
  return data;
}
```

**Why needed:** Simplifies note management across components.

---

### Components: `frontend/src/components/`

#### **dashboard/Dashboard.jsx** (Main App Component)

**Purpose:** Central hub that manages entire app state and UI.

**State Management:**
```javascript
const [chats, setChats] = useState([]);              // All chat threads
const [messages, setMessages] = useState({});        // Messages by chatId
const [notes, setNotes] = useState([]);              // All notes
const [folders, setFolders] = useState([]);          // Note folders
const [activeChat, setActiveChat] = useState(null);  // Current chat
const [activeNote, setActiveNote] = useState(null);  // Current note
const [currentView, setCurrentView] = useState("chat"); // "chat" or "notes"
```

**Key Features:**
1. **Data Fetching:** Loads chats, notes, folders on mount
2. **Chat Management:** Create, rename, delete, pin chats
3. **Message Handling:** Send messages, get AI responses
4. **Note Management:** Create, edit, delete notes
5. **Folder Management:** Organize notes into categories
6. **View Switching:** Toggle between chat and notes panels

**Why needed:** Orchestrates all user interactions and data flow.

---

#### **chat/ChatPanel.jsx**

**Purpose:** Displays active chat conversation.

**Features:**
- Renders message history (user + AI messages)
- Auto-scrolls to newest message
- Shows AI typing indicator
- Pin/delete individual messages
- "Save as Note" button on each message

**Why needed:** Main interface for AI conversations.

---

#### **chat/ChatInput.jsx**

**Purpose:** Message input field with send button.

**Features:**
- Multi-line textarea (auto-resize)
- Enter to send, Shift+Enter for new line
- Model selector dropdown (Gemini, Groq)
- Loading state during AI response

**Why needed:** Primary user input mechanism.

---

#### **chat/ChatHeader.jsx**

**Purpose:** Displays chat title with actions.

**Features:**
- Editable chat title (click to rename)
- Pin/unpin chat button
- Delete chat button
- "New Chat" button

**Why needed:** Chat navigation and management.

---

#### **notes/NotesPanel.jsx**

**Purpose:** Note editor interface.

**Features:**
- Rich text editor for note content
- Title input field
- Folder dropdown selector
- Color picker for visual organization
- Auto-save on edit
- "Show in Chat" button (if note is from a chat)

**Why needed:** Main interface for note-taking.

---

#### **notes/NotesListPanel.jsx**

**Purpose:** Displays all notes in sidebar.

**Features:**
- Lists all notes grouped by folder
- Pinned notes at top
- Click to open note
- Preview of note content
- Create new note button

**Why needed:** Note navigation and discovery.

---

#### **Sidebar.jsx**

**Purpose:** Navigation sidebar for chats or notes.

**Features:**
- Lists all chats (when in chat view)
- Lists all notes (when in notes view)
- Search/filter functionality
- Pin/unpin items
- Delete items
- Switch between chat/notes views

**Why needed:** Primary navigation mechanism.

---

#### **Header.jsx**

**Purpose:** Top navigation bar.

**Features:**
- App logo/title
- User profile dropdown
- Logout button
- Settings menu

**Why needed:** Consistent navigation across views.

---

#### **ProtectedRoute.jsx**

**Purpose:** Route guard component.

```jsx
export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
```

**Why needed:** 
- Enforces authentication rules
- Redirects unauthorized users
- Prevents authenticated users from accessing login

---

### Services: `frontend/src/services/`

#### **geminiApi.js**

**Purpose:** Direct frontend-to-backend Gemini API call.

```javascript
export async function sendMessageToGemini(message, token) {
  const res = await axios.post(
    "http://localhost:4000/api/gemini/chat",
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

**Why needed:** Alternative to integrated chat flow for testing.

---

### Hooks: `frontend/src/hooks/`

#### **useChats.js**
Custom hook for chat state management.

```javascript
export function useChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats().then(setChats).finally(() => setLoading(false));
  }, []);

  const createChat = async (title) => {
    const newChat = await apiCreateChat({ title });
    setChats(prev => [newChat, ...prev]);
    return newChat;
  };

  return { chats, loading, createChat, /* other functions */ };
}
```

**Why needed:** Reusable chat logic across components.

---

#### **useNotes.js**
Custom hook for note state management.

**Why needed:** Reusable note logic with auto-save, persistence.

---

#### **useFolders.js**
Custom hook for folder management.

**Why needed:** Centralized folder operations.

---

#### **useUIState.js**
Custom hook for UI state (modals, sidebars).

**Why needed:** Manages complex UI state (open/close, active views).

---

### Styles: `frontend/src/styles/`

#### **global.css**
Base styles for entire app.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #5227FF;
  --bg-dark: #020617;
  --text-light: #e5e7eb;
}
```

**Why needed:** Consistent baseline styles.

---

#### **dashboard.css**
Main dashboard layout styles.

**Features:**
- Flexbox layout (sidebar + main content)
- Responsive breakpoints
- Dark theme colors

**Why needed:** Dashboard visual structure.

---

#### **dashboard-chat.css**
Chat panel specific styles.

**Features:**
- Message bubbles (user vs AI)
- Avatar positioning
- Hover effects

**Why needed:** Chat UI aesthetics.

---

#### **dashboard-note-editor.css**
Note editor styles.

**Features:**
- Rich text editor styling
- Color picker UI
- Folder dropdown

**Why needed:** Note-taking interface polish.

---

## 🔐 Authentication Flow

### 1. **Signup Flow**
```
User submits signup form
   ↓
Frontend: POST /api/auth/signup
   ↓
Backend: Validate input, hash password
   ↓
Backend: INSERT into users table
   ↓
Backend: Generate JWT token
   ↓
Backend: Return token + user data
   ↓
Frontend: Store token in localStorage
   ↓
Frontend: Set axios auth header
   ↓
Frontend: Redirect to /dashboard
```

### 2. **Login Flow**
```
User submits login form
   ↓
Frontend: POST /api/auth/login
   ↓
Backend: Verify email exists
   ↓
Backend: Compare password with hash
   ↓
Backend: Generate JWT token
   ↓
Backend: Return token + user data
   ↓
Frontend: Store token in localStorage
   ↓
Frontend: Redirect to /dashboard
```

### 3. **Protected Route Access**
```
User navigates to /dashboard
   ↓
Frontend: ProtectedRoute checks for token
   ↓
Frontend: If no token, redirect to /login
   ↓
Frontend: If token exists, validate with backend
   ↓
Frontend: GET /api/auth/profile (with token)
   ↓
Backend: auth.middleware verifies JWT
   ↓
Backend: Return user data
   ↓
Frontend: If valid, render Dashboard
   ↓
Frontend: If invalid, clear token and redirect to /login
```

---

## 💬 Chat Flow (Complete Workflow)

### **User Sends Message → AI Responds → Save to Database**

```
1. User types message and clicks Send
   ↓
2. Frontend: Capture input from ChatInput.jsx
   ↓
3. Frontend: Call sendMessage() from chat.js API
   ↓
4. Frontend: POST /api/chats/send { chatId, message, model }
   ↓
5. Backend: chat.controller.sendMessage()
   ├─ Check if chatId exists
   ├─ If no chatId: Create new chat (lazy creation)
   │    └─ Generate placeholder title from first message
   ├─ Save user message to messages table
   │    └─ INSERT (chat_id, user_id, role: 'user', content)
   ├─ Call AI service (ai.service.js)
   │    └─ Route to gemini.service.js or groq.service.js
   │    └─ External API call to Google Gemini/Groq
   │    └─ Receive AI-generated response
   ├─ Save AI message to messages table
   │    └─ INSERT (chat_id, role: 'assistant', content)
   ├─ Async: Generate meaningful chat title
   │    └─ Send first few messages to AI
   │    └─ Ask AI: "Generate a 3-5 word title"
   │    └─ Update chat title in database
   └─ Return AI response to frontend
   ↓
6. Frontend: Receive AI response
   ↓
7. Frontend: Update local state (setMessages, setChats)
   ↓
8. Frontend: Render AI message in ChatPanel
   ↓
9. Frontend: Auto-scroll to newest message
```

**Key Points:**
- **Lazy Chat Creation:** Chats are only created when first message is sent (prevents empty chats)
- **Dual Save:** Both user and AI messages are saved to database
- **Async Title Generation:** Non-blocking AI call generates meaningful title in background
- **Error Handling:** If AI fails, fallback message is saved instead

---

## 📝 Note Flow (Save Chat as Note)

### **User Saves Chat Message as Note**

```
1. User clicks "Save as Note" button on message
   ↓
2. Frontend: Open note creation modal
   ↓
3. Frontend: Pre-fill note content with message text
   ↓
4. User selects folder and color
   ↓
5. Frontend: Call createNote() from notes.js API
   ↓
6. Frontend: POST /api/notes { title, content, folderId, color, chatId, messageId }
   ↓
7. Backend: note.controller.createNote()
   ├─ Validate user is authenticated
   ├─ INSERT into notes table
   │    └─ Include chat_id and message_id (links note to source)
   ├─ Return new note with metadata
   │    └─ can_show_in_chat flag (validates source still exists)
   └─ Send response to frontend
   ↓
8. Frontend: Add note to local state
   ↓
9. Frontend: Show success toast
   ↓
10. Frontend: Close modal
```

**Key Points:**
- **Source Linking:** Notes remember which chat/message they came from (chat_id, message_id)
- **Validation:** can_show_in_chat flag ensures source chat/message wasn't deleted
- **Flexibility:** Notes can be standalone (no chat link) or linked

---

## 🎯 Key Design Patterns

### 1. **MVC Architecture (Backend)**
- **Models:** Database queries (data layer)
- **Controllers:** Business logic (request handlers)
- **Routes:** URL mapping (API endpoints)

### 2. **Service Layer Pattern**
- Controllers call services for external operations (AI APIs, email)
- Keeps controllers focused on HTTP logic
- Services are reusable across controllers

### 3. **Context + Hooks (Frontend)**
- React Context for global state (AuthContext)
- Custom hooks for feature-specific logic (useChats, useNotes)
- Reduces prop drilling, improves code organization

### 4. **Soft Delete Pattern**
- is_deleted flag instead of DELETE queries
- Preserves data integrity (foreign key constraints)
- Allows "undo" functionality
- Easier auditing and debugging

### 5. **Lazy Creation Pattern**
- Chats are created when first message is sent
- Prevents empty/abandoned chats in database
- Better user experience (no "create chat" step)

### 6. **Centralized Error Handling**
- Try-catch blocks in all controllers
- Consistent error response format
- Frontend displays user-friendly error messages

---

## 🔒 Security Features

### 1. **Password Security**
- Bcrypt hashing (10 rounds)
- Strong password validation (8+ chars, uppercase, lowercase, digit, special)
- Passwords never stored in plain text

### 2. **JWT Authentication**
- Stateless authentication (no server sessions)
- Tokens expire after 7 days
- Tokens include user ID + email (no sensitive data)

### 3. **Authorization Middleware**
- Every protected route checks JWT validity
- req.user automatically populated from token
- Database queries include user_id to prevent unauthorized access

### 4. **CORS Configuration**
- Whitelisted origins (localhost:5173/5174)
- Prevents cross-origin attacks
- Credentials allowed for cookie/auth headers

### 5. **SQL Injection Prevention**
- mysql2 prepared statements
- User input is parameterized (never concatenated into SQL)

### 6. **API Rate Limiting** (NOT IMPLEMENTED - should be added)
- Recommended: express-rate-limit package
- Prevents brute force attacks

---

## 🚀 Deployment Considerations

### Environment Variables Required

**Backend (.env):**
```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=chatz_db
JWT_SECRET=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:4000/api
```

### Production Checklist

1. **Database:**
   - Use production MySQL instance (AWS RDS, Google Cloud SQL)
   - Enable SSL/TLS connections
   - Regular backups

2. **Backend:**
   - Deploy to Heroku, Railway, AWS EC2, or Google Cloud Run
   - Enable HTTPS (Let's Encrypt)
   - Set NODE_ENV=production
   - Add rate limiting
   - Enable logging (Winston, Morgan)

3. **Frontend:**
   - Build with `npm run build`
   - Deploy to Vercel, Netlify, or AWS S3 + CloudFront
   - Update CORS whitelist in backend
   - Enable HTTPS

4. **Security:**
   - Rotate JWT secret
   - Use strong database passwords
   - Enable API key restrictions (Gemini, Groq)
   - Set up monitoring (Sentry, LogRocket)

---

## 📊 Performance Optimizations

### Current Optimizations:
1. **Database Connection Pooling:** Reuses connections (max 10)
2. **Indexed Queries:** user_id, chat_id, pinned columns have indexes
3. **Lazy Loading:** Chats created only when needed
4. **Soft Deletes:** Fast DELETE operations (UPDATE instead of DELETE)

### Recommended Improvements:
1. **Caching:** Redis for frequently accessed chats/notes
2. **Pagination:** Limit results for large chat lists
3. **Websockets:** Real-time updates (Socket.io)
4. **CDN:** Serve static assets from CDN
5. **Code Splitting:** React.lazy() for route-based splitting

---

## 🧪 Testing Strategy

### Recommended Testing Approach:

**Backend Testing:**
- **Unit Tests:** Jest for models, services
- **Integration Tests:** Supertest for API endpoints
- **Database Tests:** Use test database with migrations

**Frontend Testing:**
- **Component Tests:** React Testing Library
- **E2E Tests:** Cypress or Playwright
- **Snapshot Tests:** Jest snapshots for UI consistency

---

## 📚 Learning Resources

### Technologies Used:
- **React:** https://react.dev
- **Express:** https://expressjs.com
- **MySQL:** https://dev.mysql.com/doc
- **JWT:** https://jwt.io
- **Axios:** https://axios-http.com
- **Vite:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com

---

## 🏗️ Future Enhancements

### Planned Features:
1. **Real-time Chat:** WebSocket support for live updates
2. **File Uploads:** Attach images/documents to notes
3. **Markdown Support:** Rich text formatting in notes
4. **Search Functionality:** Full-text search across chats/notes
5. **Export Notes:** Download as PDF/Word
6. **Collaborative Notes:** Share notes with other users
7. **Voice Input:** Speech-to-text for messages
8. **Dark/Light Theme Toggle:** User preference
9. **Mobile App:** React Native version
10. **AI Memory:** Context-aware conversations across sessions

---

## 🐛 Common Issues & Fixes

### Issue 1: "CORS Error"
**Cause:** Frontend URL not whitelisted in backend  
**Fix:** Add your frontend URL to allowedOrigins in server.js

### Issue 2: "Token Invalid"
**Cause:** JWT_SECRET mismatch or token expired  
**Fix:** Check .env file, ensure JWT_SECRET is same on signup and login

### Issue 3: "Database Connection Failed"
**Cause:** MySQL server not running or wrong credentials  
**Fix:** Verify MySQL is running, check DB_* variables in .env

### Issue 4: "AI Response Empty"
**Cause:** API key invalid or quota exceeded  
**Fix:** Verify GEMINI_API_KEY in .env, check Google Cloud Console for quota

### Issue 5: "Notes Not Saving"
**Cause:** Auth token missing or note validation failed  
**Fix:** Check browser console for errors, verify token is set in localStorage

---

## 📞 Project Maintenance

### Code Organization Best Practices:
1. **One responsibility per file:** Each file should have a single, clear purpose
2. **Consistent naming:** Use camelCase for variables/functions, PascalCase for components
3. **Comment complex logic:** Explain "why", not "what"
4. **Error messages:** Be specific and actionable
5. **Version control:** Commit often with descriptive messages

### Git Workflow:
```bash
# Feature branch workflow
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add: New feature description"
git push origin feature/new-feature
# Create pull request
# After review, merge to main
```

---

## 📝 Summary

This project is a **full-stack AI chat platform** that demonstrates:
- **Backend:** RESTful API with Express, JWT auth, MySQL database
- **Frontend:** React SPA with Context API, custom hooks, responsive design
- **AI Integration:** Google Gemini and Groq SDK for intelligent responses
- **Note-taking:** Linked notes system for knowledge management
- **Security:** Password hashing, JWT tokens, middleware protection
- **UX:** Auto-title generation, soft deletes, pin/unpin, color organization

The architecture follows industry best practices with clear separation of concerns, making it maintainable and scalable for future enhancements.

---

**Created for MCA Semester 1 Project**  
**Last Updated:** December 23, 2025
