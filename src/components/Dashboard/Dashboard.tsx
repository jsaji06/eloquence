import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getFirestore, getDoc, doc, type DocumentData } from 'firebase/firestore';
import "./style.css"

export default function Dashboard() {
    const navigate = useNavigate();
    const db = getFirestore()
    const user = getAuth().currentUser;
    let [userInfo, setUserInfo] = useState<DocumentData>();

    let userID = user!.uid;
    useEffect(() => {
        if (!user) navigate("/")
        let retrieveData = async () => {
            let userDocRef = doc(db, "users", userID);
            let userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setUserInfo(userDocSnap.data());
            }
        }
        retrieveData();
    }, [])
    return (
        <div className="dashboard">
            <header>
                <h1>Welcome, {userInfo!.firstName}. </h1>
            </header>
        </div>
    )
}
