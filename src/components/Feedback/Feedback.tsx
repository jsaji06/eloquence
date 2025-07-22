import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, type SetStateAction } from 'react';
import "./style.css";
import { type Dispatch } from 'react';
 
interface FeedbackProps {
    feedback:any
    index:number
    setActiveText: Dispatch<SetStateAction<string>>
    setActiveColor: Dispatch<SetStateAction<string>>
    feedbackList: Array<any>
    setFeedbackList: Dispatch<SetStateAction<Array<any>>>
}

export default function Feedback(props: FeedbackProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
        <div className="subsectionView feedback" style={{backgroundColor: props.feedback.point.color}} onClick={() =>{ 
            
        }}>
            <div className='header' style={{backgroundColor: props.feedback.point.color}}>
                <h2>Point {props.index+1}</h2>
                <FontAwesomeIcon className="icon" icon={collapsed ? faMinus : faPlus} onClick={() => {
                    setCollapsed(!collapsed)
                    let newList = [...props.feedbackList]
                    newList[props.index].highlighted = !collapsed;
                    props.setFeedbackList(newList)
                }}
                  />
            </div>
            <div className='content' style={{padding:"20px", display:collapsed ? "block" : "none"}}>
                <p>{props.feedback.point.content}</p>
                <ul>
                  {props.feedback.advice.map((adv:any) => {

                    return (<li>{adv}</li>)
          })}
                </ul>
            </div>
        </div>
        </>
    )
}
