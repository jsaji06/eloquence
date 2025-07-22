import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import Alert from "../Alert/Alert"

const auth = getAuth();
const db = getFirestore();

export default function () {
    const navigate = useNavigate()
    const location = useLocation();
    const [error, setError] = useState<string | undefined>(undefined);

    let firstName = location.state.firstName
    let lastName = location.state.lastName

    const checkVerification = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload()
            if (auth.currentUser.emailVerified) {
                let id = auth.currentUser.uid
                try {
                    const usersRef = collection(db, "users")
                    const docRef = doc(usersRef, id)
                    const newDoc = {
                        firstName: firstName,
                        lastName: lastName,
                        documents: []
                    }
                    try {
                        await setDoc(docRef, newDoc)
                        console.log("User successfully registered in database")
                        navigate("/dashboard")
                    } catch(err){
                        console.log("dih", err)
                    }

                }
                catch (err) {
                    console.log(err);
                    navigate("/signup")
                }
            } 
        }
    }
    checkVerification();
    useEffect(() => {
        checkVerification();
    })
    return (
        <>
        
            {error && <Alert setMessage={setError} message={error} />}
            
            <div className="login">
                <h1>We have sent a verification link to your email.</h1>
                <p>Please check your inbox, or spam/junk. If you have successfully verified, please click the button below.</p>
                <button onClick={(e) => {
                    e.preventDefault();
                    checkVerification();
                }}>I have successfully verified.</button>
            </div>
        </>
    )
}
