import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, type SetStateAction } from 'react';
import { type Response } from '../../Types.tsx';
import "./style.css";
import { type Point } from '../../Types.tsx';
import { type Dispatch } from 'react';
import Alert from '../Alert/Alert.tsx';
import Overlay from '../Overlay/Overlay.tsx';
 
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
    const [message, setMessage] = useState<string | undefined>(undefined)

    return (
        <>
        <div className="subsectionView feedback" style={{backgroundColor: props.feedback.point.color}} onClick={e =>{ 
            
        }}>
            <div className='header' style={{backgroundColor: props.feedback.point.color}}>
                <h2>Point {props.index+1}</h2>
                <FontAwesomeIcon className="icon" icon={collapsed ? faMinus : faPlus} onClick={e => {
                    setCollapsed(!collapsed)
                    let newList = [...props.feedbackList]
                    newList[props.index].highlighted = !collapsed;
                    props.setFeedbackList(newList)
                    // if(!collapsed){
                    // props.setActiveText("")
                    // } else {
                    //     props.setActiveText(props.feedback.point.highlighted_text[0])
                    //     props.setActiveColor(props.feedback.point.color)
                    // }
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
