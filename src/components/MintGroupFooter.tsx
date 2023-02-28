import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { CandyMachineV3, NftPaymentMintSettings } from "../hooks/types";
import { MultiMintButton } from "../MultiMintButton";
import { MintGroupMetadata } from "./types";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GatewayProvider } from "@civic/solana-gateway-react";
import {
    MintCount,
    Section,
    Container,
    Column,
} from "../styles";
import Home from "../Home";

const MintInfoRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;
    gap: 8px;
    width: 100%;
`
const MintLimit = styled.p`
    font-weight: 500;
    font-size: 16px;
    line-height: 100%;
    color: var(--white);
    text-transform: uppercase;
`
const MintedByYou = styled.span`
    font-style: italic;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    color: var(--white);
    text-transform: none;
`
const DotSeperator = styled.span`
    font-weight: 500;
    font-size: 16px;
    line-height: 100%;
`
const MintPrice = styled.p`
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 100%;
    color: var(--white);
    text-transform: uppercase;
`
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

    const solCost = useMemo(
        () =>
            prices
                ? prices.payment
                    .filter(({ kind }) => kind === "sol")
                    .reduce((a, { price }) => a + price, 0)
                : 0,
        [prices]
    );

    const tokenCost = useMemo(
        () =>
            prices
                ? prices.payment
                    .filter(({ kind }) => kind === "token")
                    .reduce((a, { price }) => a + price, 0)
                : 0,
        [prices]
    );

    let candyPrice = null;
    if (prices.payment.filter(({ kind }) => kind === "token").reduce((a, { kind }) => a + kind, "")) {
        candyPrice = `${tokenCost} Token`
    } else if (prices.payment.filter(({ kind }) => kind === "sol").reduce((a, { price }) => a + price, 0)) {
        candyPrice = `◎ ${solCost}`
    } else if (guards.payment?.nfts?.length === 0 ) {
        candyPrice = "1 NFT"
    } else {
        candyPrice = "Free mint"
    }

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
        <MintInfoRow>
            <MintLimit>
                {guards?.mintLimit?.settings?.limit ? (
                    <div>
                        <span>{guards?.mintLimit?.settings?.limit} per wallet </span>
                        <MintedByYou><>
                            ({guards?.mintLimit?.mintCounter?.count || "0"}
                            {guards?.mintLimit?.settings?.limit && (
                                <>/{guards?.mintLimit?.settings?.limit} </>
                            )}
                            by you)
                        </></MintedByYou>
                    </div>
                ) : <span>UNLIMITED </span>}

            </MintLimit>
            <DotSeperator>•</DotSeperator>
            <MintPrice>
                {candyPrice}
            </MintPrice>
        </MintInfoRow>
    );
}