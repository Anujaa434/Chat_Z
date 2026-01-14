# Notes Persistence - Quick Test Guide

## Setup Before Testing
1. Make sure the backend and frontend servers are running
2. User must be logged in
3. Have some chat messages available

## Test Cases

### Test 1: Create a New Note
**Steps:**
1. Click "Notes" tab in sidebar
2. Click "+ New Note" button
3. Enter a title (e.g., "Test Note")
4. Click "Create"
5. Add some content to the note

**Expected Result:**
- Note appears in the notes list
- Note data is saved to database
- Content is visible in the editor

**Verification:**
- Log out and log back in
- Notes tab should still show the created note

---

### Test 2: Save Message to Notes
**Steps:**
1. Go to "Chats" tab
2. Create a new chat and send a message
3. Hover over the message and click the menu (⋮)
4. Click "Save to notes"
5. This creates a note automatically

**Expected Result:**
- A new note is created with the chat title
- The message is added as an entry
- Note appears in Notes list

**Verification:**
- Switch tabs back and forth
- Log out and log back in
- Note and message entry should persist

---

### Test 3: Edit Note Content
**Steps:**
1. Go to Notes tab
2. Click on a note to open it
3. Edit the title
4. Edit the content in the text area
5. Click "Save Note"

**Expected Result:**
- Changes are saved to database
- Preview updates to show new content

**Verification:**
- Log out and log back in
- Click the note again
- Title and content should be as edited

---

### Test 4: Add Manual Entry to Note
**Steps:**
1. Open a note in editor
2. Type text in the "Add note block" input at bottom
3. Press Enter (or Shift+Enter for newline)
4. Manual entry appears as a note block

**Expected Result:**
- Entry is added to the note
- Content is automatically saved to database

**Verification:**
- Log out and log back in
- Note should still have the manual entry

---

### Test 5: Pin/Unpin Note
**Steps:**
1. Go to Notes tab
2. Hover over a note in the list
3. Click menu (⋮) and select "Pin note"
4. Note moves to top of list

**Expected Result:**
- Note pin status updates in database
- Pinned notes appear first in sorted list

**Verification:**
- Log out and log back in
- Pinned note should still be at top

---

### Test 6: Move Note to Folder
**Steps:**
1. Go to Notes tab
2. Click on a note
3. Hover over the note in the sidebar
4. Click menu (⋮) and select "Move to folder"
5. Choose a folder from the modal
6. Click "Confirm"

**Expected Result:**
- Note's folder assignment updates
- Note color changes to folder color
- Database stores new folder ID

**Verification:**
- Log out and log back in
- Note should be in the selected folder with correct color

---

### Test 7: Delete Note
**Steps:**
1. Go to Notes tab
2. Hover over a note in the list
3. Click menu (⋮) and select "Delete"
4. Note disappears from list

**Expected Result:**
- Note is soft-deleted in database
- No longer appears in notes list

**Verification:**
- Log out and log back in
- Deleted note should not appear
- Check database: note should have `is_deleted = 1`

---

### Test 8: Multiple Notes Persistence
**Steps:**
1. Create 3-4 different notes
2. Add different content to each
3. Pin some notes
4. Move them to different folders

**Expected Result:**
- All notes display correctly
- Sorting respects pinned status

**Verification:**
- Log out and log back in
- All notes still there with correct order, content, and folders

---

### Test 9: Note Entry Operations
**Steps:**
1. Open a note with multiple entries (from saved messages + manual)
2. Hover over an entry
3. Click the menu (⋮) on the entry
4. Test options: View in chat, Pin, Delete, Copy

**Expected Result:**
- Each operation works without errors
- Entries update correctly

**Verification:**
- Log out and log back in
- Entries should be preserved

---

### Test 10: Browser Refresh Persistence
**Steps:**
1. Create a note with content
2. Refresh the browser (F5 or Cmd+R)
3. Navigate to notes

**Expected Result:**
- Note is still there with all content
- No loss of data during refresh

---

## Database Verification Queries

To verify data is being saved correctly, run these SQL queries:

```sql
-- Check if notes exist for a user
SELECT * FROM notes WHERE user_id = [USER_ID] AND is_deleted = 0;

-- Check if folders exist
SELECT * FROM note_folders WHERE user_id = [USER_ID] AND is_deleted = 0;

-- Check note content
SELECT id, title, content, pinned, note_folder_id FROM notes 
WHERE user_id = [USER_ID] LIMIT 5;

-- Check deleted notes (soft delete)
SELECT id, title, is_deleted FROM notes WHERE user_id = [USER_ID];
```

---

## Common Issues & Solutions

### Issue: Notes disappear after logout
**Solution:** Check that browser network tab shows POST/PUT requests to `/api/notes` with 200 status codes. If not, notes aren't being saved to DB.

### Issue: Save button doesn't work
**Solution:** Check browser console for errors. Verify user is logged in (auth token exists). Check that API endpoints exist on backend.

### Issue: Note doesn't appear immediately after save
**Solution:** Notes use optimistic updates. If note doesn't appear after 2 seconds, check console for API errors.

### Issue: Folder/Pin changes don't persist
**Solution:** Check that PATCH requests to `/api/notes/:id/pin` return 200. Verify database was updated.

---

## Performance Notes

- Initial load fetches all notes and folders on component mount
- Each note save is a separate API call
- Optimistic updates used to avoid perceived lag
- Soft deletes preserve data integrity
- Consider adding batch updates for multiple note edits

---

## Success Indicators

✅ All CRUD operations (Create, Read, Update, Delete) work
✅ Data persists across login/logout cycles
✅ Pinned notes stay pinned
✅ Notes stay in correct folders
✅ No console errors during operations
✅ Database shows updated timestamps on changes
✅ Browser refresh doesn't lose data
✅ Multiple users' notes don't conflict
