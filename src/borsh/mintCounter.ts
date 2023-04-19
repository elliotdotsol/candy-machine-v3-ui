import { MintCounterArgs } from "@metaplex-foundation/mpl-candy-guard";
import { deserialize } from "borsh";

export class MintCounterBorsh implements MintCounterArgs {
  count: number;
  constructor(args: MintCounterArgs) {
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
