import React, { type SetStateAction, type Dispatch } from 'react'
import './style.css';

interface AlertProps {
    message?: string
    setMessage: Dispatch<SetStateAction<string | undefined>>
}

export default function Alert(props: AlertProps) {
    return (
        <div className="alert">
            <h1>Error</h1>
            <p>{props.message}</p>
            <button onClick={(e) => props.setMessage(undefined)}>Exit</button>
        </div>
    )
}
