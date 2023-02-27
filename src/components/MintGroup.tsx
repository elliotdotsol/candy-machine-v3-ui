import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import Countdown from "react-countdown";
import { CandyMachineV3, NftPaymentMintSettings } from "../hooks/types";
import { MultiMintButton } from "../MultiMintButton";
import { MintGroupMetadata } from "./types";
import styled from "styled-components";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Paper } from "@material-ui/core";
import { GatewayProvider } from "@civic/solana-gateway-react";

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;

const Card = styled(Paper)`
  display: inline-block;
  background-color: var(--countdown-background-color) !important;
  margin: 5px;
  min-width: 40px;
  padding: 24px;
  h1 {
    margin: 0px;
  }
`;

const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <div>
      <Card elevation={1}>
        <h1>{days}</h1>Days
      </Card>
      <Card elevation={1}>
        <h1>{hours}</h1>
        Hours
      </Card>
      <Card elevation={1}>
        <h1>{minutes}</h1>Mins
      </Card>
      <Card elevation={1}>
        <h1>{seconds}</h1>Secs
      </Card>
    </div>
  );
};

export default function MintGroup({
  mintGroup,
  candyMachineV3,
}: {
  mintGroup: MintGroupMetadata;
  candyMachineV3: CandyMachineV3;
}) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const { guards, guardStates, prices } = React.useMemo(
    () => ({
      guards:
        candyMachineV3.guards[mintGroup.label] ||
        candyMachineV3.guards.default ||
        {},
      guardStates: candyMachineV3.guardStates[mintGroup.label] ||
        candyMachineV3.guardStates.default || {
          isStarted: true,
          isEnded: false,
          isLimitReached: false,
          canPayFor: 10,
          messages: [],
          isWalletWhitelisted: true,
          hasGatekeeper: false,
        },
      prices: candyMachineV3.prices[mintGroup.label] ||
        candyMachineV3.prices.default || {
          payment: [],
          burn: [],
          gate: [],
        },
    }),
    [
      mintGroup,
      candyMachineV3.guards,
      candyMachineV3.guardStates,
      candyMachineV3.prices,
    ]
  );

  const startMint = React.useCallback(
    async (quantityString: number = 1) => {
      const nftGuards: NftPaymentMintSettings[] = Array(quantityString)
        .fill(undefined)
        .map((_, i) => {
          return {
            burn: guards.burn?.nfts?.length
              ? {
                  mint: guards.burn.nfts[i]?.mintAddress,
                }
              : undefined,
            payment: guards.payment?.nfts?.length
              ? {
                  mint: guards.payment.nfts[i]?.mintAddress,
                }
              : undefined,
            gate: guards.gate?.nfts?.length
              ? {
                  mint: guards.gate.nfts[i]?.mintAddress,
                }
              : undefined,
          };
        });

      console.log({ nftGuards });
      // debugger;
      candyMachineV3
        .mint(quantityString, {
          groupLabel: mintGroup.label,
          nftGuards,
        })
        .then((items) => {
          // setMintedItems(items as any);
          console.log("minted", items);
        })
        .catch(
          (e) => console.error("mint error", e)
          // setAlertState({
          //   open: true,
          //   message: e.message,
          //   severity: "error",
          // })
        );
    },
    [candyMachineV3.mint, guards]
  );

  const MintButton = ({
    gatekeeperNetwork,
  }: {
    gatekeeperNetwork?: PublicKey;
  }) => (
    <MultiMintButton
      candyMachine={candyMachineV3.candyMachine}
      gatekeeperNetwork={gatekeeperNetwork}
      isMinting={candyMachineV3.status.minting}
      setIsMinting={() => {}}
      isActive={!!candyMachineV3.items.remaining}
      isEnded={guardStates.isEnded}
      isSoldOut={!candyMachineV3.items.remaining}
      guardStates={guardStates}
      onMint={startMint}
      prices={prices}
    />
  );

  return (
    <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}>
      {mintGroup.title ? <h3>{mintGroup.title}</h3> : null}
      {mintGroup.description ? <p>{mintGroup.description}</p> : null}

      {!guardStates.isStarted ? (
        <Countdown
          date={guards.startTime}
          renderer={renderGoLiveDateCounter}
          onComplete={() => {
            candyMachineV3.refresh();
          }}
        />
      ) : !wallet?.publicKey ? (
        <ConnectButton>Connect Wallet</ConnectButton>
      ) : // ) : !guardStates.canPayFor ? (
      //   <h1>You cannot pay for the mint</h1>
      !guardStates.isWalletWhitelisted ? (
        <h1>Mint is private.</h1>
      ) : (
        <>
          <>
            {!!candyMachineV3.items.remaining &&
            guardStates.hasGatekeeper &&
            wallet.publicKey &&
            wallet.signTransaction ? (
              <GatewayProvider
                wallet={{
                  publicKey: wallet.publicKey,
                  //@ts-ignore
                  signTransaction: wallet.signTransaction,
                }}
                gatekeeperNetwork={guards.gatekeeperNetwork}
                clusterUrl={connection.rpcEndpoint}
                cluster={process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}
                options={{ autoShowModal: false }}
              >
                <MintButton gatekeeperNetwork={guards.gatekeeperNetwork} />
              </GatewayProvider>
            ) : (
              <MintButton />
            )}
          </>
        </>
      )}
    </div>
  );
}
