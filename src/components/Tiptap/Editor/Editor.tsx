import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import { useEffect, useState, type ChangeEvent, type SetStateAction, type Dispatch } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faListOl } from '@fortawesome/free-solid-svg-icons'
import { Color } from '@tiptap/extension-color'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from "@tiptap/extension-text-style";
import './style.css'
import { updateDocument } from '../../HelperFunctions'
import { Timestamp } from 'firebase/firestore'
import { type Response, type Point } from '../../../Types'
import { type ActiveText } from '../../../Types'
import { type Editor as TiptapEditor } from '@tiptap/react'

const html_tag_regex = new RegExp("<[^>]+>")

const extensions = [StarterKit, Heading, Underline, Highlight.configure({ multicolor: true }), TextStyle, Color, Placeholder.configure({ placeholder: "Your masterpiece begins here. To enable AI features, write at least 25 words. This editor has Markdown support.", emptyEditorClass: "empty-editor" })]

interface EditorProps {
  docId: string;
  text: string;
  setText: (value: string) => void;
  review: (value?: string) => void
  loading: boolean;
  title: string;
  setRecentlyModified: Dispatch<SetStateAction<Timestamp | undefined>>
  aiData: Response[]
  feedback: Array<any>
  setFeedback: Dispatch<SetStateAction<Array<any>>>
  feedbackPanel: boolean
  activeText: ActiveText;
  aiPanel: boolean
}

const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions,
    content: props.text,
    editorProps: {
      attributes: {
        class: 'editor'
      }
    },
    onUpdate: ({ editor }) => {
      props.setText(editor.getHTML());
      updateDocument(props.docId, undefined, editor.getHTML(), undefined);
      props.setRecentlyModified(Timestamp.now());
    }
  })
  useEffect(() => {

    if (editor && props.text !== editor.getHTML()) {
      editor.commands.setContent(props.text);
    }
  }, [props.text])
  useEffect(() => {
    const doc = editor?.state.doc;
    if (!doc || !doc.textContent.trim()) {
      return;
    }
    if (!props.activeText) return

    if (!editor || !props.aiData) return;
    if (props.feedbackPanel !== true) {
      editor?.chain().setTextSelection({ from: 0, to: editor.state.doc.content.size }).unsetMark("highlight").unsetHighlight().run()
      props.aiData.forEach((data: Response) => {
        data.points.forEach((point: Point) => {
          point.highlighted_text.forEach((text: string) => {
            highlight(editor, text, point.color)
            return;
          })
        })


      })
      editor?.chain().setTextSelection(0)
    } else {
        editor?.chain().setTextSelection({ from: 0, to: editor.state.doc.content.size }).unsetMark("highlight").unsetHighlight().run()
        props.feedback.map((subsection:any, i) => {
        if (subsection.highlighted) {
          subsection.point.highlighted_text.map((text: string) => {
            let positions = findText(editor, text)
            console.log(positions)
            highlight(editor, text, subsection.point.color)
            return;
          })
        }
      })

    }

  }, [editor, props.aiData, props.feedbackPanel, props.feedback, props.activeText.text, props.activeText.color])

  // Utility to normalize quotes and whitespace
  const normalize = (str: string) =>
    str
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

  function findText(editor:TiptapEditor, text:string){
    const normalizedRaw = normalize(editor.getText());
    const normIndex = normalizedRaw.indexOf(normalize(text));
    if (normIndex !== -1) {
      let from = normIndex + 1;
      let to = normIndex + text.length + 1
      let offset = (editor.getText().slice(from).length) - normalize(editor.getText().slice(from)).length
      from += offset
      return {from, to}
    }
    else return null
  }
  function highlight(editor: TiptapEditor, text: string, color: string) {
    let positions = findText(editor, text);
    if(positions){
      let from = positions.from;
      let to = positions.to;
      editor.chain()
        .setTextSelection({ from, to })
        .setMark("highlight", { color: color })
        .setTextSelection(from)
        .unsetMark("highlight")
        .unsetHighlight()
        .run()
    }
  }


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

