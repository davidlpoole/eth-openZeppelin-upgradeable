# Deploy an Upgradeable Vending Machine Smart Contract

Deploying contracts under a proxy can be useful in order to future-proof your smart contract functionality.
It means being able to deploy a version 1 contract, add new functionality and then deploy a version 2 of that contract
under the proxy, and so on...

## 1. Deploy to Sepolia

`npx hardhat run scripts/deployProxy.js --network sepolia`

- [Proxy](https://sepolia.etherscan.io/address/0x1576b6a3F62785Bec45c83ABA633970C00333E11) (
  0x1576b6a3F62785Bec45c83ABA633970C00333E11)
- [VendingMachineV1](https://sepolia.etherscan.io/address/0xDA905b5fdACb19276e074447B64D700d60f0dE80) (
  0xDA905b5fdACb19276e074447B64D700d60f0dE80)

### Verify deployed implementation V1 contract on Etherscan

`npx hardhat verify --network sepolia 0xDA905b5fdACb19276e074447B64D700d60f0dE80`

- [Verified VendingMachineV1 source code](https://sepolia.etherscan.io/address/0xDA905b5fdACb19276e074447B64D700d60f0dE80#code)

## 2. Upgrade Proxy to VendingMachineV2

`npx hardhat run scripts/upgradeProxy.js --network`

- [VendingMachineV2](https://sepolia.etherscan.io/address/0xa3b4f7692b0d98a8fea3d98a99512ea2d368187c)

### Verify deployed implementation V2 contract on Etherscan

`npx hardhat verify --network sepolia 0xa3b4f7692b0d98a8fea3d98a99512ea2d368187c`

- [Verified VendingMachineV2 source code](https://sepolia.etherscan.io/address/0xa3b4f7692b0d98a8fea3d98a99512ea2d368187c#code)
