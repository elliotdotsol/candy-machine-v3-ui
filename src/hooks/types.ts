import {
  CandyMachine,
  DefaultCandyGuardMintSettings,
  Metadata,
  MintLimitGuardSettings,
  Nft,
  NftBurnGuardMintSettings,
  NftGateGuardMintSettings,
  NftPaymentGuardMintSettings,
  NftWithToken,
  Pda,
  Sft,
  SftWithToken,
} from "@metaplex-foundation/js";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { MintCounterBorsh } from "../borsh/mintCounter";
import { MerkleTree } from "../helpers";

export type GuardGroups = {
  default?: GuardGroup;
  [k: string]: GuardGroup;
};

export type GuardStates = {
  default?: GuardGroupStates;
  [k: string]: GuardGroupStates;
};

export type GuardMerkles = {
  [k: string]: {
    tree: MerkleTree;
    proof: Uint8Array[];
  };
};

export type GuardPrices = {
  default?: ParsedPricesForUI;
  [k: string]: ParsedPricesForUI;
};

export type CandyMachineV3Items = {
  available: number;
  remaining: number;
  redeemed: number;
};

export type CandyMachineV3 = {
  status: {
    candyMachine: boolean;
    guardGroups: boolean;
    minting: boolean;
    initialFetchGuardGroupsDone: boolean;
  };
  candyMachine: CandyMachine;
  items: CandyMachineV3Items;
  guards: GuardGroups;
  guardStates: GuardStates;
  merkles: GuardMerkles;
  prices: GuardPrices;
  mint: (
    quantityString?: number,
    opts?: {
      groupLabel?: string;
      nftGuards?: NftPaymentMintSettings[];
    }
  ) => Promise<(Sft | SftWithToken | Nft | NftWithToken)[]>;
  refresh: () => Promise<void>;
};

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

export type GuardGroup = {
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