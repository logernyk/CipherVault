import { useEffect } from "react";
import { useMyPhotos } from "@/hooks/useMyPhotos";
import { Eip1193Provider, JsonRpcSigner } from "ethers";

export function MyPhotos(props: { chainId: number | undefined; signer: JsonRpcSigner | undefined; provider: Eip1193Provider | undefined }) {
  const { chainId, signer, provider } = props;
  const my = useMyPhotos({ chainId, signer, provider });

  useEffect(() => {
    // 切换网络或账户后，用户可手动点击刷新。也可在这里自动刷新
  }, [chainId, signer]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600 font-medium">
          Total: {my.photos.length} photos
        </div>
        <button 
          onClick={my.refresh} 
          disabled={!chainId || !signer}
          className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed btn-hover transition-all text-sm font-semibold"
        >
          🔄 Refresh Photos
        </button>
      </div>

      {my.photos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-6">🖼️</div>
          <div className="text-xl mb-3 font-semibold">No Photos Uploaded Yet</div>
          <div className="text-gray-400">Upload your first photo to get started!</div>
        </div>
      ) : (
        <div className="photo-grid">
          {my.photos.map((p) => (
            <div key={p.photoId} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-2 rounded-2xl text-xs font-bold">
                  Photo #{p.photoId}
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-2xl">
                  {new Date(p.timestamp * 1000).toLocaleDateString('en-US')}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-2 font-semibold">Metadata URI</div>
                  <div className="text-sm text-gray-700 break-all bg-white p-3 rounded-2xl border-2 border-gray-100">
                    {p.metadataURI || "No metadata available"}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-2 font-semibold">Content Hash</div>
                  <div className="text-xs font-mono text-gray-600 break-all bg-white p-3 rounded-2xl border-2 border-gray-100">
                    {p.contentHash}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="text-xs text-gray-500 font-medium">
                  Uploaded: {new Date(p.timestamp * 1000).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {my.message && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
          <div className="text-green-800 text-sm font-medium">{my.message}</div>
        </div>
      )}
    </div>
  );
}


