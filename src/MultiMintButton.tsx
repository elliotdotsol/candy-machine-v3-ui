import { CircularProgress } from "@material-ui/core";
// import Button from "@material-ui/core/Button";
import { CandyMachine } from "@metaplex-foundation/js";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import { GuardGroupStates, ParsedPricesForUI, PaymentRequired } from "./hooks/types";

// Icons
const MinusIcon = (props) => (
  <svg
    width={22}
    height={22}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 11h8m6 0c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1s10 4.477 10 10Z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)


const PlusIcon = (props) => (
  <svg
    width={22}
    height={22}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M11 7v8m-4-4h8m6 0c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1s10 4.477 10 10Z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const CTAButton = styled.button`
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: var(--white);
  cursor: pointer;
  border: none;
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  background: none;
`;
export const ButtonWrap = styled.div`
  padding: 16px 24px;
  background-color: var(--primary);
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--white);
  border: none;
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
`
export const NumberWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  padding: 16px;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;  
`

export const NumbericIcon = styled.button`
  border: none;
  box-shadow: none;
  background: none;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;
export const NumberInput = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
`
export const NumericField = styled.input`
  font-size: 20px !important;
  padding: 0;
  vertical-align: middle;
  background-color: none;
  box-sizing: border-box;
  background: none;
  font-family: 'Plus Jakarta Sans';
  font-weight: 600;
  line-height: 100%;
  height: 20px;
  width: 24px;
  color: var(--white);
  border: none;
  text-align: center;
  margin-top: -2px;
  overflow: visible;

  :hover,
  :focus {
    box-shadow: none;
  }
  :focus-visible {
    outline: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;
export const EstimatedCost = styled.p`
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: var(--white);
  text-transform: none;
  text-align: left;

  @media only screen and (max-width: 450px) {
    font-size: 12px;
  }
`
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
const deepClone = (items: PaymentRequired[]) =>
  items.map((item) => ({ ...item }));
export const MultiMintButton = ({
  onMint,
  candyMachine,
  isMinting,
  setIsMinting,
  isEnded,
  isActive,
  isSoldOut,
  prices,
  guardStates,
  gatekeeperNetwork,
}: {
  onMint: (quantityString: number) => Promise<void>;
  candyMachine: CandyMachine | undefined;
  isMinting: boolean;
  setIsMinting: (val: boolean) => void;
  isEnded: boolean;
  isActive: boolean;
  isSoldOut: boolean;
  prices: ParsedPricesForUI;
  guardStates: GuardGroupStates;
  gatekeeperNetwork?: PublicKey;
}) => {
  const [loading, setLoading] = useState(false);

  const [mintCount, setMintCount] = useState(1);
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [waitForActiveToken, setWaitForActiveToken] = useState(false);
  const limit = useMemo(() => guardStates.canPayFor, [guardStates]);

  function costSolUI(totalSolCost) {
    return Number.parseFloat(totalSolCost).toFixed(3);
  }

  const totalSolCost = useMemo(
    () =>
      prices
        ? mintCount *
        (prices.payment
          .filter(({ kind }) => kind === "sol")
          .reduce((a, { price }) => a + price, 0) +
          0.012)
        : 0.012,
    [mintCount, prices]
  );
  const totalTokenCosts = useMemo((): PaymentRequired[] => {
    if (!prices) return [];
    const maxPriceHash: { [k: string]: number } = {};
    const payment$burn$lenth = prices.payment.length + prices.burn.length;
    let payments = deepClone(
      prices.payment.concat(prices.burn).concat(prices.gate)
    ).filter((price, index) => {
      const cacheKey = price.mint?.toString();
      if (!["token", "nft"].includes(price.kind)) return false;
      const alreadyFound = !!maxPriceHash[cacheKey];
      if (index < payment$burn$lenth) price.price *= mintCount;
      price.price = maxPriceHash[cacheKey] = Math.max(
        maxPriceHash[cacheKey] || 0,
        price.price
      );
      return !alreadyFound;
    });
    return payments;
  }, [mintCount, prices]);
  const totalTokenCostsString = useMemo(() => {
    return totalTokenCosts.reduce(
      (text, price) => `${text} + ${price.price} ${price.label}`,
      ""
    );
  }, [totalTokenCosts]);

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
    // console.log("change: ", GatewayStatus[gatewayStatus]);
  }, [previousGatewayStatus, gatewayStatus, setIsMinting]);

  useEffect(() => {
    if (waitForActiveToken && gatewayStatus === GatewayStatus.ACTIVE) {
      console.log("Minting after token active");
      setWaitForActiveToken(false);
      onMint(mintCount);
    }
  }, [waitForActiveToken, gatewayStatus, onMint, mintCount]);

  function incrementValue() {
    var numericField = document.querySelector(".mint-qty") as HTMLInputElement;
    if (numericField) {
      var value = parseInt(numericField.value);
      if (!isNaN(value) && value < 10) {
        value++;
        numericField.value = "" + value;
        updateAmounts(value);
      }
    }
  }

  function decrementValue() {
    var numericField = document.querySelector(".mint-qty") as HTMLInputElement;
    if (numericField) {
      var value = parseInt(numericField.value);
      if (!isNaN(value) && value > 1) {
        value--;
        numericField.value = "" + value;
        updateAmounts(value);
      }
    }
  }

  function updateMintCount(target: any) {
    var value = parseInt(target.value);
    if (!isNaN(value)) {
      if (value > 10) {
        value = 10;
        target.value = "" + value;
      } else if (value < 1) {
        value = 1;
        target.value = "" + value;
      }
      updateAmounts(value);
    }
  }

  function updateAmounts(qty: number) {
    setMintCount(qty);
    // setTotalCost(Math.round(qty * (price + 0.012) * 1000) / 1000); // 0.012 = approx of account creation fees
  }
  const disabled = useMemo(
    () =>
      loading ||
      isSoldOut ||
      isMinting ||
      isEnded ||
      !isActive ||
      mintCount > limit,
    [loading, isSoldOut, isMinting, isEnded, !isActive]
  );
  return (
    <div className="w-100">
      <div className="w-100">
        <ButtonWrap>
        <CTAButton
          disabled={disabled}
          onClick={async () => {
            console.log("isActive gatekeeperNetwork", {
              isActive,
              gatekeeperNetwork,
            });
            if (isActive && gatekeeperNetwork) {
              if (gatewayStatus === GatewayStatus.ACTIVE) {
                await onMint(mintCount);
              } else {
                setWaitForActiveToken(true);
                await requestGatewayToken();
              }
            } else {
              await onMint(mintCount);
            }
          }}
          variant="contained"
        >
          {!candyMachine ? (
            "CONNECTING..."
          ) : isSoldOut ? (
            "SOLD OUT"
          ) : isActive ? guardStates.messages.length ? (guardStates.messages[0]) : (
            mintCount > limit ? (
              "LIMIT REACHED"
            ) : isMinting || loading ? (
              <CircularProgress />
            ) : (
              "MINT"
            )
          ) : isEnded ? (
            "ENDED"
          ) : (
            "UNAVAILABLE"
          )}

          {!isSoldOut && isActive && (
        <EstimatedCost>
          Estimated costs: {costSolUI(totalSolCost)} SOL
          {totalTokenCostsString}
        </EstimatedCost>
        )}
        </CTAButton>

          <NumberInput>
          <NumbericIcon
            disabled={disabled || mintCount <= 1}
            onClick={() => decrementValue()}
          >
            <MinusIcon></MinusIcon>
          </NumbericIcon>
          <NumericField
            disabled={disabled}
            type="number"
            className="mint-qty"
            step={1}
            min={1}
            max={Math.min(limit, 10)}
            value={mintCount}
            onChange={(e) => updateMintCount(e.target as any)}
          />
          <NumbericIcon
            disabled={disabled || limit <= mintCount}
            onClick={() => incrementValue()}
          >
            <PlusIcon></PlusIcon>
          </NumbericIcon>
          </NumberInput>
          </ButtonWrap>
        
      </div>
      {guardStates.messages?.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
};
