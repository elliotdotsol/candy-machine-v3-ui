/**
 * This file demonstrate minting with allowlist, in a manner that it can be implemented on frontend (Browser) with wallet adapter.
 */

import {
  callCandyGuardRouteBuilder,
  getMerkleProof,
  IdentitySigner,
  keypairIdentity,
  Metaplex,
  mintFromCandyMachineBuilder,
  PublicKey,
  TransactionBuilder,
} from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

const key = Keypair.fromSecretKey(Uint8Array.from(require("./key.json")));
const { number, creators, ...config } = require("./config.json");

const metaplex = Metaplex.make(
  new Connection("https://metaplex.devnet.rpcpool.com/")
).use(keypairIdentity(key));

const allowList = require("./allowlist.json");
const mintingWallet = metaplex.identity().publicKey;

(async function () {
  const { program } = require("./cache.json");
  if (!program)
    return console.log("Program not found in your cache, exiting...");
  const candyMachine = await metaplex.candyMachines().findByAddress({
    address: new PublicKey(program.candyMachine),
  });
  const merkleProof = getMerkleProof(allowList, mintingWallet.toBase58());
  console.log(
    mintingWallet,
    allowList,
    // merkleProof,
    merkleProof.map((p) => new PublicKey(p).toString())
  );
  if (!merkleProof.length) return console.log("User is not in allowed list");
  //   await metaplex.candyMachines().callGuardRoute({
  //     candyMachine,
  //     guard: "allowList",
  //     group: "waoed",
  //     settings: {
  //       path: "proof",
  //       merkleProof: merkleProof,
  //     },
  //   });

  //   return;
  const group = "waoed";
  const transactionBuilders: TransactionBuilder[] = [
    callCandyGuardRouteBuilder(metaplex, {
      candyMachine,
      guard: "allowList",
      group,
      settings: {
        path: "proof",
        merkleProof,
      },
    }),
  ];
  for (let index = 0; index < 1; index++) {
    transactionBuilders.push(
      await mintFromCandyMachineBuilder(metaplex, {
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress, // metaplex.candyMachines().pdas().authority({candyMachine: candyMachine.address})
        group,
        guards: {},
      })
    );
  }
  const blockhash = await metaplex.rpc().getLatestBlockhash();

  const transactions = transactionBuilders.map((t) =>
    t.toTransaction(blockhash)
  );
  const signers: { [k: string]: IdentitySigner } = {};
  transactions.forEach((tx, i) => {
    tx.feePayer = mintingWallet;
    tx.recentBlockhash = blockhash.blockhash;
    transactionBuilders[i].getSigners().forEach((s) => {
      if ("signAllTransactions" in s) signers[s.publicKey.toString()] = s;
      else if ("secretKey" in s) tx.partialSign(s);
      // @ts-ignore
      else if ("_signer" in s) tx.partialSign(s._signer);
    });
  });
  let signedTransactions = transactions;

  for (let signer in signers) {
    await signers[signer].signAllTransactions(transactions);
  }
  const allowListCallGuardRouteTx = signedTransactions.shift();
  transactionBuilders.shift();
  transactions.shift();
  await metaplex.rpc().sendAndConfirmTransaction(allowListCallGuardRouteTx, {
    commitment: "processed",
  });
  console.log(signedTransactions);
  const output = await Promise.all(
    signedTransactions.map((tx, i) => {
      return metaplex
        .rpc()
        .sendAndConfirmTransaction(tx, { commitment: "finalized" })
        .then((tx) => ({
          ...tx,
          context: transactionBuilders[i].getContext() as any,
        }));
    })
  );
  const nfts = await Promise.all(
    output.map(
      ({ context }) =>
        context.mintSigner &&
        metaplex
          .nfts()
          .findByMint({
            mintAddress: context.mintSigner?.publicKey,
            tokenAddress: context.tokenAddress,
          })
          .catch((e) => null)
    )
  );
  console.log(nfts);
})();
