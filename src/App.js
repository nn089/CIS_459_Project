import React, {useState} from 'react';
import Web3 from 'web3';
import TicketmasterArtifact from "./contractsData/Ticketmaster.json";
import TicketmasterAddress from "./contractsData/Ticketmaster-address.json";

const ABI = TicketmasterArtifact.abi;

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [eventId, setEventId] = useState("1");
  const [price, setPrice] = useState("0.01");
  const [supply, setSupply] = useState("5");
  const [ticketId, setTicketId] = useState("1");
  const [resalePrice, setResalePrice] = useState("0.02");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("Connect your wallet to begin.");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("Please install MetaMask.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3 = new Web3(window.ethereum);

      const ticketing = new web3.eth.Contract(
        ABI,
        TicketmasterAddress.address
      );

      setAccount(accounts[0]);
      setContract(ticketing);
      setStatus("Wallet connected.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function sendTransaction(method, value) {
    if (!contract || !account) {
      setStatus("Connect MetaMask first.");
      return;
    }

    try {
      setStatus("Waiting for transaction confirmation...");

      const options = { from: account };

      if (value !== undefined) {
        options.value = value;
      }

      await method.send(options);

      setStatus("Transaction successful!");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createEvent() {
    const web3 = new Web3(window.ethereum);

    await sendTransaction(
      contract.methods.createEvent(
        Number(eventId),
        web3.utils.toWei(price, "ether"),
        Number(supply)
      )
    );
  }

  async function buyPrimaryTicket() {
    try {
      const event = await contract.methods
        .events(Number(eventId))
        .call();

      await sendTransaction(
        contract.methods.buyPrimaryTicket(Number(eventId)),
        event.ticketPrice
      );
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function listTicket() {
    const web3 = new Web3(window.ethereum);

    await sendTransaction(
      contract.methods.listTicketForResale(
        Number(ticketId),
        web3.utils.toWei(resalePrice, "ether")
      )
    );
  }

  async function buyResaleTicket() {
    try {
      const ticket = await contract.methods
        .tickets(Number(ticketId))
        .call();

      await sendTransaction(
        contract.methods.buyResaleTicket(Number(ticketId)),
        ticket.resalePrice
      );
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function getTicketOwner() {
    try {
      const currentOwner = await contract.methods
        .getTicketOwner(Number(ticketId))
        .call();

      setOwner(currentOwner);
      setStatus("Ticket owner retrieved.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "20px" }}>
      <h1>Decentralized Ticketing</h1>

      <button onClick={connectWallet}>
        {account ? "Wallet Connected" : "Connect MetaMask"}
      </button>

      <p>{status}</p>

      <hr />

      <h2>Create Event</h2>

      <input
        placeholder="Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />

      <input
        placeholder="Ticket Price (ETH)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="Ticket Supply"
        value={supply}
        onChange={(e) => setSupply(e.target.value)}
      />

      <button onClick={createEvent}>Create Event</button>

      <button onClick={buyPrimaryTicket}>Buy Primary Ticket</button>

      <hr />

      <h2>Resell Ticket</h2>

      <input
        placeholder="Ticket ID"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
      />

      <input
        placeholder="Resale Price (ETH)"
        value={resalePrice}
        onChange={(e) => setResalePrice(e.target.value)}
      />

      <button onClick={listTicket}>List Ticket for Resale</button>

      <button onClick={buyResaleTicket}>Buy Resale Ticket</button>

      <hr />

      <h2>Ticket Ownership</h2>

      <button onClick={getTicketOwner}>Check Ticket Owner</button>

      {owner && <p>Current Owner: {owner}</p>}
    </div>
  );
}

export default App;

