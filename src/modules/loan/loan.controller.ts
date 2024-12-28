import { Controller, Post, Headers, Body, Get, Query, UseInterceptors } from "@nestjs/common";
import { LoanService } from "./loan.service";
import { Loan } from "./loan.schema";
import { LoanBillService } from "../loan-bill/loan-bill.service";
import { LoanDetailResponse, LoanPaymentRequest } from "./loan.dto";
import { InvalidDateFormatError } from "src/constants/errors.enum";
import { LoanRepayment } from "../loan-repayment/loan-repayment.schema";

@Controller()
export class LoanController {
  constructor(
    private readonly loanService: LoanService,
) {}

  @Post("/loan")
  async createLoan(
    @Headers("user-id") userId: string,
    @Body() loan: Loan,
  ): Promise<Loan[]> {
    return this.loanService.newLoan(userId, loan.amount, loan.interval, loan.tenure);
  }

  @Get("/loan")
  async getLoan(
    @Headers("user-id") userId: string,
    @Query("current-date") currentDate: string,
  ): Promise<LoanDetailResponse> {
    if(!currentDate) {
      currentDate = new Date().toISOString();
    }
    const parsedDate = new Date(currentDate);
    if (isNaN(parsedDate.getTime())) {
      throw InvalidDateFormatError();
    }
    return this.loanService.getLoanByUser(userId, parsedDate);
  }

  @Post("/loan/make-payment")
  async makePayment(
    @Headers("user-id") userId: string,
    @Body() request: LoanPaymentRequest,
    @Query("current-date") currentDate: string,
  ): Promise<any> {
    if(!currentDate) {
      currentDate = new Date().toISOString();
    }
    const parsedDate = new Date(currentDate);
    if (isNaN(parsedDate.getTime())) {
      throw InvalidDateFormatError();
    }
    return this.loanService.makePayment(userId, request.amount, parsedDate);
  }
}
