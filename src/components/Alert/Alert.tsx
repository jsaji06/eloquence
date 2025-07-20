import React, { type SetStateAction, type Dispatch } from 'react'
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

interface AlertProps {
    message?: string
    setMessage: Dispatch<SetStateAction<string | undefined>>
    customButtonHandler?: () => void
    customButtonText?:string
}

let iconStyling = {
    padding:0,
    width:"30px",
    

}

export default function Alert(props: AlertProps) {
    return (
        <div className="alert">
            <FontAwesomeIcon icon={faX} className="exitIcon" onClick={e => props.setMessage(undefined)} style={{display:props.customButtonHandler ? "block" : "none"}} />
            <h1>Error</h1>
            <p>{props.message}</p>
            <button onClick={(e) => {
                props.setMessage(undefined)
                if(props.customButtonHandler) props.customButtonHandler()
                }}>{props.customButtonText ? props.customButtonText : "Exit"}</button>
        </div>
    )
}
