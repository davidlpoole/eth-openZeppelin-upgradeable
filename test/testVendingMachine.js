const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require("chai");
const {ethers, upgrades} = require("hardhat");

describe("Vending Machine", function () {
    async function deployFixture() {

        const [owner, otherUser] = await ethers.getSigners();

        const VendingMachineV1 = await ethers.getContractFactory('VendingMachineV1');
        const proxy = await upgrades.deployProxy(VendingMachineV1, [5]);
        await proxy.waitForDeployment();

        return {owner, otherUser, proxy}
    }

    async function deployV2() {
        const {owner, otherUser, proxy} = await loadFixture(deployFixture);

        const VendingMachineV2 = await ethers.getContractFactory('VendingMachineV2');
        const upgradedV2 = await upgrades.upgradeProxy(proxy.target, VendingMachineV2);
        await upgradedV2.waitForDeployment();

        return {owner, otherUser, proxy, upgradedV2}
    }

    async function deployV2WithPurchases() {
        const {owner, otherUser, proxy, upgradedV2} = await loadFixture(deployV2);

        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});

        return {owner, otherUser, proxy, upgradedV2}
    }

    async function deployV3WithPurchases() {
        const {owner, otherUser, proxy, upgradedV3} = await loadFixture(deployV3);

        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
        await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});

        return {owner, otherUser, proxy, upgradedV3}
    }

    async function deployV3() {
        const {owner, otherUser, proxy} = await loadFixture(deployFixture);

        const VendingMachineV3 = await ethers.getContractFactory('VendingMachineV3');
        const upgradedV3 = await upgrades.upgradeProxy(proxy.target, VendingMachineV3);
        await upgradedV3.waitForDeployment();

        return {owner, otherUser, proxy, upgradedV3}
    }

    describe("V1", () => {
        it("should initialise with 5 sodas", async function () {
            const {proxy} = await loadFixture(deployFixture);
            assert.equal(await proxy.numSodas(), 5);
        })

        it("should initialise with correct owner", async function () {
            const {proxy, owner} = await loadFixture(deployFixture);
            assert.equal(await proxy.owner(), owner.address);
        })

        it("should decrease numSodas when sodas purchased with >=1000 wei", async function () {
            const {proxy} = await loadFixture(deployFixture);
            await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            assert.equal(await proxy.numSodas(), 4);
        })

        it("should revert if soda purchased with <1000 wei", async function () {
            const {proxy} = await loadFixture(deployFixture);
            await assert.isRejected(proxy.purchaseSoda({value: ethers.parseUnits("100", "wei")}));
            assert.equal(await proxy.numSodas(), 5);
        })
    })


    describe("V2", () => {
        it("should initialise with 100 sodas", async function () {
            const {proxy, upgradedV2} = await loadFixture(deployV2);
            assert.equal(await upgradedV2.numSodas(), 5);
        })

        it("should initialise with correct owner", async function () {
            const {proxy, owner, upgradedV2} = await loadFixture(deployV2);
            assert.equal(await upgradedV2.owner(), owner.address);
        })

        it("should decrease numSodas when sodas purchased with >=1000 wei", async function () {
            const {proxy, upgradedV2} = await loadFixture(deployV2);
            await upgradedV2.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            assert.equal(await proxy.numSodas(), 4);
        })

        it("should revert if soda purchased with <1000 wei", async function () {
            const {proxy, upgradedV2} = await loadFixture(deployV2);
            await expect(upgradedV2.purchaseSoda({value: ethers.parseUnits("100", "wei")})).to.be.revertedWith("You must pay 1000 wei for a soda!")
            assert.equal(await proxy.numSodas(), 5);
        })

        it("profits must be greater than zero ti withdrawProfits", async function () {
            const {proxy, owner, upgradedV2} = await loadFixture(deployV2);
            await expect(upgradedV2.withdrawProfits()).to.be.revertedWith("Profits must be greater than 0 in order to withdraw!");
        })

        it("owner can withdraw profits", async function () {
            const {proxy, owner, upgradedV2} = await loadFixture(deployV2WithPurchases);
            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);

            await expect(() =>
                upgradedV2.withdrawProfits()
            ).to.changeEtherBalance(owner, "3000");

            expect(await ethers.provider.getBalance(proxy)).to.equal(0);
        })

        it("other user cant withdraw profits", async function () {
            const {proxy, owner, otherUser, upgradedV2} = await loadFixture(deployV2WithPurchases);
            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);

            await expect(upgradedV2.connect(otherUser).withdrawProfits()).to.be.revertedWith("Only owner can call this function.");

            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);
        })

        it("owner can setNewOwner", async function () {
            const {owner, otherUser, proxy, upgradedV2} = await loadFixture(deployV2);
            await upgradedV2.setNewOwner(otherUser.address);
            assert.equal(await proxy.owner(), otherUser.address);
        })

        it("reverts if another user tries to change the owner", async function () {
            const {proxy, owner, otherUser, upgradedV2} = await loadFixture(deployV2);
            await expect(upgradedV2.connect(otherUser).setNewOwner(otherUser.address)).to.be.revertedWith("Only owner can call this function.");
            assert.equal(await proxy.owner(), owner.address);
        })
    })


    describe("V3", () => {
        it("should initialise with 100 sodas", async function () {
            const {proxy, upgradedV3} = await loadFixture(deployV3);
            assert.equal(await upgradedV3.numSodas(), 5);
        })

        it("should initialise with correct owner", async function () {
            const {proxy, owner, upgradedV3} = await loadFixture(deployV3);
            assert.equal(await upgradedV3.owner(), owner.address);
        })

        it("should decrease numSodas when sodas purchased with >=1000 wei", async function () {
            const {proxy, upgradedV3} = await loadFixture(deployV3);
            await upgradedV3.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            assert.equal(await proxy.numSodas(), 4);
        })

        it("should revert if soda purchased with <1000 wei", async function () {
            const {proxy, upgradedV3} = await loadFixture(deployV3);
            await expect(upgradedV3.purchaseSoda({value: ethers.parseUnits("100", "wei")})).to.be.revertedWith("You must pay 1000 wei for a soda!")
            assert.equal(await proxy.numSodas(), 5);
        })

        it("profits must be greater than zero ti withdrawProfits", async function () {
            const {proxy, owner, upgradedV3} = await loadFixture(deployV3);
            await expect(upgradedV3.withdrawProfits()).to.be.revertedWith("Profits must be greater than 0 in order to withdraw!");
        })

        it("owner can withdraw profits", async function () {
            const {proxy, owner, upgradedV3} = await loadFixture(deployV3WithPurchases);
            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);

            await expect(() =>
                upgradedV3.withdrawProfits()
            ).to.changeEtherBalance(owner, "3000");

            expect(await ethers.provider.getBalance(proxy)).to.equal(0);
        })

        it("other user cant withdraw profits", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3WithPurchases);
            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);

            await expect(upgradedV3.connect(otherUser).withdrawProfits()).to.be.revertedWith("Only owner can call this function.");

            expect(await ethers.provider.getBalance(proxy)).to.equal(3000);
        })

        it("owner can setNewOwner", async function () {
            const {owner, otherUser, proxy, upgradedV3} = await loadFixture(deployV3);
            await upgradedV3.setNewOwner(otherUser.address);
            assert.equal(await proxy.owner(), otherUser.address);
        })

        it("reverts if another user tries to change the owner", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3);
            await expect(upgradedV3.connect(otherUser).setNewOwner(otherUser.address)).to.be.revertedWith("Only owner can call this function.");
            assert.equal(await proxy.owner(), owner.address);
        })

        it("reverts if another user tries to change the owner", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3);
            await expect(upgradedV3.connect(otherUser).setNewOwner(otherUser.address)).to.be.revertedWith("Only owner can call this function.");
            assert.equal(await proxy.owner(), owner.address);
        })

        it("revert if no stock left", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3WithPurchases);

            assert.equal(await upgradedV3.numSodas(), 2);
            await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            await proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            assert.equal(await upgradedV3.numSodas(), 0);
            await expect(proxy.purchaseSoda({value: ethers.parseUnits("1000", "wei")})).to.be.revertedWith("There's no stock left!")
            assert.equal(await upgradedV3.numSodas(), 0);
        })

        it.only("purchases mapping should contain count of user's purchases", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3WithPurchases);
            expect(await upgradedV3.purchases.staticCall(owner.address)).to.equal(3);
            expect(await upgradedV3.purchases.staticCall(otherUser.address)).to.equal(0);
            await upgradedV3.connect(otherUser).purchaseSoda({value: ethers.parseUnits("1000", "wei")});
            expect(await upgradedV3.purchases.staticCall(otherUser.address)).to.equal(1);
        })

        it("re-stocks numSodas", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3WithPurchases);
            assert.equal(await upgradedV3.numSodas(), 2);
            await upgradedV3.resupplySodas(8);
            assert.equal(await upgradedV3.numSodas(), 10);
        })

        it("only owner can resupply", async function () {
            const {proxy, owner, otherUser, upgradedV3} = await loadFixture(deployV3WithPurchases);
            assert.equal(await upgradedV3.numSodas(), 2);
            await expect(upgradedV3.connect(otherUser).resupplySodas(8)).to.be.revertedWith("Only owner can call this function.");
            assert.equal(await upgradedV3.numSodas(), 2);
        })
    })
});