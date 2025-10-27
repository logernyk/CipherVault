import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const artifactPath = resolve("./artifacts/contracts/PhotoAlbum.sol/PhotoAlbum.json");
const outDir = resolve("../frontend/src/abi");
const outABI = resolve(outDir + "/PhotoAlbumABI.ts");
const outAddr = resolve(outDir + "/PhotoAlbumAddresses.ts");

mkdirSync(outDir, { recursive: true });

const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

const abiTs = `export const PhotoAlbumABI = ${JSON.stringify({ abi: artifact.abi }, null, 2)} as const;`;
writeFileSync(outABI, abiTs);

// Load deployments if present
let deployments = {};
try {
  const d = JSON.parse(readFileSync(resolve("./deployments/localhost/PhotoAlbum.json"), "utf8"));
  deployments["31337"] = { address: d.address, chainId: 31337, chainName: "hardhat" };
} catch {}
try {
  const d = JSON.parse(readFileSync(resolve("./deployments/sepolia/PhotoAlbum.json"), "utf8"));
  deployments["11155111"] = { address: d.address, chainId: 11155111, chainName: "sepolia" };
} catch {}

const addrTs = `export const PhotoAlbumAddresses = ${JSON.stringify(deployments, null, 2)} as const;`;
writeFileSync(outAddr, addrTs);

console.log("ABI and addresses exported to", dirname(outABI));


