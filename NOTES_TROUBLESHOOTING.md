# Notes Persistence - Troubleshooting Guide

## Issue: Notes Disappear After Logout/Login

### Symptoms
- Notes are visible while logged in
- After logging out and logging back in, notes are gone
- Fresh page load loses all notes

### Root Causes
1. **Database not connected** - Notes aren't being saved to DB
2. **API endpoints not registered** - Routes not mounted in server
3. **Auth token not provided** - API calls missing authorization header
4. **User ID mismatch** - Notes saved for different user

### Solutions

#### Solution 1: Verify Database Connection
```bash
# Test database connection
cd backend
node -e "require('./src/config/db').query('SELECT 1').then(() => console.log('DB OK'))"
```

#### Solution 2: Check if Routes are Mounted
```javascript
// In backend/src/server.js, verify this line exists:
app.use("/api/notes", noteRoutes);
```

#### Solution 3: Check Browser Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Create a new note
4. Look for POST request to `/api/notes`
5. Should see status 200 or 201
6. Check response contains `id` field

If request is failing:
- Check browser console for errors
- Verify auth token in Local Storage: `localStorage.getItem('token')`
- Check backend logs for error messages

#### Solution 4: Verify Auth Header
In `frontend/src/api/axios.js`, check that token is being sent:
```javascript
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### Solution 5: Check User ID
In database, verify notes have correct `user_id`:
```sql
SELECT id, title, user_id FROM notes LIMIT 5;
-- Should show notes with matching user_id from logged-in user
```

---

## Issue: Save Button Doesn't Work

### Symptoms
- "Save Note" button doesn't trigger action
- No errors in console
- Note content not saved

### Root Causes
1. **Async function not awaited**
2. **Missing error handling**
3. **Note ID not found**
4. **API endpoint returning error**

### Solutions

#### Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Red error messages indicate problems

#### Check API Response
1. Network tab → Filter "XHR" or "Fetch"
2. Click on PUT/POST request to `/api/notes`
3. Go to "Response" tab
4. Should show the updated note data
5. If error, read error message

#### Test API Manually
```javascript
// Open browser console and run:
fetch('http://localhost:4000/api/notes/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    title: 'Test',
    content: 'Content',
    folderId: null,
    color: '#5227FF'
  })
}).then(r => r.json()).then(console.log).catch(console.error)
```

---

## Issue: Notes Appear But Content Doesn't Update

### Symptoms
- Note list shows correct notes
- Opening note shows old content
- Changes don't persist

### Root Causes
1. **Local state updating but not DB**
2. **API call failing silently**
3. **Concurrent updates conflicting**

### Solutions

#### Add Console Logging
In `frontend/src/components/dashboard/Dashboard.jsx`, update functions:
```javascript
const handleSaveNoteEditor = async () => {
  console.log('Saving note:', noteEditorId);
  try {
    await apiUpdateNote(noteEditorId, {
      title: noteEditorTitle,
      content: noteEditorContent,
      folderId: currentNote.folderId,
      color: noteEditorColor,
    });
    console.log('Note saved successfully');
  } catch (err) {
    console.error('Failed to save note:', err);
  }
};
```

#### Check Network Requests
1. Open Network tab
2. Click "Save Note"
3. Look for PUT request to `/api/notes/{id}`
4. Check status (should be 200)
5. Check response has `updated_at` timestamp

#### Verify Database Update
```sql
-- Check if updated_at changed recently
SELECT id, title, updated_at FROM notes WHERE id = 1;

-- Should show recent timestamp
```

---

## Issue: Duplicate Notes Appearing

### Symptoms
- Same note appears multiple times in list
- Note count increases with each save
- Duplicate entries in database

### Root Causes
1. **Note ID generation using Date.now()** - Can create collisions
2. **Optimistic update creating new note before DB response**
3. **Multiple save calls happening**

### Solutions

#### Temporary Fix: Refresh Page
- Reload the page (F5)
- Duplicates should disappear as fresh fetch occurs

#### Check for Race Conditions
In `handleSaveMessageToNote()`, ensure you're not calling create multiple times:
```javascript
// BAD - Creates new note every time
setNotes((prev) => {
  const existing = prev.find(...);
  if (!existing) {
    apiCreateNote(...);  // Happens immediately
    return [...prev, newNote];  // Then updates state
  }
});

// GOOD - Check result before creating
const response = await apiCreateNote(...);
setNotes((prev) => [...prev, response]);
```

---

## Issue: Pin Status Not Persisting

### Symptoms
- Note appears pinned in UI
- After refresh, unpinned
- Pin status changes don't save

### Root Causes
1. **PATCH endpoint not called**
2. **Pinned value wrong type** (string vs boolean)
3. **Note ID mismatch**

### Solutions

#### Verify PATCH Endpoint
Check backend route:
```javascript
// In backend/src/routes/note.routes.js
router.patch("/:noteId/pin", auth.requireAuth, noteController.togglePinNote);
```

#### Check Data Type
Ensure pinned is sent as boolean:
```javascript
// CORRECT
await togglePinNote(noteId, true);   // boolean
await togglePinNote(noteId, false);  // boolean

// WRONG
await togglePinNote(noteId, "1");    // string
await togglePinNote(noteId, 1);      // number
```

#### Verify Database Update
```sql
-- Check if pinned flag updated
SELECT id, title, pinned FROM notes WHERE id = 1;

