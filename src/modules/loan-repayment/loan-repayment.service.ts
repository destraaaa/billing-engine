import { Injectable } from "@nestjs/common";
import { LoanRepayment } from "./loan-repayment.schema";
import { Loan } from "../loan/loan.schema";
import { LoanRepaymentRepository } from "./loan-repayment.repository";
import { LoanBill } from "../loan-bill/loan-bill.schema";
import { ClientSession } from "mongoose";
@Injectable()
export class LoanRepaymentService {
  constructor(
    private readonly loanRepaymentRepository: LoanRepaymentRepository,
  ) {}

  async newLoanRepayment(
    userId: string,
    amount: number,
    loanBills: LoanBill[],
    session?: ClientSession
  ): Promise<LoanRepayment[]> {
    const loanRepayment: LoanRepayment = {
      userId: userId,
      amount: amount,
      loanBills: loanBills.map((loanBill) => loanBill['_id']),  
    }
    return this.loanRepaymentRepository.create(loanRepayment, session);
  }
}