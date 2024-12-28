import { HttpStatus } from "@nestjs/common";
import ApiError from "./api-error";

export const InvalidDateFormatError = () =>
    new ApiError(
      HttpStatus.BAD_REQUEST,
      "INVALID_DATE_FORMAT",
      'Date format is invalid',
    );

export const InvalidPaymentAmount = (payableAmount) =>
    new ApiError(
        HttpStatus.BAD_REQUEST,
        "INVALID_PAYMENT_AMOUNT",
        `The amount must paid must be ${payableAmount}`,
    );

export const BillAlreadyPaid = () =>
    new ApiError(
        HttpStatus.BAD_REQUEST,
        "BILL_ALREADY_PAID",
        `Bill is already paid`,
    );

export const LoanIsSettled = () =>
    new ApiError(
        HttpStatus.BAD_REQUEST,
        "LOAN_IS_SETTLED",
        `Loan is already settled`,
    );