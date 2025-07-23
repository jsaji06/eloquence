import { type SetStateAction, type Dispatch } from 'react'
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import Overlay from '../Overlay/Overlay';

interface AlertProps {
    header?:string;
    message?: string
    setMessage: Dispatch<SetStateAction<string | undefined>>
    customButtonHandler?: () => void
    customButtonText?:string
}

export default function Alert(props: AlertProps) {
    return (
        <>
        {props.message && <Overlay />}
        <div className="alert">
            <FontAwesomeIcon icon={faX} className="exitIcon" onClick={() => props.setMessage(undefined)} style={{display:props.customButtonHandler ? "block" : "none"}} />
            <h1>{props.header ? props.header : "Error"}</h1>
            <p>{props.message}</p>
            <button onClick={() => {
                props.setMessage(undefined)
                if(props.customButtonHandler) props.customButtonHandler()
                }}>{props.customButtonText ? props.customButtonText : "Exit"}</button>
        </div>
        </>
    )
}
