import "./style.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, contractABI } from "./contract";

const app = document.querySelector("#app");

app.innerHTML = [
  '<div class="container">',

  "<header>",
  "<h1>DormChain</h1>",
  "<p>ระบบซื้อขายและโอนสิทธิ์สัญญาหอพักด้วย Blockchain</p>",
  "</header>",

  '<section class="hero">',
  "<h2>ระบบจัดการสิทธิ์สัญญาหอพัก</h2>",
  "<p>Smart Contract บน Sepolia Testnet</p>",

  '<button id="connectWallet">',
  "เชื่อมต่อ MetaMask",
  "</button>",

  '<p id="walletAddress">',
  "ยังไม่ได้เชื่อมต่อ Wallet",
  "</p>",
  "</section>",

  '<section class="contract-card">',

  "<h2>สร้างสัญญาหอพัก</h2>",

  '<div class="actions">',

  "<input",
  ' id="dormNameInput"',
  ' type="text"',
  ' placeholder="ชื่อหอพัก เช่น ABC Residence"',
  " />",

  "<input",
  ' id="roomNumberInput"',
  ' type="text"',
  ' placeholder="เลขห้อง เช่น 302"',
  " />",

  "<input",
  ' id="monthlyRentInput"',
  ' type="number"',
  ' placeholder="ค่าเช่ารายเดือน เช่น 3500"',
  " />",

  '<button id="createContractButton">',
  "สร้างสัญญาหอพัก",
  "</button>",

  '<p id="createStatus"></p>',

  "</div>",

  "</section>",

  '<section class="contract-card">',

  "<h2>ข้อมูลสัญญาหอพัก</h2>",

  '<div class="info">',

  "<p>",
  "<strong>Contract ID:</strong>",
  ' <span id="contractId">-</span>',
  "</p>",

  "<p>",
  "<strong>หอพัก:</strong>",
  ' <span id="dormName">-</span>',
  "</p>",

  "<p>",
  "<strong>ห้อง:</strong>",
  ' <span id="roomNumber">-</span>',
  "</p>",

  "<p>",
  "<strong>ค่าเช่ารายเดือน:</strong>",
  ' <span id="monthlyRent">-</span>',
  "</p>",

  "<p>",
  "<strong>ราคาโอน:</strong>",
  ' <span id="transferPrice">-</span>',
  "</p>",

  "<p>",
  "<strong>เจ้าของปัจจุบัน:</strong>",
  ' <span id="currentOwner">-</span>',
  "</p>",

  "<p>",
  "<strong>สถานะ:</strong>",
  ' <span id="status">-</span>',
  "</p>",

  "<p>",
  "<strong>ผู้ขอโอน:</strong>",
  ' <span id="pendingBuyer">-</span>',
  "</p>",

  "</div>",

  '<div class="actions">',

  "<h3>จัดการการโอนสิทธิ์</h3>",

  "<input",
  ' id="priceInput"',
  ' type="number"',
  ' placeholder="ราคาโอน เช่น 5000"',
  " />",

  '<button id="listButton">',
  "เปิดให้โอนสิทธิ์",
  "</button>",

  '<button id="requestButton">',
  "ขอรับสิทธิ์",
  "</button>",

  '<button id="approveButton">',
  "อนุมัติการโอน",
  "</button>",

  "</div>",

  '<p id="contractStatus"></p>',

  "</section>",

  '<section class="history-card">',

  "<h2>ประวัติการทำรายการบน Blockchain</h2>",

  '<p class="history-description">',
  "ตรวจสอบประวัติการเปลี่ยนแปลงเจ้าของสัญญาจาก Blockchain",
  "</p>",

  '<button id="historyButton">',
  "ดูประวัติการโอน",
  "</button>",

  '<div id="historyList">',
  "ยังไม่ได้โหลดประวัติ",
  "</div>",

  "</section>",

  "</div>",
].join("");

const connectButton = document.querySelector("#connectWallet");

const walletAddress = document.querySelector("#walletAddress");

const createContractButton = document.querySelector("#createContractButton");

const dormNameInput = document.querySelector("#dormNameInput");

const roomNumberInput = document.querySelector("#roomNumberInput");

const monthlyRentInput = document.querySelector("#monthlyRentInput");

const createStatus = document.querySelector("#createStatus");

const listButton = document.querySelector("#listButton");

const requestButton = document.querySelector("#requestButton");

const approveButton = document.querySelector("#approveButton");

const priceInput = document.querySelector("#priceInput");

const contractStatus = document.querySelector("#contractStatus");

const historyButton = document.querySelector("#historyButton");

const historyList = document.querySelector("#historyList");

// เก็บ Contract ID ที่หน้าเว็บกำลังใช้งาน
let currentContractId = null;

async function getProvider() {
  return new ethers.BrowserProvider(window.ethereum);
}

