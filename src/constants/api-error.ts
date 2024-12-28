import { HttpStatus } from "@nestjs/common";

export default class ApiError extends Error {
    message: string;
    code: string;
    err?: any;
    status: HttpStatus;
  
    constructor(status: HttpStatus, code?: string, message?: string, err?: any) {
      super(message);
      this.status = status;
      this.code = code;
      this.message = message;
      this.err = err;
    }
  
    isEqualTo(other: ApiError): boolean {
      return (
        this.status === other.status &&
        this.code === other.code &&
        this.message === other.message &&
        this.err === other.err
      );
    }
  }
  