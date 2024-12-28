import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoanRepaymentController } from "./loan-repayment.controller";
import { LoanRepaymentRepository } from "./loan-repayment.repository";
import { LoanRepayment, LoanRepaymentSchema } from "./loan-repayment.schema";
import { LoanRepaymentService } from "./loan-repayment.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LoanRepayment.name,
        schema: LoanRepaymentSchema,
      },
    ]),
  ],
  controllers: [LoanRepaymentController],
  providers: [LoanRepaymentService, LoanRepaymentRepository],
  exports: [LoanRepaymentService]
})
export class LoanRepaymentModule {}
