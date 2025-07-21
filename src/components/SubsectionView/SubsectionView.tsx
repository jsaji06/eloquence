import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, type SetStateAction } from 'react';
import { type Response } from '../../Types.tsx';
import "./style.css";
import { type Point } from '../../Types.tsx';
import { type Dispatch } from 'react';
import Alert from '../Alert/Alert.tsx';
import Overlay from '../Overlay/Overlay.tsx';

interface SubsectionViewProps {
    subsection: Response;
    setPoints: Dispatch<SetStateAction<Array<Point>>>
    points: Array<Point>
    aiData: Response[]
    setAiData: Dispatch<SetStateAction<Response[] | undefined>>
}

export default function SubsectionView(props: SubsectionViewProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined)

    return (
        <>
            {message && <Alert message={message} setMessage={setMessage} />}
            {message && <Overlay />}
            <div className="subsectionView">
                <div className='header'>
                    <h2>{props.subsection.header}</h2>
                    <FontAwesomeIcon className="icon" icon={props.subsection.collapsed ? faMinus : faPlus} onClick={() => {
                        setCollapsed(!props.subsection.collapsed); 

                        let aiData = props.aiData.map((data, i) => {
                            if(props.aiData[i] === props.subsection){
                                props.aiData[i].collapsed = !props.subsection.collapsed;
                                return props.aiData[i]
                            }
                            return props.aiData[i]
                        })
                        props.setAiData(aiData)

                        if(!props.subsection.collapsed) {
                            props.aiData.map((data, i) => {
                                data.points.map(point => {
                                    point.active = true;
                                    return point
                                })
                                return data

                            })
                        }
                    }
                    } />
                </div>
                <div className="content" style={{ 'display': props.subsection.collapsed ? 'block' : 'none' }}>
                    {props.subsection.points.map((point) => {
                        if (point.active) {
                            return (
                                <div className="point" style={{ backgroundColor: point.color }}>
                                    <div className="select">
                                        <div className={"circle " + (props.points.includes(point) ? "active" : "")} onClick={e => {
                                            if (!props.points.includes(point)) {
                                                if (props.points.length >= 3) {
                                                    setMessage("You can only select up to three points.")
                                                }
                                                else props.setPoints([...props.points, point])
                                            } else {
                                                props.setPoints(props.points.filter(p => point !== p))
                                            }
                                        }}></div>
                                    </div>
                                    <div className="pointContent">
                                        <p className="subtext">{point.type_of_point.toUpperCase()}</p>
                                        <p className="pointText">{point.content}</p>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </>
    )
}
