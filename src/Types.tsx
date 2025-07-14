export type Point = {
    type_of_point: 'refutation' | 'counterpoint' | 'question' | 'dilemma';
    content: string;
    highlighted_text:Array<string>;
    color:string;
}

export type Response = {
    header: string;
    points: Array<Point>;
}

export type UserInformation = {
    firstName:string;
    lastName:string;
    documents:Array<string>;
}

// export type Feedbacl

// export interface AdviceResponse {
//     point:
// }