pragma solidity ^0.8.0;

contract Ticketmaster {
    struct Event {
        uint256 eventID;
        address payable venueAddress;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 availableTickets;
        bool eventExists;
    }

    struct Ticket {
        uint256 ticketID;
        uint256 eventID;
        address ownerAddress;
        bool ticketAvailableForSale;
        uint256 resalePrice;
    }

    address public immutable contractOwner;
    uint256 public nextTicketID = 1;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;

    event EventCreated(
        uint256 indexed eventID,
        address indexed venueAddress,
        uint256 ticketPrice,
        uint256 totalTickets
    );
    event PrimaryTicketSold(
        uint256 indexed ticketID,
        uint256 indexed eventID,
        address indexed buyer,
        uint256 price
    );
    event TicketListedForResale(
        uint256 indexed ticketID,
        address indexed seller,
        uint256 resalePrice
    );
    event ResaleTicketSold(
        uint256 indexed ticketID,
        address indexed seller,
        address indexed buyer,
        uint256 resalePrice
    );
    event ResaleListingCancelled(uint256 indexed ticketID, address indexed owner);

    constructor() {
        contractOwner = msg.sender;
    }

    
    function createEvent(
        uint256 eventID,
        uint256 ticketPrice,
        uint256 totalTickets
    ) external {
        require(msg.sender == contractOwner, "Only contract owner can create events");
        require(!events[eventID].eventExists, "Event already exists");
        require(ticketPrice > 0, "Ticket price must be greater than zero");
        require(totalTickets > 0, "Ticket supply must be greater than zero");

        events[eventID] = Event({
            eventID: eventID,
            venueAddress: payable(msg.sender),
            ticketPrice: ticketPrice,
            totalTickets: totalTickets,
            availableTickets: totalTickets,
            eventExists: true
        });

        emit EventCreated(eventID, msg.sender, ticketPrice, totalTickets);
    }

    // Buy one new ticket from the venue
    function buyPrimaryTicket(uint256 eventID) external payable returns (uint256) {
        Event storage eventInfo = events[eventID];

        require(eventInfo.eventExists, "Event does not exist");
        require(eventInfo.availableTickets > 0, "No tickets available");
        require(msg.value == eventInfo.ticketPrice, "Send the exact ticket price");

        uint256 ticketID = nextTicketID;
        nextTicketID++;

        tickets[ticketID] = Ticket({
            ticketID: ticketID,
            eventID: eventID,
            ownerAddress: msg.sender,
            ticketAvailableForSale: false,
            resalePrice: 0
        });

        eventInfo.availableTickets--;

        emit PrimaryTicketSold(ticketID, eventID, msg.sender, msg.value);
        return ticketID;
    }

    // List a ticket you own for resale
    function listTicketForResale(uint256 ticketID, uint256 resalePrice) external {
        Ticket storage ticket = tickets[ticketID];

        require(ticket.ticketID != 0, "Ticket does not exist");
        require(ticket.ownerAddress == msg.sender, "Only ticket owner can list");
        require(events[ticket.eventID].eventExists, "Event does not exist");
        require(resalePrice > 0, "Resale price must be greater than zero");
        require(!ticket.ticketAvailableForSale, "Ticket is already listed");

        ticket.resalePrice = resalePrice;
        ticket.ticketAvailableForSale = true;

        emit TicketListedForResale(ticketID, msg.sender, resalePrice);
    }

    // Buy a listed ticket from its current owner
    function buyResaleTicket(uint256 ticketID) external payable {
        Ticket storage ticket = tickets[ticketID];

        require(ticket.ticketID != 0, "Ticket does not exist");
        require(events[ticket.eventID].eventExists, "Event does not exist");
        require(ticket.ticketAvailableForSale, "Ticket is not listed for resale");
        require(msg.sender != ticket.ownerAddress, "Owner cannot buy their own ticket");
        require(msg.value == ticket.resalePrice, "Send the exact resale price");

        address payable seller = payable(ticket.ownerAddress);
        uint256 price = ticket.resalePrice;

        // transfer the ticket or reset infotmation if the transaction fails
        ticket.ownerAddress = msg.sender;
        ticket.ticketAvailableForSale = false;
        ticket.resalePrice = 0;

        (bool paid, ) = seller.call{value: price}("");
        require(paid, "Payment to seller failed");

        emit ResaleTicketSold(ticketID, seller, msg.sender, price);
    }

    //Return the current owner of a ticket
    function getTicketOwner(uint256 ticketID) external view returns (address) {
        require(tickets[ticketID].ticketID != 0, "Ticket does not exist");
        return tickets[ticketID].ownerAddress;
    }
}