-- Should show pinned = 1 (true) or 0 (false)
```

---

## Issue: Folder Changes Not Saved

### Symptoms
- Move note to folder works in UI
- After refresh, note in original folder
- Folder color doesn't update

### Root Causes
1. **PUT endpoint not sending folderId**
2. **Folder ID type mismatch** (string vs number)
3. **Color not updating with folder**

### Solutions

#### Check PUT Request Body
```javascript
// CORRECT - All fields required
await apiUpdateNote(noteId, {
  title: existingNote.title,
  content: existingNote.content,
  folderId: 3,  // number
  color: '#22C55E'
});

// WRONG - Missing fields
await apiUpdateNote(noteId, {
  folderId: 3  // Missing title, content, color
});
```

#### Verify Database Update
```sql
-- Check if note_folder_id updated
SELECT id, title, note_folder_id, color FROM notes WHERE id = 1;

-- Should show correct folder ID and matching color
```

---

## Issue: Delete Not Working

### Symptoms
- Delete option appears but doesn't work
- Note still visible after delete
- No error messages

### Root Causes
1. **DELETE endpoint returning error**
2. **Note ID not being passed correctly**
3. **Authorization issue**

### Solutions

#### Check Network Request
1. Click delete on a note
2. Network tab → look for DELETE to `/api/notes/{id}`
3. Check status code (should be 200)
4. Check response: `{ "success": true }`

#### Test Manually
```javascript
fetch('http://localhost:4000/api/notes/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log).catch(console.error)
```

---

## Issue: Auth Token Issues

### Symptoms
- 401 errors on all note API calls
- Notes can't be loaded
- Can't save notes

### Root Causes
1. **Token expired**
2. **Token not being sent**
3. **Token format wrong**

### Solutions

#### Check Token in LocalStorage
```javascript
// Run in browser console
localStorage.getItem('token');
// Should return a long string (JWT)

// If empty, user not logged in
```

#### Check Token Format
```javascript
// In axios requests, should be:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// NOT
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Logout and Login Again
Token might be expired:
1. Click logout
2. Log back in (new token generated)
3. Try notes operations again

---

## Issue: Slow Performance

### Symptoms
- Saving notes takes a long time
- Lots of network requests
- High CPU usage

### Root Causes
1. **Multiple unnecessary API calls**
2. **Large note content** (MB of data)
3. **Database slow queries**

### Solutions

#### Monitor Network Activity
1. Open Network tab
2. Disable cache (checkbox in DevTools)
3. Perform note operations
4. Count number of requests
5. Each operation should be: 1 GET + 1 PUT/POST

#### Check Database Performance
```sql
-- Check if indexes exist
SHOW INDEX FROM notes;
SHOW INDEX FROM note_folders;

-- Run slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

#### Optimize Frontend
- Avoid too many renders
- Use React DevTools Profiler to find bottlenecks
- Debounce repeated saves

---

## Debugging Checklist

When something breaks, go through this checklist:

- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed requests (4xx, 5xx status)
- [ ] Verify user is logged in (check token in LocalStorage)
- [ ] Check backend server is running (port 4000)
- [ ] Check database is running and connected
- [ ] Verify routes are mounted in `server.js`
- [ ] Check auth middleware is protecting routes
- [ ] Verify API request/response format
- [ ] Test API endpoint manually with curl/Postman
- [ ] Check database for actual data
- [ ] Look at backend console logs for errors
- [ ] Clear browser cache and try again
- [ ] Restart both frontend and backend servers

---

## Getting Help

### Check Logs

**Backend Log:**
```bash
cd backend && npm start
# Look for error messages
```

**Browser Console:**
Press F12 in browser, go to Console tab

**Network Tab:**
Press F12, go to Network tab, look for failed requests

### Enable Debug Mode

Add to `frontend/src/api/axios.js`:
```javascript
api.interceptors.response.use(
  response => {
    console.log('API Success:', response.config.method, response.config.url, response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.method, error.config?.url, error.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### Test with Postman/curl

```bash
# Create note
curl -X POST http://localhost:4000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","content":"test"}'

# Get notes
curl -X GET http://localhost:4000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update note
curl -X PUT http://localhost:4000/api/notes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated","content":"new content","folderId":null,"color":"#5227FF"}'

# Delete note
curl -X DELETE http://localhost:4000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Profiling

### React DevTools Profiler
1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Record while saving notes
4. Look for long render times
5. Click on slow components to see why

### Network Profiler
1. Open DevTools → Network tab
2. Disable cache
3. Perform operation
4. Note total request time
5. If > 2 seconds, database might be slow

---

## Still Having Issues?

1. **Check all files are created:**
   - `backend/src/models/note.model.js`
   - `backend/src/controllers/note.controller.js`
   - `backend/src/routes/note.routes.js`
   - `frontend/src/api/notes.js`

2. **Verify imports:**
   - Dashboard.jsx imports from `/api/notes`
   - server.js imports note routes
   - Routes import middleware correctly

3. **Test database:**
   ```sql
   -- Verify tables exist
   SHOW TABLES;
   DESCRIBE notes;
   DESCRIBE note_folders;
   ```

4. **Restart everything:**
   - Kill backend process
   - Kill frontend dev server
   - Clear browser cache
   - Restart both servers

5. **Check git status:**
   ```bash
   git status
   # Should show modified files
   git diff
   # Review changes
   ```

If still stuck, check the implementation summary in `NOTES_PERSISTENCE_IMPLEMENTATION.md`.
