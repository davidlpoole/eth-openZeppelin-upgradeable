const {ethers, upgrades} = require('hardhat');

// const proxyAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';   // localhost
const proxyAddress = '0x1576b6a3F62785Bec45c83ABA633970C00333E11';   // sepolia

async function main() {
    const VendingMachineV3 = await ethers.getContractFactory('VendingMachineV3');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV3);
    await upgraded.waitForDeployment();

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxyAddress
    );

    console.log("The current contract owner is: " + await upgraded.owner());
    console.log('Implementation contract address: ' + implementationAddress);
}

main();