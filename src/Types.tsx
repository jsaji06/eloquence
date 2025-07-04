export type Point = {
    type_of_point: string;
    content: string
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