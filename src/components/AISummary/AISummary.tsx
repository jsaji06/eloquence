import { type SetStateAction, type Dispatch } from 'react'
import './style.css'
import { type Response } from '../../Types';
import SubsectionView from '../SubsectionView/SubsectionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faArrowLeft, faComments } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { type Point } from '../../Types';
import Alert from '../Alert/Alert';
import Feedback from '../Feedback/Feedback';
import { updateDocument } from '../HelperFunctions';
import {type FeedbackResponse} from '../../Types'

interface AISummaryProps {
  loading: boolean;
  aiData: Response[];
  setAiPanelActive: Dispatch<SetStateAction<boolean>>;
  feedback:Array<FeedbackResponse>;
  setFeedback:Dispatch<SetStateAction<Array<FeedbackResponse>>>;
  feedbackPanel:boolean;
  setFeedbackPanel:Dispatch<SetStateAction<boolean>>;
  setActiveText: Dispatch<SetStateAction<string>>;
  setActiveColor: Dispatch<SetStateAction<string>>;
  docId:string;
  setAiData:Dispatch<SetStateAction<Response[] | undefined>>
  actions?:number
  setActions?:Dispatch<SetStateAction<number>>

}

export default function AISummary(props: AISummaryProps) {
  const [selectedPoints, setSelectedPoints] = useState<Array<Point>>([]);
  const [loadMorePanel, setLoadMorePanel] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined)
  let fetchFeedback = () => {
    setLoadMorePanel(true);
    props.setFeedback([])
    props.setFeedbackPanel(true);
    fetch("https://eloquence-68ro.onrender.com/get_advice", {
      method: "POST",
      body: JSON.stringify({
        points: selectedPoints
      }),
      headers: {
        'Content-Type': "application/json"
      }
    })
    .then(response => {
      if(response.status === 200)
        return response.json()


    })

    .then(data => {
      setLoadMorePanel(false);
      props.setFeedback(data.response)
      if(props.docId !== "GUEST")
        updateDocument(props.docId, undefined, undefined, undefined, data.response);
    })
    .catch(() => {
      setMessage("A problem occured. Please try again.")
    })
  }
  let getExtraFeedback = () => {
    if(props.setActions && props.actions){
      props.setActions(prev => prev - 1)
      if(props.actions && props.actions <= 0) return;
      else if(props.actions > 0) fetchFeedback()
    }
    else fetchFeedback()
    
}

  return (
    <>
  {message && <Alert message={message} setMessage={setMessage} />}
  <div className="aiSummaryPanel">
  
    {!props.feedbackPanel && (
      
      props.loading ? (
        <>
        <nav className="navPanel">
        <FontAwesomeIcon
    icon={faX}
    className="icon exit"
    onClick={() => {
      props.setAiPanelActive(false);
    }}
  />
  </nav>
        <div className="loadingScreen">
          <h1 style={{ textAlign: 'center' }}>
            Thoroughly analyzing your masterpiece. Hang tight!
          </h1>
        </div>
        </>
      ) : (
        <>
        <nav className="panelNav">
          <FontAwesomeIcon
      icon={faX}
      className="icon exit"
      onClick={() => {
        props.setAiPanelActive(false);
      }}
    />
    {props.feedback.length > 0  && <FontAwesomeIcon
      icon={faComments}
      className="icon exit"
      onClick={() => {
        props.setFeedbackPanel(true)
      }}
    />}
  </nav>
        <div className="content">
          <h1>Nice start so far! Here's what we got for you.</h1>
          <p>
            Collapse each section to view what we suggested you cover/think
            about for the corresponding header. The color of the highlighted text corresponds to the color-coded section of our feedback.
          </p>
          <p>You can select up to 3 pieces of feedback to request a deeper analysis on each of them.</p>
          {selectedPoints.length > 0 && <button style={{backgroundColor:"", marginBottom:"20px"}} onClick={e => {
            e.preventDefault();
            getExtraFeedback();
          }}>Get extra feedback</button>}

          {props.aiData?.map((subsection:Response, i:number) => {
            if(subsection){
            return (<SubsectionView key={i} subsection={subsection} points={selectedPoints} setPoints={setSelectedPoints} aiData={props.aiData} setAiData={props.setAiData} />)
            }
          }
          )}
        </div>
        </>
      )
    )}
    {props.feedbackPanel && (
      loadMorePanel ? (
        <>
        <nav className="navPanel">
        <FontAwesomeIcon
    icon={faX}
    className="icon exit"
    onClick={() => {
      props.setAiPanelActive(false);
    }}
    
  />
</nav>
        <div className="loadingScreen">
          <h1 style={{ textAlign: 'center' }}>
            Providing you more insightful feedback. Sit back and hold tight.
          </h1>
        </div>
        </>
      ) : (
        <>
        <nav className="panelNav">
        <FontAwesomeIcon
    icon={faArrowLeft}
    className="icon exit"
    onClick={() => {
      props.setFeedbackPanel(false);
      props.setAiPanelActive(true);
    }}
    
  /> 
  </nav>
        <div className="content">
          <h1>Here’s more tailored advice for your writing.</h1>
          <p>
          The points are color-coded based on what you have requested.
          </p>

          {props.feedback?.map((subsection:any, i:number) => {            
          return (            
            <Feedback key={i} setActiveColor={props.setActiveColor} setActiveText={props.setActiveText} feedback={subsection} index={i} feedbackList={props.feedback} setFeedbackList={props.setFeedback} />
          )})}
        </div>
        </>
      )
    )}
  </div>
  <br />
</>
  )
}
