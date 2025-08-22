import { useEditor, EditorContent } from '@tiptap/react'
import Heading from '@tiptap/extension-heading'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import './style.css'
import { useEffect } from 'react';
import { updateDocument } from '../../HelperFunctions';

const extensions = [StarterKit, Heading.configure({
  levels: [1],

}), Placeholder.configure({
  placeholder: "Your title..."
})]

interface HeaderProps {
  docId: string;
  title: string;
  setTitle: (value: string) => void
  demoTitle?:string;
}


const Header = (props: HeaderProps) => {
  const editor = useEditor({
    extensions,
    injectCSS: false,
    content: props.title,
    editorProps: {
      attributes: {
        class: 'header',
      },
      transformPastedHTML: (html) => {
          console.log(html);
          return html
      },
      handleKeyDown(_, event) {
        if (event.key === 'Enter') return true
      },
    },
    onUpdate: async ({ editor }) => {
      props.setTitle(editor?.getJSON()?.content![0].content![0].text ?? "")
      if(editor?.getJSON()?.content![0].content![0].text?.length! >= 2){
        console.log("Oopsiedaisy");
      }
      if(props.docId !== "GUEST")
        updateDocument(props.docId, editor?.getJSON()?.content![0].content![0].text, undefined, undefined);
    }

  })
  useEffect(() => {
    if(props.demoTitle){
    if(props.demoTitle !== ""){
      props.setTitle(props.demoTitle)
    }
  }
  }, [props.demoTitle])
  useEffect(() => {
    if (editor && props.title != "" && props.title !== editor.getText()) {
      editor?.commands.setContent(props.title);
    }
  }, [editor, props.title])

  if (!editor) return null

  return <EditorContent editor={editor} />
}

export default Header