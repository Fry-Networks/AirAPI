export interface Point {
    ts: Date;
    value: number;
}

export interface DataItem {
    param: string;
    units: string;
    span: number;
    points: Point[];
}


export interface RequestBody {
    miner_key: string;
    token: string;
    deviceId: string;
    address: string;
}
