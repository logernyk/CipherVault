import React from "react";
import { usePhotoAlbum } from "@/hooks/usePhotoAlbum";
import { ethers } from "ethers";

interface AlbumPageProps {
  instance: any | undefined;
  chainId: number | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  provider: ethers.Eip1193Provider | undefined;
}

export function AlbumPage({ instance, chainId, signer, provider }: AlbumPageProps) {
  const album = usePhotoAlbum({ instance, chainId, signer, provider });

  return (
    <div className="space-y-8">
      {/* Album NFT Creation Section */}
      <div className="bg-white rounded-2xl card-shadow p-8 fade-in">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-purple-600 text-2xl">🎨</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Album NFT</h2>
            <p className="text-gray-600 mt-1">Bundle your photos into a unique NFT collection</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Album Name</label>
            <input
              value={album.albumName}
              onChange={(e) => album.setAlbumName(e.target.value)}
              placeholder="Give your album a memorable name"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Album Description</label>
            <textarea
              value={album.albumDesc}
              onChange={(e) => album.setAlbumDesc(e.target.value)}
              placeholder="Describe the content or theme of this album"
              rows={4}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Photo ID List</label>
            <input
              value={album.albumPhotoIds}
              onChange={(e) => album.setAlbumPhotoIds(e.target.value)}
              placeholder="Enter photo IDs separated by commas, e.g: 1,2,3"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <input
              type="checkbox"
              id="isPublic"
              checked={album.albumIsPublic}
              onChange={(e) => album.setAlbumIsPublic(e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="isPublic" className="ml-3 text-sm font-semibold text-gray-700">
              Make this album public
            </label>
          </div>

          <button
            onClick={album.mintAlbum}
            disabled={!album.canMintAlbum}
            className="w-full px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all duration-200 font-bold text-lg"
          >
            🎯 Generate Album NFT
          </button>
        </div>
      </div>

      {/* Message Display */}
      {album.message && (
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
          <div className="text-purple-800 font-medium">{album.message}</div>
        </div>
      )}
    </div>
  );
}
