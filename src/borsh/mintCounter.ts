import { MintCounter } from "@metaplex-foundation/mpl-candy-guard";
import { deserialize } from "borsh";

export class MintCounterBorsh implements MintCounter {
  count: number;
  constructor(args: MintCounter) {
    Object.assign(this, args);
  }
  static schema = new Map([
    [
      MintCounterBorsh,
      {
        kind: "struct",
        fields: [
        //   ["accountDiscriminator", "Uint8Array"],
          ["count", "u16"],
        ],
      },
    ],
  ]);
  static fromBuffer(buffer: Buffer) {
    return deserialize(MintCounterBorsh.schema, MintCounterBorsh, buffer);
  }
}
