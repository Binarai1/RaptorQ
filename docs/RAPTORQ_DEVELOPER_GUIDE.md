# RaptorQ Developer Integration Guide
## Complete Developer Documentation v1.0

<div align="center">

![RaptorQ Developer](https://via.placeholder.com/500x200?text=RAPTORQ+DEVELOPER+API&bg=1a1b23&color=4f46e5)

**Build Quantum-Resistant Applications**  
*Step-by-Step Integration Guide for Websites & Applications*

---

**By Binarai Developer Relations Team**  
**Updated January 2025**

</div>

---

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Installation & Setup](#installation--setup)
3. [Authentication](#authentication)
4. [Core APIs](#core-apis)
5. [Web Integration](#web-integration)
6. [Mobile Integration](#mobile-integration)
7. [Desktop Integration](#desktop-integration)
8. [Advanced Features](#advanced-features)
9. [Security Best Practices](#security-best-practices)
10. [Example Projects](#example-projects)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)

---

## Quick Start Guide

### 🚀 Get Started in 5 Minutes

**Step 1: Install RaptorQ SDK**
```bash
# Web/Node.js
npm install @raptorq/wallet-sdk

# Python
pip install raptorq-wallet-sdk

# Mobile (React Native)
npm install @raptorq/react-native-sdk
```

**Step 2: Initialize Connection**
```javascript
import { RaptorQWallet } from '@raptorq/wallet-sdk';

const wallet = new RaptorQWallet({
  network: 'mainnet', // or 'testnet'
  quantumSecurity: true,
  apiKey: 'your-api-key' // Get from https://dev.raptorq.com
});
```

**Step 3: Connect to User's Wallet**
```javascript
// Connect to user's RaptorQ wallet
const connection = await wallet.connect();
console.log('Connected to:', connection.address);
```

**Step 4: Send a Transaction**
```javascript
const transaction = await wallet.sendTransaction({
  to: 'RTM1abc...xyz',
  amount: 1.5,
  message: 'Payment from my app'
});
console.log('Transaction sent:', transaction.hash);
```

**🎉 That's it! You're now integrated with quantum-resistant RaptorQ.**

---

## Installation & Setup

### Prerequisites

- **Node.js 16+** (for web/server integration)
- **Python 3.8+** (for Python integration)
- **RaptorQ Wallet** installed by users
- **API Key** from [https://dev.raptorq.com](https://dev.raptorq.com)

### Platform-Specific Installation

#### 🌐 Web Applications (React, Vue, Angular)

```bash
# Install the web SDK
npm install @raptorq/wallet-sdk

# For React projects, also install React hooks
npm install @raptorq/react-hooks
```

**React Integration:**
```tsx
import React from 'react';
import { useRaptorQ } from '@raptorq/react-hooks';

function MyApp() {
  const { connect, connected, address, sendTransaction } = useRaptorQ();
  
  return (
    <div>
      {!connected ? (
        <button onClick={connect}>Connect RaptorQ Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => sendTransaction({
            to: 'RTM1recipient...',
            amount: 1.0
          })}>
            Send RTM
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 🖥️ Server-Side (Node.js, Express)

```bash
npm install @raptorq/server-sdk express
```

```javascript
const express = require('express');
const { RaptorQServer } = require('@raptorq/server-sdk');

const app = express();
const raptorq = new RaptorQServer({
  apiKey: process.env.RAPTORQ_API_KEY,
  network: 'mainnet'
});

// Accept payments endpoint
app.post('/accept-payment', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    const paymentRequest = await raptorq.createPaymentRequest({
      amount,
      orderId,
      callbackUrl: `${req.protocol}://${req.get('host')}/payment-callback`
    });
    
    res.json({ paymentUrl: paymentRequest.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

#### 🐍 Python Applications (Django, Flask)

```bash
pip install raptorq-wallet-sdk
```

**Flask Integration:**
```python
from flask import Flask, request, jsonify
from raptorq import RaptorQWallet

app = Flask(__name__)
wallet = RaptorQWallet(
    api_key='your-api-key',
    network='mainnet'
)

@app.route('/create-payment', methods=['POST'])
def create_payment():
    try:
        data = request.json
        payment = wallet.create_payment_request(
            amount=data['amount'],
            order_id=data['order_id'],
            callback_url='https://yoursite.com/payment-callback'
        )
        return jsonify({'payment_url': payment.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()
```

#### 📱 Mobile (React Native)

```bash
npm install @raptorq/react-native-sdk
```

```tsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useRaptorQMobile } from '@raptorq/react-native-sdk';

export default function App() {
  const { connect, connected, address, scanQR } = useRaptorQMobile();
  
  return (
    <View>
      {!connected ? (
        <Button title="Connect RaptorQ" onPress={connect} />
      ) : (
        <View>
          <Text>Connected: {address}</Text>
          <Button title="Scan QR to Pay" onPress={scanQR} />
        </View>
      )}
    </View>
  );
}
```

---

## Authentication

### API Key Management

**Get Your API Key:**
1. Visit [https://dev.raptorq.com](https://dev.raptorq.com)
2. Create developer account
3. Generate new API key
4. Configure permissions

**Environment Variables:**
```bash
# .env file
RAPTORQ_API_KEY=your-api-key-here
RAPTORQ_NETWORK=mainnet # or testnet
RAPTORQ_WEBHOOK_SECRET=your-webhook-secret
```

### SDK Configuration

```javascript
const config = {
  apiKey: process.env.RAPTORQ_API_KEY,
  network: process.env.RAPTORQ_NETWORK,
  
  // Optional: Advanced security settings
  quantumSecurity: true,
  autoUpgrade: true,
  
  // Optional: Webhook configuration
  webhookSecret: process.env.RAPTORQ_WEBHOOK_SECRET,
  
  // Optional: UI customization
  theme: {
    primaryColor: '#4f46e5',
    fontFamily: 'Inter'
  }
};

const wallet = new RaptorQWallet(config);
```

---

## Core APIs

### 🔗 Connection Management

#### Connect to Wallet
```javascript
// Connect to user's wallet
const connection = await wallet.connect();

// Check connection status
const isConnected = wallet.isConnected();

// Get connected address
const address = wallet.getAddress();

// Disconnect
await wallet.disconnect();
```

#### Connection Events
```javascript
wallet.on('connected', (address) => {
  console.log('Wallet connected:', address);
});

wallet.on('disconnected', () => {
  console.log('Wallet disconnected');
});

wallet.on('accountChanged', (newAddress) => {
  console.log('Account changed to:', newAddress);
});
```

### 💰 Transaction APIs

#### Send Transaction
```javascript
const transaction = await wallet.sendTransaction({
  to: 'RTM1recipient...', // RTM address
  amount: 1.5, // RTM amount
  message: 'Payment for order #123', // Optional
  gasPrice: 'auto', // or specific value
  instantSend: true // Use InstaSend for speed
});

console.log('Transaction hash:', transaction.hash);
console.log('Status:', transaction.status);
```

#### Request Payment
```javascript
const paymentRequest = await wallet.requestPayment({
  amount: 2.5,
  message: 'Payment for services',
  orderId: 'ORDER-123',
  expiresIn: 3600 // 1 hour
});

console.log('Payment URL:', paymentRequest.url);
console.log('QR Code:', paymentRequest.qrCode);
```

#### Transaction History
```javascript
const transactions = await wallet.getTransactions({
  limit: 50,
  offset: 0,
  filter: 'sent' // 'sent', 'received', 'all'
});

transactions.forEach(tx => {
  console.log(`${tx.type}: ${tx.amount} RTM to ${tx.to}`);
});
```

### 🎨 Asset Management (NFTs)

#### Create Asset
```javascript
const asset = await wallet.createAsset({
  name: 'My Quantum NFT',
  description: 'First quantum-resistant NFT',
  image: 'https://example.com/image.png',
  metadata: {
    artist: 'Digital Creator',
    rarity: 'Legendary'
  },
  quantumSecure: true // Add quantum signature
});

console.log('Asset created:', asset.id);
```

#### Transfer Asset
```javascript
const transfer = await wallet.transferAsset({
  assetId: 'asset_123...',
  to: 'RTM1recipient...',
  message: 'Gift for you!'
});
```

### 📲 QR Code Integration

#### Generate QR Code
```javascript
const qrCode = await wallet.generateQR({
  type: 'payment',
  amount: 5.0,
  message: 'Scan to pay',
  address: wallet.getAddress()
});

// qrCode.image = base64 image data
// qrCode.data = QR code data string
```

#### Scan QR Code
```javascript
// For mobile apps
const scanResult = await wallet.scanQR();
if (scanResult.type === 'payment') {
  const payment = await wallet.sendTransaction({
    to: scanResult.address,
    amount: scanResult.amount
  });
}
```

---

## Web Integration

### 🌐 Website Payment Integration

#### Simple Pay Button
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.raptorq.com/wallet-sdk.js"></script>
</head>
<body>
  <button id="pay-button">Pay with RaptorQ</button>
  
  <script>
    const wallet = new RaptorQWallet({
      apiKey: 'your-api-key'
    });
    
    document.getElementById('pay-button').onclick = async () => {
      try {
        await wallet.connect();
        const payment = await wallet.sendTransaction({
          to: 'RTM1merchant...',
          amount: 10.0,
          message: 'Purchase from Your Store'
        });
        alert('Payment successful: ' + payment.hash);
      } catch (error) {
        alert('Payment failed: ' + error.message);
      }
    };
  </script>
</body>
</html>
```

#### E-Commerce Integration
```javascript
class RaptorQCheckout {
  constructor(merchantAddress, apiKey) {
    this.merchant = merchantAddress;
    this.wallet = new RaptorQWallet({ apiKey });
  }
  
  async processPayment(orderDetails) {
    try {
      // Connect to wallet
      await this.wallet.connect();
      
      // Create payment
      const payment = await this.wallet.sendTransaction({
        to: this.merchant,
        amount: orderDetails.total,
        message: `Order ${orderDetails.id}`,
        metadata: {
          orderId: orderDetails.id,
          items: orderDetails.items
        }
      });
      
      // Verify payment
      const verified = await this.verifyPayment(payment.hash);
      
      return {
        success: true,
        transactionHash: payment.hash,
        verified
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async verifyPayment(txHash) {
    const tx = await this.wallet.getTransaction(txHash);
    return tx.status === 'confirmed';
  }
}

// Usage
const checkout = new RaptorQCheckout('RTM1merchant...', 'api-key');
const result = await checkout.processPayment({
  id: 'ORDER-123',
  total: 25.50,
  items: ['Product A', 'Product B']
});
```

### 🛒 WordPress Plugin Integration

```php
<?php
// WordPress RaptorQ Payment Plugin

class RaptorQ_Payment_Gateway extends WC_Payment_Gateway {
    
    public function __construct() {
        $this->id = 'raptorq';
        $this->title = 'RaptorQ Wallet';
        $this->description = 'Pay with quantum-resistant RaptorQ wallet';
        
        $this->init_form_fields();
        $this->init_settings();
    }
    
    public function process_payment($order_id) {
        $order = wc_get_order($order_id);
        
        // Create RaptorQ payment request
        $payment_data = array(
            'amount' => $order->get_total(),
            'order_id' => $order_id,
            'return_url' => $this->get_return_url($order)
        );
        
        $response = wp_remote_post('https://api.raptorq.com/v1/payments', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->get_option('api_key'),
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($payment_data)
        ));
        
        if (is_wp_error($response)) {
            return array('result' => 'failure');
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        return array(
            'result' => 'success',
            'redirect' => $body['payment_url']
        );
    }
}
?>
```

---

## Mobile Integration

### 📱 iOS Swift Integration

```swift
import RaptorQWalletSDK

class PaymentViewController: UIViewController {
    let wallet = RaptorQWallet(apiKey: "your-api-key")
    
    @IBAction func connectWallet(_ sender: UIButton) {
        wallet.connect { [weak self] result in
            switch result {
            case .success(let address):
                DispatchQueue.main.async {
                    self?.updateUI(connected: true, address: address)
                }
            case .failure(let error):
                print("Connection failed: \(error)")
            }
        }
    }
    
    @IBAction func sendPayment(_ sender: UIButton) {
        let transaction = Transaction(
            to: "RTM1recipient...",
            amount: 1.5,
            message: "Mobile payment"
        )
        
        wallet.sendTransaction(transaction) { result in
            switch result {
            case .success(let txHash):
                print("Payment sent: \(txHash)")
            case .failure(let error):
                print("Payment failed: \(error)")
            }
        }
    }
}
```

### 🤖 Android Kotlin Integration

```kotlin
import com.raptorq.wallet.RaptorQWallet
import com.raptorq.wallet.Transaction

class MainActivity : AppCompatActivity() {
    private lateinit var wallet: RaptorQWallet
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        wallet = RaptorQWallet.Builder()
            .apiKey("your-api-key")
            .network("mainnet")
            .build()
        
        findViewById<Button>(R.id.connectButton).setOnClickListener {
            connectWallet()
        }
        
        findViewById<Button>(R.id.payButton).setOnClickListener {
            sendPayment()
        }
    }
    
    private fun connectWallet() {
        wallet.connect(object : RaptorQWallet.ConnectionCallback {
            override fun onSuccess(address: String) {
                runOnUiThread {
                    updateUI(connected = true, address = address)
                }
            }
            
            override fun onError(error: Exception) {
                Log.e("RaptorQ", "Connection failed", error)
            }
        })
    }
    
    private fun sendPayment() {
        val transaction = Transaction.Builder()
            .to("RTM1recipient...")
            .amount(1.5)
            .message("Android payment")
            .build()
            
        wallet.sendTransaction(transaction, object : RaptorQWallet.TransactionCallback {
            override fun onSuccess(txHash: String) {
                Log.d("RaptorQ", "Payment sent: $txHash")
            }
            
            override fun onError(error: Exception) {
                Log.e("RaptorQ", "Payment failed", error)
            }
        })
    }
}
```

---

## Desktop Integration

### 🖥️ Electron App Integration

```javascript
// main.js (Electron main process)
const { app, BrowserWindow, ipcMain } = require('electron');
const { RaptorQDesktop } = require('@raptorq/desktop-sdk');

let wallet;

app.whenReady().then(() => {
  wallet = new RaptorQDesktop({
    apiKey: process.env.RAPTORQ_API_KEY
  });
  
  createWindow();
});

// Handle wallet operations
ipcMain.handle('wallet-connect', async () => {
  return await wallet.connect();
});

ipcMain.handle('wallet-send', async (event, transaction) => {
  return await wallet.sendTransaction(transaction);
});
```

```javascript
// renderer.js (Electron renderer process)
const { ipcRenderer } = require('electron');

class DesktopWallet {
  async connect() {
    return await ipcRenderer.invoke('wallet-connect');
  }
  
  async sendTransaction(details) {
    return await ipcRenderer.invoke('wallet-send', details);
  }
}

// Usage in your desktop app
const wallet = new DesktopWallet();

document.getElementById('connect-btn').onclick = async () => {
  const address = await wallet.connect();
  console.log('Connected:', address);
};
```

### 🐍 Python Desktop (tkinter/PyQt)

```python
import tkinter as tk
from tkinter import messagebox
from raptorq import RaptorQWallet

class RaptorQDesktopApp:
    def __init__(self, root):
        self.root = root
        self.wallet = RaptorQWallet(api_key='your-api-key')
        
        self.setup_ui()
    
    def setup_ui(self):
        tk.Label(self.root, text="RaptorQ Desktop Integration").pack()
        
        self.connect_btn = tk.Button(self.root, text="Connect Wallet", 
                                   command=self.connect_wallet)
        self.connect_btn.pack()
        
        self.send_btn = tk.Button(self.root, text="Send Payment", 
                                command=self.send_payment, state='disabled')
        self.send_btn.pack()
    
    def connect_wallet(self):
        try:
            address = self.wallet.connect()
            messagebox.showinfo("Success", f"Connected: {address}")
            self.send_btn.config(state='normal')
        except Exception as e:
            messagebox.showerror("Error", f"Connection failed: {e}")
    
    def send_payment(self):
        try:
            tx = self.wallet.send_transaction(
                to='RTM1recipient...',
                amount=1.0,
                message='Desktop payment'
            )
            messagebox.showinfo("Success", f"Payment sent: {tx.hash}")
        except Exception as e:
            messagebox.showerror("Error", f"Payment failed: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = RaptorQDesktopApp(root)
    root.mainloop()
```

---

## Advanced Features

### 🤖 BinarAi Integration

#### AI Asset Creation
```javascript
const aiAsset = await wallet.createAIAsset({
  prompt: 'A quantum-resistant digital artwork',
  style: 'cyberpunk',
  size: '1024x1024',
  quantumSecure: true
});

console.log('AI Asset created:', aiAsset.id);
console.log('IPFS Hash:', aiAsset.ipfsHash);
```

#### Batch Asset Creation
```javascript
const prompts = [
  'Quantum crystal formation',
  'Digital matrix landscape',
  'Cyberpunk city at night'
];

const assets = await wallet.batchCreateAIAssets({
  prompts: prompts,
  style: 'digital_art',
  quantumSignature: true
});

assets.forEach(asset => {
  console.log(`Created: ${asset.name} - ${asset.id}`);
});
```

### 🔐 Advanced Security

#### Multi-Signature Transactions
```javascript
const multiSigTx = await wallet.createMultiSigTransaction({
  to: 'RTM1recipient...',
  amount: 100.0,
  requiredSignatures: 2,
  signers: ['RTM1signer1...', 'RTM1signer2...', 'RTM1signer3...']
});

// Sign the transaction
const signature = await wallet.signTransaction(multiSigTx.id);
```

#### Quantum-Resistant Signatures
```javascript
const quantumSignature = await wallet.generateQuantumSignature({
  message: 'Important contract data',
  algorithm: 'SHAKE256',
  strength: '2048-bit'
});

// Verify signature
const isValid = await wallet.verifyQuantumSignature({
  message: 'Important contract data',
  signature: quantumSignature,
  publicKey: wallet.getPublicKey()
});
```

### 📊 Analytics & Monitoring

#### Transaction Analytics
```javascript
const analytics = await wallet.getAnalytics({
  timeframe: '30d',
  metrics: ['volume', 'count', 'average_amount']
});

console.log('30-day volume:', analytics.volume);
console.log('Transaction count:', analytics.count);
```

#### Real-time Monitoring
```javascript
// Monitor incoming transactions
wallet.onTransaction('received', (tx) => {
  console.log(`Received ${tx.amount} RTM from ${tx.from}`);
  
  // Send notification
  notifyUser(`Payment received: ${tx.amount} RTM`);
});

// Monitor outgoing transactions
wallet.onTransaction('sent', (tx) => {
  console.log(`Sent ${tx.amount} RTM to ${tx.to}`);
  updateOrderStatus(tx.metadata.orderId, 'paid');
});
```

---

## Security Best Practices

### 🔒 API Key Security

**❌ Never do this:**
```javascript
// DON'T: Expose API keys in frontend code
const wallet = new RaptorQWallet({
  apiKey: 'rq_live_abc123...' // Visible to users!
});
```

**✅ Do this instead:**
```javascript
// Frontend: Use public key only
const wallet = new RaptorQWallet({
  publicKey: 'rq_pub_xyz789...' // Safe for frontend
});

// Backend: Use secret key
const serverWallet = new RaptorQWallet({
  secretKey: 'rq_secret_abc123...' // Keep secret!
});
```

### 🛡️ Transaction Validation

```javascript
// Always validate transactions before processing
function validateTransaction(tx) {
  // Check amount limits
  if (tx.amount > MAX_TRANSACTION_AMOUNT) {
    throw new Error('Amount exceeds limit');
  }
  
  // Validate address format
  if (!wallet.isValidAddress(tx.to)) {
    throw new Error('Invalid recipient address');
  }
  
  // Check for duplicate transactions
  if (isTransactionDuplicate(tx.id)) {
    throw new Error('Duplicate transaction');
  }
  
  return true;
}
```

### 🔐 Quantum Security Features

```javascript
// Enable quantum security features
const secureWallet = new RaptorQWallet({
  apiKey: 'your-api-key',
  quantumSecurity: true,
  autoUpgrade: true,
  securityLevel: 'maximum'
});

// Use quantum-resistant signatures
const quantumTx = await secureWallet.sendQuantumTransaction({
  to: 'RTM1recipient...',
  amount: 10.0,
  quantumProof: true
});
```

---

## Example Projects

### 🛒 E-Commerce Store

**Complete integration example:**

```javascript
// store.js - E-commerce integration
class QuantumStore {
  constructor() {
    this.wallet = new RaptorQWallet({
      publicKey: 'rq_pub_...',
      network: 'mainnet'
    });
    
    this.cart = [];
    this.orders = new Map();
  }
  
  addToCart(product, quantity = 1) {
    this.cart.push({ ...product, quantity });
    this.updateCartUI();
  }
  
  async checkout() {
    const total = this.calculateTotal();
    const orderId = this.generateOrderId();
    
    try {
      // Connect to wallet
      await this.wallet.connect();
      
      // Create payment
      const payment = await this.wallet.sendTransaction({
        to: STORE_ADDRESS,
        amount: total,
        message: `Order ${orderId}`,
        metadata: {
          orderId,
          items: this.cart
        }
      });
      
      // Store order
      this.orders.set(orderId, {
        items: this.cart,
        total,
        txHash: payment.hash,
        status: 'paid'
      });
      
      // Clear cart
      this.cart = [];
      
      return { success: true, orderId, txHash: payment.hash };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  calculateTotal() {
    return this.cart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }
  
  generateOrderId() {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// Usage
const store = new QuantumStore();

// Add products to cart
store.addToCart({ id: 1, name: 'Quantum T-Shirt', price: 25.99 });
store.addToCart({ id: 2, name: 'RaptorQ Mug', price: 12.50 });

// Checkout
document.getElementById('checkout-btn').onclick = async () => {
  const result = await store.checkout();
  
  if (result.success) {
    showSuccess(`Order ${result.orderId} completed! TX: ${result.txHash}`);
  } else {
    showError(`Checkout failed: ${result.error}`);
  }
};
```

### 💡 Subscription Service

```javascript
// subscription.js - Recurring payments
class QuantumSubscription {
  constructor(planId, amount, interval) {
    this.planId = planId;
    this.amount = amount;
    this.interval = interval; // 'monthly', 'yearly'
    
    this.wallet = new RaptorQWallet({
      publicKey: 'rq_pub_...'
    });
  }
  
  async subscribe(userId) {
    try {
      await this.wallet.connect();
      
      // Create subscription
      const subscription = await this.wallet.createSubscription({
        planId: this.planId,
        amount: this.amount,
        interval: this.interval,
        userId: userId
      });
      
      return subscription;
      
    } catch (error) {
      throw new Error(`Subscription failed: ${error.message}`);
    }
  }
  
  async processRecurringPayment(subscriptionId) {
    const payment = await this.wallet.sendTransaction({
      to: SERVICE_ADDRESS,
      amount: this.amount,
      message: `Subscription payment ${subscriptionId}`,
      metadata: { subscriptionId, recurring: true }
    });
    
    return payment;
  }
}
```

### 🎮 Gaming Integration

```javascript
// game.js - In-game purchases
class QuantumGame {
  constructor() {
    this.wallet = new RaptorQWallet({
      publicKey: 'rq_pub_game_...'
    });
    
    this.player = {
      address: null,
      credits: 0,
      items: []
    };
  }
  
  async connectPlayer() {
    const address = await this.wallet.connect();
    this.player.address = address;
    
    // Load player data
    await this.loadPlayerData();
  }
  
  async purchaseItem(itemId, price) {
    const payment = await this.wallet.sendTransaction({
      to: GAME_ADDRESS,
      amount: price,
      message: `Purchase item ${itemId}`,
      metadata: {
        playerId: this.player.address,
        itemId,
        gameAction: 'purchase'
      }
    });
    
    // Add item to player inventory
    this.player.items.push({ itemId, txHash: payment.hash });
    
    return payment;
  }
  
  async sellItem(itemId, price) {
    // Create sell order
    const sellOrder = await this.wallet.createSellOrder({
      itemId,
      price,
      seller: this.player.address
    });
    
    return sellOrder;
  }
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### ❌ Connection Failed
```javascript
// Problem: Wallet connection fails
wallet.connect().catch(error => {
  if (error.code === 'WALLET_NOT_INSTALLED') {
    showInstallPrompt();
  } else if (error.code === 'USER_REJECTED') {
    showUserMessage('Connection was cancelled');
  } else {
    console.error('Connection error:', error);
  }
});

function showInstallPrompt() {
  const installButton = document.createElement('button');
  installButton.textContent = 'Install RaptorQ Wallet';
  installButton.onclick = () => {
    window.open('https://raptorq.com/download', '_blank');
  };
  document.body.appendChild(installButton);
}
```

#### ❌ Transaction Failed
```javascript
// Problem: Transaction fails to send
async function sendTransactionWithRetry(details, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tx = await wallet.sendTransaction(details);
      return tx;
    } catch (error) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient balance');
      } else if (error.code === 'NETWORK_ERROR' && i < maxRetries - 1) {
        // Retry after delay
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      } else {
        throw error;
      }
    }
  }
}
```

#### ❌ API Key Issues
```javascript
// Problem: Invalid API key
try {
  await wallet.connect();
} catch (error) {
  if (error.code === 'INVALID_API_KEY') {
    console.error('API key is invalid. Get a new one from https://dev.raptorq.com');
  } else if (error.code === 'API_KEY_EXPIRED') {
    console.error('API key has expired. Please renew it.');
  }
}
```

### Debug Mode

```javascript
// Enable debug mode for detailed logging
const wallet = new RaptorQWallet({
  apiKey: 'your-api-key',
  debug: true, // Enable debug logging
  logLevel: 'verbose' // 'error', 'warn', 'info', 'verbose'
});

// Listen to debug events
wallet.on('debug', (event) => {
  console.log('Debug:', event);
});
```

### Testing on Testnet

```javascript
// Use testnet for development
const testWallet = new RaptorQWallet({
  apiKey: 'your-testnet-api-key',
  network: 'testnet'
});

// Get testnet RTM from faucet
const faucetRequest = await testWallet.requestTestnetFunds({
  amount: 10.0,
  address: wallet.getAddress()
});
```

---

## API Reference

### Core Methods

#### `connect()`
Connects to user's RaptorQ wallet.

**Returns:** `Promise<string>` - Wallet address
**Throws:** `ConnectionError`

```javascript
const address = await wallet.connect();
```

#### `sendTransaction(details)`
Sends a transaction.

**Parameters:**
- `details.to` (string) - Recipient address
- `details.amount` (number) - Amount in RTM
- `details.message` (string, optional) - Transaction message
- `details.instantSend` (boolean, optional) - Use InstaSend

**Returns:** `Promise<Transaction>`

```javascript
const tx = await wallet.sendTransaction({
  to: 'RTM1abc...',
  amount: 1.5,
  message: 'Payment',
  instantSend: true
});
```

#### `getBalance()`
Gets wallet balance.

**Returns:** `Promise<number>` - Balance in RTM

```javascript
const balance = await wallet.getBalance();
```

### Asset Methods

#### `createAsset(details)`
Creates a new asset/NFT.

**Parameters:**
- `details.name` (string) - Asset name
- `details.description` (string) - Asset description
- `details.image` (string) - Image URL or base64
- `details.metadata` (object, optional) - Additional metadata

**Returns:** `Promise<Asset>`

#### `transferAsset(assetId, to)`
Transfers an asset to another address.

**Parameters:**
- `assetId` (string) - Asset ID
- `to` (string) - Recipient address

**Returns:** `Promise<Transaction>`

### QR Code Methods

#### `generateQR(details)`
Generates a QR code.

**Parameters:**
- `details.type` (string) - 'payment', 'address'
- `details.amount` (number, optional) - Amount for payment QR
- `details.message` (string, optional) - QR message

**Returns:** `Promise<QRCode>`

#### `scanQR()`
Scans a QR code (mobile only).

**Returns:** `Promise<QRResult>`

### Event Methods

#### `on(event, callback)`
Listen to wallet events.

**Events:**
- `connected` - Wallet connected
- `disconnected` - Wallet disconnected
- `transaction` - Transaction received/sent
- `error` - Error occurred

```javascript
wallet.on('transaction', (tx) => {
  console.log('New transaction:', tx);
});
```

---

## Support & Resources

### 📚 Additional Resources

- **Developer Portal**: [https://dev.raptorq.com](https://dev.raptorq.com)
- **API Documentation**: [https://docs.raptorq.com/api](https://docs.raptorq.com/api)
- **SDK Examples**: [https://github.com/raptorq-wallet/examples](https://github.com/raptorq-wallet/examples)
- **Community Forum**: [https://community.raptorq.com](https://community.raptorq.com)

### 💬 Get Help

- **Discord**: [Join Developer Community](https://discord.gg/raptorq-dev)
- **Email**: developers@raptorq.com
- **GitHub Issues**: [Report bugs](https://github.com/raptorq-wallet/sdk/issues)
- **Stack Overflow**: Tag questions with `raptorq-wallet`

### 🚀 Stay Updated

- **Newsletter**: Subscribe to developer updates
- **Twitter**: [@RaptorQDev](https://twitter.com/raptorqdev)
- **Blog**: [https://blog.raptorq.com/developers](https://blog.raptorq.com/developers)
- **Changelog**: [https://changelog.raptorq.com](https://changelog.raptorq.com)

---

<div align="center">

## 🛠️ Build the Quantum Future

**Start integrating RaptorQ today and future-proof your applications**

**[Get API Key](https://dev.raptorq.com) | [Download SDKs](https://github.com/raptorq-wallet) | [Join Community](https://discord.gg/raptorq)**

---

**Built with ❤️ by Binarai Developer Relations Team**

*Empowering developers to build quantum-resistant applications*

</div>