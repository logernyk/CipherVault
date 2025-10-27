import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner, ZeroAddress } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { PhotoAlbumABI } from "@/abi/PhotoAlbumABI";
import { PhotoAlbumAddresses } from "@/abi/PhotoAlbumAddresses";

export type MyPhoto = {
  photoId: number;
  contentHash: string;
  metadataURI: string;
  owner: string;
  timestamp: number;
};

export function useMyPhotos(params: {
  chainId: number | undefined;
  signer: JsonRpcSigner | undefined;
  provider: Eip1193Provider | undefined;
}) {
  const { chainId, signer, provider } = params;

  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const contractInfo = useMemo(() => {
    if (!chainId) return {} as any;
    const entry = (PhotoAlbumAddresses as any)[String(chainId)];
    return { address: entry?.address as `0x${string}` | undefined, abi: (PhotoAlbumABI as any).abi };
  }, [chainId]);

  const refresh = useCallback(async () => {
    if (!contractInfo.address || !signer) return;
    const rpc = signer.provider ?? (provider ? new BrowserProvider(provider) : undefined);
    if (!rpc) return;
    setBusy(true);
    setMessage("");
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer ?? rpc);
      const me = (await signer.getAddress()).toLowerCase();
      const results: MyPhoto[] = [];
      let id = 1;
      // 顺序扫描直到遇到第一个未使用的 id（owner == ZeroAddress 或 timestamp == 0）
      // 该合约的 photoId 自增且没有删除，因此可用该方式停止
      // 小规模数据足够；若数据量大，可进一步做指数探测 + 二分优化
      for (;;) {
        const p = await c.getPhoto(BigInt(id));
        const owner: string = String(p.owner);
        const ts: number = Number(p.timestamp);
        if (owner === ZeroAddress || ts === 0) break;
        if (owner.toLowerCase() === me) {
          results.push({
            photoId: id,
            contentHash: String(p.contentHash),
            metadataURI: String(p.metadataURI),
            owner,
            timestamp: ts,
          });
        }
        id += 1;
      }
      // 时间倒序展示
      results.sort((a, b) => b.timestamp - a.timestamp);
      setPhotos(results);
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, contractInfo.abi, signer, provider]);

  return { photos, busy, message, refresh };
}


