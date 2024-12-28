import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type LoanDocument = Loan & Document;

export enum INTERVAL_ENUM {
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
  }

@Schema({ collection: 'loan', timestamps: true })
export class Loan {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  principalAmount: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  tenure: number;

  @Prop({ required: true })
  interestPctPerAnnum: number;

  @Prop({ required: true })
  installmentAmount: number;

  @Prop({ required: true})
  interval: INTERVAL_ENUM;

  @Prop({ required: true })
  isSettled: boolean;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);