const {ethers, upgrades} = require('hardhat');

const proxyAddress = '0x1576b6a3F62785Bec45c83ABA633970C00333E11';

async function main() {
    const VendingMachineV2 = await ethers.getContractFactory('VendingMachineV2');
    const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV2);
    await upgraded.waitForDeployment();

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxyAddress
    );

    console.log("The current contract owner is: " + await upgraded.owner());
    console.log('Implementation contract address: ' + implementationAddress);
}

main();