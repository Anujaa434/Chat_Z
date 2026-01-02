import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({
  groupedMessages,
  dateLabel,
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
  messagesContainerRef,
  messageRefs,
  savedMessageIds,
  emptyStateTitle,
  emptyStateSubtitle,
}) => {
  const hasMessages =
    Object.keys(groupedMessages).length > 0 &&
    Object.values(groupedMessages).some((arr) => arr.length > 0);

  // Map each dateKey -> first messageId in that group (for scroll targeting)
  const firstMessageIdByDate = useMemo(() => {
    const map = {};
    Object.entries(groupedMessages).forEach(([dateKey, msgs]) => {
      if (msgs && msgs.length) {
        map[dateKey] = msgs[0].id;
      }
    });
    return map;
  }, [groupedMessages]);

  // Track the currently visible date for the floating header
  const [currentDateKey, setCurrentDateKey] = useState(() => {
    const keys = Object.keys(groupedMessages);
    return keys.length ? keys[0] : null;
  });

  // Compute current date based on scroll position relative to first message of each date
  useEffect(() => {
    const el = messagesContainerRef?.current;
    if (!el) return;

    const updateCurrentDate = () => {
      const containerTop = el.getBoundingClientRect().top;
      // Build offsets for each date's first message
      const entries = Object.entries(firstMessageIdByDate)
        .map(([dateKey, firstId]) => {
          const node = messageRefs?.current?.[firstId];
          if (!node) return null;
          const top = node.getBoundingClientRect().top - containerTop;
          return { dateKey, top };
        })
        .filter(Boolean)
        // Ensure chronological order as rendered
        .sort((a, b) => a.top - b.top);

      if (!entries.length) return;

      // Find the last date whose first message is at or above a small threshold from top
      const threshold = 12; // px
      let current = entries[0].dateKey;
      for (const e of entries) {
        if (e.top <= threshold) current = e.dateKey;
        else break;
      }
      setCurrentDateKey(current);
    };

    // Initialize and attach listener
    updateCurrentDate();
    el.addEventListener("scroll", updateCurrentDate, { passive: true });
    return () => el.removeEventListener("scroll", updateCurrentDate);
  }, [messagesContainerRef, messageRefs, firstMessageIdByDate]);

  const handleHeaderClick = () => {
    if (!currentDateKey) return;
    const firstId = firstMessageIdByDate[currentDateKey];
    const node = messageRefs?.current?.[firstId];
    if (!node) return; // fail gracefully
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-to-bottom affordance
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  useEffect(() => {
    const el = messagesContainerRef?.current;
    if (!el) return;
    const check = () => {
      const threshold = 8;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      setShowScrollToBottom(!atBottom);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [messagesContainerRef, groupedMessages]);

  const scrollToBottom = () => {
    const el = messagesContainerRef?.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="chat-messages" ref={messagesContainerRef}>
      {/* Floating sticky date header (WhatsApp-style, subtle and centered) */}
      {hasMessages && currentDateKey && (
        <div className="date-header-floating" onClick={handleHeaderClick}>
          {dateLabel(currentDateKey)}
        </div>
      )}
      {hasMessages && showScrollToBottom && (
        <button
          type="button"
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}
      <div className="chat-messages-inner">
        {!hasMessages ? (
          <div className="empty-state">
            <div className="empty-title">{emptyStateTitle}</div>
            <div className="empty-subtitle">{emptyStateSubtitle}</div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, msgs]) => (
            <React.Fragment key={dateKey}>
              <div className="date-header">{dateLabel(dateKey)}</div>
              {msgs.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isSaved={savedMessageIds && savedMessageIds.has ? savedMessageIds.has(msg.id) : false}
                  openMessageMenuId={openMessageMenuId}
                  setOpenMessageMenuId={setOpenMessageMenuId}
                  messageMenuDirection={messageMenuDirection}
                  setMessageMenuDirection={setMessageMenuDirection}
                  decideMenuDirection={decideMenuDirection}
                  messageSelectionMode={messageSelectionMode}
                  selectedMessageIds={selectedMessageIds}
                  toggleSelectMessage={toggleSelectMessage}
                  handleSaveMessageToNote={handleSaveMessageToNote}
                  handleTogglePinMessage={handleTogglePinMessage}
                  handleDeleteSingleMessage={handleDeleteSingleMessage}
                  messageRefs={messageRefs}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;
