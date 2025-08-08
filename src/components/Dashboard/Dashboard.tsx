import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getFirestore, doc, type DocumentData, addDoc, collection, arrayUnion, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { onSnapshot, query, where, setDoc } from 'firebase/firestore';
import Document from "../Document/Document";
import "./style.css"
import Loading from '../Loading/Loading';
import { type Doc, type UserInformation } from '../../Types';
import Alert from '../Alert/Alert';
export default function Dashboard() {
    const navigate = useNavigate();
    const db = getFirestore()
    const auth = getAuth();
    let [userInfo, setUserInfo] = useState<UserInformation>();
    const [documents, setDocuments] = useState<Doc[]>();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | undefined>()

    useEffect(() => {
        setLoading(true)
        let unsubscribeUserDoc: (() => void) | undefined;
        let unsubUser: (() => void) | undefined;
        const unsubscribed = onAuthStateChanged(auth, (auth_user) => {
            if(!auth_user) {
                navigate("/login")
                return;
            }
            if(location.pathname !== "/dashboard"){
                navigate("/dashboard")
                return;
            }
            let userID = auth_user.uid;
            let userRef = doc(db, "users", userID!)
            
            unsubUser = onSnapshot(userRef, async (userSnap: DocumentSnapshot) => {
                
                if(userSnap.exists()){
                    setUserInfo({ ...userSnap.data() } as unknown as UserInformation)
                    let userDocRef = query(collection(db, "documents"), where("ownerId", "==", userID));
                    unsubscribeUserDoc = onSnapshot(userDocRef, async (userDocSnap: QuerySnapshot) => {
                        let docs: any = []
                        userDocSnap.forEach(test => {
                            let doc = test.data()
                            if (!doc.trash) docs.push({ ...doc, id: test.id })
                        })
                        setDocuments(docs.sort((a: Doc, b: Doc) => b.recentlyModified - a.recentlyModified));
                    }, (_) => {
                        setMessage("There was an error trying to retrieve user documents. Please try again.")
                    })
                    setLoading(false)
                } else {
                    setLoading(false);
                    navigate("/login")
                    return;
                }
            })
        })
        return () => {
            unsubscribed();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
            if (unsubUser) unsubUser()
        };
    }, [navigate, db, auth])

    let logout = async () => {
        try {
            await signOut(auth);
        } catch (_) {
            setMessage("There was an issue trying to sign you out; please try again.")
        }
    }

    let createDocument = async () => {
        let docRef = await addDoc(collection(db, "documents"), {
            ownerId: auth.currentUser!.uid,
            title: "",
            content: "",
            dateCreated: new Date(),
            recentlyModified: new Date(),
            trash: false,
            feedbackPersonalization: {
                personalized:false,                
                openEnded: "",
                attributes:[]
            }
        })

        let id = docRef.id;
        let userID = auth!.currentUser!.uid;
        await setDoc(doc(db, "users", userID), {
            ...userInfo,
            documents: arrayUnion(id)
        })
        navigate("/editor/" + id);
    }

    return (
        <>
        {message && <Alert message={message} setMessage={setMessage} /> }
            <div className="dashboard">
                {loading && <Loading />}
                <nav>

                    <div className="icons">
                        <button onClick={() => { createDocument() }}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon></button>
                        <div className="test" style={{ position: "relative" }}>
                            <button
                                onClick={() => setOpen(!open)}
                            ><FontAwesomeIcon icon={faUser} /></button>
                            {open && (
                                <div className="dropdown">
                                    <button onClick={() => navigate("/settings")}>
                                        Settings
                                    </button>
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        logout()
                                    }}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
                <div className="dashContainer">
                    <div className="dashHeader">
                        <h1>Welcome, {userInfo?.firstName}. </h1>
                        <p>Below are your documents. Click on the title to proceed to editing.</p>
                    </div>
                    <div className="documentContainer">
                        {documents && [...Array(Math.ceil(documents.length / 3))].map((_, rowIndex) => {
                            const rowDocs = documents.slice(rowIndex * 3, rowIndex * 3 + 3);
                            return (
                                <div className="row" key={rowIndex}>
                                    {rowDocs.map((document: DocumentData, i: number) => {
                                        return (
                                            <Document key={i} document={document} />
                                        )
                                    })}
                                </div>
                            );
                        })}
                        {userInfo?.documents.length == 0 && <p>Nothing to see here. Add a document!</p>}
                    </div>
                </div>
            </div>
        </>
    )
}
