import { type Response, type Point } from '../../Types.tsx';
import "./style.css";
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface SubsectionViewProps {
    subsection: Response;
}

export default function SubsectionView(props: SubsectionViewProps) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="subsectionView">
            <div className='header'>
                <h2>{props.subsection.header}</h2>
                <FontAwesomeIcon className="icon" icon={collapsed ? faMinus : faPlus} onClick={() => setCollapsed(!collapsed)} />
            </div>
            <div className="content" style={{ 'display': collapsed ? 'block' : 'none' }}>
                {props.subsection.points.map(point => {
                    return (
                        <div className="point">
                            <p className="subtext">{point.type_of_point.toUpperCase()}</p>
                            <p className="pointText">{point.content}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
