import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faX } from '@fortawesome/free-solid-svg-icons'
import '../index.css'
import Overlay from '../components/Overlay/Overlay'
import { type Dispatch, type SetStateAction } from 'react'
import { useState } from 'react'

interface ModalProps {
    modal:boolean;
    setModal:Dispatch<SetStateAction<boolean>>
    setDemoTitle: Dispatch<SetStateAction<string>>
    setDemoPara: Dispatch<SetStateAction<string>>
}

export default function DemoTestModal(props:ModalProps) {
  let dummyText = [
    {
    "title":"The Paradox Behind Generative Art",
    "content":"The issue of AI-generated art doesn’t only lie in visual pieces, such as paintings, drawings, or animated films. One could extend this question to other forms of art or modes of human expression and creation, such as literature and music. Regardless, the point still remains - whether AI can generate novels or exquisite illustrations, they still lack the soul and humanity that human-curated art has. There’s no intrinsic meaning behind what a computer generates or what it could generate, and there never will be. And if we continue to treat computer and human-generated art as the same, then society will surely lose its own humanity.",
    "active":false,
    "selected":false
    },
    {
        "title": "Passion vs. Grit - Who Would Prevail?",
        "content":"Suppose you have two people - we’ll call them Billy and Johnny - working separately on a photography project for a college class. Billy loves photography - he’s the president of the photography club on campus, he runs his own photography social media accounts, and aspires to become a photographer for a large modeling agency. Johnny, on the other hand, could care less about photography. He’s only taking this class to pass a general education requirement. However, Johnny has one quality that many lack - grit. Even if he’s so disinterested about something, he will do whatever it takes to get his desired outcome. In this case, he’s trying to maintain his 4.0 GPA, so he will put as much effort as possible in this photography project. Who is destined to get the better outcome here? In my opinion, Billy will, as most of the effort he puts into his photography is already derived from his passion, so he would love even the most grueling parts of photography. Whereas Johnny’s efforts are derived solely from his strong will to get a good grade, not from his love of photography, which would eventually drain him.",
        "active":false,
        "selected":false
    },
]
let [text, setText] = useState(dummyText);
let [error, setError] = useState("");
  return (
        <>
        {props.modal && <Overlay />}
        <div className="alert">
            <FontAwesomeIcon icon={faX} className="exitIcon" onClick={() => props.setModal(false)}/>
            <h1>Try Eloquence with an Example Paragraph</h1>
            <p>Want to see Eloquence in action instantly? Select a paragraph to enter, then click "Review with AI" to witness the magic.</p>

            <div className="paragraphContainer">
                {text.map((textP, _) => {
                    return (
                <div className={`paragraphDemo`}>
                <div className="paragraphHeader">
                    <h2>{`${textP.selected ? "Selected: " : ""} ${textP.title}`}</h2>
                    <FontAwesomeIcon className="collapseIcon" icon={textP.active ? faMinus : faPlus} onClick={() => {
                        let newText = [...text];
                        for(let i = 0; i < newText.length; i++){
                            if(newText[i] === textP){
                                newText[i].active = !newText[i].active;
                                setText(newText);
                            } else newText[i].active = false;
                        }
                    }} />
                </div>
                <div className="paragraphContent" style={{display: textP.active ? "block" : "none"}}>
                    <p>{textP.content}</p>
                    <button onClick={() => {
                        let newText = [...text];
                        for(let i = 0; i < newText.length; i++){
                            if(newText[i] === textP){
                                newText[i].selected = !newText[i].selected;
                                newText[i].active = false;
                                setText(newText);
                            }
                            else  newText[i].selected = false;
                             
                        }
                    }}>{textP.selected ? "Deselect" : "Select"}</button>
                </div>
                </div>
                )})}
                
            </div>
            <p style={{display:error ? "block" : "none"}}>{error}</p>
            <button onClick={() => {
                let selected = text.filter(t => t.selected);
                if(selected.length === 0) setError("Please select one paragraph, or click the X to exit.")
                props.setDemoTitle(selected[0].title)
                props.setDemoPara(selected[0].content)
                props.setModal(false)
                }}>Submit</button>
            </div>
        </>
  )
}
