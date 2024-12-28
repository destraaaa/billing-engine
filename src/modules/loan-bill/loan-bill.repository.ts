import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { LoanBill, LoanBillDocument } from "../loan-bill/loan-bill.schema";

@Injectable()
export class LoanBillRepository {
  constructor(
    @InjectModel(LoanBill.name)
    private readonly model: Model<LoanBillDocument>,
  ) {}

  async createMany(loanBills: LoanBill[]): Promise<LoanBill[]> {
    return this.model.insertMany(loanBills);
  }

  async findUsingFilter(filter: object): Promise<LoanBill[]> {
    return this.model.find(filter).sort({'seqNum': 1}).exec();
  }

  async updateMany(
    filter,
    loanBill: Partial<LoanBill>,
    session?: ClientSession,
  ) {
    return await this.model
      .updateMany(filter, { ...loanBill })
      .session(session)
      .exec();
  }
}