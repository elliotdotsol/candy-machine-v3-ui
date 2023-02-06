import { keccak_256 } from "js-sha3";

export class MerkleTree<T = any> {
  data: Array<T>;
  leafs: Array<Buffer>;
  layers: Array<Array<Buffer>>;

  constructor(data: T[]) {
    this.leafs = MerkleTree.buildLeaves(data).slice();
    this.layers = [];

    let hashes = this.leafs.map(MerkleTree.nodeHash);
    while (hashes.length > 0) {
      this.layers.push(hashes.slice());
      if (hashes.length === 1) break;
      hashes = hashes.reduce((acc, cur, idx, arr) => {
        if (idx % 2 === 0) {
          const nxt = arr[idx + 1];
          acc.push(MerkleTree.internalHash(cur, nxt));
        }
        return acc;
      }, Array<Buffer>());
    }
  }

  static buildLeaves = (data: any[]) => {
    const leaves: Array<Buffer> = [];
    for (let idx = 0; idx < data.length; ++idx) {
      leaves.push(Buffer.from(data[idx]));
    }

    return leaves;
  };

  static nodeHash(data: Buffer): Buffer {
    //@ts-ignore
    return Buffer.from(keccak_256.digest([0x00, ...data]));
  }

  static internalHash(first: Buffer, second: Buffer | undefined): Buffer {
    if (!second) return first;
    const [fst, snd] = [first, second].sort(Buffer.compare);
    //@ts-ignore
    return Buffer.from(keccak_256.digest([0x01, ...fst, ...snd]));
  }

  getRoot(): Buffer {
    return this.layers[this.layers.length - 1][0];
  }

  getRootArray(): number[] {
    let arr: number[] = [];
    //@ts-ignore
    for (let v of this.getRoot().values()) {
      arr.push(v);
    }
    return arr;
  }

  getProof(idx: number): Buffer[] {
    return this.layers.reduce((proof, layer) => {
      const sibling = idx ^ 1;
      if (sibling < layer.length) {
        proof.push(layer[sibling]);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  getProofArray(index: number) {
    let res = [];

    for (let e of this.getProof(index)) {
      let arr: number[] = [];
      //@ts-ignore
      for (let v of e.values()) {
        arr.push(v);
      }
      //@ts-ignore
      res.push(arr);
    }
    return res;
  }

  getHexRoot(): string {
    return this.getRoot().toString("hex");
  }

  getHexProof(idx: number): string[] {
    return this.getProof(idx).map((el) => el.toString("hex"));
  }

  verifyProof(idx: number, proof: Buffer[], root: Buffer): boolean {
    let pair = MerkleTree.nodeHash(this.leafs[idx]);
    for (const item of proof) {
      pair = MerkleTree.internalHash(pair, item);
    }

    return pair.equals(root);
  }

  verifyRoot(idx: number, proof: Buffer[], root: Buffer): boolean {
    let pair = MerkleTree.nodeHash(this.leafs[idx]);
    for (const item of proof) {
      pair = MerkleTree.internalHash(pair, item);
    }
    return pair.equals(root);
  }

  verifyClaim(item: T, proof: Buffer[]): boolean {
    let pair = MerkleTree.nodeHash(Buffer.from(item));
    for (const item of proof) {
      pair = MerkleTree.internalHash(pair, item);
    }
    return pair.equals(this.getRoot());
  }

  //   static verifyClaim(leaf: Buffer, proof: Buffer[], root: Buffer): boolean {
  //     let pair = MerkleTree.nodeHash(leaf);
  //     for (const item of proof) {
  //       pair = MerkleTree.internalHash(pair, item);
  //     }

  //     return pair.equals(root);
  //   }
}
