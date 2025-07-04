import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyD05Mnj7ZryNoCbH-kxVWOJGV91Aj9opnw",
    authDomain: "eloquence-39ed6.firebaseapp.com",
    projectId: "eloquence-39ed6",
    storageBucket: "eloquence-39ed6.firebasestorage.app",
    messagingSenderId: "242618451460",
    appId: "1:242618451460:web:f1ea326207dd4ae149d751",
    measurementId: "G-RLRCXF0DZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export let loginWithEmail = (e: React.MouseEvent<HTMLButtonElement>, email:string, password:string) => {
    e.preventDefault();
    const auth = getAuth(app);
    return signInWithEmailAndPassword(auth, email, password)
}
export let loginWithGoogle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
}
