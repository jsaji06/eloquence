import { type SetStateAction, type Dispatch } from 'react'
import './style.css'
import { type Response } from '../../Types';
import SubsectionView from '../SubsectionView/SubsectionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faArrowLeft, faAmbulance, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { type Point } from '../../Types';
import Alert from '../Alert/Alert';
import Feedback from '../Feedback/Feedback';


interface AISummaryProps {
  loading: boolean;
  aiData: Response[];
  setAiPanelActive: Dispatch<SetStateAction<boolean>>;
  feedback:Array<any>;
  setFeedback:Dispatch<SetStateAction<Array<any>>>;
  feedbackPanel:boolean;
  setFeedbackPanel:Dispatch<SetStateAction<boolean>>;
  setActiveText: Dispatch<SetStateAction<string>>;
  setActiveColor: Dispatch<SetStateAction<string>>;

}

export default function AISummary(props: AISummaryProps) {
  const [selectedPoints, setSelectedPoints] = useState<Array<Point>>([]);
  const [loadMorePanel, setLoadMorePanel] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined)

  let getExtraFeedback = () => {
    setLoadMorePanel(true);
    props.setFeedback([])
    props.setFeedbackPanel(true);
    fetch("http://localhost:8000/get_advice", {
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
      else console.log(response.status)

    })

    .then(data => {
      console.log(data.response)
      setLoadMorePanel(false);
      // setMoreAnalysis(data.response)
      props.setFeedback(data.response)
    })
    .catch(err => {
      setMessage("A problem occured. Please try again.")
    })
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
      icon={faAmbulance}
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
          {selectedPoints.length > 0 && <button style={{backgroundColor:"#141414", color:"#b8b8b8", marginBottom:"20px"}} onClick={e => {
            e.preventDefault();
            getExtraFeedback();
          }}>Get extra feedback</button>}

          {props.aiData?.map((subsection:Response) => (
            <SubsectionView subsection={subsection} points={selectedPoints} setPoints={setSelectedPoints} />
          ))}
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
            <Feedback setActiveColor={props.setActiveColor} setActiveText={props.setActiveText} feedback={subsection} index={i} />
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
