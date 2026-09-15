"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { MINT, getPDAs } from '@/lib/salaryContract';

const RPC = "https://api.mainnet-beta.solana.com";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      const conn = new Connection(RPC);
      const { payrollVault } = getPDAs();
      const balance = await conn.getBalance(payrollVault);
      setVaultBalance(balance / 1e9);
    }
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <WalletMultiButton />
      </div>

      <div className="max-w-xl w-full bg-gray-900 border border-green-500/30 rounded-xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-green-400 mb-2 tracking-tighter">THE WAGE CAGE</h1>
          <p className="text-gray-400">Clock in. Stake $WAGE. Get paid in SOL.</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 mb-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Total SOL in Payroll Vault</p>
          <p className="text-4xl font-bold text-yellow-400">
            {vaultBalance !== null ? vaultBalance.toFixed(3) : "..."} ◎
          </p>
        </div>

        {connected ? (
          <div className="space-y-4">
            <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase tracking-widest transition-colors">
              Clock In (Stake)
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg uppercase tracking-widest transition-colors">
                Claim Wage (SOL)
              </button>
              <button className="py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg uppercase tracking-widest transition-colors">
                Clock Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400 mb-4">Please connect your wallet to start your shift.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center text-xs text-gray-600">
        <p>CA: {MINT.toBase58()}</p>
        <p>Smart Contract: 22XrMr2QW6feeH8J3e64ktc4zRnHCs4BCQHQC9UFrF53</p>
      </div>
    </main>
  );
}
