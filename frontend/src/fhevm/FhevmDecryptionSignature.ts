import { ethers } from "ethers";

export class FhevmDecryptionSignature {
  constructor(
    public publicKey: string,
    public privateKey: string,
    public signature: string,
    public contractAddresses: `0x${string}`[],
    public userAddress: `0x${string}`,
    public startTimestamp: number,
    public durationDays: number,
    public eip712: any
  ) {}

  static async loadOrSign(instance: any, contractAddresses: string[], signer: ethers.Signer, storage: Storage, keyPair?: { publicKey: string; privateKey: string }) {
    const userAddress = (await signer.getAddress()) as `0x${string}`;
    const key = `${userAddress}:${contractAddresses.sort().join(",")}`;
    const cached = storage.getItem(key);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    const { publicKey, privateKey } = keyPair ?? instance.generateKeypair();
    const startTimestamp = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const eip712 = instance.createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);
    const signature = await (signer as any).signTypedData(eip712.domain, { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification }, eip712.message);
    const sig = new FhevmDecryptionSignature(publicKey, privateKey, signature, contractAddresses as `0x${string}`[], userAddress, startTimestamp, durationDays, eip712);
    storage.setItem(key, JSON.stringify(sig));
    return sig;
  }
}


