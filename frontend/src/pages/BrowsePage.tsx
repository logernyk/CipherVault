import React from "react";
import { useAlbumBrowser } from "@/hooks/useAlbumBrowser";
import { ethers } from "ethers";

interface BrowsePageProps {
  chainId: number | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  provider: ethers.Eip1193Provider | undefined;
}

export function BrowsePage({ chainId, signer, provider }: BrowsePageProps) {
  const browser = useAlbumBrowser({ chainId, signer, provider });

  return (
    <div className="space-y-8">
      {/* Album Browser Section */}
      <div className="bg-white rounded-2xl card-shadow p-8 fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-indigo-600 text-2xl">🌐</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Browse Albums</h2>
              <p className="text-gray-600 mt-1">Explore public photo albums from the community</p>
            </div>
          </div>
          <button
            onClick={browser.refresh}
            disabled={!chainId}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all duration-200 font-semibold"
          >
            🔄 Refresh List
          </button>
        </div>

        <div className="space-y-6">
          {browser.list.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-6">📭</div>
              <div className="text-xl mb-2">No Albums Found</div>
              <div className="text-gray-400">Be the first to create an album!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {browser.list.map((a) => (
                <div
                  key={a.tokenId}
                  onClick={() => browser.openAlbum(a.tokenId)}
                  className="bg-gray-50 rounded-2xl p-6 cursor-pointer hover:bg-gray-100 transition-all duration-200 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-800 text-lg">#{a.tokenId}</span>
                    <span className={`px-3 py-1 rounded-2xl text-xs font-semibold ${a.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                      {a.isPublic ? '🌍 Public' : '🔒 Private'}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-2 text-lg">{a.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(a.createdAt * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {browser.selected && (
            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Album Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Album ID</div>
                  <div className="font-bold text-lg">#{browser.selected.tokenId}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Album Name</div>
                  <div className="font-bold text-lg">{browser.selected.name}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Created Date</div>
                  <div className="font-bold">{new Date(browser.selected.createdAt * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Access Level</div>
                  <div className="font-bold">{browser.selected.isPublic ? '🌍 Public' : '🔒 Private'}</div>
                </div>
              </div>
              <div className="mb-6 bg-white rounded-2xl p-4 border-2 border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Description</div>
                <div className="text-gray-800">{browser.selected.description || 'No description provided'}</div>
              </div>
              <div className="mb-6 bg-white rounded-2xl p-4 border-2 border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Owner Address</div>
                <div className="font-mono text-sm text-gray-700 break-all">{browser.selected.owner}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
                <div className="text-sm text-gray-600 mb-4">Photos in Album ({browser.selected.photos.length})</div>
                {browser.selected.photos.length === 0 ? (
                  <div className="text-gray-500 italic text-center py-8">This album contains no photos yet</div>
                ) : (
                  <div className="space-y-3">
                    {browser.selected.photos.map((p) => (
                      <div key={p.photoId} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-800">Photo #{p.photoId}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-2xl">
                            {new Date(p.timestamp * 1000).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Metadata:</span> {p.metadataURI || 'Not available'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono break-all bg-white p-2 rounded-2xl border-2 border-gray-100">
                          <span className="font-medium">Hash:</span> {p.contentHash}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      {browser.message && (
        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl">
          <div className="text-indigo-800 font-medium">{browser.message}</div>
        </div>
      )}
    </div>
  );
}
