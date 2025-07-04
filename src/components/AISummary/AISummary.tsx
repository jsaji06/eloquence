import { type SetStateAction, type Dispatch } from 'react'
import './style.css'
import { type Response } from '../../Types';
import SubsectionView from '../SubsectionView/SubsectionView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

interface AISummaryProps {
  loading: boolean;
  aiData: Response[];
  setAiPanelActive: Dispatch<SetStateAction<boolean>>
}

export default function AISummary(props: AISummaryProps) {
  return (
    <>
        <FontAwesomeIcon icon={faX} className="icon exit" onClick={() => {
          props.setAiPanelActive(false);
        }} />
      <div className="aiSummaryPanel" >
        {props.loading && <div className="loadingScreen">
          <h1 style={{textAlign:'center'}}>Thorougly analyzing your masterpiece. Hang tight!</h1>
        </div>}
        {!props.loading && <div className="content">
          <h1>Nice start so far! Here's what we got for you. </h1>
          <p>Collapse each section to view what we suggested you cover/think about for the corresponding header.</p>
          
          {props.aiData?.map((subsection) => {
            return (<SubsectionView subsection={subsection} />)

          })}
        </div>}
      </div>
      <br />
    </>
  )
}
