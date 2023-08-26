import { useCallback } from "react";
import { Paper, Snackbar, LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { DefaultCandyGuardRouteSettings, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import confetti from "canvas-confetti";
import Link from "next/link";
import Countdown from "react-countdown";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { defaultGuardGroup, network } from "./config";

import { collectionImageURL } from "./config";
import { collectionTitle } from "./config";
import { collectionDescription } from "./config";

import { tokenType } from "./config";
import { websiteURL } from "./config";
import { twitterURL } from "./config";
import { discordURL } from "./config";

import { MultiMintButton } from "./MultiMintButton";
//import { MintButton } from "./MintButton";
import {
  MintCount,
  Section,
  Container,
  Column,
} from "./styles";
import { AlertState } from "./utils";
import NftsModal from "./NftsModal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import useCandyMachineV3 from "./hooks/useCandyMachineV3";
import {
  CustomCandyGuardMintSettings,
  NftPaymentMintSettings,
  ParsedPricesForUI,
} from "./hooks/types";
import { guardToLimitUtil } from "./hooks/utils";

const BorderLinearProgress = styled(LinearProgress)`
  height: 16px !important;
  border-radius: 30px;
  background-color: var(--alt-background-color) !important;
  > div.MuiLinearProgress-barColorPrimary{
    background-color: var(--primary) !important;
  }
  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-color: var(--primary);
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  width: 100%;

  @media only screen and (max-width: 450px) {
    top: 16px;
  }
`;
const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  margin: 30px;
  z-index: 999;
  position: relative;

  .wallet-adapter-dropdown-list {
    background: #ffffff;
  }
  .wallet-adapter-dropdown-list-item {
    background: #000000;
  }
  .wallet-adapter-dropdown-list {
    grid-row-gap: 5px;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
  width: 100%;
`
const Other = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 48px;
  width: 100%;
`
const ImageWrap = styled.div`
  aspect-ratio: 1 / 1;
  width: 100%;
  background-image: url(${ collectionImageURL });
  background-size: cover;
  border-radius: 16px;
`
const Image = styled.div`
  height: 100%
  width: 100%;
`
const CollectionName = styled.h1`
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: var(--white);

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
  }
`
const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 16px;
  flex-wrap: wrap;
`
const InfoBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 8px;
  border: 2px solid #FFFFFF;
  border-radius: 4px;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);

  @media only screen and (max-width: 450px) {
    font-size: 18px;
  }
`
const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  margin-bottom: -3px;
`
const CollectionDescription = styled.p`
  font-weight: 400;
  font-size: 20px;
  line-height: 150%;
  color: var(--white);
`
const MintedByYou = styled.span`
  font-style: italic;
  font-weight: 500;
  font-size: 16px;
  line-height: 100%;
  text-transform: none;
`
const ProgressbarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
`
const StartTimer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 48px;
  background: var(--alt-background-color);
  border-radius: 8px;
  @media only screen and (max-width: 450px) {
    gap: 16px;
    padding: 16px;
    width: -webkit-fill-available;
    justify-content: space-between;
  }
`
const StartTimerInner = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 16px;
  min-width: 90px;
  border-radius: 0px !important;
  box-shadow: none !important;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  background: none !important;
  text-transform: uppercase;
  color: var(--white);
  span {
    font-style: normal;
    font-weight: 800;
    font-size: 48px;
    line-height: 100%;
  }

  @media only screen and (max-width: 450px) {
    min-width: 70px;
    span {
      font-size: 32px;
    }
  }
`;
const StartTimerWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 0px;
  gap: 16px;
  width: -webkit-fill-available;
`
const StartTimerSubtitle = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: #FFFFFF;
`
const PrivateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: -webkit-fill-available;
`
const PrivateText = styled.h2`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 10px;
  background: var(--error);
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white);
  width: -webkit-fill-available;
`
const PrivateSubtext = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: var(--white);
`
const WalletAmount = styled.div`
  color: var(--white);
  width: auto;
  padding: 8px 8px 8px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 5px;
  background-color: var(--primary);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 600;
  line-height: 100%;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;
const ConnectWallet = styled(WalletMultiButton)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 18px 24px;
  gap: 10px;
  width: 100%;
  height: fit-content;
  background-color: var(--primary) !important;
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white) !important;
  transition: 0.2s;
  :hover {
    background-color: var(--primary) !important;
    color: var(--white) !important;
    opacity: 0.9;
  }
`

export interface HomeProps {
  candyMachineId: PublicKey;
}
const candyMachinOps = {
  allowLists: [
    {
      list: require("../cmv3-demo-initialization/allowlist.json"),
      groupLabel: "early",
    },
  ],
};
const Home = (props: HomeProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const candyMachineV3 = useCandyMachineV3(
    props.candyMachineId,
    candyMachinOps
  );

  const [balance, setBalance] = useState<number>();
  const [mintedItems, setMintedItems] = useState<Nft[]>();

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const { guardLabel, guards, guardStates, prices } = useMemo(() => {
    const guardLabel = "early";
    return {
      guardLabel,
      guards:
        candyMachineV3.guards[guardLabel] ||
        candyMachineV3.guards.default ||
        {},
      guardStates: candyMachineV3.guardStates[guardLabel] ||
        candyMachineV3.guardStates.default || {
        isStarted: true,
        isEnded: false,
        isLimitReached: false,
        canPayFor: 10,
        messages: [],
        isWalletWhitelisted: true,
        hasGatekeeper: false,
      },
      prices: candyMachineV3.prices[guardLabel] ||
        candyMachineV3.prices.default || {
        payment: [],
        burn: [],
        gate: [],
      },
    };
  }, [
    candyMachineV3.guards,
    candyMachineV3.guardStates,
    candyMachineV3.prices,
  ]);
  useEffect(() => {
    console.log({ guardLabel, guards, guardStates, prices });
  }, [guardLabel, guards, guardStates, prices]);
  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, connection]);

  useEffect(() => {
    if (mintedItems?.length === 0) throwConfetti();
  }, [mintedItems]);

  const openOnSolscan = useCallback((mint) => {
    window.open(
      `https://solscan.io/address/${mint}${[WalletAdapterNetwork.Devnet, WalletAdapterNetwork.Testnet].includes(
        network
      )
        ? `?cluster=${network}`
        : ""
      }`
    );
  }, []);

  const throwConfetti = useCallback(() => {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [confetti]);

  const startMint = useCallback(
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

        
      // console.log({ nftGuards });
      // debugger;
      candyMachineV3
        .mint(quantityString, {
          groupLabel: guardLabel,
          nftGuards,
        })
        .then((items) => {
          setMintedItems(items as any);
        })
        .catch((e) =>
          setAlertState({
            open: true,
            message: e.message,
            severity: "error",
          })
        );
    },
    [candyMachineV3.mint, guards]
  );

  useEffect(() => {
    console.log({ candyMachine: candyMachineV3.candyMachine });
  }, [candyMachineV3.candyMachine]);

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
   if (prices.payment.filter(({kind}) => kind === "token").reduce((a, { kind }) => a + kind, "")) {
    candyPrice = `${tokenCost} ${tokenType}`
  } else if (prices.payment.filter(({kind}) => kind === "sol").reduce((a, { price }) => a + price, 0)) {
    candyPrice = `◎ ${solCost}`
  } else {
    candyPrice = "1 NFT"
  }

  console.log(candyPrice);
  // Icons
  const Globe = (props) => (
    <svg
      width={30}
      height={30}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 1.667A20.4 20.4 0 0 1 20.333 15 20.4 20.4 0 0 1 15 28.333m0-26.666A20.4 20.4 0 0 0 9.667 15 20.4 20.4 0 0 0 15 28.333m0-26.666C7.636 1.667 1.667 7.637 1.667 15c0 7.364 5.97 13.333 13.333 13.333m0-26.666c7.364 0 13.333 5.97 13.333 13.333 0 7.364-5.97 13.333-13.333 13.333M2.333 11h25.334M2.333 19h25.334"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
  const Twitter = (props) => (
    <svg
      width={28}
      height={23}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.789 23c-3.235 0-6.25-.94-8.789-2.564 2.155.14 5.958-.195 8.324-2.451-3.559-.163-5.164-2.893-5.373-4.059.302.117 1.744.257 2.558-.07C1.416 12.83.788 9.237.927 8.141c.768.536 2.07.723 2.582.676-3.814-2.729-2.442-6.834-1.767-7.72 2.737 3.792 6.84 5.922 11.914 6.04a5.866 5.866 0 0 1-.146-1.305C13.51 2.61 16.113 0 19.325 0a5.79 5.79 0 0 1 4.25 1.853c1.122-.263 2.81-.878 3.634-1.41-.416 1.493-1.71 2.738-2.493 3.2.006.016-.007-.016 0 0 .688-.104 2.549-.462 3.284-.96-.364.838-1.736 2.233-2.862 3.013C25.348 14.938 18.276 23 8.788 23Z"
        fill="#fff"
      />
    </svg>
  )
  const Discord = (props) => (
    <svg
      width={28}
      height={21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M24.532 2.66C22.605.98 20.294.14 17.853 0l-.385.42c2.183.56 4.11 1.68 5.908 3.22-2.183-1.26-4.624-2.1-7.193-2.38-.77-.14-1.412-.14-2.183-.14-.77 0-1.413 0-2.184.14-2.568.28-5.009 1.12-7.192 2.38C6.422 2.1 8.349.98 10.532.42L10.147 0c-2.44.14-4.753.98-6.68 2.66C1.285 7.14.129 12.18 0 17.36 1.927 19.6 4.624 21 7.45 21c0 0 .899-1.12 1.54-2.1-1.669-.42-3.21-1.4-4.238-2.94.9.56 1.798 1.12 2.698 1.54 1.155.56 2.311.84 3.467 1.12 1.028.14 2.056.28 3.083.28 1.027 0 2.055-.14 3.083-.28 1.155-.28 2.312-.56 3.468-1.12.899-.42 1.798-.98 2.697-1.54-1.028 1.54-2.57 2.52-4.239 2.94.642.98 1.541 2.1 1.541 2.1 2.826 0 5.523-1.4 7.45-3.64-.128-5.18-1.284-10.22-3.468-14.7ZM9.762 14.84c-1.285 0-2.44-1.26-2.44-2.8 0-1.54 1.155-2.8 2.44-2.8 1.284 0 2.44 1.26 2.44 2.8 0 1.54-1.156 2.8-2.44 2.8Zm8.476 0c-1.284 0-2.44-1.26-2.44-2.8 0-1.54 1.156-2.8 2.44-2.8 1.285 0 2.44 1.26 2.44 2.8 0 1.54-1.155 2.8-2.44 2.8Z"
        fill="#fff"
      />
    </svg>
  )



  return (
    <main>
      <>
        <Header>
          <WalletContainer>
            <Wallet>
              {wallet ? (
                <WalletAmount>
                  {(balance || 0).toLocaleString()} SOL
                  <ConnectButton />
                </WalletAmount>
              ) : (
                <ConnectButton>Connect Wallet</ConnectButton>
              )}
            </Wallet>
          </WalletContainer>
        </Header>
        <Section>
          <Container>
            <Column>
              <ImageWrap>
                <Image>

                </Image>
              </ImageWrap>
            </Column>
            <Column>
              <Content>
                <CollectionName>{collectionTitle}</CollectionName>
                <InfoRow>
                {guardStates.isStarted && wallet.publicKey && (
                  <InfoBox>
                    <p>Total items</p>
                    <p>{candyMachineV3.items.available}{" "}</p>
                  </InfoBox>
                )} {guardStates.isStarted && wallet.publicKey && (
                  <InfoBox>
                    <p>Price</p>
                    <p>{candyPrice}</p>
                  </InfoBox>
                )}
                  <IconRow>
                    <a href={websiteURL} target="_blank" rel="noopener noreferrer"><Globe></Globe></a>
                    <a href={twitterURL} target="_blank" rel="noopener noreferrer"><Twitter></Twitter></a>
                    <a href={discordURL} target="_blank" rel="noopener noreferrer"><Discord></Discord></a>
                  </IconRow>
                </InfoRow>
                <CollectionDescription>{collectionDescription}</CollectionDescription>
              </Content>
              <Other>
                {!guardStates.isStarted ? (
                  
                  <Countdown
                    date={guards.startTime}
                    renderer={renderGoLiveDateCounter}
                    onComplete={() => {
                      candyMachineV3.refresh();
                    }}
                  />
                ) : !wallet?.publicKey ? (
                  <ConnectWallet>Connect Wallet</ConnectWallet>
                  // ) : !guardStates.canPayFor ? (
                  //   <h1>You cannot pay for the mint</h1>
                ) : !guardStates.isWalletWhitelisted ? (
                  <PrivateWrap>
                  <PrivateText>Mint is private</PrivateText>
                  <PrivateSubtext>You’re currently not allowed to mint. Try again at a later time.</PrivateSubtext>
                  </PrivateWrap>
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
                          connection={connection}
                          cluster={
                            process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"
                          }
                          options={{ autoShowModal: false }}
                        >
                          <MintButton
                            gatekeeperNetwork={guards.gatekeeperNetwork}
                          />
                        </GatewayProvider>
                      ) : (
                        <MintButton />
                      )}
                    </>
                  </>
                )}

                <ProgressbarWrap>
                {guardStates.isStarted && wallet.publicKey && (
                  <MintCount>
                    Total minted {candyMachineV3.items.redeemed} /  
                    {candyMachineV3.items.available}{" "}
                    {(guards?.mintLimit?.mintCounter?.count ||
                      guards?.mintLimit?.settings?.limit) && (
                        <MintedByYou>
                        <>
                          ({guards?.mintLimit?.mintCounter?.count || "0"}
                          {guards?.mintLimit?.settings?.limit && (
                            <>/{guards?.mintLimit?.settings?.limit} </>
                          )}
                          by you)
                        </>
                        </MintedByYou>
                      )}
                  </MintCount>
                )}
                {guardStates.isStarted && wallet.publicKey && (
                <div className="w-100">
                <BorderLinearProgress variant="determinate" value={(candyMachineV3.items.redeemed * 100 / candyMachineV3.items.available)}></BorderLinearProgress>
                </div>
                )}
                </ProgressbarWrap>


                <NftsModal
                  openOnSolscan={openOnSolscan}
                  mintedItems={mintedItems || []}
                  setMintedItems={setMintedItems}
                />
              </Other>
            </Column>
          </Container>
        </Section>
      </>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar> 
    </main>
  );
};

export default Home;

const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <StartTimerWrap>
      <StartTimerSubtitle>Mint opens in:</StartTimerSubtitle>
      <StartTimer>
      <StartTimerInner elevation={1}>
        <span>{days}</span>Days
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{hours}</span>
        Hours
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{minutes}</span>Mins
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{seconds}</span>Secs
      </StartTimerInner>
    </StartTimer>
    </StartTimerWrap>
  );
};
