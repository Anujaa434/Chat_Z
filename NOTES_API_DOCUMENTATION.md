# Notes API Documentation

## Base URL
```
http://localhost:4000/api/notes
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Notes Endpoints

### 1. GET /api/notes
Get all notes for the logged-in user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "title": "Meeting Notes",
    "content": "Discussed Q4 goals...",
    "note_folder_id": 1,
    "color": "#06B6D4",
    "pinned": 0,
    "is_deleted": 0,
    "created_at": "2024-12-17T10:30:00Z",
    "updated_at": "2024-12-17T15:45:00Z"
  }
]
```

---

### 2. GET /api/notes/:noteId
Get a specific note by ID.

**Parameters:**
- `noteId` (path) - Note ID

**Response:**
```json
{
  "id": 1,
  "user_id": 5,
  "title": "Meeting Notes",
  "content": "Discussed Q4 goals...",
  "note_folder_id": 1,
  "color": "#06B6D4",
  "pinned": 0,
  "is_deleted": 0,
  "created_at": "2024-12-17T10:30:00Z",
  "updated_at": "2024-12-17T15:45:00Z"
}
```

---

### 3. POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "New Note",
  "content": "Note content here",
  "folderId": 1,
  "color": "#06B6D4"
}
```

**Parameters:**
- `title` (string, optional) - Note title, defaults to "Untitled Note"
- `content` (string, optional) - Note content, defaults to ""
- `folderId` (number, optional) - ID of folder to place note in
- `color` (string, optional) - Hex color code, defaults to "#5227FF"

**Response:**
```json
{
  "id": 42,
  "user_id": 5,
  "title": "New Note",
  "content": "Note content here",
  "note_folder_id": 1,
  "color": "#06B6D4",
  "pinned": 0,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:00:00Z",
  "updated_at": "2024-12-17T16:00:00Z"
}
```

---

### 4. PUT /api/notes/:noteId
Update an existing note.

**Parameters:**
- `noteId` (path) - Note ID to update

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "folderId": 2,
  "color": "#F97373"
}
```

**Response:**
```json
{
  "id": 42,
  "user_id": 5,
  "title": "Updated Title",
  "content": "Updated content",
  "note_folder_id": 2,
  "color": "#F97373",
  "pinned": 0,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:00:00Z",
  "updated_at": "2024-12-17T16:10:00Z"
}
```

---

### 5. DELETE /api/notes/:noteId
Delete a note (soft delete).

**Parameters:**
- `noteId` (path) - Note ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

---

### 6. PATCH /api/notes/:noteId/pin
Toggle pin status for a note.

**Parameters:**
- `noteId` (path) - Note ID

**Request Body:**
```json
{
  "pinned": true
}
```

**Response:**
```json
{
  "id": 42,
  "user_id": 5,
  "title": "New Note",
  "content": "Note content",
  "note_folder_id": 1,
  "color": "#06B6D4",
  "pinned": 1,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:00:00Z",
  "updated_at": "2024-12-17T16:15:00Z"
}
```

---

## Folders Endpoints

### 1. GET /api/notes/folders/list/all
Get all folders for the logged-in user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "name": "Work Projects",
    "color": "#06B6D4",
    "pinned": 0,
    "is_deleted": 0,
    "created_at": "2024-12-17T10:00:00Z",
    "updated_at": "2024-12-17T10:00:00Z"
  }
]
```

---

### 2. POST /api/notes/folders
Create a new note folder.

**Request Body:**
```json
{
  "name": "Project Alpha",
  "color": "#22C55E"
}
```

**Parameters:**
- `name` (string, optional) - Folder name, defaults to "New Folder"
- `color` (string, optional) - Hex color code, defaults to "#5227FF"

**Response:**
```json
{
  "id": 5,
  "user_id": 5,
  "name": "Project Alpha",
  "color": "#22C55E",
  "pinned": 0,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:20:00Z",
  "updated_at": "2024-12-17T16:20:00Z"
}
```

---

### 3. PUT /api/notes/folders/:folderId
Update a folder.

**Parameters:**
- `folderId` (path) - Folder ID to update

**Request Body:**
```json
{
  "name": "Project Alpha - Updated",
  "color": "#EAB308"
}
```

**Response:**
```json
{
  "id": 5,
  "user_id": 5,
  "name": "Project Alpha - Updated",
  "color": "#EAB308",
  "pinned": 0,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:20:00Z",
  "updated_at": "2024-12-17T16:25:00Z"
}
```

---

### 4. DELETE /api/notes/folders/:folderId
Delete a folder (soft delete).

**Parameters:**
- `folderId` (path) - Folder ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

---

### 5. PATCH /api/notes/folders/:folderId/pin
Toggle pin status for a folder.

**Parameters:**
- `folderId` (path) - Folder ID

**Request Body:**
```json
{
  "pinned": true
}
```

**Response:**
```json
{
  "id": 5,
  "user_id": 5,
  "name": "Project Alpha",
  "color": "#22C55E",
  "pinned": 1,
  "is_deleted": 0,
  "created_at": "2024-12-17T16:20:00Z",
  "updated_at": "2024-12-17T16:30:00Z"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden (Not Owner)
```json
{
  "error": "Note not found or unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Note not found"
}
```

### 400 Bad Request
```json
{
  "error": "Title cannot be empty"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create note"
}
```

---

## Usage Examples

### Create a Note with Saved Chat Message
```javascript
const newNote = await createNote({
  title: "Chat Conversation",
  content: "You: What is AI?\n\nAI: Artificial Intelligence is...",
  folderId: 1,
  color: "#06B6D4"
});
```

### Update Note Content
```javascript
const updated = await updateNote(noteId, {
  title: note.title,
  content: updatedContent,
  folderId: note.folderId,
  color: note.color
});
```

### Pin Important Note
```javascript
const pinned = await togglePinNote(noteId, true);
```

### Move Note to Different Folder
```javascript
const moved = await updateNote(noteId, {
  title: note.title,
  content: note.content,
  folderId: 3,  // New folder
  color: "#F97373"  // Folder's color
});
```

### Delete Note
```javascript
const result = await deleteNote(noteId);
// { success: true, message: "Note deleted successfully" }
```

---

## Database Schema

### notes table
```sql
CREATE TABLE notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  note_folder_id BIGINT UNSIGNED NULL,
  message_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) DEFAULT NULL,
  content TEXT NOT NULL,
  pinned TINYINT(1) DEFAULT 0,
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_folder_id) REFERENCES note_folders(id) ON DELETE SET NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);
```

### note_folders table
```sql
CREATE TABLE note_folders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(20) DEFAULT '#5227FF',
  pinned TINYINT(1) DEFAULT 0,
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Rate Limiting
None currently implemented. Consider adding rate limiting for production use.

---

## Pagination
Not implemented. All notes/folders returned at once. Consider implementing for users with many notes.

---

## Caching
No caching implemented. Consider Redis caching for frequently accessed notes.

---

## WebSocket Support
Not implemented. Consider adding real-time updates for collaborative notes in future.
