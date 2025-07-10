import type { DocumentData } from 'firebase/firestore';
import React from 'react'
import './style.css'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface DocumentProps {
  document: DocumentData;
}

export default function Document(props: DocumentProps) {
  const navigate = useNavigate();
  return (
    <div className="documentView" onClick={(e) => {
      e.preventDefault();
      navigate("/editor/" + props.document.id, { state: { document_id: props.document.id } });
    }}>

      <h4>{props.document.title !== "" ? props.document.title : "Untitled document"}</h4>
      <p className="docContent">{new DOMParser().parseFromString(props.document.content, "text/html").body.textContent !== "" ? new DOMParser().parseFromString(props.document.content, "text/html").body.textContent : "No text yet."}</p>
      <FontAwesomeIcon icon={faTrash} style={{ color: 'black' }} />

    </div>
  )
}
