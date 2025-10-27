import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { execSync } from "node:child_process";

task("export", "Compile and export ABI to frontend").setAction(async (_, hre) => {
  await hre.run("compile");
  execSync("node ./scripts/export-abi.mjs", { stdio: "inherit" });
});


