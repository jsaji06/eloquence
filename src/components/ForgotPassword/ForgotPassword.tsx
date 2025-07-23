import { useState } from 'react';
import { forgotPassword } from '../HelperFunctions';
import Alert from '../Alert/Alert';
import { useNavigate } from 'react-router-dom';
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | undefined>()
  return (
    <>
    {message && <Alert customButtonText="" header="Password Reset Email Sent" message={message} setMessage={setMessage} customButtonHandler={() => navigate("/")} />}
    <form className="login">
        <h1>Forgot your password?</h1>
        <p>No worries, enter your email and we'll get it sorted.</p>
        <br />
        <input type="email" placeholder='Enter your email...' required onChange={e => setEmail(e.target.value)} />
        <br />
        <button type="submit" onClick={async (e) => {
            e.preventDefault();
            await forgotPassword(email);
            setMessage("An email to change your password was sent to your inbox. Check your spam too. Proceed to log in only after you have successfully reset your password. If you remembered your password, you can disregard the email and proceed to login as normal.")
            
        }}>Send Password Reset Email</button>
        <div className="options">
            <div className="otherOptions">
                <a href='/'>Remembered your password?</a>
                <a href='/signup'>Don't have an account?</a>
            </div>
        </div>
    </form>
    </>
  )
}
