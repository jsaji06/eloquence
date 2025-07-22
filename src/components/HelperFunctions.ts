import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { type Response, type FeedbackResponse } from "../Types";


const firebaseConfig = {
    apiKey: process.env.ANTHROPIC_KEY,
    authDomain: "eloquence-39ed6.firebaseapp.com",
    projectId: "eloquence-39ed6",
    storageBucket: "eloquence-39ed6.firebasestorage.app",
    messagingSenderId: "242618451460",
    appId: "1:242618451460:web:f1ea326207dd4ae149d751",
    measurementId: "G-RLRCXF0DZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export let loginWithEmail = (e: React.MouseEvent<HTMLButtonElement>, email: string, password: string) => {
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

export let updateDocument = async (documentId: string, title?: string, content?: string, aiData?: Response[], feedback?: FeedbackResponse[]) => {
    const update: any = {
        recentlyModified: new Date()
    }

    if (title) {
        update.title = title;
    }
    if (content) {
        update.content = content;
    }
    if(aiData) {
        update.aiData = aiData;
    }
    if(feedback){
        update.feedback = feedback;
    }
    try {
        await updateDoc(doc(db, "documents", documentId), update);
    }
    catch(err){
        console.log(err);
    }
}

export let trashDocument = async (documentId:string) => {
    const update: any = {
        trash:true
    }
    try {
        await updateDoc(doc(db, "documents", documentId), update);
    } catch(err) {
        console.log(err)
    }
}