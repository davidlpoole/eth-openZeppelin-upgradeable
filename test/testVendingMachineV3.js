const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert} = require("chai");
const {ethers, upgrades} = require("hardhat");

describe("Vending Machine", function () {
    async function deployFixture() {

        const [owner] = await ethers.getSigners();

        const VendingMachineV1 = await ethers.getContractFactory('VendingMachineV1');
        const proxy = await upgrades.deployProxy(VendingMachineV1, [100]);
        await proxy.waitForDeployment();

        const VendingMachineV2 = await ethers.getContractFactory('VendingMachineV2');
        const upgradedV2 = await upgrades.upgradeProxy(proxy.target, VendingMachineV2);
        await upgradedV2.waitForDeployment();

        const VendingMachineV3 = await ethers.getContractFactory('VendingMachineV3');
        const upgradedV3 = await upgrades.upgradeProxy(proxy.target, VendingMachineV3);
        await upgradedV3.waitForDeployment();

        return {proxy, owner, upgradedV2, upgradedV3}
    }

    describe("V1", () => {
        it("should initialise with 100 sodas", async function () {
            const {proxy} = await loadFixture(deployFixture);
            assert.equal(await proxy.numSodas(), 100);
        })

        it("should initialise with correct owner", async function () {
            const {proxy, owner} = await loadFixture(deployFixture);
            assert.equal(await proxy.owner(), owner.address);
        })

        it("should decrease numSodas when sodas purchased with >=1000 wei", async function () {
            const {proxy} = await loadFixture(deployFixture);
            await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            assert.equal(await proxy.numSodas(), 99);
        })

        it("should revert if soda purchased with <1000 wei", async function () {
            const {proxy} = await loadFixture(deployFixture);
            await assert.isRejected(proxy.purchaseSoda({value: ethers.parseUnits("100", "wei")}));
            assert.equal(await proxy.numSodas(), 100);
        })
    })


});