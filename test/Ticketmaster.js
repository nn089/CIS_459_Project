const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ticketmaster", function () {

    // Test 1: Verify that the contract deploys successfully
    it("Test 1: Contract deploys successfully", async function () {
        const ticketmaster = await ethers.deployContract("Ticketmaster");

        await ticketmaster.waitForDeployment();

        const address = await ticketmaster.getAddress();
        const code = await ethers.provider.getCode(address);

        expect(code).to.not.equal("0x");
    });

    // Test 2: Verify that purchasing from a nonexistent event fails
    it("Test 2: Cannot purchase a ticket for an event that does not exist", async function () {
        const [, buyer] = await ethers.getSigners();

        const ticketmaster = await ethers.deployContract("Ticketmaster");

        await ticketmaster.waitForDeployment();

        await expect(
            ticketmaster.connect(buyer).buyPrimaryTicket(999, {
                value: ethers.parseEther("1")
            })
        ).to.be.revertedWith("Event does not exist");
    });

});
