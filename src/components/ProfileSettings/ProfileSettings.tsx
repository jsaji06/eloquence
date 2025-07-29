import "../../index.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../HelperFunctions";
import { doc } from "firebase/firestore";
import {getFirestore} from "firebase/firestore"
import { DocumentSnapshot } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import Alert from "../Alert/Alert";
import { deleteAccount } from "../HelperFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function ProfileSettings() {
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [status, setStatus] = useState("")
    const [message, setMessage] = useState<string | undefined>()

    useEffect(() => {
        let unsubscribeUserDoc: (() => void) | undefined;
        let unsubUser: (() => void) | undefined;
        const unsubscribed = onAuthStateChanged(auth, (auth_user) => {
            if(!auth_user) {   
                navigate("/login")
                return;
            }
            let userID = auth_user.uid;
            let userRef = doc(db, "users", userID!)
            unsubUser = onSnapshot(userRef, async (userSnap: DocumentSnapshot) => {
                
                if(userSnap.exists()){
                    setFirstName(userSnap.data().firstName)
                    setLastName(userSnap.data().lastName)
                } 
            })
        })
        return () => {
            unsubscribed();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
            if (unsubUser) unsubUser()
        };
    }, [navigate, auth])

  return (
    <>
    {message && <Alert message={message} setMessage={setMessage} header="Warning" customButtonHandler={() => deleteAccount()} customButtonText="I understand"/> }
    <div className="profileSettings">
        <header>
        <button onClick={() => navigate("/dashboard")}><FontAwesomeIcon icon={faArrowLeft} /></button>
        <h1>Profile Settings</h1>
        <p>Change the information displayed from your profile</p>
        </header>
        <main className="profileSettingsContainer">
            <div className="row">
                <div className="info firstName">
                    <h2>First Name</h2>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="info lastName">
                    <h2>Last Name</h2>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
            </div>
        </main>
        <footer>
            <p>{status}</p>
        <div className="row">
            <button onClick={async () => {
                try {
                await updateUserProfile(setStatus, firstName, lastName)
                setStatus("Your changes have been saved.")
                } catch(_){
                    setStatus("An error occured in saving your data; please try again.")
                }
                }}>Save Changes</button>
            <button onClick={() => window.location.href = "/forgot-password"}>Change Password</button>
            <button onClick={() => {
                setMessage("By pressing the button below, you understand that you will lose all access to your account and data associated with it. ")
            }}>Delete Account</button>
        </div>
        </footer>
    </div>
    </>
  )
}
