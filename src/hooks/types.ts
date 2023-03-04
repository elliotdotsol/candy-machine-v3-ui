import {
  DefaultCandyGuardMintSettings,
  Metadata,
  MintLimitGuardSettings,
  NftBurnGuardMintSettings,
  NftGateGuardMintSettings,
  NftPaymentGuardMintSettings,
  Pda,
} from "@metaplex-foundation/js";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { MintCounterBorsh } from "../borsh/mintCounter";

export type Token = {
  mint: PublicKey;
  balance: number;
  decimals: number;
};
export type TokenPayment$Gate = {
  mint: PublicKey;
  amount: number;
  symbol?: string;
  decimals: number;
};

 export type SolPayment = {
  type: "sol";
  amount: number;
  decimals: number;
 };

// export type TokenPayment = {
//   type: "token";
//   mint: PublicKey;
//   amount: number;
//   symbol?: string;
//   decimals: number;
// };

// export type NftPayment = {
//   type: "nft";
//   nfts: Metadata[];
// };

// export type PaymentGuard = {
//   criteria: "pay" | "have";
// } & (SolPayment | TokenPayment | NftPayment);

export type GuardGroup = {
  // address: PublicKey;
  startTime?: Date;
  endTime?: Date;
  payment?: {
    sol?: {
      amount: number;
      decimals: number;
    };
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  burn?: {
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  gate?: {
    token?: TokenPayment$Gate;
    nfts?: Metadata[];
    requiredCollection?: PublicKey;
  };
  // payments?: PaymentGuard[];
  mintLimit?: MintLimitLogics;
  redeemLimit?: number;
  allowed?: PublicKey[];
  allowList?: Uint8Array;
  gatekeeperNetwork?: PublicKey;
};

export type MintLimitLogics = {
  settings: MintLimitGuardSettings;
  pda?: Pda;
  accountInfo?: AccountInfo<Buffer>;
  mintCounter?: MintCounterBorsh; //MintCounter;
};

export type GuardGroupStates = {
  isStarted: boolean;
  isEnded: boolean;
  canPayFor: number;
  messages: string[];
  isLimitReached: boolean;
  isWalletWhitelisted: boolean;
  hasGatekeeper: boolean;
};

export type PaymentRequired = {
  label: string;
  price: number;
  mint?: PublicKey;
  decimals?: number;
  kind: string;
};
export type ParsedPricesForUI = {
  payment: PaymentRequired[];
  burn: PaymentRequired[];
  gate: PaymentRequired[];
};

export declare type CustomCandyGuardMintSettings = Partial<
  DefaultCandyGuardMintSettings & {
    allowList: {
      proof: Uint8Array[];
    };
  }
>;

export type AllowLists = {
  groupLabel?: string;
  list: (string | Uint8Array)[];
}[];

export type NftPaymentMintSettings = {
  payment?: NftPaymentGuardMintSettings;
  gate?: NftGateGuardMintSettings;
  burn?: NftBurnGuardMintSettings;
};
