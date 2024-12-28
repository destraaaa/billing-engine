import { Module } from "@nestjs/common";
import { LoanController } from "./loan.controller";
import { LoanService } from "./loan.service";
import { LoanRepository } from "./loan.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Loan, LoanSchema } from "./loan.schema";
import { LoanBillModule } from "../loan-bill/loan-bill.module";
import { LoanRepaymentModule } from "../loan-repayment/loan-repayment.module";

@Module({
  imports: [
    MongooseModule.forFeature([
        {
          name: Loan.name,
          schema: LoanSchema,
        },
      ]),
    LoanBillModule,
    LoanRepaymentModule,
  ],
  controllers: [LoanController],
  providers: [LoanService, LoanRepository],
})
export class LoanModule {}
