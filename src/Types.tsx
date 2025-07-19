import type { Timestamp } from "firebase/firestore";
import { type DocumentData } from "firebase/firestore";
export type Point = {
    type_of_point: 'refutation' | 'counterpoint' | 'question' | 'dilemma';
    content: string;
    highlighted_text: Array<string>;
    color: string;
}

export type Response = {
    header: string;
    points: Array<Point>;
}

export type UserInformation = {
    firstName: string;
    lastName: string;
    documents: Array<string>;
}

export interface ActiveText {
    text: string;
    color: string;
}

export interface Doc extends DocumentData {
    ownerId: string,
    title: string,
    content: string,
    dateCreated: Timestamp,
    recentlyModified: Timestamp,
    trash: boolean
}

// export type Feedbacl

// export interface AdviceResponse {
//     point:
// }