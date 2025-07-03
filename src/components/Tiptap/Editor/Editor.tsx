// src/Tiptap.tsx
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from "@tiptap/extension-text-style";
import './style.css'
import { useEffect, useState, type ChangeEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBold, faDisplay, faItalic, faList, faListOl, faStrikethrough, faUnderline } from '@fortawesome/free-solid-svg-icons'
const html_tag_regex = new RegExp("<[^>]+>")

const extensions = [StarterKit, Heading, Underline, Highlight.configure({ multicolor: true }), TextStyle, Color, Placeholder.configure({ placeholder: "Your masterpiece begins here. To enable AI features, write at least 25 words. This editor has Markdown support.", emptyEditorClass: "empty-editor" })]

interface EditorProps {
  setText: (value: string) => void;
  review: (value?: string) => void
  loading: boolean;
  title:string;

}

const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions,
    content: '',
    editorProps: {
      attributes: {
        class: 'editor',

      }
    },
    onUpdate: ({ editor }) => {
      props.setText(editor.getHTML());
    }
  })

  let getHeadingVal = (level: number) => {
    switch (level) {
      case 1:
        return "h1"
      case 2:
        return "h2"
      case 3:
        return "h3"
      case 4:
        return "h4"
      case 5:
        return "h5"
      case 6:
        return "h6"
      default:
        return "p"
    }
  }

  let changeHeading = (e: ChangeEvent<HTMLSelectElement>) => {
    switch (e.target.value) {
      case "h1":
        editor?.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case "h2":
        editor?.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case "h3":
        editor?.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case "h4":
        editor?.chain().focus().toggleHeading({ level: 4 }).run()
        break
      case "h5":
        editor?.chain().focus().toggleHeading({ level: 5 }).run()
        break
      case "h6":
        editor?.chain().focus().toggleHeading({ level: 6 }).run()
        break;
      case "p":
        editor?.chain().focus().setParagraph().run()
    }
  }

  const [selectedWordCount, setSelectedWordCount] = useState(0);
  useEffect(() => {
    if (editor?.state.selection) {
      const { from, to } = editor?.state.selection;
      let text = editor?.state.doc.textBetween(from, to);
      let count = text.split(" ").filter(word => word.replace(html_tag_regex, "") != "").length
      setSelectedWordCount(count);
    }
  })
  console.log(editor?.getAttributes('heading'))
  return (
    <>

      <EditorContent className="editorContent" editor={editor} />
      <BubbleMenu className="menu bubbleMenu" editor={editor}>
        <p style={{ 'whiteSpace': 'nowrap', 'margin': '0', 'padding': '0 15px' }}> {selectedWordCount} words</p>
        <select value={getHeadingVal(editor?.getAttributes("heading").level)} onChange={(e) => {
          changeHeading(e)
        }}>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={"bubbleBtn" + (editor?.isActive('bold') ? ' active' : '')} style={{ fontWeight: "800" }}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={"bubbleBtn" + (editor?.isActive('italic') ? ' active' : '')} style={{ fontStyle: "italic" }}>I</button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={"bubbleBtn" + (editor?.isActive('underline') ? ' active' : '')} style={{ textDecoration: "underline" }}>U</button>
        <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={"bubbleBtn" + (editor?.isActive('strike') ? ' active' : '')} style={{ textDecoration: "line-through" }}>S</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={"bubbleBtn" + (editor?.isActive('orderedList') ? ' active' : '')}><FontAwesomeIcon icon={faListOl} /></button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={"bubbleBtn" + (editor?.isActive('bulletList') ? ' active' : '')}><FontAwesomeIcon icon={faList} /></button>
        <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={"bubbleBtn" + (editor?.isActive('codeBlock') ? ' active' : '')}>{"</>"}</button>
        <input id="colorPicker" type="color" onInput={(e) => editor?.chain().focus().setColor(e.currentTarget.value).run()} value={editor?.getAttributes("textStyle").color ?? "#b8b8b8"} style={{ 'backgroundColor': editor?.getAttributes("textStyle").color ?? "#b8b8b8" }} />
        <button onClick={() => {
          if (editor?.state.selection) {
            const { from, to } = editor?.state.selection;
            let text = editor?.state.doc.textBetween(from, to);
            if (!props.loading && selectedWordCount >= 25 && props.title != "") editor?.chain().focus().selectAll().unsetHighlight().setTextSelection({ from, to }).setHighlight({ color: "#A99BAD" }).run()
            props.review(text);
          }

        }} style={{ 'display': selectedWordCount < 25 ? 'none' : 'block' }}>Ai</button>

      </BubbleMenu >
      <FloatingMenu tippyOptions={{ placement: "left", offset: [0, 30] }} className="menu floatingMenu" editor={editor}>
        <select value={getHeadingVal(editor?.getAttributes("heading").level)} onChange={(e) => {
          changeHeading(e)
        }}>
          <option value="p">p</option>
          <option value="h1">h1</option>
          <option value="h2">h2</option>
          <option value="h3">h3</option>
          <option value="h4">h4</option>
          <option value="h5">h5</option>
          <option value="h6">h6</option>
        </select>

        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={"bubbleBtn" + (editor?.isActive('bold') ? ' active' : '')} style={{ fontWeight: "800" }}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={"bubbleBtn" + (editor?.isActive('italic') ? ' active' : '')} style={{ fontStyle: "italic" }}>I</button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={"bubbleBtn" + (editor?.isActive('underline') ? ' active' : '')} style={{ textDecoration: "underline" }}>U</button>
        <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={"bubbleBtn" + (editor?.isActive('strike') ? ' active' : '')} style={{ textDecoration: "line-through" }}>S</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={"bubbleBtn" + (editor?.isActive('orderedList') ? ' active' : '')}><FontAwesomeIcon icon={faListOl} /></button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={"bubbleBtn" + (editor?.isActive('bulletList') ? ' active' : '')}><FontAwesomeIcon icon={faList} /></button>
        <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={"bubbleBtn" + (editor?.isActive('codeBlock') ? ' active' : '')}>{"</>"}</button>
        <input id="colorPicker" type="color" onInput={(e) => editor?.chain().focus().setColor(e.currentTarget.value).run()} value={editor?.getAttributes("textStyle").color ?? "#b8b8b8"} style={{ 'backgroundColor': editor?.getAttributes("textStyle").color ?? "#b8b8b8" }} />
      </FloatingMenu >
    </>
  )
}

export default Editor
