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
  feedback:Array<any>
  setFeedback:Dispatch<SetStateAction<Array<any>>>
  feedbackPanel:boolean
  activeText:ActiveText;
}


const Editor = (props: EditorProps) => {
  console.log(props)
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
    // console.log("active text", props.activeText)
    const container = document.querySelector(".editorContainer");
    editor?.chain().focus().selectAll().unsetHighlight().setTextSelection(0).run()
    if(!props.activeText) return
    if(props.activeText?.text.trim() !== "" && props.feedbackPanel){
      let found = false;
    editor?.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return true;
    
      const raw = node.text;
      const matchIndex = raw.toLowerCase().indexOf(props.activeText.text.toLowerCase());
    
      if (matchIndex !== -1) {
        const from = pos + matchIndex;
        const to = from + props.activeText.text.length;
        editor?.chain().setTextSelection({ from, to }).setMark("highlight", { color: props.activeText.color }).setTextSelection(0).run();
        // Start of GPT-generated code
        const dom = editor.view.domAtPos(from);
      // Find the element at those coordinates
        const el = dom.node.nodeType === 3 ? dom.node.parentElement : dom.node as HTMLElement;

      // Ensure the element exists and is inside the scroll container
        if (el && container?.contains(el)) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
        // If element is outside or deeply nested, fallback to manual scroll
          const coords = editor.view.coordsAtPos(from);
          const containerRect = container?.getBoundingClientRect();
          if (!coords || !containerRect || !container) return;
          const scrollY =(coords.top - containerRect.top + container.scrollTop - container.clientHeight / 2);

          container?.scrollTo({ top: scrollY, behavior: "smooth" });
      } // End of GPT-generated code
        found = true;
        return false; // stop walking this node
      }

      return true;
    })
    if(found) return;
  }  
  editor?.chain().focus().selectAll().unsetHighlight().setTextSelection(0).run()
    if (!editor || !props.aiData) return;
    let rawText = normalize(editor?.state.doc.textBetween(0, editor?.state.doc.content.size, "\n"))
    if(props.feedbackPanel !== true){
    props.aiData.forEach((data: Response) => {
      data.points.forEach((point: Point) => {
        point.highlighted_text.forEach((text: string) => {
          // Start of GPT Code
          editor.state.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return true;
          
            const raw = node.text;
            const matchIndex = raw.toLowerCase().indexOf(text.toLowerCase());
          
            if (matchIndex !== -1) {
              const from = pos + matchIndex;
              const to = from + text.length;
              editor.chain().setTextSelection({ from, to }).setMark("highlight", { color: point.color }).setTextSelection(0).run();
              return false; // stop walking this node
            }
    
            return true;
          })
          // End
        })
      })


    })
  } else {
    props.feedback.map((subsection, i) => {
      subsection.point.highlighted_text.map((text:string) => {
          // Start of GPT Code
          editor.state.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return true;
          
            const raw = normalize(node.text);
            const matchIndex = raw.toLowerCase().indexOf(normalize(text).toLowerCase());
          
            if (matchIndex !== -1) {
              const from = pos + matchIndex;
              const to = from + text.length;
              editor.chain().setTextSelection({ from, to }).setMark("highlight", { color: subsection.point.color }).setTextSelection(to).run();
              return false; // stop walking this node
            }
    
            return true;
          })
          // End 
      })
    })
  }
  console.log("Dick", props.feedbackPanel);
  }, [editor, props.aiData, props.feedbackPanel, props.feedback, props.activeText.text, props.activeText.color])

  useEffect(() => {
    if (editor && props.text !== editor.getHTML()) {
      editor.commands.setContent(props.text);
    }
  }, [editor, props.text]);

  function normalize(text:string){
    return text
    .replace(/[\u2018\u2019]/g, "'")  // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')  // smart double quotes
    .replace(/\u2013|\u2014/g, "-")   // en/em dashes
    .replace(/&nbsp;/g, " ")          // non-breaking space
    .replace(/\s+/g, " ")             // collapse whitespace
    .trim()
    .toLowerCase();
  }

  // useEffect(() => {
    
  // }, [])


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

