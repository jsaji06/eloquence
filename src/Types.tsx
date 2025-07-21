import type { Timestamp } from "firebase/firestore";
import { type DocumentData } from "firebase/firestore";
export type Point = {
    type_of_point: 'refutation' | 'counterpoint' | 'question' | 'dilemma';
    content: string;
    highlighted_text: Array<string>;
    color: string;
    active:boolean
}

export type Response = {
    header: string;
    points: Array<Point>;
    collapsed:boolean;
}

export interface UserInformation extends DocumentData {
    firstName: string,
    lastName: string,
    nameOAuth?:string,
    documents: Array<string>
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
    trash: boolean,
    // feedback:Array<any>
}

export type FeedbackResponse = {
    advices:Array<string>;
    point:Point;
}

// export type Feedbacl

// export interface AdviceResponse {
//     point:
// }