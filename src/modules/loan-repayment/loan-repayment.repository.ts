import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { LoanRepayment, LoanRepaymentDocument } from "../loan-repayment/loan-repayment.schema";

@Injectable()
export class LoanRepaymentRepository {
  constructor(
    @InjectModel(LoanRepayment.name)
    private readonly model: Model<LoanRepaymentDocument>,
  ) {}

  async create(loanRepayment: LoanRepayment, session?:ClientSession): Promise<LoanRepayment[]> {
    return await this.model.create([loanRepayment], {session});
  }
}