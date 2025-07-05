const CONTRACT_ADDRESS = "0x2d67613c758b68e281785999bf2233883d1c25b0";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

let provider;
let signer;
let contract;
let account;

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("sendButton").addEventListener("click", sendTokens);

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  account = (await window.ethereum.request({ method: "eth_accounts" }))[0];

  document.getElementById("account").innerText = `Connected: ${account}`;
  contract = new ethers.Contract(CONTRACT_ADDRESS, ERC20_ABI, signer);

  document.getElementById("transferSection").style.display = "block";

  getBalance();
}

async function getBalance() {
  try {
    const balance = await contract.balanceOf(account);
    const formatted = ethers.formatUnits(balance, 18);
    document.getElementById("balance").innerText = `Balance: ${formatted} Tokens`;
  } catch (err) {
    console.error(err);
    alert("Error fetching balance. Check contract address and network!");
  }
}


async function sendTokens() {
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  if (!ethers.isAddress(recipient)) {
    alert("Invalid address!");
    return;
  }

  try {
    // Convert to wei
    const value = ethers.parseUnits(amount, 18);

    console.log(`Sending ${value} to ${recipient}`);

    // Let ethers estimate gas!
    const tx = await contract.transfer(recipient, value);
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    alert("Transfer successful!");
    getBalance();
  } catch (err) {
    console.error(err);

    if (err.code === 'INSUFFICIENT_FUNDS') {
      alert("Not enough tokens to send that amount.");
    } else if (err.message && err.message.includes("execution reverted")) {
      alert("Transaction reverted. Check token balance and contract address!");
    } else {
      alert("Error while transferring: " + err.message);
    }
  }
}
