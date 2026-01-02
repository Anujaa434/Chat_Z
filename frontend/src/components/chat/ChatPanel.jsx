import React from "react";
import ChatHeader from "./ChatHeader";
import PinnedBar from "./PinnedBar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatPanel = ({
  activeChat,
  model,
  setModel,
  pinnedMessages,
  pinnedBarIndex,
  currentPinnedForBar,
  pinPreview,
  onPinnedBarClick,
  messageSelectionMode,
  selectedMessageIds,
  onDeleteSelectedMessages,
  onToggleMessageSelectionMode,
  onSaveSelectedMessagesToNote,
  onPinSelectedMessages,
  selectionPinLabel,
  groupedMessages,
  dateLabel,
  openMessageMenuId,
  setOpenMessageMenuId,
  messageMenuDirection,
  setMessageMenuDirection,
  decideMenuDirection,
  toggleSelectMessage,
  handleSaveMessageToNote,
  handleTogglePinMessage,
  handleDeleteSingleMessage,
  messagesContainerRef,
  messageRefs,
  savedMessageIds,
  emptyStateTitle,
  emptyStateSubtitle,
  handleSendMessage,
  messageInputRef,
  messageInput,
  setMessageInput,
  handleInputKeyDown,
  showPinMessageLimitToast,
}) => {
  return (
    <div className="chat-panel">
      <ChatHeader
        activeChat={activeChat}
        model={model}
        setModel={setModel}
      />

      <PinnedBar
        pinnedMessages={pinnedMessages}
        pinnedBarIndex={pinnedBarIndex}
        currentPinnedForBar={currentPinnedForBar}
        pinPreview={pinPreview}
        onPinnedBarClick={onPinnedBarClick}
      />

      {messageSelectionMode && (
        <div className="message-selection-toolbar">
          <div className="selection-actions">
            <span>{selectedMessageIds.length} selected</span>
            <button
              type="button"
              className="danger"
              disabled={!selectedMessageIds.length}
              onClick={onDeleteSelectedMessages}
            >
              Delete
            </button>
            <button
              type="button"
              disabled={!selectedMessageIds.length}
              onClick={onPinSelectedMessages}
            >
              {selectionPinLabel} messages
            </button>
            <button
              type="button"
              disabled={!selectedMessageIds.length}
              onClick={onSaveSelectedMessagesToNote}
            >
              Save to notes
            </button>
            <button
              type="button"
              onClick={onToggleMessageSelectionMode}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <MessageList
        groupedMessages={groupedMessages}
        dateLabel={dateLabel}
        activeMessagesFlat={[]}
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
        messagesContainerRef={messagesContainerRef}
        messageRefs={messageRefs}
        savedMessageIds={savedMessageIds}
        emptyStateTitle={emptyStateTitle}
        emptyStateSubtitle={emptyStateSubtitle}
      />

      <ChatInput
        handleSendMessage={handleSendMessage}
        messageInputRef={messageInputRef}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleInputKeyDown={handleInputKeyDown}
        model={model}
        setModel={setModel}
      />

      {showPinMessageLimitToast && (
        <div className="pin-limit-toast">
          <div className="pin-limit-toast-inner">
            <div className="pin-limit-text">
              <div className="pin-limit-message">
                You can pin up to 3 messages in a chat.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
