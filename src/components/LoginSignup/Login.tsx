import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { loginWithEmail, loginWithGoogle } from '../HelperFunctions'
import { useNavigate } from 'react-router';
import Alert from "../Alert/Alert";
import './style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const auth = getAuth();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) navigate('/dashboard');
        })
    }, [navigate])
    return (
        <>
            {error && <Alert setMessage={setError} message={error} />}
            <form className="login">
                <h1>Login to Eloquence</h1>
                {/* <form> */}
                <input type="text" placeholder='Enter your email...' required onChange={e => setEmail(e.target.value)} />
                <br />
                <input type="password" placeholder='Enter your password...' required onChange={e => setPassword(e.target.value)} />
                <br />
                <button type="submit" onClick={e => {
                    loginWithEmail(e, email, password)
                        .then((_) => {

                            navigate("/dashboard")
                        })
                        .catch(_ => {
                            setError("Invalid password or email; please try again.")
                        })
                }}>Login</button>
                        <button type="button" onClick={e => {
                            loginWithGoogle(e)
                                .then((_) => {
                                    navigate("/dashboard")
                                })
                                .catch(_ => {
                                    setError("An error occured. Please try again.")
                                })
                        }} ><FontAwesomeIcon icon={faGoogle} />Login with Google</button>
                <div className="options">
                    <div className="otherOptions">
                        <a href='/signup'>New to Eloquence?</a>
                        <a href='/forgot-password'>Forgot your password?</a>
                    </div>
                </div>
                {/* </form> */}
            </form >
        </>
    )
}
