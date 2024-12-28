import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type LoanRepaymentDocument = LoanRepayment & Document;

export enum INTERVAL_ENUM {
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
  }

@Schema({ collection: 'loanRepayment', timestamps: true })
export class LoanRepayment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;
  
  @Prop({ required: true, default: null, ref: 'LoanBill' })
  loanBills: Types.ObjectId[];
}

export const LoanRepaymentSchema = SchemaFactory.createForClass(LoanRepayment);