import React from "react";
import { MyPhotos } from "@/components/MyPhotos";
import { ethers } from "ethers";

interface MyPhotosPageProps {
  chainId: number | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  provider: ethers.Eip1193Provider | undefined;
}

export function MyPhotosPage({ chainId, signer, provider }: MyPhotosPageProps) {
  return (
    <div className="space-y-8">
      {/* My Photos Section */}
      <div className="bg-white rounded-2xl card-shadow p-8 fade-in">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-green-600 text-2xl">🖼️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Photo Collection</h2>
            <p className="text-gray-600 mt-1">View and manage all your uploaded photos</p>
          </div>
        </div>
        <MyPhotos chainId={chainId} signer={signer} provider={provider} />
      </div>
    </div>
  );
}
