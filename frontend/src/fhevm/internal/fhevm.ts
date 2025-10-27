import { Eip1193Provider, JsonRpcProvider, isAddress } from "ethers";
import { RelayerSDKLoader, isFhevmWindowType } from "./RelayerSDKLoader";

export type FhevmInstance = any;

export class FhevmReactError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "FhevmReactError";
  }
}

const isFhevmInitialized = (): boolean => {
  if (!isFhevmWindowType(window, console.log)) return false;
  return (window as any).relayerSDK.__initialized__ === true;
};

const fhevmLoadSDK = () => {
  const loader = new RelayerSDKLoader({ trace: console.log });
  return loader.load();
};

const fhevmInitSDK = async (options?: any) => {
  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("window.relayerSDK is not available");
  }
  const result = await (window as any).relayerSDK.initSDK(options);
  (window as any).relayerSDK.__initialized__ = result;
  if (!result) throw new Error("window.relayerSDK.initSDK failed.");
  return true;
};

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") { super(message); this.name = "FhevmAbortError"; }
}

type FhevmRelayerStatusType = "sdk-loading" | "sdk-loaded" | "sdk-initializing" | "sdk-initialized" | "creating";

async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    const net = await provider.getNetwork();
    return Number(net.chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try { return await rpc.send("web3_clientVersion", []); } finally { rpc.destroy(); }
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string) {
  const version = await getWeb3Client(rpcUrl);
  if (typeof version !== "string" || !version.toLowerCase().includes("hardhat")) return undefined;
  const rpc = new JsonRpcProvider(rpcUrl);
  try { return await rpc.send("fhevm_relayer_metadata", []); } catch { return undefined; } finally { rpc.destroy(); }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(providerOrUrl: Eip1193Provider | string, mockChains?: Record<number, string>): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;
  const _mockChains: Record<number, string> = { 31337: "http://localhost:8545", ...(mockChains ?? {}) };
  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) rpcUrl = _mockChains[chainId];
    return { isMock: true, chainId, rpcUrl: rpcUrl! };
  }
  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const { signal, onStatusChange, provider: providerOrUrl, mockChains } = parameters;
  const throwIfAborted = () => { if (signal.aborted) throw new FhevmAbortError(); };
  const notify = (status: FhevmRelayerStatusType) => { onStatusChange?.(status); };

  const { isMock, rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);

  if (isMock) {
    const meta = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);
    if (meta) {
      notify("creating");
      const fhevmMock = await import("./mock/fhevmMock");
      const instance = await fhevmMock.fhevmMockCreateInstance({ rpcUrl, chainId, metadata: meta });
      throwIfAborted();
      return instance;
    }
  }

  throwIfAborted();

  if (!isFhevmWindowType(window, console.log)) {
    notify("sdk-loading");
    await fhevmLoadSDK();
    throwIfAborted();
    notify("sdk-loaded");
  }

  if (!isFhevmInitialized()) {
    notify("sdk-initializing");
    await fhevmInitSDK();
    throwIfAborted();
    notify("sdk-initialized");
  }

  const relayerSDK = (window as any).relayerSDK;
  const aclAddress = relayerSDK.SepoliaConfig.aclContractAddress;
  if (typeof aclAddress !== "string" || !aclAddress.startsWith("0x")) throw new Error(`Invalid address: ${aclAddress}`);

  notify("creating");
  const instance = await relayerSDK.createInstance({ ...relayerSDK.SepoliaConfig, network: providerOrUrl });
  throwIfAborted();
  return instance;
};


