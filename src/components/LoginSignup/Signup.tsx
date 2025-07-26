import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithGoogle } from "../HelperFunctions.ts";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import Alert from "../Alert/Alert.tsx";
import { createDoc } from '../HelperFunctions.ts';


export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state;

    return (
        <>
            {error && <Alert setMessage={setError} message={error} />}
            <form className="login">
                <h1>Join Eloquence</h1>
                <input type="text" placeholder='Enter your first name...' required onChange={e => setFirstName(e.target.value)} />
                <br />
                <input type="text" placeholder='Enter your last name...' required onChange={e => setLastName(e.target.value)} />
                <br />
                <input type="email" placeholder='Enter your email...' required onChange={e => setEmail(e.target.value)} />
                <br />
                <input type="password" placeholder='Enter your password...' required onChange={e => setPassword(e.target.value)} />
                <br />
                <button type="submit" onClick={async (e) => {
                    e.preventDefault();
                    let auth = getAuth();
                    try {
                        let userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                        let user = userCredentials.user;
                        await sendEmailVerification(user)
                        navigate("/verification", { state: { firstName: firstName, lastName: lastName, doc: state } })

                    } catch (error) {
                        setError("There was an error in registering your account. Please try again later.")
                    }
                }}>Signup</button>
                <button type="button" onClick={ async (e) => {
                    try {
                    let user = await loginWithGoogle(e)
                    if(state){
                        try {
                        await createDoc(user.user.uid, state);
                        } catch(err) {
                            console.log(err)
                        }
                    }
                    navigate("/dashboard")
                } catch(err){
                    console.log(err)
                }                    
                }}>Login with Google</button>
                <div className="options">
                    <div className="otherOptions">
                        <a href='/login'>Already have an account?</a>
                        <a href='/forgot-password'>Forgot your password?</a>
                    </div>
                </div>
            </form>
        </>
    )
}
