import { getConnectionToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { LoanBillRepository } from "./loan-bill.repository";
import { LoanBillService } from "./loan-bill.service";
import { Loan } from "../loan/loan.schema";
import { LoanBill } from "./loan-bill.schema";
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
describe('LoanBillService', () => {
    let loanBillRepository: LoanBillRepository;
    let loanBillService: LoanBillService;
  
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
            LoanBillService,
            {
                provide: LoanBillRepository,
                useValue: {},
            },
            {
                provide: getConnectionToken(),
                useClass: MockConnection,
            }
        ],
      }).compile();
  
      loanBillService = moduleRef.get<LoanBillService>(LoanBillService);
      loanBillRepository = moduleRef.get<LoanBillRepository>(
        LoanBillRepository,
      );
    });
  
    describe('generateBillsForLoan', () => {
        it('should generate and save loan bills for a given loan', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
              createdAt: new Date('2024-01-01'),
              tenure: 3,
              installmentAmount: 1000,
            } as any as Loan;
        
            const mockSession = {};
            const expectedBills: LoanBill[] = [
              {
                userId: 'user123',
                seqNum: 1,
                dueDate: new Date('2024-01-08'), // 7 days after createdAt
                amountDue: 1000,
                isPaid: false,
                loan: new Types.ObjectId("67700a3ee69842060406226c"),
              },
              {
                userId: 'user123',
                seqNum: 2,
                dueDate: new Date('2024-01-15'), // 14 days after createdAt
                amountDue: 1000,
                isPaid: false,
                loan: new Types.ObjectId("67700a3ee69842060406226c"),
              },
              {
                userId: 'user123',
                seqNum: 3,
                dueDate: new Date('2024-01-22'), // 21 days after createdAt
                amountDue: 1000,
                isPaid: false,
                loan: new Types.ObjectId("67700a3ee69842060406226c"),
              },
            ];
        
            loanBillRepository.createMany = jest.fn().mockResolvedValue(expectedBills);
        
            
            const result = await loanBillService.generateBillsForLoan(mockLoan, mockSession as any);
        
            
            expect(result).toEqual(expectedBills);
          });
    });

    describe('getBillsFromLoan', () => {
        it('should return loan bills for the given loan', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            const mockBills = [
              { seqNum: 1, amountDue: 1000, isPaid: false },
              { seqNum: 2, amountDue: 1000, isPaid: true },
            ];
        
            loanBillRepository.findUsingFilter = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await loanBillService.getBillsFromLoan(mockLoan);
        
            
            expect(result).toEqual(mockBills);
          });
        
          it('should return an empty array if no bills are found', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            loanBillRepository.findUsingFilter = jest.fn().mockResolvedValue([]);
        
            
            const result = await loanBillService.getBillsFromLoan(mockLoan);
        
            
            expect(result).toEqual([]);
          }); 
    });

    describe('getBillsFromLoanAndSeqNum', () => {
        it('should return loan bills within the specified sequence number range', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            const seqNumFrom = 1;
            const seqNumTo = 3;
        
            const mockBills = [
              { seqNum: 1, amountDue: 1000, isPaid: false },
              { seqNum: 2, amountDue: 1000, isPaid: true },
              { seqNum: 3, amountDue: 1000, isPaid: false },
            ];
        
            loanBillRepository.findUsingFilter = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await loanBillService.getBillsFromLoanAndSeqNum(mockLoan, seqNumFrom, seqNumTo);
        
            
            expect(result).toEqual(mockBills);
          });
        
          it('should return an empty array if no bills match the criteria', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            const seqNumFrom = 5;
            const seqNumTo = 10;
        
            loanBillRepository.findUsingFilter = jest.fn().mockResolvedValue([]);
        
            
            const result = await loanBillService.getBillsFromLoanAndSeqNum(mockLoan, seqNumFrom, seqNumTo);
        
            
            expect(result).toEqual([]);
          });
    });

    describe('payBills', () => {
        it('should update loan bills as paid within the specified sequence number range', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            const seqNumFrom = 1;
            const seqNumTo = 3;
            const mockSession = {}; // Mocked session if needed
        
            const mockUpdatedBills = [
              { seqNum: 1, amountDue: 1000, isPaid: true },
              { seqNum: 2, amountDue: 1000, isPaid: true },
              { seqNum: 3, amountDue: 1000, isPaid: true },
            ];
        
            loanBillRepository.updateMany = jest.fn().mockResolvedValue(mockUpdatedBills);
        
            
            const result = await loanBillService.payBills(mockLoan, seqNumFrom, seqNumTo, mockSession as any);
        
            
            expect(result).toEqual(mockUpdatedBills);
          });
        
          it('should return an empty array if no bills are updated', async () => {
            
            const mockLoan: Loan = {
              _id: '67700a3ee69842060406226c',
              userId: 'user123',
            } as any as Loan;
        
            const seqNumFrom = 5;
            const seqNumTo = 10;
            const mockSession = {}; // Mocked session if needed
        
            loanBillRepository.updateMany = jest.fn().mockResolvedValue([]);
        
            
            const result = await loanBillService.payBills(mockLoan, seqNumFrom, seqNumTo, mockSession as any);
        
            
            expect(result).toEqual([]);
          });
    });
});