import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "../suiClient";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const transferSUI = async (
  amount: number,
  signer: Ed25519Keypair,
  recipientAddress: string
): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [amount]);
  tx.transferObjects([coin], recipientAddress);

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: signer,
    options: {
      showEffects: true,
      showBalanceChanges: true,
    },
  });
};
