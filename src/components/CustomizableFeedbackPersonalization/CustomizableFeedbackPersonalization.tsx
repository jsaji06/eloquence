import { type SetStateAction } from 'react'
import Overlay from '../Overlay/Overlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { type FeedbackPersonalizationObject } from '../../Types';
import type { Dispatch } from 'react';
import { updateDocument } from '../HelperFunctions';
import type { Section, Option } from '../../Types';

interface FeedbackProps {
    docId: string
    feedbackPersonalization: FeedbackPersonalizationObject
    setFeedbackPersonalization: Dispatch<SetStateAction<FeedbackPersonalizationObject | undefined>>
    setFeedbackModal: Dispatch<SetStateAction<boolean | undefined>>
    setOpenEnded: Dispatch<SetStateAction<boolean>>
}

export default function CustomizableFeedbackPersonalization(props: FeedbackProps) {
  const [error, setError] = useState<string | undefined>();
  let feedbackSections = props.feedbackPersonalization.attributes


  let [feedback, setFeedback] = useState<Array<Section>>(feedbackSections)

  function getFeedback(){
    setError("Loading...")
    let activePoints = feedback
        .flatMap(section => section.options.filter(option => option.active)).map(option => option.type) 
    console.log(activePoints)

    fetch("https://eloquence-68ro.onrender.com/validate_prompt", {
        
        method: "POST",
        body: JSON.stringify({
        prompt: activePoints.join(",")
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
                props.setFeedbackPersonalization({...props.feedbackPersonalization, attributes: feedback, personalized: true} as unknown as FeedbackPersonalizationObject)
                updateDocument(props.docId, undefined, undefined, undefined, undefined, {...props.feedbackPersonalization, attributes: feedback , personalized: true} as unknown as FeedbackPersonalizationObject)
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
            <p>Tailor the feedback you recieve by selecting one response per section.</p>

            <div className="paragraphContainer">
                {feedbackSections.map((section: Section, i) => (
                    <div className="feedbackSection" key={section.type}>
                        <h2>{section.type}</h2>
                        <div className="optionsFeedback">
                            {section.options.map((option: Option, j) => {
                                return (<button className={feedback[i].options[j].active ? "activeFeedback" : ""} onClick={() => {
                                    let newFeedback = [...feedback]
                                    newFeedback[i].options[j].active = !newFeedback[i].options[j].active
                                    setFeedback(newFeedback);
                                }
                                } key={option.type}>{option.type}</button>)
                            })}
                        </div>
                    </div>
                ))}
                
            </div>
            <a href="#" style={{color:"var(--text-primary)"}} onClick={() => props.setOpenEnded(true)}>Open-ended Prompting</a>
            <p>{error ? error : ""}</p>
            <button style={{
                "display": feedback.some(optionList => optionList.options.some(option => option.active)) ? "block" : "none"

            }} onClick={() => {
                getFeedback()
            }}>Submit</button>
            </div>
            
        </>
  )
}
