import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import Countdown from "react-countdown";
import { CandyMachineV3, NftPaymentMintSettings } from "../hooks/types";
import { MultiMintButton } from "../MultiMintButton";
import { MintGroupMetadata } from "./types";
import styled from "styled-components";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GatewayProvider } from "@civic/solana-gateway-react";

const MintTimerWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
`
const MintTimerWrapEnded = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
  opacity: 0.5;
`
const MintTimer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
`
const TimerItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 4px 7px;
  gap: 10px;
  background: rgba(78, 68, 206, 0.25);
  border-radius: 4px;
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
  min-width: 30px;
  min-height: 25px;
`

const renderMintTimer = ({ formatted: { days, hours, minutes, seconds } }: any) => {
    return (
        <MintTimer>
            <TimerItem elevation={1}>
                {days}
            </TimerItem>
            <TimerItem elevation={1}>
                {hours}

            </TimerItem>
            <TimerItem elevation={1}>
                {minutes}
            </TimerItem>
            <TimerItem elevation={1}>
                {seconds}
            </TimerItem>
        </MintTimer>
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
            setIsMinting={() => { }}
            isActive={!!candyMachineV3.items.remaining}
            isEnded={guardStates.isEnded}
            isSoldOut={!candyMachineV3.items.remaining}
            guardStates={guardStates}
            onMint={startMint}
            prices={prices}
        />
    );

    return (
        <div>
            {!guardStates.isStarted && !guardStates.isEnded ? (
                <MintTimerWrap> Starts in
                <Countdown
                    date={guards.startTime}
                    renderer={renderMintTimer}
                    onComplete={() => {
                        candyMachineV3.refresh();
                    }}
                />
                </MintTimerWrap>
            ) : null}
            

            {guardStates.isStarted && guards.endTime && !guardStates.isEnded ? (
                <MintTimerWrap> Ends in
                <Countdown
                    date={guards.endTime}
                    renderer={renderMintTimer}
                    onComplete={() => {
                        candyMachineV3.refresh();
                    }}
                />
                </MintTimerWrap>
            ) : null}

            {guardStates.isEnded ? (
                <MintTimerWrapEnded>Ended</MintTimerWrapEnded>
            ) : null}


        </div>
    );
}