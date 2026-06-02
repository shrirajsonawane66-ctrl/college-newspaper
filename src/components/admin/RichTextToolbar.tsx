"use client";

import { useCallback } from "react";
import {
  Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered,
  Pilcrow, SeparatorHorizontal, Quote as QuoteIcon, Image,
} from "lucide-react";

interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (before: string, after: string) => void;
}

type FormatAction = {
  label: string;
  icon: typeof Bold;
  title: string;
  getTags: () => [string, string];
};

const ACTIONS: FormatAction[] = [
  { label: "H2", icon: Heading1, title: "Section Heading", getTags: () => ["<h2>", "</h2>\n"] },
  { label: "H3", icon: Heading2, title: "Subheading", getTags: () => ["<h3>", "</h3>\n"] },
  { label: "B", icon: Bold, title: "Bold", getTags: () => ["<strong>", "</strong>"] },
  { label: "I", icon: Italic, title: "Italic", getTags: () => ["<em>", "</em>"] },
  { label: "\u201C", icon: Quote, title: "Blockquote", getTags: () => ["\n<blockquote>\n<p>", "</p>\n</blockquote>\n"] },
  { label: "\u201E", icon: QuoteIcon, title: "Pull Quote", getTags: () => ["\n<div class=\"editorial-pullquote\">", "</div>\n"] },
  { label: "\u2022", icon: List, title: "Bullet List", getTags: () => ["\n<ul>\n<li>", "</li>\n</ul>\n"] },
  { label: "1.", icon: ListOrdered, title: "Numbered List", getTags: () => ["\n<ol>\n<li>", "</li>\n</ol>\n"] },
  { label: "\u2014", icon: SeparatorHorizontal, title: "Divider", getTags: () => ["\n<hr />\n", ""] },
  { label: "P", icon: Pilcrow, title: "Paragraph", getTags: () => ["<p>", "</p>\n"] },
  { label: "IMG", icon: Image, title: "Image", getTags: () => ['\n<img src="" alt="" />\n<div class="image-caption">Caption</div>\n', ""] },
];

export default function RichTextToolbar({ textareaRef, onInsert }: RichTextToolbarProps) {
  const handleAction = useCallback((action: FormatAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);

    const [openTag, closeTag] = action.getTags();

    if (selected) {
      const before = text.substring(0, start);
      const after = text.substring(end);
      ta.value = before + openTag + selected + closeTag + after;
      ta.selectionStart = ta.selectionEnd = start + openTag.length + selected.length + closeTag.length;
    } else {
      const [tagOpen, tagClose] = action.getTags();
      onInsert(tagOpen, tagClose);
    }

    ta.focus();
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }, [textareaRef, onInsert]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 border border-border bg-paper-dark/50 rounded-sm">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.title}
            type="button"
            onClick={() => handleAction(action)}
            title={action.title}
            className="p-1.5 text-ink-lighter hover:text-ink hover:bg-paper-dark transition-colors rounded-sm"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
