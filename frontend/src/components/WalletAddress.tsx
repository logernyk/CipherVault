import { JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";

export function WalletAddress(props: { signer: JsonRpcSigner | undefined }) {
  const { signer } = props;
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!signer) {
          if (mounted) setAddress(undefined);
          return;
        }
        const addr = await signer.getAddress();
        if (mounted) setAddress(addr);
      } catch {
        if (mounted) setAddress(undefined);
      }
    })();
    return () => { mounted = false; };
  }, [signer]);

  return (
    <div>
      <div className="text-sm text-gray-500 mb-1 font-medium">Wallet Address</div>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${address ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="font-mono text-xs text-gray-700 break-all font-semibold">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
        </div>
      </div>
    </div>
  );
}


