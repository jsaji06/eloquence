import { type SetStateAction, type Dispatch } from 'react'
import './style.css'
import { type Response } from '../../Types';
import SubsectionView from '../SubsectionView/SubsectionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faArrowLeft, faAmbulance, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { type Point } from '../../Types';


interface AISummaryProps {
  loading: boolean;
  aiData: Response[];
  setAiPanelActive: Dispatch<SetStateAction<boolean>>;
  feedback:Array<any>;
  setFeedback:Dispatch<SetStateAction<Array<any>>>;
  feedbackPanel:boolean;
  setFeedbackPanel:Dispatch<SetStateAction<boolean>>;
}

export default function AISummary(props: AISummaryProps) {
  const [selectedPoints, setSelectedPoints] = useState<Array<Point>>([]);
  // const [betterAnalysisView, setBetterAnalysisView] = useState(false);
  const [loadMorePanel, setLoadMorePanel] = useState(false);

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
  }

  return (
    <>
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
          console.log(subsection)
          return (            
            <div className="subsectionView" style={{backgroundColor: subsection.point.color}}>
            <div className='header' style={{backgroundColor: subsection.point.color}}>
                <h2>Point {i+1}</h2>
                <FontAwesomeIcon className="icon" icon={faPlus} />
            </div>
            <div className='content' style={{padding:"20px"}}>
                <p>{subsection.point.content}</p>
                <ul>
                  {subsection.advice.map((adv:any) => {
                    console.log(adv);
                    return (<li>{adv}</li>)
          })}
                </ul>
            </div>
        </div>
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
