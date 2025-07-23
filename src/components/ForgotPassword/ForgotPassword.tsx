import React from 'react'
import { useState } from 'react';
import { forgotPassword } from '../HelperFunctions';
export default function ForgotPassword() {
    const [email, setEmail] = useState("");
  return (
    <form className="login">
        <h1>Forgot your password?</h1>
        <p>No worries, enter your email and we'll get it sorted.</p>
        <br />
        <input type="email" placeholder='Enter your email...' required onChange={e => setEmail(e.target.value)} />
        <br />
        <button type="submit" onClick={async (e) => {
            e.preventDefault();
            // let auth = getAuth();
            await forgotPassword(email);
        }}>Send Password Reset Email</button>
        <div className="options">
            <div className="otherOptions">
                <a href='/login'>Remembered your password?</a>
                <a href='/signup'>Don't have an account?</a>
            </div>
        </div>
    </form>
  )
}
