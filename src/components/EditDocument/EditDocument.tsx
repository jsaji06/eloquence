import { useState, useEffect } from 'react'
import Editor from '../Tiptap/Editor/Editor';
import Header from '../Tiptap/Header/Header';
import AISummary from '../AISummary/AISummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Alert from '../Alert/Alert';
import Overlay from '../Overlay/Overlay';
import { type Response } from '../../Types';
import { useParams } from 'react-router-dom';
import { doc, getFirestore, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import { updateDocument } from '../HelperFunctions';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';


function EditDocument() {
 const { document_id } = useParams()
 const navigate = useNavigate();


 const html_tag_regex = new RegExp("<[^>]+>", "g")
 const [aiPanelActive, setAiPanelActive] = useState(false);
 const [loadingPanel, setLoadingPanel] = useState(false);
 const [text, setText] = useState("");
 const [title, setTitle] = useState("");
 const [aiData, setAIData] = useState<Response[]>();
 const [feedback, setFeedback] = useState<Array<any>>([]);
 const [message, setMessage] = useState<string | undefined>(undefined)
 const [recentlyModified, setRecentlyModified] = useState<Timestamp>();
 const [loading, setLoading] = useState(false);
 const [feedbackPanel, setFeedbackPanel] = useState(false);


 const db = getFirestore();
 const auth = getAuth();

 useEffect(() => {
  const unsubscribed = onAuthStateChanged(auth, (auth_user) => {
    if (!auth_user) {
        setMessage("You've been signed out. Redirecting you.")
        navigate("/")
        return;
    }  
  
  else {
   let getDocument = async () => {
     let d = doc(db, "documents", document_id!);
     setLoading(true);
     try {
       let document = await getDoc(d);
       console.log(document);
       if (document.exists()) {
         let data = document.data();
         setTitle(data.title);
         setText(data.content);
         setRecentlyModified(data.recentlyModified);
         setLoading(false);
         setAIData(data.aiData);
       }
     } catch (err) {
       console.log(err);
       navigate("/login");
     }
   }
   getDocument();
  }
  })
  return () => {
    unsubscribed()
  }
 }, [auth])


 let review = (writing?: string) => {
   if (loadingPanel) setMessage("Please wait. An analysis is pending.")
   if (title == "") setMessage("Please write a title.")
   else if (text.split(" ").length < 25) {
     setMessage("You must write at least 25 words before requesting an analysis.");
   }
   else {
    setFeedbackPanel(false);
    setFeedback([])
     setLoadingPanel(true);
     setAiPanelActive(true);
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
         if (response.status === 200) return response.json()
          else {
            throw new Error("Error");
          }
       })
       .then((data: Response[]) => {
         setLoadingPanel(false);
         setAIData(data);
         setFeedback([]);
         updateDocument(document_id!, undefined, undefined, data);
        
       })
       .catch(_ => {
         setLoadingPanel(false);
         setAiPanelActive(false);
         setMessage("An error occured. Please try again.");
       })
   }
 }
 let wordCount = text.replace(html_tag_regex, "").split(" ").length;
 return (
   <>
     {loading && <Loading />}
     {message && <Alert message={message} setMessage={setMessage} />}
     <div className="container">


       {message && <Overlay />}
       <PanelGroup direction="horizontal" className="eContainer">
         <Panel minSize={40} className='editorContainer panel' style={{ overflowY: "scroll", height: "100%;" }}>
           <button onClick={e => {
             navigate("/dashboard")
           }}><FontAwesomeIcon icon={faArrowLeft} /></button>
           <div className="menuHeader" style={{width:"fit-content"}}>


             {(() => {
               return <><p className="saved">{wordCount} words</p>●<p className='time'>Last modified {recentlyModified && recentlyModified.toDate().getMonth() + 1}/{recentlyModified?.toDate().getDate()}/{recentlyModified?.toDate().getFullYear()} {recentlyModified && (
                 recentlyModified.toDate().getHours() > 12
                   ? recentlyModified.toDate().getHours() - 12
                   : recentlyModified.toDate().getHours()
               )}:{String(recentlyModified?.toDate().getMinutes()).padStart(2, '0')} {recentlyModified && (
                 recentlyModified.toDate().getHours() > 12
                   ? "pm"
                   : "am"
               )}</p></>
             })()}
             ●<FontAwesomeIcon title={"Hello"} icon={faBrain} className="icon" style={{ "display": aiData ? "block" : "none" }} onClick={() => setAiPanelActive(true)} />
           </div>
           <Header docId={document_id!} setTitle={setTitle} title={title} />
           <Editor feedbackPanel={feedbackPanel} feedback={feedback} setFeedback={setFeedback} aiData={aiData!} docId={document_id!} title={title} loading={loadingPanel} review={review} setText={setText} text={text} setRecentlyModified={setRecentlyModified} />
           <button style={{ display: wordCount < 25 || (aiPanelActive || loadingPanel) ? "none" : "flex" }} className="aiBtn" onClick={() => {
             review()
           }}><FontAwesomeIcon className="icon" icon={faBrain} /> <p>Review with AI</p> </button>
         </Panel>
         <PanelResizeHandle disabled={!aiPanelActive} className="resizeHandle" />
         <Panel className="panel aiPanel" minSize={40} style={{ display: aiPanelActive ? "block" : 'none' }}>
           <AISummary setFeedbackPanel={setFeedbackPanel} feedbackPanel={feedbackPanel} feedback={feedback} setFeedback={setFeedback} setAiPanelActive={setAiPanelActive} aiData={aiData!} loading={loadingPanel} />
         </Panel>
       </PanelGroup>
     </div >
   </>
 )
}


export default EditDocument



