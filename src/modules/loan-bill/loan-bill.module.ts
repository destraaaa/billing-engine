import { Module } from "@nestjs/common";
import { LoanBillController } from "./loan-bill.controller";
import { LoanBillService } from "./loan-bill.service";
import { LoanBillRepository } from "./loan-bill.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { LoanBill, LoanBillSchema } from "./loan-bill.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LoanBill.name,
        schema: LoanBillSchema,
      },
    ]),
  ],
  controllers: [LoanBillController],
  providers: [LoanBillService, LoanBillRepository],
  exports: [LoanBillService]
})
export class LoanBillModule {}
