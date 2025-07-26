import { useState, useEffect } from 'react'

import Header from '../Tiptap/Header/Header';
import AISummary from '../AISummary/AISummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Alert from '../Alert/Alert';
import Overlay from '../Overlay/Overlay';
import { type Response } from '../../Types';
import { useNavigate } from 'react-router-dom';
import '../../index.css'
import GuestEditor from "./GuestEditor"
import { type FeedbackResponse } from '../../Types';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

function EditDocument() {

    const navigate = useNavigate();


    const html_tag_regex = new RegExp("<[^>]+>", "g")
    const [aiPanelActive, setAiPanelActive] = useState(false);
    const [loadingPanel, setLoadingPanel] = useState(false);
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [aiData, setAIData] = useState<Response[]>();
    const [feedback, setFeedback] = useState<Array<FeedbackResponse>>([]);
    const [feedbackPanel, setFeedbackPanel] = useState(false);
    const [activeText, setActiveText] = useState("");
    const [activeColor, setActiveColor] = useState("");
    const [actions, setActions] = useState(5);
    const [message, setMessage] = useState<string | undefined>();
    const [button, setButton] = useState<() => void | undefined>();
    const [hide, setHide] = useState(false);

    const auth = getAuth();

    let redirectGuest = () => {
        setHide(true);
        navigate("/signup", {
            state: {
                title: title,
                content: text,
                dateCreated: new Date(),
                recentlyModified: new Date(),
                trash: false,
                aiData: aiData
            }
        })
    }

    useEffect(() => {
        if (actions <= 0) {
            setMessage("Like Eloquence so far? Sign up so that you don't lose your feedback.")
            setButton(() => redirectGuest);
        }
    }, [actions])

    useEffect(() => {

        const unsubscribed = onAuthStateChanged(auth, (auth_user) => {
            if (auth_user) {
                navigate("/dashboard")
                return;
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
            setAIData([])
            setFeedback([])
            setLoadingPanel(true);
            setAiPanelActive(true);
            fetch("https://eloquence-68ro.onrender.com/get_points", {
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
            {message && <Alert message={message} setMessage={setMessage} customButtonHandler={button} />}
            <div className="container" style={{display: !hide ? "block" : "none"}}>
                {message && <Overlay />}
                <PanelGroup direction="horizontal" className="eContainer">
                    <Panel minSize={40} className='editorContainer panel' style={{ overflowY: "scroll", height: "100%;" }}>
                        <button id="exitDoc" onClick={() => {
                            setActions(prev => prev - 1)
                            navigate("/dashboard")
                        }}><FontAwesomeIcon icon={faArrowLeft} /></button>
                        <div className="menuHeader" style={{ width: "fit-content" }}>
                            {(() => {
                                return <><p className="saved">{wordCount} words</p></>
                            })()}
                            ●<FontAwesomeIcon title={"Hello"} icon={faBrain} className="icon" style={{ "display": aiData ? "block" : "none" }} onClick={() => setAiPanelActive(true)} />
                            ●<FontAwesomeIcon title={"Hello"} icon={faBrain} className="icon" style={{ "display": aiData ? "block" : "none" }} onClick={() => setAiPanelActive(true)} />
                        </div>
                        <Header docId="GUEST" setTitle={setTitle} title={title} />
                        <GuestEditor setActions={setActions} setMessage={setMessage} setAiData={setAIData} activeText={{ "text": activeText, "color": activeColor }} aiPanel={aiPanelActive} feedbackPanel={feedbackPanel} feedback={feedback} setFeedback={setFeedback} aiData={aiData!} title={title} loading={loadingPanel} review={review} setText={setText} text={text} />
                        <button style={{ display: (wordCount < 25 || wordCount >= 1500) || (aiPanelActive || loadingPanel) ? "none" : "flex" }} className="aiBtn" onClick={() => {
                            review()
                        }}><FontAwesomeIcon className="icon" icon={faBrain} /> <p>Review with AI</p> </button>
                    </Panel>
                    <PanelResizeHandle disabled={!aiPanelActive} className="resizeHandle" />
                    <Panel className="panel aiPanel" minSize={40} style={{ display: aiPanelActive ? "block" : 'none' }}>
                        <AISummary setActions={setActions} docId="GUEST" setAiData={setAIData} setActiveText={setActiveText} setActiveColor={setActiveColor} setFeedbackPanel={setFeedbackPanel} feedbackPanel={feedbackPanel} feedback={feedback} setFeedback={setFeedback} setAiPanelActive={setAiPanelActive} aiData={aiData!} loading={loadingPanel} />
                    </Panel>
                </PanelGroup>
            </div >
        </>
    )
}


export default EditDocument



