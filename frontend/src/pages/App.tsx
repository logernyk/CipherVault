import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { WalletAddress } from "@/components/WalletAddress";
import { Navigation } from "@/components/Navigation";
import { UploadPage } from "./UploadPage";
import { AlbumPage } from "./AlbumPage";
import { MyPhotosPage } from "./MyPhotosPage";
import { BrowsePage } from "./BrowsePage";
import { PhotoAlbumAddresses } from "@/abi/PhotoAlbumAddresses";

export function App() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<string>('upload');

  useEffect(() => {
    const w = (window as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!w) return;
    setProvider(w);
    (async () => {
      const _chainId = await w.request({ method: "eth_chainId" });
      setChainId(parseInt(_chainId as string, 16));
    })();
  }, []);

  const { instance, status } = useFhevm({ provider, chainId, enabled: true });

  useEffect(() => {
    if (!provider) return;
    const p = new ethers.BrowserProvider(provider);
    (async () => {
      try {
        await provider.request?.({ method: "eth_requestAccounts" });
        const s = await p.getSigner();
        setSigner(s);
      } catch {}
    })();
  }, [provider]);

  const currentAddress = useMemo(() => (chainId ? (PhotoAlbumAddresses as any)[String(chainId)]?.address : undefined), [chainId]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage instance={instance} chainId={chainId} signer={signer} provider={provider} />;
      case 'album':
        return <AlbumPage instance={instance} chainId={chainId} signer={signer} provider={provider} />;
      case 'photos':
        return <MyPhotosPage chainId={chainId} signer={signer} provider={provider} />;
      case 'browse':
        return <BrowsePage chainId={chainId} signer={signer} provider={provider} />;
      default:
        return <UploadPage instance={instance} chainId={chainId} signer={signer} provider={provider} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">📸 Blockchain Photo Album</h1>
          <p className="text-xl text-gray-600 font-medium">Privacy-Protected Photo Album DApp powered by FHEVM</p>
        </div>

        {/* Status Information Card */}
        <div className="bg-white rounded-2xl card-shadow p-8 mb-8 fade-in border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2 font-medium">FHEVM Status</div>
              <div className={`font-bold text-lg ${status === 'ready' ? 'text-green-600' : 'text-yellow-600'}`}>
                {status === 'ready' ? '✅ Ready' : '⏳ Loading'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2 font-medium">Network ID</div>
              <div className="font-bold text-blue-600 text-lg">{chainId ?? "Not Connected"}</div>
            </div>
            <div className="text-center">
              <WalletAddress signer={signer} />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2 font-medium">Contract Address</div>
              <div className="font-mono text-xs text-gray-700 break-all font-semibold">
                {currentAddress ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : "Not Deployed"}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Page Content */}
        <div className="fade-in">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}



