import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Loan, LoanDocument } from "./loan.schema";

@Injectable()
export class LoanRepository {
  constructor(
    @InjectModel(Loan.name)
    private readonly model: Model<LoanDocument>,
  ) {}

  async create(loan: Loan, session?: ClientSession): Promise<Loan[]> {
    return this.model.create([loan], {session});
  }

  async findOneUsingFilter(filter: object): Promise<Loan> {
    return this.model.findOne(filter).exec();
  }
}