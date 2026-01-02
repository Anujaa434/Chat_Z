import React from "react";

const MessageItem = ({
  msg,
  isSaved,
  openMessageMenuId,
  setOpenMessageMenuId,
  messageMenuDirection,
  setMessageMenuDirection,
  decideMenuDirection,
  messageSelectionMode,
  selectedMessageIds,
  toggleSelectMessage,
  handleSaveMessageToNote,
  handleTogglePinMessage,
  handleDeleteSingleMessage,
  messageRefs,
}) => {
  const isUser = msg.from === "user";
  const isMenuOpen = openMessageMenuId === msg.id;

  return (
    <div
      className={`message-row ${isUser ? "user" : "ai"} ${
        isMenuOpen ? "menu-open" : ""
      }`}
    >
      <div
        className={`message-bubble ${msg.pinnedAt ? "pinned" : ""}`}
        ref={(el) => {
          if (el) {
            messageRefs.current[msg.id] = el;
          }
        }}
      >
        <div className="message-text">{msg.text}</div>

        <div className="message-meta">
          <span>
            {isUser ? "You" : "AI"} · {msg.time}
          </span>
          <div className="message-meta-right">
            {isSaved && (
              <span className="saved-pill" title="Saved to notes">Saved</span>
            )}
            {messageSelectionMode && isUser && (
              <input
                type="checkbox"
                className="message-select-checkbox"
                checked={selectedMessageIds.includes(msg.id)}
                onChange={() => toggleSelectMessage(msg.id)}
              />
            )}

            {isUser && (
              <>
                <button
                  type="button"
                  className="message-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dir = decideMenuDirection(e, 220);
                    setMessageMenuDirection(dir);
                    setOpenMessageMenuId((prev) =>
                      prev === msg.id ? null : msg.id
                    );
                  }}
                >
                  ⋮
                </button>
                {isMenuOpen && (
                  <div
                    className={`message-menu ${
                      messageMenuDirection === "up"
                        ? "menu-up"
                        : "menu-down"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!messageSelectionMode) {
                          // parent will handle toggling mode
                        }
                        toggleSelectMessage(msg.id);
                        setOpenMessageMenuId(null);
                      }}
                    >
                      Select message
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSaveMessageToNote(msg);
                        setOpenMessageMenuId(null);
                      }}
                    >
                      Save to notes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleTogglePinMessage(msg.id);
                        setOpenMessageMenuId(null);
                      }}
                    >
                      {msg.pinnedAt ? "Unpin message" : "Pin message"}
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        handleDeleteSingleMessage(msg.id);
                        setOpenMessageMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
