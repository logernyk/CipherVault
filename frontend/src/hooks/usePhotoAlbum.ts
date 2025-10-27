import { Contract, Eip1193Provider, JsonRpcSigner, ZeroHash, keccak256, toUtf8Bytes } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { PhotoAlbumABI } from "@/abi/PhotoAlbumABI";
import { PhotoAlbumAddresses } from "@/abi/PhotoAlbumAddresses";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";

// 默认 gasLimit（避免 FHEVM 下 estimateGas 回滚导致 -32603）
const DEFAULT_GAS_LIMIT = {
  uploadPhoto: 3_000_000n,
  mintAlbum: 1_000_000n,
};

export function usePhotoAlbum(params: {
  instance: any | undefined;
  chainId: number | undefined;
  signer: JsonRpcSigner | undefined;
  provider: Eip1193Provider | undefined;
}) {
  const { instance, chainId, signer } = params;
  const [handle, setHandle] = useState<string | undefined>();
  const [clear, setClear] = useState<string | bigint | undefined>();
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [photoMetaURI, setPhotoMetaURI] = useState<string>("");
  const [photoRawHash, setPhotoRawHash] = useState<string>("");
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [photoFileHashHex, setPhotoFileHashHex] = useState<string>("");
  const [albumName, setAlbumName] = useState<string>("");
  const [albumDesc, setAlbumDesc] = useState<string>("");
  const [albumIsPublic, setAlbumIsPublic] = useState<boolean>(true);
  const [albumPhotoIds, setAlbumPhotoIds] = useState<string>("");

  const contractInfo = useMemo(() => {
    if (!chainId) return {} as any;
    const entry = (PhotoAlbumAddresses as any)[String(chainId)];
    return { address: entry?.address as `0x${string}` | undefined, abi: (PhotoAlbumABI as any).abi };
  }, [chainId]);

  const canRefresh = useMemo(() => Boolean(contractInfo.address && signer), [contractInfo.address, signer]);
  const canDecrypt = useMemo(() => Boolean(contractInfo.address && signer && instance && handle && handle !== ZeroHash && !busy), [contractInfo.address, signer, instance, handle, busy]);
  const canUpload = useMemo(() => {
    const hasHash = Boolean(photoFileHashHex || photoRawHash);
    // 允许没有 photoMetaURI 也可以上传（按需求放宽）
    return Boolean(contractInfo.address && signer && instance && !busy && hasHash);
  }, [contractInfo.address, signer, instance, busy, photoRawHash, photoFileHashHex]);
  const canMintAlbum = useMemo(() => Boolean(contractInfo.address && signer && albumName && albumPhotoIds), [contractInfo.address, signer, albumName, albumPhotoIds]);

  const refresh = useCallback(async () => {
    if (!contractInfo.address || !signer) return;
    const c = new Contract(contractInfo.address, contractInfo.abi, signer);
    const h = await c.getEncryptedUploadCount(await signer.getAddress());
    setHandle(h);
  }, [contractInfo.address, signer]);

  const upload = useCallback(async () => {
    if (!contractInfo.address || !signer || !instance || (!photoRawHash && !photoFileHashHex)) return;
    setBusy(true);
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer);
      const contentHash = photoFileHashHex || keccak256(toUtf8Bytes(photoRawHash));
      const enc = await instance.createEncryptedInput(contractInfo.address, await signer.getAddress()).add32(1).encrypt();
      const tx = await c.uploadPhoto(
        contentHash,
        photoMetaURI || "",
        enc.handles[0],
        enc.inputProof,
        { gasLimit: DEFAULT_GAS_LIMIT.uploadPhoto }
      );
      setMessage(`tx: ${tx.hash}`);
      await tx.wait();
      setMessage(`upload ok`);
      await refresh();
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, signer, instance, photoMetaURI, photoRawHash, photoFileHashHex, refresh]);

  const setPhotoFile = useCallback(async (file: File | undefined) => {
    if (!file) {
      setPhotoFileName("");
      setPhotoFileHashHex("");
      return;
    }
    setPhotoFileName(file.name);
    const buf = await file.arrayBuffer();
    const hashHex = keccak256(new Uint8Array(buf));
    setPhotoFileHashHex(hashHex);
  }, []);

  const decrypt = useCallback(async () => {
    if (!contractInfo.address || !signer || !instance || !handle || handle === ZeroHash) return;
    setBusy(true);
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(instance, [contractInfo.address], signer, window.localStorage);
      if (!sig) throw new Error("build signature failed");
      const res = await instance.userDecrypt(
        [{ handle, contractAddress: contractInfo.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );
      setClear(res[handle]);
      setMessage("decrypt ok");
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, signer, instance, handle]);

  const mintAlbum = useCallback(async () => {
    if (!contractInfo.address || !signer || !albumName || !albumPhotoIds) return;
    setBusy(true);
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer);
      const ids = albumPhotoIds.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
      const tx = await c.mintAlbum(
        albumName,
        albumDesc,
        ids,
        albumIsPublic,
        { gasLimit: DEFAULT_GAS_LIMIT.mintAlbum }
      );
      setMessage(`tx: ${tx.hash}`);
      await tx.wait();
      setMessage("mint album ok");
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, signer, albumName, albumDesc, albumIsPublic, albumPhotoIds]);

  return {
    handle,
    clear,
    message,
    canRefresh,
    canDecrypt,
    canUpload,
    canMintAlbum,
    refresh,
    decrypt,
    upload,
    mintAlbum,
    photoMetaURI,
    setPhotoMetaURI,
    photoRawHash,
    setPhotoRawHash,
    photoFileName,
    photoFileHashHex,
    setPhotoFile,
    albumName,
    setAlbumName,
    albumDesc,
    setAlbumDesc,
    albumIsPublic,
    setAlbumIsPublic,
    albumPhotoIds,
    setAlbumPhotoIds,
  };
}


