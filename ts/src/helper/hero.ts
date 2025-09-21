import { suiClient } from "../suiClient";
import { Transaction } from "@mysten/sui/transactions";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const mintHero = async (
  name: string,
  signer: Ed25519Keypair,
  adminCapId: string
): Promise<SuiTransactionBlockResponse | Error> => {
  try {
    const tx = new Transaction();
    let hero = tx.moveCall({
      target: `${process.env.PACKAGE_ID}::hero::create_hero`,
      arguments: [tx.object(adminCapId), tx.pure.string(name)],
    });
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::hero::transfer_hero`,
      arguments: [
        tx.object(adminCapId),
        hero,
        tx.pure.address(signer.toSuiAddress()),
      ],
    });

    return await suiClient.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
      signer: signer,
    });
  } catch (error) {
    return error as Error;
  }
};

export const newAdmin = async (signer: Ed25519Keypair, to: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::hero::new_admin`,
    arguments: [tx.object(process.env.ADMIN_CAP_ID!), tx.pure.address(to)],
  });

  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    options: {
      showObjectChanges: true,
      showEffects: true,
    },
    signer: signer,
  });
};
