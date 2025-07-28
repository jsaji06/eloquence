import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type SetStateAction } from 'react';
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
    const collapsed = props.feedback.collapsed ?? false;
    return (
        <>
        <div className="subsectionView feedback" style={{backgroundColor: props.feedback.point.color}}>
            <div className='header' style={{backgroundColor: props.feedback.point.color}}>
                <h2>Point {props.index+1}</h2>
                <FontAwesomeIcon className="icon" icon={collapsed ? faMinus : faPlus} onClick={() => {
                    let newList = [...props.feedbackList]
                    newList.map((_, i) => {
                        if(i === props.index){
                            newList[props.index].collapsed = !collapsed;
                            newList[props.index].highlighted = !collapsed;
                            props.setFeedbackList(newList)
                        }
                    })
                }}
                  />
            </div>
            <div className='content' style={{padding:"20px", display:collapsed ? "block" : "none"}}>
                <p>{props.feedback.point.content}</p>
                <ul>
                  {props.feedback.advice.map((adv:any, i:number) => {

                    return (<li key={i}>{adv}</li>)
          })}
                </ul>
            </div>
        </div>
        </>
    )
}
