import React from "react";

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
        <textarea
          ref={messageInputRef}
          className="chat-input"
          placeholder="Type your message…"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={1}
        />
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

export default ChatInput;
