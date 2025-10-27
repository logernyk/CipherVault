import React from "react";
import { usePhotoAlbum } from "@/hooks/usePhotoAlbum";
import { ethers } from "ethers";

interface UploadPageProps {
  instance: any | undefined;
  chainId: number | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  provider: ethers.Eip1193Provider | undefined;
}

export function UploadPage({ instance, chainId, signer, provider }: UploadPageProps) {
  const album = usePhotoAlbum({ instance, chainId, signer, provider });

  return (
    <div className="space-y-8">
      {/* Photo Upload Section */}
      <div className="bg-white rounded-2xl card-shadow p-8 fade-in">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-blue-600 text-2xl">📤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Photo Upload & Verification</h2>
            <p className="text-gray-600 mt-1">Upload and encrypt your photos on the blockchain</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photo Metadata URI</label>
            <input
              value={album.photoMetaURI}
              onChange={(e) => album.setPhotoMetaURI(e.target.value)}
              placeholder="Enter IPFS or other storage URI"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Photo File</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => album.setPhotoFile(e.target.files?.[0])}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
              />
            </div>
            {album.photoFileName && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <div className="text-sm text-gray-700 font-medium">Selected: {album.photoFileName}</div>
                {album.photoFileHashHex && (
                  <div className="text-xs text-gray-500 mt-2 font-mono break-all">
                    Hash: {album.photoFileHashHex}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={album.refresh}
              disabled={!album.canRefresh}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all duration-200 font-semibold"
            >
              Get Upload Count
            </button>
            <button
              onClick={album.upload}
              disabled={!album.canUpload}
              className="px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all duration-200 font-semibold"
            >
              Encrypt & Upload
            </button>
            <button
              onClick={album.decrypt}
              disabled={!album.canDecrypt}
              className="px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all duration-200 font-semibold"
            >
              Decrypt Count
            </button>
          </div>

          {(album.handle || album.clear !== undefined) && (
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 space-y-3">
              {album.handle && (
                <div className="text-sm">
                  <span className="font-semibold text-blue-800">Encrypted Handle:</span>
                  <span className="ml-2 font-mono text-blue-600">{album.handle}</span>
                </div>
              )}
              {album.clear !== undefined && (
                <div className="text-sm">
                  <span className="font-semibold text-blue-800">Upload Count:</span>
                  <span className="ml-2 text-blue-600 font-bold text-lg">{String(album.clear)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      {album.message && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
          <div className="text-blue-800 font-medium">{album.message}</div>
        </div>
      )}
    </div>
  );
}
