import { Injectable } from "@nestjs/common";
import { INTERVAL_ENUM, Loan } from "./loan.schema";
import { LoanRepository } from "./loan.repository";
import { LoanDetailResponse, LoanDueDto } from "./loan.dto";
import { LoanBillService } from "../loan-bill/loan-bill.service";
import { LoanRepayment } from "../loan-repayment/loan-repayment.schema";
import { BillAlreadyPaid, InvalidPaymentAmount, LoanIsSettled } from "../../constants/errors.enum";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { LoanRepaymentService } from "../loan-repayment/loan-repayment.service";

@Injectable()
export class LoanService {
  constructor(
    @InjectConnection() protected readonly connection: Connection,
    private readonly loanRepository: LoanRepository,
    private readonly loanBillService: LoanBillService,
    private readonly loanRepaymentService: LoanRepaymentService,
  ) {}

  async newLoan(
    userId: string,
    amount: number = 5000000,    
    interval=INTERVAL_ENUM.WEEKLY,
    tenure: number = 50,
    interestPctPerAnnum: number = 10): Promise<Loan[]> {
    const afterInterest = ((100+interestPctPerAnnum)/100)*amount;
    const loan: Loan = {
        userId: userId,
        principalAmount: amount,
        amount: afterInterest,
        interval: interval,
        tenure: tenure,
        interestPctPerAnnum: interestPctPerAnnum,
        installmentAmount: afterInterest/tenure,
        isSettled: false,
    }
    const session = await this.connection.startSession();
    try {
        session.startTransaction();
        const createdLoan = await this.loanRepository.create(loan);
        const loanBills = await this.loanBillService.generateBillsForLoan(createdLoan[0], session);
        return createdLoan;
    } catch (error) {
        await session.abortTransaction();
    } finally {
        await session.endSession();
    }
  }

  async getLoanByUser(userId: string, currentDate: Date = new Date()): Promise<LoanDetailResponse> {
    const loan = await this.loanRepository.findOneUsingFilter({userId: userId});
    if (!loan) {
        return null;
    }
    const nextDue = await this.getNextDue(loan, currentDate);
    return {
        loan: loan,
        outstandingBalance: await this.getOutstandingBalance(loan),
        latePaymentCount: await this.countLatePayment(loan, currentDate),
        isDelinquent: await this.isDelinquent(loan, currentDate),
        nextDueDate: nextDue.dueDate,
        payableAmount: nextDue.payableAmount,
    }
  }

  async getOutstandingBalance(loan: Loan): Promise<number> {
    const loanBills = await this.loanBillService.getBillsFromLoan(loan);
    return loanBills.filter(bill => !bill.isPaid).reduce((acc, bill) => acc + bill.amountDue, 0);
  }

  async countLatePayment(loan: Loan, currentDate: Date = new Date()): Promise<number> {
    const loanBills = await this.loanBillService.getBillsFromLoan(loan);
    return loanBills.filter(bill => !bill.isPaid && bill.dueDate < currentDate).length;
  }

  async getNextDue(loan: Loan, currentDate: Date = new Date()): Promise<LoanDueDto> {
    const nextDueDate = new Date(currentDate);
    nextDueDate.setDate(currentDate.getDate() + 7);

    const loanBills = await this.loanBillService.getBillsFromLoan(loan);
    const payableBills = loanBills.filter(bill => !bill.isPaid && bill.dueDate < nextDueDate);
    
    const billCount = payableBills.length;
    const dueDate = billCount > 0 ? payableBills[billCount - 1].dueDate : "N/A";
    const amountPerBill = loan.installmentAmount;
    const payableAmount = payableBills.reduce((acc, bill) => acc + bill.amountDue, 0);
    const firstBillSeqNum = billCount > 0 ? payableBills[0].seqNum : 0;
    return {
        dueDate,
        payableAmount,
        billCount,
        amountPerBill,
        firstBillSeqNum,   
    }
  }

  async isDelinquent(loan: Loan, currentDate: Date = new Date()): Promise<boolean> {
    return await this.countLatePayment(loan, currentDate) >= 2;
  }

  async makePayment(
    userId: string,
    amount: number,
    currentDate: Date = new Date()
  ): Promise<LoanRepayment[]> {
    const loan = await this.loanRepository.findOneUsingFilter({userId: userId});
    if(loan.isSettled) {
        throw LoanIsSettled();
    }
    const nextDue = await this.getNextDue(loan, currentDate);
    if(nextDue.payableAmount === 0) {
        throw BillAlreadyPaid();
    }
    if(amount !== nextDue.payableAmount) {
        throw InvalidPaymentAmount(nextDue.payableAmount);
    }
    const session = await this.connection.startSession();
    try {
        session.startTransaction();
        const billToPayCount = amount / nextDue.amountPerBill;
        const paidBills = await this.loanBillService.getBillsFromLoanAndSeqNum(loan, nextDue.firstBillSeqNum, nextDue.firstBillSeqNum + billToPayCount - 1);
        const payBills = await this.loanBillService.payBills(loan, nextDue.firstBillSeqNum, nextDue.firstBillSeqNum + billToPayCount - 1, session);
        if(nextDue.firstBillSeqNum + billToPayCount - 1 == loan.tenure) {
            await this.loanRepository.updateOneUsingFilter({userId: userId}, {isSettled: true});
        }
        return this.loanRepaymentService.newLoanRepayment(loan.userId, amount, paidBills, session);
    } catch (error) {
        await session.abortTransaction();
    } finally {
        await session.endSession();
    }
  }

}