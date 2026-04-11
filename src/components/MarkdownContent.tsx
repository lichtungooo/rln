import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'

interface MarkdownContentProps {
  markdown: string
  className?: string
}

export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Markdown,
    ],
    content: markdown,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className ?? ''}`,
      },
    },
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(markdown, { emitUpdate: false })
    }
  }, [markdown, editor])

  if (!editor) return null
  return <EditorContent editor={editor} />
}