async function getSignerContract() {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

async function getReadContract() {
  const provider = await getProvider();

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
}

// หา Contract ล่าสุด
async function getLatestContractId() {
  try {
    const contract = await getReadContract();

    const count = await contract.contractCount();

    if (count === 0n) {
      return null;
    }

    return Number(count);
  } catch (error) {
    console.error("Get Latest Contract Error:", error);

    return null;
  }
}

// โหลดข้อมูล Contract
async function loadContractData(contractId = null) {
  try {
    const provider = await getProvider();

    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
      contractStatus.textContent = "กรุณาเปลี่ยน MetaMask เป็น Sepolia Testnet";

      return;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      provider,
    );

    // ถ้าไม่ได้ระบุ ID ให้หา Contract ล่าสุด
    let id = contractId;

    if (!id) {
      id = await getLatestContractId();
    }

    if (!id) {
      contractStatus.textContent = "ยังไม่มีข้อมูลสัญญาหอพัก";

      return;
    }

    currentContractId = Number(id);

    const data = await contract.getContract(currentContractId);

    document.querySelector("#contractId").textContent = "#" + currentContractId;

    document.querySelector("#dormName").textContent = data[1];

    document.querySelector("#roomNumber").textContent = data[2];

    document.querySelector("#monthlyRent").textContent =
      Number(data[3]).toLocaleString("th-TH") + " บาท";

    document.querySelector("#transferPrice").textContent =
      Number(data[4]).toLocaleString("th-TH") + " บาท";

    document.querySelector("#currentOwner").textContent = data[5];

    document.querySelector("#pendingBuyer").textContent = data[7];

    document.querySelector("#status").textContent = data[6]
      ? "เปิดให้โอนสิทธิ์"
      : "ไม่เปิดให้โอน";

    contractStatus.textContent = "เชื่อมต่อ Smart Contract สำเร็จ ✓";
  } catch (error) {
    console.error("Load Contract Error:", error);

    contractStatus.textContent = "ไม่สามารถโหลดข้อมูล Smart Contract ได้";
  }
}

// เชื่อมต่อ Wallet
async function connectWallet() {
  if (!window.ethereum) {
    walletAddress.textContent = "ไม่พบ MetaMask";

    return;
  }

  try {
    const provider = await getProvider();

    const accounts = await provider.send("eth_requestAccounts", []);

    walletAddress.textContent = "Wallet: " + accounts[0];

    connectButton.textContent = "เชื่อมต่อแล้ว ✓";

    await loadContractData();
  } catch (error) {
    console.error("Connect Wallet Error:", error);

    walletAddress.textContent = "เกิดข้อผิดพลาด";
  }
}

// สร้าง Contract ใหม่
async function createContract() {
  try {
    const dormName = dormNameInput.value.trim();

    const roomNumber = roomNumberInput.value.trim();

    const monthlyRent = monthlyRentInput.value.trim();

    if (!dormName) {
      createStatus.textContent = "กรุณากรอกชื่อหอพัก";

      return;
    }

    if (!roomNumber) {
      createStatus.textContent = "กรุณากรอกเลขห้อง";

      return;
    }

    if (!monthlyRent) {
      createStatus.textContent = "กรุณากรอกค่าเช่ารายเดือน";

      return;
    }

    if (Number(monthlyRent) <= 0) {
      createStatus.textContent = "กรุณากรอกค่าเช่าที่มากกว่า 0";

      return;
    }

    const contract = await getSignerContract();

    createStatus.textContent = "กำลังสร้างสัญญา กรุณายืนยันใน MetaMask...";

    const tx = await contract.createContract(dormName, roomNumber, monthlyRent);

    createStatus.textContent = "กำลังรอ Blockchain ยืนยันธุรกรรม...";

    await tx.wait();

    // หา Contract ล่าสุดหลังสร้างสำเร็จ
    const latestId = await getLatestContractId();

    createStatus.textContent = "สร้างสัญญาหอพักสำเร็จ ✓";

    dormNameInput.value = "";

    roomNumberInput.value = "";

    monthlyRentInput.value = "";

    // โหลดข้อมูล Contract ใหม่
    if (latestId) {
      await loadContractData(latestId);
    }
  } catch (error) {
    console.error("Create Contract Error:", error);

    createStatus.textContent = "สร้างสัญญาไม่สำเร็จ";
  }
}

// เปิดให้โอน
async function listForTransfer() {
  try {
    if (!currentContractId) {
      alert("ยังไม่มี Contract ที่เลือก");

      return;
    }

    const price = priceInput.value;

    if (!price) {
      alert("กรุณาใส่ราคาโอน");

      return;
    }

    if (Number(price) <= 0) {
      alert("กรุณาใส่ราคาโอนที่มากกว่า 0");

      return;
    }

    const contract = await getSignerContract();

    contractStatus.textContent = "กำลังส่งธุรกรรม...";

    const tx = await contract.listForTransfer(currentContractId, price);

    await tx.wait();

    contractStatus.textContent = "เปิดให้โอนสำเร็จ ✓";

    await loadContractData(currentContractId);
  } catch (error) {
    console.error("List Transfer Error:", error);

    contractStatus.textContent = "เปิดให้โอนไม่สำเร็จ";
  }
}

