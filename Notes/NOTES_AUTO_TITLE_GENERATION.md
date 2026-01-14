# Auto Title Generation - Implementation Guide

## Overview
This feature automatically generates meaningful, short chat titles by summarizing the conversation using AI, similar to ChatGPT's behavior.

## Key Features Implemented

### 1. **Database Schema Update**
- Added `is_auto_title_generated` column to `chats` table (TINYINT, default 0)
- This flag tracks whether a title was auto-generated or manually set

### 2. **New Auto Title Generation Utility**
- **File**: `backend/src/utils/generateAutoTitle.js`
- **Function**: `generateAutoTitle(messages, model)`
  - Takes message history and AI model as input
  - Sends AI a prompt asking for a 3-6 word summary
  - Returns generated title or fallback to first message
  - Features:
    - Removes quotes and punctuation
    - Limits to 6 words max
    - Validates output
    - Graceful fallback on AI failure

### 3. **Chat Model Updates**
- Added `isAutoTitleGenerated` parameter to `createChat()`
- New method `updateAutoTitle()` that:
  - Only updates if title hasn't been manually set
  - Sets `is_auto_title_generated = 1` on success
  - Prevents overwriting user-manual edits

### 4. **Smart Title Generation Flow**
- **When**: After first AI response is received (asynchronous)
- **How**: Runs in background using `setImmediate()` to avoid blocking response
- **Only Once**: Checks `is_auto_title_generated` flag before generating
- **User Override**: Manual rename sets flag to 0, disabling future auto-updates

## Technical Implementation Details

### Chat Creation Flow
```
1. User sends first message → Chat created with placeholder title from first message
2. AI processes and responds → Message saved
3. Background job triggers asynchronously:
   a. Fetch all messages in chat
   b. Call generateAutoTitle() with conversation
   c. Update chat title with generated summary
   d. Set is_auto_title_generated = 1
```

### Title Generation Logic
- **Input**: Conversation history (user + AI messages)
- **AI Prompt**: "Generate short chat title (max 6 words) summarizing topic. No punctuation, no full sentences."
- **Output Examples**:
  - "Explain JWT, CI/CD, MVC" → "Backend Concepts Overview"
  - "What is Java, OOP, inheritance" → "Java Basics Discussion"
  - "Daily study planning questions" → "Study Planning"

### Manual Rename Protection
- When user manually renames chat → `is_auto_title_generated = 0`
- Future auto-generation skipped for this chat
- Ensures user edits aren't overwritten

## Files Modified

### Backend
1. **database/schema.sql**
   - Added `is_auto_title_generated TINYINT(1) DEFAULT 0` column

2. **backend/src/utils/generateAutoTitle.js** (NEW)
   - `generateAutoTitle(messages, model)` - AI-powered title generation
   - `fallbackTitle(firstMessage)` - Fallback to first message

3. **backend/src/models/chat.model.js**
   - Updated `createChat()` to accept `isAutoTitleGenerated` parameter
   - Updated `renameChat()` to set flag to 0 (manual rename)
   - New `updateAutoTitle()` method for auto-generated titles

4. **backend/src/controllers/chat.controller.js**
   - Imported `generateAutoTitle` utility
   - Updated `sendMessage()` to trigger async title generation
   - Uses `setImmediate()` for non-blocking operation

## Testing Checklist

### ✅ Basic Functionality
- [ ] Send first message in a chat
- [ ] Verify chat initially has placeholder title from first message
- [ ] Wait a moment (async processing)
- [ ] Refresh chat list - title should be auto-generated

### ✅ Title Quality
Test with different conversation types:
- [ ] Technical question → Technical topic summary
- [ ] General discussion → Topic overview
- [ ] Multi-turn conversation → Main theme captured
- [ ] Short greeting ("hi", "hello") → Falls back gracefully

### ✅ Edge Cases
- [ ] Multiple chats created quickly - each gets own title
- [ ] Very long conversation - title still summarizes main topic
- [ ] AI fails to generate - fallback to first message works
- [ ] Chat has only user messages (AI doesn't respond) - fallback used

### ✅ Manual Override
- [ ] User renames auto-generated title
- [ ] Verify `is_auto_title_generated = 0` in database
- [ ] Send new message to chat
- [ ] Title should NOT change (respects manual edit)

### ✅ Different AI Models
Test with:
- [ ] Gemini
- [ ] Claude (if available)
- [ ] Groq (if available)

### ✅ Database Integrity
```sql
-- Check flags are being set correctly
SELECT id, title, is_auto_title_generated FROM chats LIMIT 10;

-- Should see mix of 0 (manual) and 1 (auto-generated)
```

## Database Migration

Run this to add the column to existing chats table:
```sql
ALTER TABLE chats ADD COLUMN is_auto_title_generated TINYINT(1) DEFAULT 0;
```

## API Response Format
The `sendMessage` endpoint continues to return:
```json
{
  "reply": "AI response text",
  "chatId": 123,
  "provider": "gemini",
  "chat": {
    "id": 123,
    "title": "Initial placeholder title",
    "is_auto_title_generated": 0
  }
}
```

Chat title will be updated in background and synced to frontend on next refresh.

## UX Considerations

### User Experience
1. **Instant Response**: Chat message sent immediately, title updates in background
2. **No Blocking**: Auto-generation doesn't slow down message sending
3. **Graceful Degradation**: If AI fails, uses fallback title
4. **User Control**: Manual rename disables future auto-updates

### Frontend Sync
- Frontend can optionally poll for updated chat list
- Or implement WebSocket for real-time title updates
- Current implementation: Title updates on page refresh

## Performance Metrics

- **Response Time**: No impact (async processing)
- **AI Call Latency**: ~1-2 seconds (doesn't block user)
- **Database Impact**: 1 additional UPDATE query per chat (background job)

## Security Considerations

- ✅ User ownership verified in `updateAutoTitle()`
- ✅ Chat ID validated
- ✅ Only processes actual messages
- ✅ Fallback prevents empty titles

## Future Enhancements

1. **Real-time Updates**: WebSocket to push title changes to frontend
2. **Custom Title Length**: Allow users to prefer 3, 5, or 7 word titles
3. **Emoji Support**: Optional emoji in titles (e.g., "🧠 AI Model Research")
4. **Regenerate**: Allow users to request new auto-generated title
5. **Category Tags**: Add auto-categorization (e.g., "Learning", "Work", "Research")

## Viva-Ready One-Liner

**"Instead of using the first message as the title, we generate a summarized chat title using AI to improve clarity and organization, similar to ChatGPT."**
