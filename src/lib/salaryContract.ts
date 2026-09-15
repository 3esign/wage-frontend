import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

export const PROGRAM_ID = new PublicKey("22XrMr2QW6feeH8J3e64ktc4zRnHCs4BCQHQC9UFrF53");
export const MINT = new PublicKey("ATR4Ud18HaHmrUCuod5zhsrDjahFQMzfXYJVx8VYvPEt");

export function getPDAs() {
    const [payrollState] = PublicKey.findProgramAddressSync(
        [Buffer.from("payroll_state"), MINT.toBuffer()],
        PROGRAM_ID
    );
    const [payrollVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("payroll_vault"), MINT.toBuffer()],
        PROGRAM_ID
    );
    const [salaryVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("salary_vault"), MINT.toBuffer()],
        PROGRAM_ID
    );
    return { payrollState, payrollVault, salaryVault };
}

export function getEmployeePDA(user: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("employee"), MINT.toBuffer(), user.toBuffer()],
        PROGRAM_ID
    )[0];
}

// Instruction 1: ClockIn
export function createClockInInstruction(user: PublicKey, amount: bigint) {
    const { payrollState, payrollVault, salaryVault } = getPDAs();
    const employee = getEmployeePDA(user);
    const userAta = getAssociatedTokenAddressSync(MINT, user);
    
    // Convert amount to little endian 8 bytes
    const data = Buffer.alloc(9);
    data.writeUInt8(1, 0); // Instruction 1
    data.writeBigUInt64LE(amount, 1);
    
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: user, isSigner: true, isWritable: true },
            { pubkey: MINT, isSigner: false, isWritable: false },
            { pubkey: payrollState, isSigner: false, isWritable: true },
            { pubkey: payrollVault, isSigner: false, isWritable: true },
            { pubkey: salaryVault, isSigner: false, isWritable: true },
            { pubkey: employee, isSigner: false, isWritable: true },
            { pubkey: userAta, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
        ],
        data
    });
}

// Instruction 2: ClockOut
export function createClockOutInstruction(user: PublicKey) {
    const { payrollState, payrollVault, salaryVault } = getPDAs();
    const employee = getEmployeePDA(user);
    const userAta = getAssociatedTokenAddressSync(MINT, user);
    
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: user, isSigner: true, isWritable: true },
            { pubkey: MINT, isSigner: false, isWritable: false },
            { pubkey: payrollState, isSigner: false, isWritable: true },
            { pubkey: payrollVault, isSigner: false, isWritable: true },
            { pubkey: salaryVault, isSigner: false, isWritable: true },
            { pubkey: employee, isSigner: false, isWritable: true },
            { pubkey: userAta, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
        ],
        data: Buffer.from([2])
    });
}

// Instruction 3: ClaimSalary
export function createClaimSalaryInstruction(user: PublicKey) {
    const { payrollState, payrollVault } = getPDAs();
    const employee = getEmployeePDA(user);
    
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: user, isSigner: true, isWritable: true },
            { pubkey: MINT, isSigner: false, isWritable: false },
            { pubkey: payrollState, isSigner: false, isWritable: true },
            { pubkey: payrollVault, isSigner: false, isWritable: true },
            { pubkey: employee, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([3])
    });
}