// ขอรับสิทธิ์
async function requestTransfer() {
  try {
    if (!currentContractId) {
      alert("ยังไม่มี Contract ที่เลือก");

      return;
    }

    const contract = await getSignerContract();

    contractStatus.textContent = "กำลังส่งคำขอ...";

    const tx = await contract.requestTransfer(currentContractId);

    await tx.wait();

    contractStatus.textContent = "ส่งคำขอรับสิทธิ์สำเร็จ ✓";

    await loadContractData(currentContractId);
  } catch (error) {
    console.error("Request Transfer Error:", error);

    contractStatus.textContent = "ส่งคำขอไม่สำเร็จ";
  }
}

// อนุมัติการโอน
async function approveTransfer() {
  try {
    if (!currentContractId) {
      alert("ยังไม่มี Contract ที่เลือก");

      return;
    }

    const contract = await getSignerContract();

    contractStatus.textContent = "กำลังอนุมัติการโอน...";

    const tx = await contract.approveTransfer(currentContractId);

    await tx.wait();

    contractStatus.textContent = "อนุมัติและโอนสิทธิ์สำเร็จ ✓";

    await loadContractData(currentContractId);
  } catch (error) {
    console.error("Approve Transfer Error:", error);

    contractStatus.textContent = "อนุมัติการโอนไม่สำเร็จ";
  }
}

// โหลดประวัติการโอน
async function loadTransferHistory() {
  try {
    const provider = await getProvider();

    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
      historyList.innerHTML =
        "<p>กรุณาเปลี่ยน MetaMask เป็น Sepolia Testnet</p>";

      return;
    }

    historyList.innerHTML =
      '<p class="history-loading">กำลังโหลดประวัติจาก Blockchain...</p>';

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      provider,
    );

    const latestBlock = await provider.getBlockNumber();

    const fromBlock = Math.max(0, latestBlock - 10000);

    const events = await contract.queryFilter(
      contract.filters.ContractTransferred(),
      fromBlock,
      latestBlock,
    );

    if (events.length === 0) {
      historyList.innerHTML =
        '<p class="history-empty">ยังไม่พบประวัติการโอน</p>';

      return;
    }

    historyList.innerHTML = "";

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      const contractId = event.args[0].toString();

      const oldOwner = event.args[1];

      const newOwner = event.args[2];

      const item = document.createElement("div");

      item.className = "history-item";

      const shortOldOwner = oldOwner.slice(0, 10) + "..." + oldOwner.slice(-8);

      const shortNewOwner = newOwner.slice(0, 10) + "..." + newOwner.slice(-8);

      const shortTxHash =
        event.transactionHash.slice(0, 14) +
        "..." +
        event.transactionHash.slice(-10);

      item.innerHTML = `

        <div class="history-header">

          <div class="history-number">
            รายการที่ ${i + 1}
          </div>

          <div class="history-id">
            Contract #${contractId}
          </div>

        </div>

        <div class="history-row">

          <span class="history-label">
            เจ้าของเดิม
          </span>

          <span class="history-value">
            ${shortOldOwner}
          </span>

        </div>

        <div class="history-row">

          <span class="history-label">
            เจ้าของใหม่
          </span>

          <span class="history-value">
            ${shortNewOwner}
          </span>

        </div>

        <div class="history-row">

          <span class="history-label">
            Block
          </span>

          <span class="history-value">
            ${event.blockNumber}
          </span>

        </div>

        <div class="history-row">

          <span class="history-label">
            Transaction
          </span>

          <a
            class="history-tx"
            href="https://sepolia.etherscan.io/tx/${event.transactionHash}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${shortTxHash}
          </a>

        </div>

      `;

      historyList.appendChild(item);
    }
  } catch (error) {
    console.error("History Error:", error);

    historyList.innerHTML =
      '<p class="history-empty">ไม่สามารถโหลดประวัติ Blockchain ได้</p>';
  }
}

// ปุ่มเชื่อมต่อ Wallet
connectButton.addEventListener("click", connectWallet);

// ปุ่มสร้าง Contract
createContractButton.addEventListener("click", createContract);

// ปุ่มเปิดให้โอน
listButton.addEventListener("click", listForTransfer);

// ปุ่มขอรับสิทธิ์
requestButton.addEventListener("click", requestTransfer);

// ปุ่มอนุมัติ
approveButton.addEventListener("click", approveTransfer);

// ปุ่มประวัติ
historyButton.addEventListener("click", loadTransferHistory);

// ถ้าเปลี่ยน Account ใน MetaMask
if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length > 0) {
      walletAddress.textContent = "Wallet: " + accounts[0];

      await loadContractData();
    }
  });

  // ถ้าเปลี่ยน Network
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
