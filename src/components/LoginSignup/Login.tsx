import { useState } from 'react'
import { getAuth } from "firebase/auth"
import { loginWithEmail, loginWithGoogle } from './HelperFunctions'
import { useNavigate } from 'react-router';
import Overlay from "../Overlay/Overlay";
import Alert from "../Alert/Alert";
import './style.css'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);

    let user = getAuth().currentUser;
    if (user) navigate("/dashboard");
    return (
        <>
            {error && <Alert setMessage={setError} message={error} />}
            {error && <Overlay />}
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
                <div className="options">
                    <div className="loginOptions">
                        <button type="submit" onClick={e => {
                            loginWithGoogle(e)
                                .then((_) => {
                                    navigate("/dashboard")
                                })
                                .catch(_ => {
                                    setError("An error occured. Please try again.")
                                })
                        }} >Login with Google</button>
                        <button type="submit" >Login with Facebook</button>
                        <button type="submit" >Login with Apple</button>
                    </div>
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
