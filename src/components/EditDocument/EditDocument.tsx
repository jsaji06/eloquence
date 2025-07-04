import { useState } from 'react'
import Editor from '../Tiptap/Editor/Editor';
import Header from '../Tiptap/Header/Header';
import AISummary from '../AISummary/AISummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Alert from '../Alert/Alert';
import Overlay from '../Overlay/Overlay';
import { type Response } from '../../Types';

function EditDocument() {
  const html_tag_regex = new RegExp("<[^>]+>", "g")
  const [aiPanelActive, setAiPanelActive] = useState(false);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [aiData, setAIData] = useState<Response[]>();
  const [message, setMessage] = useState<string | undefined>(undefined)


  let review = (writing?: string) => {
    if (loadingPanel) setMessage("Please wait. An analysis is pending.")
    if (title == "") setMessage("Please write a title.")
    else if (text.split(" ").length < 25) {
      setMessage("You must write at least 25 words before requesting an analysis.");
    }
    else {
      setLoadingPanel(true);
      setAiPanelActive(true);
      console.log("Button clicked, request requesting")
      fetch("http://localhost:8000/get_points", {
        method: "POST",
        body: JSON.stringify({
          writing: writing ?? text,
        }),
        headers: {
          'Content-Type': "application/json"
        }
      })
        .then(response => {
          console.log("Test")
          console.log(response.status);
          if (response.status === 200) return response.json()


        })
        .then((data: Response[]) => {
          setLoadingPanel(false);
          setAIData(data);
        })
        .catch(_ => {
          setLoadingPanel(false);
          setAiPanelActive(false);
          setMessage("An error occured. Please try again.");
        })
    }
  }
  let wordCount = text.replace(html_tag_regex, "").split(" ").length;
  console.log(text.split(" ").filter(word => word !== "" && html_tag_regex.test(word)));
  return (
    <>
      {message && <Alert message={message} setMessage={setMessage} />}
      <div className="container">

        {message && <Overlay />}
        <PanelGroup direction="horizontal" className="eContainer">
          <Panel minSize={40} className='editorContainer panel' style={{ overflowY: "scroll", height: "100%;" }}>
            <div className="menuHeader">
              {(() => {
                return <p className="saved">{wordCount} words</p>
              })()}
              <FontAwesomeIcon icon={faBrain} className="icon" style={{ "display": aiData ? "block" : "none" }} onClick={() => setAiPanelActive(true)} />
            </div>
            <Header setTitle={setTitle} />
            <Editor title={title} loading={loadingPanel} review={review} setText={setText} />
            <button style={{ display: wordCount < 25 || (aiPanelActive || loadingPanel) ? "none" : "flex" }} className="aiBtn" onClick={() => {
              review()
            }}><FontAwesomeIcon className="icon" icon={faBrain} /> <p>Review with AI</p> </button>
          </Panel>
          <PanelResizeHandle disabled={!aiPanelActive} className="resizeHandle" />
          <Panel className="panel aiPanel" minSize={40} style={{ display: aiPanelActive ? "block" : 'none' }}>
            <AISummary setAiPanelActive={setAiPanelActive} aiData={aiData!} loading={loadingPanel} />
          </Panel>
        </PanelGroup>
      </div >
    </>
  )
}

export default EditDocument
