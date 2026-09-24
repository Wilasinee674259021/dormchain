import './style.css'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, contractABI } from './contract'

const app = document.querySelector('#app')

app.innerHTML = [
  '<div class="container">',

    '<header>',
      '<h1>DormChain</h1>',
      '<p>ระบบซื้อขายและโอนสิทธิ์สัญญาหอพักด้วย Blockchain</p>',
    '</header>',

    '<section class="hero">',
      '<h2>ระบบจัดการสิทธิ์สัญญาหอพัก</h2>',
      '<p>Smart Contract บน Sepolia Testnet</p>',

      '<button id="connectWallet">',
        'เชื่อมต่อ MetaMask',
      '</button>',

      '<p id="walletAddress">',
        'ยังไม่ได้เชื่อมต่อ Wallet',
      '</p>',
    '</section>',

    '<section class="contract-card">',
      '<h2>ข้อมูลสัญญาหอพัก</h2>',

      '<div class="info">',
        '<p><strong>หอพัก:</strong> <span id="dormName">-</span></p>',
        '<p><strong>ห้อง:</strong> <span id="roomNumber">-</span></p>',
        '<p><strong>ค่าเช่ารายเดือน:</strong> <span id="monthlyRent">-</span></p>',
        '<p><strong>ราคาโอน:</strong> <span id="transferPrice">-</span></p>',
        '<p><strong>เจ้าของปัจจุบัน:</strong> <span id="currentOwner">-</span></p>',
        '<p><strong>สถานะ:</strong> <span id="status">-</span></p>',
        '<p><strong>ผู้ขอโอน:</strong> <span id="pendingBuyer">-</span></p>',
      '</div>',

      '<div class="actions">',
        '<h3>จัดการการโอนสิทธิ์</h3>',

        '<input id="priceInput" type="number" placeholder="ราคาโอน เช่น 5000" />',

        '<button id="listButton">',
          'เปิดให้โอนสิทธิ์',
        '</button>',

        '<button id="requestButton">',
          'ขอรับสิทธิ์',
        '</button>',

        '<button id="approveButton">',
          'อนุมัติการโอน',
        '</button>',
      '</div>',

      '<p id="contractStatus"></p>',
    '</section>',

    '<section class="history-card">',

      '<h2>ประวัติการทำรายการบน Blockchain</h2>',

      '<p class="history-description">',
        'ตรวจสอบประวัติการเปลี่ยนแปลงเจ้าของสัญญาจาก Blockchain',
      '</p>',

      '<button id="historyButton">',
        'ดูประวัติการโอน',
      '</button>',

      '<div id="historyList">',
        'ยังไม่ได้โหลดประวัติ',
      '</div>',

    '</section>',

  '</div>'
].join('')


const connectButton =
  document.querySelector('#connectWallet')

const walletAddress =
  document.querySelector('#walletAddress')

const listButton =
  document.querySelector('#listButton')

const requestButton =
  document.querySelector('#requestButton')

const approveButton =
  document.querySelector('#approveButton')

const priceInput =
  document.querySelector('#priceInput')

const contractStatus =
  document.querySelector('#contractStatus')

const historyButton =
  document.querySelector('#historyButton')

const historyList =
  document.querySelector('#historyList')


async function getSignerContract() {

  const provider =
    new ethers.BrowserProvider(window.ethereum)

  const signer =
    await provider.getSigner()

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer
  )
}


async function loadContractData() {

  try {

    const provider =
      new ethers.BrowserProvider(window.ethereum)

    const network =
      await provider.getNetwork()

    if (network.chainId !== 11155111n) {

      contractStatus.textContent =
        'กรุณาเปลี่ยน MetaMask เป็น Sepolia Testnet'

      return
    }

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      )

    const data =
      await contract.getContract(1)

    document.querySelector('#dormName').textContent =
      data[1]

    document.querySelector('#roomNumber').textContent =
      data[2]

    document.querySelector('#monthlyRent').textContent =
      Number(data[3]).toLocaleString('th-TH') +
      ' บาท'

    document.querySelector('#transferPrice').textContent =
      Number(data[4]).toLocaleString('th-TH') +
      ' บาท'

    document.querySelector('#currentOwner').textContent =
      data[5]

    document.querySelector('#pendingBuyer').textContent =
      data[7]

    document.querySelector('#status').textContent =
      data[6]
        ? 'เปิดให้โอนสิทธิ์'
        : 'ไม่เปิดให้โอน'

    contractStatus.textContent =
      'เชื่อมต่อ Smart Contract สำเร็จ ✓'

  } catch (error) {

    console.error(error)

    contractStatus.textContent =
      'ไม่สามารถโหลดข้อมูล Smart Contract ได้'

  }
}


