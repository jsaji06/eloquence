import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { type Response, type FeedbackResponse, type FeedbackPersonalizationObject } from "../Types";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, collection, arrayUnion, addDoc, getDoc } from "firebase/firestore";
import { type Dispatch, type SetStateAction } from "react";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_KEY,
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
export let loginWithGoogle = async (e: React.MouseEvent<HTMLButtonElement>, docObj?:any) => {
    e.preventDefault();
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    // CLAUDE-GENERATED CODE STARTS HERE

    // These settings prevent the double sign-in issue
    provider.setCustomParameters({
        prompt: 'select_account',           // Always show account picker
        access_type: 'offline',             // Get refresh token
        include_granted_scopes: 'true'      // Include previously granted scopes
    });
    
    // Clear any existing auth state to prevent conflicts
    if (auth.currentUser) {
        await auth.signOut();
    }
    
    try {
        // Add a small delay to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await signInWithPopup(auth, provider);
        // CLAIDE GENERATED CODE ENDS HERE
        let userDoc = doc(db, "users", result.user.uid)
        let snap = await getDoc(userDoc)
        if(!snap.exists()){
            const usersRef = collection(db, "users")
            const docRef = doc(usersRef, result!.user.uid)
            
            const newDoc = {
                firstName: result!.user.displayName,
                lastName: "",
                documents: []
            }
                await setDoc(docRef, newDoc)
                if(docObj){
                    await createDoc(result!.user.uid, docObj);
                }
           
        }

        return result;
        // CLAUDE-GENERATED CODE STARTS HERE
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        
        // Handle specific popup issues
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in was cancelled');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Popup was blocked. Please allow popups and try again.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            // This happens when multiple popups are triggered
            // Don't throw error, let it retry naturally
            return;
        }
        
        throw error;
    }
    // CLAUDE-GENERATED CODE ENDS HERE

}

export let updateUserProfile = async (setStatus:Dispatch<SetStateAction<string>>, firstName?: string, lastName?:string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const id = user!.uid;
    let userDoc = doc(db, "users", id)
    let update: any = {

    }
    if(firstName){
        update.firstName = firstName;
    }
    if(lastName){
        update.lastName = lastName;
    }
    try {
    await updateDoc(userDoc, update);
    } catch(_) {
        setStatus("An error occured in saving your data; please try again.")
    }
    
}

export let deleteAccount = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    await user?.delete()
}

export let updateDocument = async (documentId: string, title?: string, content?: string, aiData?: Response[], feedback?: FeedbackResponse[], feedbackPersonalization?: FeedbackPersonalizationObject) => {
    const update: any = {
        recentlyModified: new Date()
    }

    if (title) {
        update.title = title;
    }
    if (content) {
        update.content = content;
    }
    if (aiData) {
        update.aiData = aiData;
    }
    if (feedback) {
        update.feedback = feedback;
    }
    if(feedbackPersonalization){
        update.feedbackPersonalization = feedbackPersonalization
    }
    try {
        await updateDoc(doc(db, "documents", documentId), update);
    }
    catch (err) {
        console.log(err);
    }
}

export let trashDocument = async (documentId: string) => {
    const update: any = {
        trash: true
    }
    try {
        await updateDoc(doc(db, "documents", documentId), update);
    } catch (err) {
        console.log(err)
    }
}

export let forgotPassword = async (email: string) => {
    const auth = getAuth(app);
    try {
        await sendPasswordResetEmail(auth, email)
    }
    catch (err) {
        console.log(err);
    }
}

export let createDoc = async (id: string, document: any) => {
    try {
        let guestD = await addDoc(collection(db, "documents"), {
            ...document,
            ownerId: id
        })
        let docId = guestD.id;
        await setDoc(doc(db, "users", id), { 
            documents: arrayUnion(docId)
        }, {merge:true})
    } catch (err) {
        console.log(err)
    }
}