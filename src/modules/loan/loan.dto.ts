import { INTERVAL_ENUM, Loan } from "./loan.schema";

export class CreateLoanDto {
    userId: string;
    amount: number = 5000000;
    tenure: number = 50;
    interval: INTERVAL_ENUM = INTERVAL_ENUM.WEEKLY;
}

export class LoanDetailResponse {
    loan: Loan;
    outstandingBalance: number;
    latePaymentCount: number;
    isDelinquent: boolean;
    nextDueDate: Date | string;
    payableAmount: number;
}

export class LoanDueDto {
    dueDate: Date | string;
    payableAmount: number;
    billCount: number;
    amountPerBill: number;
    firstBillSeqNum: number;
}

export class LoanPaymentRequest {
    amount: number;
}