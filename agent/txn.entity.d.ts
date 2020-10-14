import { BaseEntity } from "typeorm";
export declare enum TxnStatus {
    Processing = 0,
    Declined = 1,
    Successful = 2
}
export declare class Transaction extends BaseEntity {
    id: number;
    agent_id: number;
    amount: number;
    txn_time: string;
    txn_code: string;
    txn_status: TxnStatus;
    remark: string;
    decline_msg: string;
}
