import { type SetStateAction } from 'react'
import Overlay from '../Overlay/Overlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faX } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { type FeedbackPersonalizationObject } from '../../Types';
import type { Dispatch } from 'react';
import { updateDocument } from '../HelperFunctions';


interface FeedbackProps {
    docId: string
    feedbackPersonalization: FeedbackPersonalizationObject | undefined
    setFeedbackPersonalization: Dispatch<SetStateAction<FeedbackPersonalizationObject | undefined>>
    setFeedbackModal: Dispatch<SetStateAction<boolean | undefined>>
}

export default function FeedbackPersonalization(props: FeedbackProps) {
  const [openEndedFeedback, setOpenEndedFeedback] = useState<string>(props.feedbackPersonalization!.openEnded)
  const [error, setError] = useState<string | undefined>();
  function getFeedback(){
    setError("Loading...")
    fetch("https://eloquence-68ro.onrender.com/validate_prompt", {
        
        method: "POST",
        body: JSON.stringify({
        prompt: openEndedFeedback,
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
        .then((data: any) => {
            if (data['content'] === "YES"){ 
                props.setFeedbackPersonalization({...props.feedbackPersonalization, openEnded: openEndedFeedback, personalized: true} as unknown as FeedbackPersonalizationObject)
                updateDocument(props.docId, undefined, undefined, undefined, undefined, {...props.feedbackPersonalization, openEnded: openEndedFeedback, personalized: true} as unknown as FeedbackPersonalizationObject)
                props.setFeedbackModal(true)

            } else {
                setError("The prompt you provided doesnt work")
            }
        })
        .catch(_ => {
        console.log(_)
        })
    }

  return (
    <>
        {<Overlay />}
        <div className="alert feedbackModal">
            <FontAwesomeIcon icon={faX} className="exitIcon" onClick={() => {
                props.setFeedbackModal(true)
                
            }}/>
            <h1>What kind of writing are we working with?</h1>
            <p>Tailor the feedback you recieve to ensure your writing never strays from your purpose.</p>

            <div className="paragraphContainer">
                <div className="modalForm">
                <input onChange={(e) => setOpenEndedFeedback(e.target.value)} type='text' defaultValue={openEndedFeedback} />
                <button onClick={() => getFeedback()}><FontAwesomeIcon icon={faArrowRight} /> </button>
            </div>
                </div>
                <p>{error ? error : ""}</p>
            </div>
            
        </>
  )
}
