pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/Ticketmaster.sol";

contract TicketmasterTest is Test {
    Ticketmaster ticketmaster;

    function setUp() public {
        ticketmaster = new Ticketmaster();
    }

    // Test 1: Verify that an event is created correctly
    function testCreateEvent() public {
        ticketmaster.createEvent(1, 1 ether, 5);

        (
            uint256 eventID,
            address venueAddress,
            uint256 ticketPrice,
            uint256 totalTickets,
            uint256 availableTickets,
            bool eventExists
        ) = ticketmaster.events(1);

        assert(eventID == 1);
        assert(venueAddress == address(this));
        assert(ticketPrice == 1 ether);
        assert(totalTickets == 5);
        assert(availableTickets == 5);
        assert(eventExists == true);
    }

    // Test 2: Verify that buying a ticket decreases available supply
    function testBuyPrimaryTicket() public {
        ticketmaster.createEvent(1, 1 ether, 5);

        address buyer = address(0xBEEF);

        // Give the buyer enough ETH to purchase a ticket
        vm.deal(buyer, 10 ether);

        // Execute the purchase as the buyer
        vm.prank(buyer);
        uint256 ticketID = ticketmaster.buyPrimaryTicket{value: 1 ether}(1);

        // Verify the ticket was created
        assert(ticketID == 1);

        // Verify the next ticket ID was incremented
        assert(ticketmaster.nextTicketID() == 2);

        // Verify available supply decreased
        (,,,, uint256 availableTickets,) = ticketmaster.events(1);
        assert(availableTickets == 4);

        // Verify ticket ownership
        assert(ticketmaster.getTicketOwner(ticketID) == buyer);
    }
}