async function connectWallet() {

  if (!window.ethereum) {

    walletAddress.textContent =
      'ไม่พบ MetaMask'

    return
  }

  try {

    const provider =
      new ethers.BrowserProvider(window.ethereum)

    const accounts =
      await provider.send(
        'eth_requestAccounts',
        []
      )

    walletAddress.textContent =
      'Wallet: ' + accounts[0]

    connectButton.textContent =
      'เชื่อมต่อแล้ว ✓'

    await loadContractData()

  } catch (error) {

    console.error(error)

    walletAddress.textContent =
      'เกิดข้อผิดพลาด'

  }
}


async function listForTransfer() {

  try {

    const contract =
      await getSignerContract()

    const price =
      priceInput.value

    if (!price) {

      alert('กรุณาใส่ราคาโอน')

      return
    }

    contractStatus.textContent =
      'กำลังส่งธุรกรรม...'

    const tx =
      await contract.listForTransfer(
        1,
        price
      )

    await tx.wait()

    contractStatus.textContent =
      'เปิดให้โอนสำเร็จ ✓'

    await loadContractData()

  } catch (error) {

    console.error(error)

    contractStatus.textContent =
      'เปิดให้โอนไม่สำเร็จ'

  }
}


async function requestTransfer() {

  try {

    const contract =
      await getSignerContract()

    contractStatus.textContent =
      'กำลังส่งคำขอ...'

    const tx =
      await contract.requestTransfer(1)

    await tx.wait()

    contractStatus.textContent =
      'ส่งคำขอรับสิทธิ์สำเร็จ ✓'

    await loadContractData()

  } catch (error) {

    console.error(error)

    contractStatus.textContent =
      'ส่งคำขอไม่สำเร็จ'

  }
}


async function approveTransfer() {

  try {

    const contract =
      await getSignerContract()

    contractStatus.textContent =
      'กำลังอนุมัติการโอน...'

    const tx =
      await contract.approveTransfer(1)

    await tx.wait()

    contractStatus.textContent =
      'อนุมัติและโอนสิทธิ์สำเร็จ ✓'

    await loadContractData()

  } catch (error) {

    console.error(error)

    contractStatus.textContent =
      'อนุมัติการโอนไม่สำเร็จ'

  }
}


async function loadTransferHistory() {

  try {

    const provider =
      new ethers.BrowserProvider(window.ethereum)

    const network =
      await provider.getNetwork()

    if (network.chainId !== 11155111n) {

      historyList.innerHTML =
        '<p>กรุณาเปลี่ยน MetaMask เป็น Sepolia Testnet</p>'

      return
    }

    historyList.innerHTML =
      '<p class="history-loading">กำลังโหลดประวัติจาก Blockchain...</p>'

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      )

    const latestBlock =
      await provider.getBlockNumber()

    const fromBlock =
      Math.max(
        0,
        latestBlock - 10000
      )

    const events =
      await contract.queryFilter(
        contract.filters.ContractTransferred(),
        fromBlock,
        latestBlock
      )

    if (events.length === 0) {

      historyList.innerHTML =
        '<p class="history-empty">ยังไม่พบประวัติการโอน</p>'

      return
    }

    historyList.innerHTML = ''

    for (let i = 0; i < events.length; i++) {

      const event =
        events[i]

      const contractId =
        event.args[0].toString()

      const oldOwner =
        event.args[1]

      const newOwner =
        event.args[2]

      const item =
        document.createElement('div')

      item.className =
        'history-item'

      const shortOldOwner =
        oldOwner.slice(0, 10) +
        '...' +
        oldOwner.slice(-8)

      const shortNewOwner =
        newOwner.slice(0, 10) +
        '...' +
        newOwner.slice(-8)

      const shortTxHash =
        event.transactionHash.slice(0, 14) +
        '...' +
        event.transactionHash.slice(-10)

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

      `

      historyList.appendChild(item)
    }

  } catch (error) {

    console.error(
      'History Error:',
      error
    )

    historyList.innerHTML =
      '<p class="history-empty">ไม่สามารถโหลดประวัติ Blockchain ได้</p>'

  }
}


connectButton.addEventListener(
  'click',
  connectWallet
)

listButton.addEventListener(
  'click',
  listForTransfer
)

requestButton.addEventListener(
  'click',
  requestTransfer
)

approveButton.addEventListener(
  'click',
  approveTransfer
)

historyButton.addEventListener(
  'click',
  loadTransferHistory
)