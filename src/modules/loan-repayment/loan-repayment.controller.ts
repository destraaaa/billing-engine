import { Controller, Post, Headers, Body } from "@nestjs/common";
import { LoanRepaymentService } from "./loan-repayment.service";
import { LoanRepayment } from "./loan-repayment.schema";

@Controller()
export class LoanRepaymentController {
  constructor(private readonly loanService: LoanRepaymentService) {}

  // @Post("/loan")
  // async createLoanRepayment(
  //   @Headers("user-id") userId: string,
  //   @Body() loan: LoanRepayment,
  // ): Promise<LoanRepayment> {
  //   return this.loanService.newLoanRepayment(userId, loan.amount+1, loan.interval, loan.tenure);
  // }
}
