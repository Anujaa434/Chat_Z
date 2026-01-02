import React from "react";

const PinnedBar = ({
  pinnedMessages,
  pinnedBarIndex,
  currentPinnedForBar,
  pinPreview,
  onPinnedBarClick,
}) => {
  if (!pinnedMessages.length || !currentPinnedForBar) return null;

  // Calculate display index (handle -1 initial state)
  const displayIndex = pinnedBarIndex < 0 ? 0 : pinnedBarIndex % pinnedMessages.length;

  return (
    <button
      type="button"
      className="pinned-bar pinned-single-bar"
      onClick={onPinnedBarClick}
    >
      <div className="pinned-main-text">
        <div className="pinned-label-line">
          <span className="pinned-label">📌 Pinned</span>
          <span className="pinned-index">
            {displayIndex + 1}/
            {pinnedMessages.length}
          </span>
        </div>
        <div className="pinned-preview-line">
          {pinPreview(currentPinnedForBar.text)}
        </div>
      </div>

      <div className="pinned-indicator">
        {Array.from({ length: pinnedMessages.length }).map((_, i) => {
          // Bottom segment (last index) → most recent pinned message (index 0)
          // Top segment (index 0) → oldest pinned message (last index)
          const activeLine = (pinnedMessages.length - 1) - displayIndex;
          const isActive = i === activeLine;
          return (
            <span
              key={i}
              className={`pinned-indicator-line ${isActive ? "active" : ""}`}
            />
          );
        })}
      </div>
    </button>
  );
};

export default PinnedBar;
