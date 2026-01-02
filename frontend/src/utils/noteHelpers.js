/**
 * Utility functions for note content manipulation
 */

/**
 * Build a preview text from content
 */
export function buildPreview(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= 90) return trimmed;
  return trimmed.slice(0, 90) + "…";
}

/**
 * Build note.content from its entries so preview stays in sync
 */
export function rebuildNoteContentFromEntries(entries) {
  if (!entries || !entries.length) return "";
  const parts = [];

  entries.forEach((e) => {
    if (e.isManual) {
      parts.push(`Note: ${e.userText}`);
    } else {
      const seg = [];
      if (e.messageId) seg.push(`ID: ${e.messageId}`);
      seg.push(`You: ${e.userText}`);
      if (e.aiText) seg.push(`AI: ${e.aiText}`);
      parts.push(seg.join("\n\n"));
    }
  });

  return parts.join("\n\n---\n\n");
}

/**
 * Parse note.content back into entries (reverse of rebuildNoteContentFromEntries)
 */
export function parseEntriesFromContent(content) {
  if (!content || !content.trim()) return [];

  const entries = [];
  const blocks = content.split("\n\n---\n\n");

  blocks.forEach((block, idx) => {
    block = block.trim();
    if (!block) return;

    if (block.startsWith("Note: ")) {
      // Manual note entry with "Note: " prefix
      entries.push({
        id: Date.now() + idx,
        messageId: null,
        userText: block.replace(/^Note: /, ""),
        aiText: "",
        isManual: true,
      });
    } else if (block.includes("You: ") && block.includes("AI: ")) {
      // Chat entry (has both "You:" and "AI:")
      const lines = block.split("\n\n");
      let userText = "";
      let aiText = "";
      let messageId = null;

      lines.forEach((line) => {
        if (line.startsWith("ID: ")) {
          const idStr = line.replace(/^ID: /, "").trim();
          const idNum = parseInt(idStr, 10);
          if (!Number.isNaN(idNum)) messageId = idNum;
        } else if (line.startsWith("You: ")) {
          userText = line.replace(/^You: /, "");
        } else if (line.startsWith("AI: ")) {
          aiText = line.replace(/^AI: /, "");
        }
      });

      if (userText) {
        entries.push({
          id: Date.now() + idx,
          messageId,
          userText,
          aiText,
          isManual: false,
        });
      }
    } else if (block.includes("You: ")) {
      // Chat entry (has "You:" but no "AI:")
      let messageId = null;
      const idMatch = block.match(/ID:\s*(\d+)/);
      if (idMatch) {
        const idNum = parseInt(idMatch[1], 10);
        if (!Number.isNaN(idNum)) messageId = idNum;
      }
      const userText = block
        .replace(/^ID:.*\n\n/, "")
        .replace(/^You: /, "")
        .replace(/\n\n.*/, "");
      const aiMatch = block.match(/AI: (.+)/);
      const aiText = aiMatch ? aiMatch[1] : "";

      if (userText) {
        entries.push({
          id: Date.now() + idx,
          messageId,
          userText,
          aiText,
          isManual: false,
        });
      }
    } else {
      // Plain text entry (no prefix - treat as manual note)
      entries.push({
        id: Date.now() + idx,
        messageId: null,
        userText: block,
        aiText: "",
        isManual: true,
      });
    }
  });

  return entries;
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex, percent) {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}

export const folderColors = [
  "#06B6D4",
  "#6366F1",
  "#22C55E",
  "#EAB308",
  "#F97373",
  "#A855F7",
  "#0EA5E9",
  "#F97316",
];
