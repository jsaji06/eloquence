import React, { type SetStateAction, type Dispatch } from 'react'
import '../Alert/style.css';

interface AlertProps {
    message?: string
    setMessage: Dispatch<SetStateAction<string | undefined>>
}

export default function SignoutWarning(props: AlertProps) {
    return (
        <div className="alert">
            <h1>Warning</h1>
            <p>Signing out will</p>
            <button onClick={(e) => props.setMessage(undefined)}>Exit</button>
        </div>
    )
}
