import { SDK_CDN_URL } from "./constants";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType }) {
    this._trace = options.trace;
  }

  public isLoaded() {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("RelayerSDKLoader: can only be used in the browser."));
    }
    if ("relayerSDK" in window) {
      if (!isFhevmRelayerSDKType((window as any).relayerSDK, this._trace)) {
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK");
      }
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
      if (existingScript) {
        if (!isFhevmWindowType(window, this._trace)) {
          reject(new Error("RelayerSDKLoader: window object does not contain a valid relayerSDK object."));
        }
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (!isFhevmWindowType(window, this._trace)) {
          reject(new Error(`RelayerSDKLoader: Relayer SDK script has been successfully loaded from ${SDK_CDN_URL}, however, the window.relayerSDK object is invalid.`));
        }
        resolve();
      };
      script.onerror = () => {
        reject(new Error(`RelayerSDKLoader: Failed to load Relayer SDK from ${SDK_CDN_URL}`));
      };
      document.head.appendChild(script);
    });
  }
}

export function isFhevmWindowType(win: unknown, trace?: TraceType): win is any {
  if (typeof win !== "object" || win === null) {
    trace?.("RelayerSDKLoader: window object invalid");
    return false;
  }
  if (!("relayerSDK" in (win as any))) return false;
  return isFhevmRelayerSDKType((win as any).relayerSDK, trace);
}

function isFhevmRelayerSDKType(o: unknown, trace?: TraceType): o is any {
  if (!o || typeof o !== "object") return false;
  const obj = o as any;
  if (typeof obj.initSDK !== "function") return false;
  if (typeof obj.createInstance !== "function") return false;
  if (typeof obj.SepoliaConfig !== "object") return false;
  return true;
}


