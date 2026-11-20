import React, { useState } from 'react';
import Web3 from 'web3';
import TicketmasterArtifact from "./contractsData/Ticketmaster.json";
import TicketmasterAddress from "./contractsData/Ticketmaster-address.json";
import './App.css';

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
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">T</span>
          <span>Ticketmaster</span>
        </div>

        <button className="wallet-button" onClick={connectWallet}>
          {account ? "✓ Wallet Connected" : "Connect MetaMask"}
        </button>
      </nav>

      {/* Main content */}
      <main className="container">

        <section className="hero">
          <p className="eyebrow">DECENTRALIZED TICKETING PLATFORM</p>
          <h1>Events made simple.</h1>
          <p>
            Create events, purchase tickets, and trade tickets
            securely using blockchain technology.
          </p>

          {account && (
            <div className="account-display">
              Connected: {account.substring(0, 8)}...
              {account.substring(account.length - 6)}
            </div>
          )}
        </section>

        {/* Status */}
        <div className="status-box">
          <span className="status-dot"></span>
          <span>{status}</span>
        </div>

        {/* Event management */}
        <section className="section-heading">
          <h2>Event & Ticket Management</h2>
          <p>Create an event or purchase an available ticket.</p>
        </section>

        <div className="card-grid">

          <div className="card">
            <div className="card-icon purple">＋</div>
            <h3>Create an Event</h3>
            <p className="card-description">
              Set up a new event and determine its ticket price and supply.
            </p>

            <label>Event ID</label>
            <input
              placeholder="Event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />

            <label>Ticket Price (ETH)</label>
            <input
              placeholder="Ticket Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <label>Total Tickets</label>
            <input
              placeholder="Ticket Supply"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
            />

            <button className="primary-button" onClick={createEvent}>
              Create Event
            </button>
          </div>

          <div className="card">
            <div className="card-icon blue">◇</div>
            <h3>Purchase a Ticket</h3>
            <p className="card-description">
              Purchase a primary ticket directly from the event venue.
            </p>

            <label>Event ID</label>
            <input
              placeholder="Event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />

            <div className="info-panel">
              <span>Selected Event</span>
              <strong>Event #{eventId}</strong>
            </div>

            <button className="primary-button" onClick={buyPrimaryTicket}>
              Buy Primary Ticket
            </button>
          </div>

        </div>

        {/* Resale */}
        <section className="section-heading">
          <h2>Ticket Marketplace</h2>
          <p>List your ticket for resale or purchase a listed ticket.</p>
        </section>

        <div className="card-grid">

          <div className="card">
            <div className="card-icon orange">↗</div>
            <h3>List a Ticket</h3>
            <p className="card-description">
              Put a ticket you own up for sale at your chosen price.
            </p>

            <label>Ticket ID</label>
            <input
              placeholder="Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />

            <label>Resale Price (ETH)</label>
            <input
              placeholder="Resale Price"
              value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
            />

            <button className="primary-button" onClick={listTicket}>
              List Ticket for Resale
            </button>
          </div>

          <div className="card">
            <div className="card-icon green">⇄</div>
            <h3>Buy a Resale Ticket</h3>
            <p className="card-description">
              Purchase a ticket that another user has listed for resale.
            </p>

            <label>Ticket ID</label>
            <input
              placeholder="Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />

            <div className="info-panel">
              <span>Selected Ticket</span>
              <strong>Ticket #{ticketId}</strong>
            </div>

            <button className="primary-button" onClick={buyResaleTicket}>
              Buy Resale Ticket
            </button>
          </div>

        </div>

        {/* Ownership */}
        <section className="section-heading">
          <h2>Ticket Information</h2>
          <p>Check who currently owns a particular ticket.</p>
        </section>

        <div className="card ownership-card">
          <div className="ownership-input">
            <div>
              <label>Ticket ID</label>
              <input
                placeholder="Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              />
            </div>

            <button className="primary-button" onClick={getTicketOwner}>
              Check Ticket Owner
            </button>
          </div>

          {owner && (
            <div className="owner-result">
              <span>Current Ticket Owner</span>
              <strong>{owner}</strong>
            </div>
          )}
        </div>

        <footer>
          <p>Ticketmaster · Decentralized Ticketing Prototype</p>
          <p>Powered by Ethereum and Smart Contracts</p>
        </footer>

      </main>
    </div>
  );
}

export default App;