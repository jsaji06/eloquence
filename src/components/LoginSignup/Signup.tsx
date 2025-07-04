import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from "./HelperFunctions.ts";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import Alert from "../Alert/Alert.tsx";
import Overlay from "../Overlay/Overlay.tsx";

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    return (
        <>
            {error && <Alert setMessage={setError} message={error} />}
            {error && <Overlay />}
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
                        navigate("/verification", { state: { firstName: firstName, lastName: lastName } })

                    } catch (error) {
                        setError("There was an error in registering your account. Please try again later.")
                    }
                }}>Signup</button>
                <div className="options">
                    <div className="loginOptions">
                        <button type="submit" onClick={e => loginWithGoogle(e)} >Login with Google</button>
                        <button type="submit" >Login with Facebook</button>
                        <button type="submit" >Login with Apple</button>
                    </div>
                    <div className="otherOptions">
                        <a href='/login'>Already have an account?</a>
                        <a href='/forgot-password'>Forgot your password?</a>
                    </div>
                </div>
            </form>
        </>
    )
}
