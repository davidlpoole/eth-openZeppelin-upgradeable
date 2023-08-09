require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    defaultnetwork: 'localhost',
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_ALCHEMY_API_URL,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
};