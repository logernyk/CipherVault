import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner, id } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PhotoAlbumABI } from "@/abi/PhotoAlbumABI";
import { PhotoAlbumAddresses } from "@/abi/PhotoAlbumAddresses";

export type AlbumListItem = {
  tokenId: number;
  name: string;
  createdAt: number;
  isPublic: boolean;
};

export type AlbumDetail = {
  tokenId: number;
  name: string;
  description: string;
  createdAt: number;
  owner: string;
  isPublic: boolean;
  photoIds: number[];
  photos: Array<{
    photoId: number;
    contentHash: string;
    metadataURI: string;
    owner: string;
    timestamp: number;
  }>; 
};

export function useAlbumBrowser(params: {
  chainId: number | undefined;
  signer: JsonRpcSigner | undefined;
  provider: Eip1193Provider | undefined;
}) {
  const { chainId, signer, provider } = params;

  const [list, setList] = useState<AlbumListItem[]>([]);
  const [selected, setSelected] = useState<AlbumDetail | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const contractInfo = useMemo(() => {
    if (!chainId) return {} as any;
    const entry = (PhotoAlbumAddresses as any)[String(chainId)];
    return { address: entry?.address as `0x${string}` | undefined, abi: (PhotoAlbumABI as any).abi };
  }, [chainId]);

  const getReadProvider = useCallback(() => {
    if (signer?.provider) return signer.provider;
    if (provider) return new BrowserProvider(provider);
    return undefined;
  }, [provider, signer]);

  const refresh = useCallback(async () => {
    if (!contractInfo.address) return;
    const rpc = getReadProvider();
    if (!rpc) return;
    setBusy(true);
    setMessage("");
    try {
      const currentUser = signer ? (await signer.getAddress()).toLowerCase() : undefined;
      const transferTopic = id("Transfer(address,address,uint256)");
      const zeroPadded = "0x" + "0".repeat(64); // indexed from == ZeroAddress
      const logs = await rpc.getLogs({
        address: contractInfo.address,
        fromBlock: 0n,
        toBlock: "latest",
        topics: [transferTopic, zeroPadded],
      });
      const mintedTokenIds = Array.from(new Set(logs.map((l) => Number(BigInt(l.topics[3]))))).sort((a, b) => b - a);

      const c = new Contract(contractInfo.address, contractInfo.abi, signer ?? rpc);
      const items = await Promise.all(
        mintedTokenIds.map(async (tokenId) => {
          const meta = await c.getAlbum(BigInt(tokenId));
          const isPublic = Boolean(meta.isPublic);
          const owner = String(meta.owner).toLowerCase();
          const canSee = isPublic || (currentUser !== undefined && owner === currentUser);
          if (!canSee) return undefined;
          return {
            tokenId,
            name: String(meta.name),
            createdAt: Number(meta.createdAt),
            isPublic,
          } as AlbumListItem;
        })
      );
      setList(items.filter(Boolean) as AlbumListItem[]);
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, contractInfo.abi, getReadProvider, signer]);

  const openAlbum = useCallback(async (tokenId: number) => {
    if (!contractInfo.address) return;
    const rpc = getReadProvider();
    if (!rpc) return;
    setBusy(true);
    setMessage("");
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer ?? rpc);
      const meta = await c.getAlbum(BigInt(tokenId));
      const isPublic = Boolean(meta.isPublic);
      const owner = String(meta.owner).toLowerCase();
      const currentUser = signer ? (await signer.getAddress()).toLowerCase() : undefined;
      const canSee = isPublic || (currentUser !== undefined && owner === currentUser);
      if (!canSee) {
        setSelected(undefined);
        setMessage("该相册为私密，只有拥有者可查看");
        return;
      }
      const photoIds: number[] = (meta.photoIds as any[]).map((x) => Number(x));
      const photos = await Promise.all(
        photoIds.map(async (pid) => {
          const p = await c.getPhoto(BigInt(pid));
          return {
            photoId: pid,
            contentHash: String(p.contentHash),
            metadataURI: String(p.metadataURI),
            owner: String(p.owner),
            timestamp: Number(p.timestamp),
          };
        })
      );
      setSelected({
        tokenId,
        name: String(meta.name),
        description: String(meta.description),
        createdAt: Number(meta.createdAt),
        owner: String(meta.owner),
        isPublic: Boolean(meta.isPublic),
        photoIds,
        photos,
      });
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, contractInfo.abi, getReadProvider, signer]);

  useEffect(() => {
    setList([]);
    setSelected(undefined);
  }, [contractInfo.address]);

  return {
    list,
    selected,
    busy,
    message,
    refresh,
    openAlbum,
  };
}


