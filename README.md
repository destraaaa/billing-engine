# Billing Engine

A simple Node.js application that represents a billing system. Basically the job of a billing engine is to provide the
- Loan schedule for a given loan( when am i supposed to pay how much)
- Outstanding Amount for a given loan
- Status of weather the customer is Delinquent or not 

---

## Features
- Create new Loan
- Get info from a loan of a user, determine next payment, how much to pay, and whether the borrower is delinquent
- Make Payment
---
## Prerequisites
Before running the project, ensure you have the following installed:
1. **Node.js** (v18 or higher) Download it from the [Node.js Official Website](https://nodejs.org/).
2. **MongoDB** Download and run the latest version from the [Community Website](https://www.mongodb.com/try/download/community) 
---

## Installation
### Step 1: Download the ZIP file and extract it 

### Step 2: Navigate to the Project Folder
```bash
cd billing-engine
```

### Step 3: Install Dependencies
```bash
npm install
```
---
## Usage

### Run the Program
To run the program, execute the following command:
```bash
npm run start
```
This will open port 3000 on your local machine and you will be able to call the APIs through it.

### APIs
### Make a New Loan
This is an API to initiate a loan for a user. This example depicts how to create 5 million IDR loan for user abc-1234
```bash
  curl --location 'localhost:3000/loan' \
--header 'user-id: abc-1234' \
--header 'Content-Type: application/json' \
--data '{
    "amount":5000000,
    "tenure": 50,
    "interval": "Weekly"
}'
```


### Get Loan Details
This is an API to see details from a loan by a user.
There is an optional `current-date` query param there. This is to simulate the current date of the system. If you omit this param, the system will assume the date to `new Date()`
```bash
curl --location 'localhost:3000/loan?current-date=2025-01-12' \
--header 'user-id: abc-1234' \
```

### Make Payment to a Loan
This is an API to make payment, and in effect chnges the status of the bills.
Similar to Get Loan Details, there is an optional `current-date` query param there. This is to simulate the current date of the system. If you omit this param, the system will assume the date to `new Date()`
```bash
curl --location 'localhost:3000/loan/make-payment?current-date=2025-01-12' \
--header 'user-id: abc-1234' \
--header 'Content-Type: application/json' \
--data '{
    "amount":330000
}'
```
Please note that the `amount` is assumed to be equals to `payableAmount` field in the Get Loan Details API.
This is written in the problem statement:
> assume that borrower can only pay the exact amount of payable that week or not pay at all 

---

## Development

### Run Unit Tests

To ensure everything is working correctly, run the unit tests:
```bash
npm run test:cov
```

### Modify the Code

The source code is modularized into:

1.  **Loan**: Located in `src/modules/loan`
2.  **LoanBill**: Located in `src/modules/loan-bill`
3.  **LoanRepayment**: Located in `src/modules/loan-repayment`

Each represents the data model stored in the DB. All business logic exist in the `xx.service.ts` in each respective file. 

## Support

If you encounter any issues or have questions, feel free to contact the author at `destra.bintang.perkasa@gmail.com`.