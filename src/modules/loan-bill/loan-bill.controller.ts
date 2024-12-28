import { Controller, Post, Headers, Body } from "@nestjs/common";
import { LoanBillService } from "./loan-bill.service";
import { LoanBill } from "./loan-bill.schema";

@Controller()
export class LoanBillController {
  constructor(private readonly loanService: LoanBillService) {}

  // @Post("/loan")
  // async createLoanBill(
  //   @Headers("user-id") userId: string,
  //   @Body() loan: LoanBill,
  // ): Promise<LoanBill> {
  //   return this.loanService.newLoanBill(userId, loan.amount+1, loan.interval, loan.tenure);
  // }
}
