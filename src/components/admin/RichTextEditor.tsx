'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write your article here...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: `
          min-height: 400px;
          padding: 20px;
          outline: none;
          font-family: Georgia, serif;
          font-size: 17px;
          line-height: 1.8;
          color: #1a1a1a;
        `,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  const btnStyle = (isActive: boolean) => ({
    padding: '6px 10px',
    border: '1px solid',
    borderColor: isActive ? '#1a1a1a' : '#e2e2e2',
    borderRadius: '4px',
    backgroundColor: isActive ? '#1a1a1a' : '#ffffff',
    color: isActive ? '#ffffff' : '#1a1a1a',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'var(--font-inter)',
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{
      border: '1px solid #e2e2e2',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '10px 12px',
        borderBottom: '1px solid #e2e2e2',
        backgroundColor: '#fafafa',
      }}>
        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={btnStyle(editor.isActive('bold'))}>
          <strong>B</strong>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={btnStyle(editor.isActive('italic'))}>
          <em>I</em>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={btnStyle(editor.isActive('strike'))}>
          <s>S</s>
        </button>

        <div style={{ width: '1px', backgroundColor: '#e2e2e2', margin: '0 4px' }} />

        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={btnStyle(editor.isActive('heading', { level: 2 }))}>
          H2
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={btnStyle(editor.isActive('heading', { level: 3 }))}>
          H3
        </button>

        <div style={{ width: '1px', backgroundColor: '#e2e2e2', margin: '0 4px' }} />

        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={btnStyle(editor.isActive('bulletList'))}>
          • List
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={btnStyle(editor.isActive('orderedList'))}>
          1. List
        </button>

        <div style={{ width: '1px', backgroundColor: '#e2e2e2', margin: '0 4px' }} />

        <button type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={btnStyle(editor.isActive('blockquote'))}>
          &ldquo; Quote
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          style={btnStyle(editor.isActive('code'))}>
          {'<>'} Code
        </button>

        <div style={{ width: '1px', backgroundColor: '#e2e2e2', margin: '0 4px' }} />

        <button type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          style={{ ...btnStyle(false), opacity: editor.can().undo() ? 1 : 0.4 }}>
          ↩ Undo
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          style={{ ...btnStyle(false), opacity: editor.can().redo() ? 1 : 0.4 }}>
          ↪ Redo
        </button>

        <button type="button"
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          style={btnStyle(editor.isActive('link'))}>
          🔗 Link
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          style={{ ...btnStyle(false), marginLeft: 'auto' }}>
          ✕ Clear
        </button>
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror p { margin: 0 0 1em 0; }
        .ProseMirror h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          margin: 1.5em 0 0.5em;
          line-height: 1.2;
        }
        .ProseMirror h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          margin: 1.2em 0 0.4em;
        }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror s { text-decoration: line-through; }
        .ProseMirror blockquote {
          border-left: 3px solid #1a1a1a;
          padding-left: 16px;
          margin: 1em 0;
          font-style: italic;
          color: #555;
        }
        .ProseMirror code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 14px;
        }
        .ProseMirror ul { padding-left: 24px; margin: 0.5em 0; }
        .ProseMirror ol { padding-left: 24px; margin: 0.5em 0; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror a { color: #1a1a1a; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  )
}
