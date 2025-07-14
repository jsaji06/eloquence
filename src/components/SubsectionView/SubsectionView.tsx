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
    points:Array<Point>
}

export default function SubsectionView(props: SubsectionViewProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined)
    console.log("Points", props.points);

    return (
        <>
        {message && <Alert message={message} setMessage={setMessage} />}
        {message && <Overlay />}
        <div className="subsectionView">
            <div className='header'>
                <h2>{props.subsection.header}</h2>
                <FontAwesomeIcon className="icon" icon={collapsed ? faMinus : faPlus} onClick={() => setCollapsed(!collapsed)} />
            </div>
            <div className="content" style={{ 'display': collapsed ? 'block' : 'none' }}>
                {props.subsection.points.map((point) => {
                    return (
                        <div className="point" style={{ backgroundColor: point.color }}>
                            <div className="select">
                                <div className={"circle " + (props.points.includes(point) ? "active" : "")} onClick={e => {
                                    if(!props.points.includes(point)){
                                        console.log(props.points)
                                        if(props.points.length >= 3){
                                            setMessage("Tester")
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
                })}
            </div>
        </div>
        </>
    )
}
