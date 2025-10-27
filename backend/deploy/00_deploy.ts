import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("PhotoAlbum", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
};

export default func;
func.tags = ["PhotoAlbum"];


