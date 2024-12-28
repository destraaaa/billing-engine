import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { LoanRepository } from "./loan.repository";
import { INTERVAL_ENUM, Loan } from "./loan.schema";
import { LoanService } from "./loan.service";
import { LoanRepaymentService } from "../loan-repayment/loan-repayment.service";
import { LoanBillService } from "../loan-bill/loan-bill.service";
import { getConnectionToken } from "@nestjs/mongoose";
import { LoanRepaymentRepository } from "../loan-repayment/loan-repayment.repository";
import { LoanBillRepository } from "../loan-bill/loan-bill.repository";
import { LoanDueDto } from "./loan.dto";


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
describe('LoanService', () => {
    let repository: LoanRepository;
    let service: LoanService;
    let loanBillService: LoanBillService;
    let loanRepaymentService: LoanRepaymentService;
  
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
            LoanService,
            {
                provide: LoanRepaymentService,
                useValue: {},
            },
            {
                provide: LoanBillService,
                useValue: {},
            },
            {
                provide: LoanRepository,
                useValue: {},
            },
            {
                provide: getConnectionToken(),
                useClass: MockConnection,
            }
        ],
      }).compile();
  
      service = moduleRef.get<LoanService>(LoanService);
      repository = moduleRef.get<LoanRepository>(
        LoanRepository,
      );
      loanBillService = moduleRef.get<LoanBillService>(
        LoanBillService,
      );
      loanRepaymentService = moduleRef.get<LoanRepaymentService>( 
        LoanRepaymentService
      );
    });
  
    describe('newLoan', () => {
        it('should create a new loan successfully', async () => {
            
            const userId = 'user123';
            const amount = 5000000;
            const interval = INTERVAL_ENUM.WEEKLY;
            const tenure = 50;
            const interestPctPerAnnum = 10;
            const afterInterest = ((100 + interestPctPerAnnum) / 100) * amount;
        
            const mockSession = {
              startTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              endSession: jest.fn(),
            };
        
            const createdLoan = {
              userId,
              principalAmount: amount,
              amount: afterInterest,
              interval,
              tenure,
              interestPctPerAnnum,
              installmentAmount: afterInterest / tenure,
              isSettled: false,
            };
        
            repository.create = jest.fn().mockResolvedValue(createdLoan);
            loanBillService.generateBillsForLoan = jest.fn().mockResolvedValue([]);
        
            
            const result = await service.newLoan(userId, amount, interval, tenure, interestPctPerAnnum);
            expect(result).toEqual(createdLoan);
          });
    });

    describe('getLoanByUser', () => {
        it('should return loan details successfully', async () => {
            
            const userId = 'user123';
            const currentDate = new Date();
            const mockLoan = {
              userId,
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              isSettled: false,
            };
        
            const nextDue = {
              dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
              payableAmount: 100000,
            };
        
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(mockLoan);
            service.getNextDue = jest.fn().mockResolvedValue(nextDue);
            service.getOutstandingBalance = jest.fn().mockResolvedValue(1000000);
            service.countLatePayment = jest.fn().mockResolvedValue(2);
            service.isDelinquent = jest.fn().mockResolvedValue(true);
        
            
            const result = await service.getLoanByUser(userId, currentDate);
        
            
            expect(repository.findOneUsingFilter).toHaveBeenCalledWith({ userId });
            expect(service.getNextDue).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(service.getOutstandingBalance).toHaveBeenCalledWith(mockLoan);
            expect(service.countLatePayment).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(service.isDelinquent).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(result).toEqual({
              loan: mockLoan,
              outstandingBalance: 1000000,
              latePaymentCount: 2,
              isDelinquent: true,
              nextDueDate: nextDue.dueDate,
              payableAmount: nextDue.payableAmount,
            });
          });

        it('should return null if no loan is found', async () => {
            
            const userId = 'user123';
            const currentDate = new Date();
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(null);
        
            
            const result = await service.getLoanByUser(userId, currentDate);
        
            
            expect(repository.findOneUsingFilter).toHaveBeenCalledWith({ userId });
            expect(result).toBeNull();
        });
    });

    describe('getOutstandingBalance', () => {
        it('should calculate outstanding balance correctly', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const mockBills = [
              { isPaid: false, amountDue: 100000 },
              { isPaid: true, amountDue: 100000 },
              { isPaid: false, amountDue: 200000 },
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getOutstandingBalance(mockLoan);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(300000); // Sum of unpaid bills: 100000 + 200000
        });
        
        it('should return 0 if all bills are paid', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const mockBills = [
              { isPaid: true, amountDue: 100000 },
              { isPaid: true, amountDue: 200000 },
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getOutstandingBalance(mockLoan);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(0);
          });
        
          it('should return 0 if there are no bills', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const mockBills = [];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getOutstandingBalance(mockLoan);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(0);
          });
    });

    describe('countLatePayment', () => {
        it('should count late payments correctly', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const currentDate = new Date('2024-01-15');
            const mockBills = [
              { isPaid: false, dueDate: new Date('2024-01-10') }, // Late
              { isPaid: false, dueDate: new Date('2024-01-05') }, // Late
              { isPaid: true, dueDate: new Date('2024-01-10') },  // Paid, not late
              { isPaid: false, dueDate: new Date('2024-01-20') }, // Not late
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.countLatePayment(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(2); // Two late payments
        });
        
        it('should return 0 if there are no late payments', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const currentDate = new Date('2024-01-15');
            const mockBills = [
              { isPaid: true, dueDate: new Date('2024-01-10') },  // Paid
              { isPaid: false, dueDate: new Date('2024-01-20') }, // Not late
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.countLatePayment(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(0); // No late payments
        });
        
        it('should return 0 if there are no bills', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: INTERVAL_ENUM.WEEKLY,
              tenure: 50,
              interestPctPerAnnum: 10,
              installmentAmount: 110000,
              isSettled: false,
            };
        
            const currentDate = new Date('2024-01-15');
            const mockBills = [];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.countLatePayment(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toBe(0); // No bills
        });
    });

    describe('getNextDue', () => {
        it('should calculate next due details correctly when there are unpaid bills within next 7 days', async () => {
            
            const currentDate = new Date('2024-01-01');
            const nextDueDate = new Date('2024-01-08');
            const mockLoan = {
              userId: 'user123',
              installmentAmount: 100000,
            } as any as Loan;
        
            const mockBills = [
              { isPaid: false, dueDate: new Date('2024-01-05'), seqNum: 1, amountDue: 100000 },
              { isPaid: false, dueDate: new Date('2024-01-06'), seqNum: 2, amountDue: 100000 },
              { isPaid: true, dueDate: new Date('2024-01-03'), seqNum: 3, amountDue: 100000 },
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getNextDue(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toEqual({
              dueDate: mockBills[1].dueDate, // The due date of the last unpaid bill within the range
              payableAmount: 200000, // Sum of unpaid bills
              billCount: 2, // Two unpaid bills
              amountPerBill: 100000,
              firstBillSeqNum: 1, // The seqNum of the first unpaid bill
            });
          });
        
          it('should return "N/A" and zero amounts when there are no unpaid bills within next 7 days', async () => {
            
            const currentDate = new Date('2024-01-01');
            const mockLoan = {
              userId: 'user123',
              installmentAmount: 100000,
            } as any as Loan;
        
            const mockBills = [
              { isPaid: true, dueDate: new Date('2024-01-05'), seqNum: 1, amountDue: 100000 },
              { isPaid: true, dueDate: new Date('2024-01-06'), seqNum: 2, amountDue: 100000 },
            ];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getNextDue(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toEqual({
              dueDate: 'N/A',
              payableAmount: 0,
              billCount: 0,
              amountPerBill: 100000,
              firstBillSeqNum: 0,
            });
          });
        
          it('should handle the case when there are no bills at all', async () => {
            
            const currentDate = new Date('2024-01-01');
            const mockLoan = {
              userId: 'user123',
              installmentAmount: 100000,
            } as any as Loan;
        
            const mockBills = [];
        
            loanBillService.getBillsFromLoan = jest.fn().mockResolvedValue(mockBills);
        
            
            const result = await service.getNextDue(mockLoan, currentDate);
        
            
            expect(loanBillService.getBillsFromLoan).toHaveBeenCalledWith(mockLoan);
            expect(result).toEqual({
              dueDate: 'N/A',
              payableAmount: 0,
              billCount: 0,
              amountPerBill: 100000,
              firstBillSeqNum: 0,
            });
          });
    });

    describe('isDelinquent', () => {
        it('should return true when late payment count is 2 or more', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: 'WEEKLY',
              tenure: 50,
              interestPctPerAnnum: 10,
              isSettled: false,
            } as any as Loan;
        
            const currentDate = new Date('2024-01-01');
        
            jest.spyOn(service, 'countLatePayment').mockResolvedValue(2);
        
            
            const result = await service.isDelinquent(mockLoan, currentDate);
        
            
            expect(service.countLatePayment).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(result).toBe(true);
          });
        
          it('should return false when late payment count is less than 2', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: 'WEEKLY',
              tenure: 50,
              interestPctPerAnnum: 10,
              isSettled: false,
            } as any as Loan;
        
            const currentDate = new Date('2024-01-01');
        
            jest.spyOn(service, 'countLatePayment').mockResolvedValue(1);
        
            
            const result = await service.isDelinquent(mockLoan, currentDate);
        
            
            expect(service.countLatePayment).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(result).toBe(false);
          });
        
          it('should return false when there are no late payments', async () => {
            
            const mockLoan = {
              userId: 'user123',
              principalAmount: 5000000,
              amount: 5500000,
              interval: 'WEEKLY',
              tenure: 50,
              interestPctPerAnnum: 10,
              isSettled: false,
            } as any as Loan;
        
            const currentDate = new Date('2024-01-01');
        
            jest.spyOn(service, 'countLatePayment').mockResolvedValue(0);
        
            
            const result = await service.isDelinquent(mockLoan, currentDate);
        
            
            expect(service.countLatePayment).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(result).toBe(false);
          });
    });

    describe('makePayment', () => {
        it('should successfully process a payment', async () => {
            
            const mockUserId = 'user123';
            const mockAmount = 5000;
            const currentDate = new Date('2024-01-01');
            const mockLoan = { userId: mockUserId, isSettled: false };
            const mockNextDue = {
              payableAmount: 5000,
              amountPerBill: 1000,
              firstBillSeqNum: 1,
            } as any as LoanDueDto;
            const mockPaidBills = [
              { seqNum: 1, isPaid: true },
              { seqNum: 2, isPaid: true },
            ];
            const mockRepayment = [{ id: 'repayment123' }];
        
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(mockLoan);
            jest.spyOn(service, 'getNextDue').mockResolvedValue(mockNextDue);
            loanBillService.getBillsFromLoanAndSeqNum = jest.fn().mockResolvedValue(mockPaidBills);
            loanBillService.payBills = jest.fn().mockResolvedValue(mockPaidBills);
            loanRepaymentService.newLoanRepayment = jest.fn().mockResolvedValue(mockRepayment);
        
            
            const result = await service.makePayment(mockUserId, mockAmount, currentDate);
        
            
            expect(repository.findOneUsingFilter).toHaveBeenCalledWith({ userId: mockUserId });
            expect(service.getNextDue).toHaveBeenCalledWith(mockLoan, currentDate);
            expect(loanBillService.getBillsFromLoanAndSeqNum).toHaveBeenCalledWith(
              mockLoan,
              mockNextDue.firstBillSeqNum,
              mockNextDue.firstBillSeqNum + mockAmount / mockNextDue.amountPerBill - 1,
            );
            expect(loanRepaymentService.newLoanRepayment).toHaveBeenCalledWith(
              mockUserId,
              mockAmount,
              mockPaidBills,
              expect.anything(),
            );
            expect(result).toEqual(mockRepayment);
          });
        
          it('should throw BillAlreadyPaid when payableAmount is 0', async () => {
            
            const mockUserId = 'user123';
            const mockAmount = 5000;
            const currentDate = new Date('2024-01-01');
            const mockLoan = { userId: mockUserId };
            const mockNextDue = { payableAmount: 0 } as any as LoanDueDto;
        
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(mockLoan);
            jest.spyOn(service, 'getNextDue').mockResolvedValue(mockNextDue);
        
            
            await expect(service.makePayment(mockUserId, mockAmount, currentDate)).rejects.toThrow('Bill is already paid');
          });
        
          it('should throw InvalidPaymentAmount when amount does not match payableAmount', async () => {
            
            const mockUserId = 'user123';
            const mockAmount = 4000; // Incorrect amount
            const currentDate = new Date('2024-01-01');
            const mockLoan = { userId: mockUserId };
            const mockNextDue = { payableAmount: 5000 } as any as LoanDueDto;
        
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(mockLoan);
            jest.spyOn(service, 'getNextDue').mockResolvedValue(mockNextDue);
        
            
            await expect(service.makePayment(mockUserId, mockAmount, currentDate)).rejects.toThrow('The amount must paid must be 5000');
          });
        
          it('should throw LoanIsSettled when loan is already settled', async () => {
            
            const mockUserId = 'user123';
            const mockAmount = 5000;
            const currentDate = new Date('2024-01-01');
            const mockLoan = { userId: mockUserId, isSettled: true };
        
            repository.findOneUsingFilter = jest.fn().mockResolvedValue(mockLoan);
        
            
            await expect(service.makePayment(mockUserId, mockAmount, currentDate)).rejects.toThrow('Loan is already settled');
          });
    });
});
  