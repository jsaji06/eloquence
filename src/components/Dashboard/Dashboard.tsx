import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getFirestore, getDoc, doc, type DocumentData, addDoc, collection, arrayUnion, updateDoc, DocumentSnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { onSnapshot } from 'firebase/firestore';
import Document from "../Document/Document";
import "./style.css"
import Loading from '../Loading/Loading';

export default function Dashboard() {
    const navigate = useNavigate();
    const db = getFirestore()
    const auth = getAuth();
    let [userInfo, setUserInfo] = useState<DocumentData>();
    const [documents, setDocuments] = useState<DocumentData>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // let userID = user?.uid;
    useEffect(() => {
        setLoading(true)
        let unsubscribeUserDoc: (() => void) | undefined;
        const unsubscribed = onAuthStateChanged(auth, (auth_user) => {
            if (!auth_user) {
                navigate("/")
                return;
            }
            else {
                let userID = auth_user.uid;
                let userDocRef = doc(db, "users", userID!);
                unsubscribeUserDoc = onSnapshot(userDocRef, async (userDocSnap: DocumentSnapshot) => {
                    if (userDocSnap.exists()) {
                        let data = userDocSnap.data();
                        setUserInfo(data)
                        if (data.documents) {
                            const docs = await Promise.all(data.documents.map(async (documentID: string) => {
                                try {
                                    let docRef = doc(db, "documents", documentID);
                                    let docSnap = await getDoc(docRef)
                                    console.log(docSnap.data());
                                    return docSnap.exists() ? { ...docSnap.data(), id: documentID } : null;

                                } catch (err) {
                                    console.log(err);
                                    return null;

                                }
                            }))
                            setDocuments(docs.filter(Boolean));
                            setLoading(false);
                        }

                    }
                })

            }
        })
        return () => {
            // clean up both listeners on unmount
            unsubscribed();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
    }, [navigate, db, auth])

    let logout = async () => {
        try {
            let signout = await signOut(auth);
            navigate("/")
        } catch(err){
            
        }
    }

    let createDocument = async () => {
        let docRef = await addDoc(collection(db, "documents"), {
            ownerId: auth.currentUser!.uid,
            title: "",
            content: "",
            dateCreated: new Date(),
            recentlyModified: new Date()
        })

        let id = docRef.id;
        let userID = auth!.currentUser!.uid;
        await updateDoc(doc(db, "users", userID), {
            documents: arrayUnion(id)
        })
        navigate("/editor/" + id);
    }

    return (
        <>
            <div className="dashboard">
                {loading && <Loading />}
                <nav>
                    <h1>Welcome, {userInfo?.firstName}. </h1>
                    <div className="icons">
                        <button onClick={() => createDocument()}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon></button>
                        <div className="test" style={{ position: "relative" }}>
                            <button
                                onClick={() => setOpen(!open)}
                            ><FontAwesomeIcon icon={faUser} /></button>
                            {open && (
                                <div className="dropdown">
                                    <button>
                                        Profile
                                    </button>
                                    <button>
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
                    <h3>Here are your documents</h3>
                    <div className="documentContainer">
                        {documents && [...Array(Math.ceil(documents.length / 4))].map((_, rowIndex) => {
                            const rowDocs = documents.slice(rowIndex * 4, rowIndex * 4 + 4);
                            return (
                                <div className="row" key={rowIndex}>
                                    {rowDocs.map((document: object, i: number) => (
                                        <Document key={i} document={document} />
                                    ))}
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
