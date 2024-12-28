import { getConnectionToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { LoanRepaymentRepository } from "./loan-repayment.repository";
import { LoanRepaymentService } from "./loan-repayment.service";
import { LoanBill, LoanBillSchema } from "../loan-bill/loan-bill.schema";
import { LoanRepayment } from "./loan-repayment.schema";
import { Types } from "mongoose";

class MockConnection {
    startSession() {
        return {
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        };
    }
}
describe('LoanRepaymentService', () => {
    let loanRepaymentRepository: LoanRepaymentRepository;
    let loanRepaymentService: LoanRepaymentService;
  
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
            LoanRepaymentService,
            {
                provide: LoanRepaymentRepository,
                useValue: {},
            },
            {
                provide: getConnectionToken(),
                useClass: MockConnection,
            }
        ],
      }).compile();
  
      loanRepaymentService = moduleRef.get<LoanRepaymentService>(LoanRepaymentService);
      loanRepaymentRepository = moduleRef.get<LoanRepaymentRepository>(
        LoanRepaymentRepository,
      );
    });
  
    describe('newLoanRepayment', () => {
        it('should create a new loan repayment with the correct loan bills', async () => {
            
            const userId = 'user123';
            const amount = 5000;
            const mockLoanBills: LoanBill[] = [
              { _id: '67700a3ee69842060406226c', seqNum: 1, amountDue: 1000, isPaid: false } as any as LoanBill,
              { _id: '67700a3ee69842060406226d', seqNum: 2, amountDue: 1000, isPaid: false } as any as LoanBill,
            ];
        
            const mockLoanRepayment: LoanRepayment = {
              userId: userId,
              amount: amount,
              loanBills: [new Types.ObjectId('67700a3ee69842060406226c'), new Types.ObjectId('67700a3ee69842060406226d')],
            };
        
            loanRepaymentRepository.create = jest.fn().mockResolvedValue([mockLoanRepayment]);
        
            
            const result = await loanRepaymentService.newLoanRepayment(userId, amount, mockLoanBills);
        
            
            expect(result).toEqual([mockLoanRepayment]);
          });
        
          it('should create a new loan repayment with a session', async () => {
            
            const userId = 'user123';
            const amount = 5000;
            const mockLoanBills: LoanBill[] = [
              { _id: new Types.ObjectId('67700a3ee69842060406226c'), seqNum: 1, amountDue: 1000, isPaid: false } as any as LoanBill,
            ];
        
            const mockLoanRepayment: LoanRepayment = {
              userId: userId,
              amount: amount,
              loanBills: [new Types.ObjectId('67700a3ee69842060406226c')],
            };
        
            const mockSession = {}; // Mocked session
            loanRepaymentRepository.create = jest.fn().mockResolvedValue([mockLoanRepayment]);
        
            
            const result = await loanRepaymentService.newLoanRepayment(userId, amount, mockLoanBills, mockSession as any);
        
            
            expect(result).toEqual([mockLoanRepayment]);
          });
        
          it('should return an empty array if no loan bills are provided', async () => {
            
            const userId = 'user123';
            const amount = 5000;
            const mockLoanBills: LoanBill[] = []; // No loan bills
        
            loanRepaymentRepository.create = jest.fn().mockResolvedValue([]);
        
            
            const result = await loanRepaymentService.newLoanRepayment(userId, amount, mockLoanBills);
        
            
            expect(result).toEqual([]);
          });
    });
});