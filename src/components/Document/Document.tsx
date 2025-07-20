import type { DocumentData } from 'firebase/firestore';
import React from 'react'
import './style.css'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { trashDocument } from '../HelperFunctions';
import Alert from '../Alert/Alert';
import { useState } from 'react';
import Overlay from '../Overlay/Overlay';

interface DocumentProps {
  document: DocumentData;
}

export default function Document(props: DocumentProps) {
  console.log(props.document)
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | undefined>()
  const month = props.document.recentlyModified.toDate().getMonth() + 1;
  const day = props.document.recentlyModified.toDate().getDate();
  const year = props.document.recentlyModified.toDate().getFullYear();
  return (
    <>
      {message && <Alert customButtonText="Delete" message={message} setMessage={setMessage} customButtonHandler={() => trashDocument(props.document.id)} />}
      {message && <Overlay />}
      <div className="documentView" onClick={e => {
        e.preventDefault();
        navigate("/editor/" + props.document.id, { state: { document_id: props.document.id } });
      }}>

        <h4 className="docHeader">{props.document.title !== "" ? props.document.title : "Untitled document"}</h4>
        <p className="docContent">{new DOMParser().parseFromString(props.document.content, "text/html").body.textContent !== "" ? new DOMParser().parseFromString(props.document.content, "text/html").body.textContent : "No text yet."}</p>
        <div className="bottom">
          <p>Last modified {month}/{day}/{year}</p>
          <div className="icons">
            <FontAwesomeIcon icon={faTrash} style={{ color: 'var(--text-primary)' }} onClick={(e) => {
              e.stopPropagation()
              setMessage("You are about to trash this document. Click the button to confirm this action, or click the X to cancel this action.")
              // trashDocument(props.document.id)
            }} />
          </div>
        </div>

      </div>
    </>
  )
}
