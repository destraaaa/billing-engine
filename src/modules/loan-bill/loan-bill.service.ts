import { Injectable } from "@nestjs/common";
import { INTERVAL_ENUM, LoanBill } from "./loan-bill.schema";
import { Loan } from "../loan/loan.schema";
import { LoanBillRepository } from "./loan-bill.repository";
import { ClientSession } from "mongoose";
@Injectable()
export class LoanBillService {
  constructor(
    private readonly loanBillRepository: LoanBillRepository,
  ) {}
  async generateBillsForLoan(
    loan: Loan,
    session?: ClientSession,
  ): Promise<LoanBill[]> {
    let lastDueDate = loan['createdAt'];
    const bills = []; 
    for(let i=0;i<loan.tenure;i++){
        const loanBill: LoanBill = {
            userId: loan.userId,
            seqNum: i+1,
            dueDate: lastDueDate.setDate(lastDueDate.getDate() + 7),
            amountDue: loan.installmentAmount,
            isPaid: false,
            loan: loan['_id'],
        }
        bills.push(loanBill);
    }
    return this.loanBillRepository.createMany(bills);
  }

  async getBillsFromLoan(loan: Loan) {
    return this.loanBillRepository.findUsingFilter({loan: loan['_id']});
  }

  async getBillsFromLoanAndSeqNum(loan: Loan, seqNumFrom: number, seqNumTo: number) {
    return this.loanBillRepository.findUsingFilter({loan: loan['_id'], seqNum: {$gte: seqNumFrom, $lte: seqNumTo}});
  }

  async payBills(loan: Loan, seqNumFrom: number, seqNumTo: number, session?: ClientSession) {
    return this.loanBillRepository.updateMany({loan: loan['_id'], seqNum: {$gte: seqNumFrom, $lte: seqNumTo}}, {isPaid: true}, session);
  }
}