import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type LoanBillDocument = LoanBill & Document;

export enum INTERVAL_ENUM {
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
  }

@Schema({ collection: 'loanBill', timestamps: true })
export class LoanBill {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  seqNum: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  amountDue: number;

  @Prop({ required: true, default: false })
  isPaid: boolean;
  
  @Prop({ required: false, type: Types.ObjectId, ref: 'Loan' })
  loan: Types.ObjectId;
}

export const LoanBillSchema = SchemaFactory.createForClass(LoanBill);