import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Markdown,
    ],
    content: value,
    onUpdate({ editor }) {
      const md = (editor.storage as Record<string, unknown>).markdown as {
        getMarkdown: () => string
      }
      onChange(md.getMarkdown())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[140px] p-3',
        'data-placeholder': placeholder ?? 'Was möchtest du erzählen?',
      },
    },
  })

  // Wenn der externe Wert sich ändert (z.B. beim Reset), Editor synchronisieren
  useEffect(() => {
    if (editor && value !== (editor.storage as Record<string, unknown>).markdown) {
      const current = (editor.storage as Record<string, { getMarkdown: () => string }>)
        .markdown?.getMarkdown()
      if (current !== value) {
        editor.commands.setContent(value, { emitUpdate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  return (
    <div className="rounded-lg border border-input overflow-hidden bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `p-2 rounded-md transition hover:bg-muted ${
      active ? 'bg-muted text-foreground' : 'text-muted-foreground'
    }`

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link-Adresse', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 p-1">
      <button
        type="button"
        className={btn(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Fett"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Kursiv"
      >
        <Italic className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn(editor.isActive('heading', { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Überschrift"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn(editor.isActive('heading', { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Unter-Überschrift"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Liste"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Nummerierte Liste"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Zitat"
      >
        <Quote className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn(editor.isActive('link'))}
        onClick={addLink}
        title="Link einfügen"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Rückgängig"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Wiederherstellen"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  )
}
