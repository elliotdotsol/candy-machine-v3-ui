import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import { CircularProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { CandyMachine } from "@metaplex-foundation/js";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export const CTAButton = styled(Button)`
  display: block !important;
  margin: 0 auto !important;
  background-color: var(--title-text-color) !important;
  min-width: 120px !important;
  font-size: 1em !important;
`;

export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
  setIsMinting,
  isEnded,
  isActive,
  isSoldOut,
  limitReached,
  gatekeeperNetwork
}: {
  onMint: (quantityString: number) => Promise<void>;
  candyMachine: CandyMachine | undefined;
  isMinting: boolean;
  setIsMinting: (val: boolean) => void;
  isEnded: boolean;
  isActive: boolean;
  isSoldOut: boolean;
  limitReached: boolean;
  gatekeeperNetwork?: PublicKey;
}) => {
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [loading, setLoading] = useState(false);
  const [waitForActiveToken, setWaitForActiveToken] = useState(false);

  const previousGatewayStatus = usePrevious(gatewayStatus);
  useEffect(() => {
    const fromStates = [
      GatewayStatus.NOT_REQUESTED,
      GatewayStatus.REFRESH_TOKEN_REQUIRED,
    ];
    const invalidToStates = [...fromStates, GatewayStatus.UNKNOWN];
    if (
      fromStates.find((state) => previousGatewayStatus === state) &&
      !invalidToStates.find((state) => gatewayStatus === state)
    ) {
      setIsMinting(true);
    }
    console.log("change: ", GatewayStatus[gatewayStatus]);
  }, [previousGatewayStatus, gatewayStatus, setIsMinting]);

  useEffect(() => {
    if (waitForActiveToken && gatewayStatus === GatewayStatus.ACTIVE) {
      console.log("Minting after token active");
      setWaitForActiveToken(false);
      onMint(1);
    }
  }, [waitForActiveToken, gatewayStatus, onMint]);

  return (
    <CTAButton
      disabled={loading || isSoldOut || isMinting || isEnded || !isActive || limitReached}
      onClick={async () => {
        if (isActive && gatekeeperNetwork) {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            await onMint(1);
          } else {
            setWaitForActiveToken(true);
            await requestGatewayToken();
          }
        } else {
          await onMint(1);
        }
      }}
      variant="contained"
    >
      {!candyMachine ? (
        "CONNECTING..."
      ) : isSoldOut ? (
        "SOLD OUT"
      ) : limitReached ? (
        "LIMIT REACHED"
      ) : isActive ? (
        isMinting || loading ? (
          <CircularProgress />
        ) : (
          "MINT"
        )
      ) : isEnded ? (
        "ENDED"
      ) : (
        "UNAVAILABLE"
      )}
    </CTAButton>
  );
};
