const { ethers } = require("hardhat");

async function main() {
  const [venue, alice, bob] = await ethers.getSigners();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Ticketing = await ethers.getContractFactory(
    "Ticketmaster"
  );

  const ticketing = Ticketing.attach(contractAddress);

  // 1. Venue creates an event with 3 tickets at 0.1 ETH each
  await (
    await ticketing.connect(venue).createEvent(
      1,
      ethers.parseEther("0.1"),
      3
    )
  ).wait();

  console.log("1. Event created successfully");

  // 2. Alice buys a primary ticket
  await (
    await ticketing.connect(alice).buyPrimaryTicket(1, {
      value: ethers.parseEther("0.1")
    })
  ).wait();

  console.log("2. Alice bought ticket #1");

  // 3. Check ticket ownership
  let owner = await ticketing.getTicketOwner(1);
  console.log("3. Ticket #1 owner:", owner);
  console.log("   Alice's address:", alice.address);

  // 4. Alice lists ticket #1 for resale at 0.15 ETH
  await (
    await ticketing.connect(alice).listTicketForResale(
      1,
      ethers.parseEther("0.15")
    )
  ).wait();

  console.log("4. Alice listed ticket #1 for 0.15 ETH");

  // 5. Bob buys the resale ticket
  await (
    await ticketing.connect(bob).buyResaleTicket(1, {
      value: ethers.parseEther("0.15")
    })
  ).wait();

  console.log("5. Bob purchased the resale ticket");

  // 6. Verify that ownership changed to Bob
  owner = await ticketing.getTicketOwner(1);
  console.log("6. New ticket owner:", owner);
  console.log("   Bob's address:", bob.address);

  // 7. Verify the event has two tickets remaining
  const event = await ticketing.events(1);
  console.log("7. Tickets remaining:", event.availableTickets.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
