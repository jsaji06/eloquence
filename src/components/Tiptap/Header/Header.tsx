import { useEditor, EditorContent } from '@tiptap/react'
import Heading from '@tiptap/extension-heading'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import './style.css'
import React from 'react';

const extensions = [StarterKit, Heading.configure({
  levels: [1],

}), Placeholder.configure({
  placeholder: "Your title"
})]

interface HeaderProps {
  setTitle: (value:string) => void
}


const Header = (props: HeaderProps) => {
  const editor = useEditor({  
    extensions,
    injectCSS:false,
    editorProps: {
      attributes: {
        class: 'header',
      },
      handleKeyDown(view, event) {
        if (event.key === 'Enter') return true
      },
    },
    onUpdate: ({ editor }) => {
      props.setTitle(editor?.getJSON()?.content![0].content![0].text ?? "")
    }

  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}

export default Header