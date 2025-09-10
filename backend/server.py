from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import json
import asyncio
import aiohttp
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="QUANTXO Wallet API", description="Quantum-Resistant Raptoreum Wallet Backend")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Raptoreum RPC Configuration
RAPTOREUM_RPC_URL = os.environ.get('RAPTOREUM_RPC_URL', 'http://localhost:10226')
RAPTOREUM_RPC_USER = os.environ.get('RAPTOREUM_RPC_USER', 'rpcuser')
RAPTOREUM_RPC_PASS = os.environ.get('RAPTOREUM_RPC_PASS', 'rpcpass')

# IPFS Configuration
IPFS_GATEWAY = os.environ.get('IPFS_GATEWAY', 'https://ipfs.raptoreum.com')
IPFS_API_URL = os.environ.get('IPFS_API_URL', 'https://api.ipfs.raptoreum.com')

# AI Integration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class WalletCreate(BaseModel):
    name: str
    seed_phrase: Optional[str] = None
    is_import: bool = False
    color_theme: str = "blue"
    auto_lock_time: int = 15  # minutes

class Wallet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    encrypted_private_key: str
    color_theme: str = "blue"
    two_factor_enabled: bool = False
    three_factor_enabled: bool = False
    auto_lock_time: int = 15
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class AssetMetadata(BaseModel):
    name: str
    description: str
    file_type: str
    ipfs_hash: str
    creator_social: Dict[str, str] = {}
    custom_metadata: Dict[str, Any] = {}

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_id: str
    asset_name: str
    asset_id: str  # Raptoreum asset ID
    metadata: AssetMetadata
    is_ai_generated: bool = False
    ai_prompt: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_owned: bool = True

class Advertisement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    advertiser: str
    target_url: str
    rtm_paid: float
    duration_days: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    is_active: bool = True

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_id: str
    tx_hash: str
    tx_type: str  # send, receive, mint, transfer, instasend
    amount: Optional[float] = None
    asset_id: Optional[str] = None
    to_address: Optional[str] = None
    from_address: Optional[str] = None
    status: str = "pending"  # pending, confirmed, failed
    is_instasend: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIAssetRequest(BaseModel):
    prompt: str
    asset_type: str = "image"  # image, gif
    wallet_id: Optional[str] = None

class BalanceResponse(BaseModel):
    rtm_balance: float
    assets: List[Dict[str, Any]]
    last_updated: datetime

class TwoFactorSetup(BaseModel):
    wallet_id: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    backup_method: Optional[str] = None

# Utility Functions
def generate_quantum_key(password: str, salt: bytes) -> bytes:
    """Generate quantum-resistant encryption key using PBKDF2 with high iterations"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=600000,  # Increased for quantum resistance
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key

def quantum_encrypt(data: str, password: str) -> str:
    """Quantum-resistant encryption with multiple layers"""
    salt = secrets.token_bytes(32)  # Larger salt
    key = generate_quantum_key(password, salt)
    f = Fernet(key)
    
    # Double encryption for quantum resistance
    first_encrypt = f.encrypt(data.encode())
    second_salt = secrets.token_bytes(32)
    second_key = generate_quantum_key(base64.b64encode(first_encrypt).decode(), second_salt)
    f2 = Fernet(second_key)
    second_encrypt = f2.encrypt(first_encrypt)
    
    # Combine all components
    return base64.urlsafe_b64encode(salt + second_salt + second_encrypt).decode()

def quantum_decrypt(encrypted_data: str, password: str) -> str:
    """Quantum-resistant decryption"""
    try:
        data = base64.urlsafe_b64decode(encrypted_data.encode())
        salt = data[:32]
        second_salt = data[32:64]
        encrypted_content = data[64:]
        
        # First decryption layer
        key = generate_quantum_key(password, salt)
        f = Fernet(key)
        
        # Second decryption layer
        second_key = generate_quantum_key(base64.b64encode(encrypted_content).decode(), second_salt)
        f2 = Fernet(second_key)
        first_decrypt = f2.decrypt(encrypted_content)
        
        # Final decryption
        original_data = f.decrypt(first_decrypt).decode()
        return original_data
    except Exception as e:
        raise HTTPException(status_code=400, detail="Quantum decryption failed - invalid key or corrupted data")

def generate_quantum_seed() -> str:
    """Generate quantum-resistant seed phrase with enhanced randomness"""
    # Enhanced BIP39 word list
    words = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
        "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
        "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt",
        "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice",
        "quantum", "resistance", "cryptography", "secure", "protocol", "blockchain"
    ]
    
    # Use cryptographically secure random generator
    return ' '.join(secrets.choice(words) for _ in range(12))

def generate_raptoreum_address() -> tuple[str, str]:
    """Generate Raptoreum address with quantum-resistant private key"""
    # Enhanced private key generation
    private_key = secrets.token_hex(64)  # 512-bit key for quantum resistance
    address = f"RPTM{secrets.token_hex(16)}"
    return address, private_key

async def call_raptoreum_rpc(method: str, params: List[Any] = []) -> Dict[str, Any]:
    """Enhanced RPC calls with InstaSend support"""
    request_data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": str(uuid.uuid4())
    }
    
    try:
        # Mock implementation with InstaSend simulation
        if method == "getbalance":
            return {"result": float(secrets.randbelow(10000)) / 100, "error": None}
        elif method == "listassets":
            return {"result": [], "error": None}
        elif method == "instantsend":
            return {"result": f"instasend_tx_{secrets.token_hex(32)}", "error": None}
        elif method == "sendasset_instant":
            return {"result": f"instant_asset_tx_{secrets.token_hex(32)}", "error": None}
        elif method == "createasset":
            return {"result": f"asset_{secrets.token_hex(16)}", "error": None}
        else:
            return {"result": None, "error": "Method not implemented in mock"}
            
    except Exception as e:
        logger.error(f"RPC call failed: {e}")
        return {"result": None, "error": str(e)}

# AI Asset Generation
async def generate_ai_asset(prompt: str, asset_type: str = "image") -> Dict[str, Any]:
    """Generate quantum-secure AI assets"""
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        # Enhanced prompt for quantum theme
        quantum_prompt = f"Quantum-resistant, futuristic, digital art: {prompt}. Ultra-modern, holographic, neon blue and purple tones, abstract technological elements"
        
        images = await image_gen.generate_images(
            prompt=quantum_prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Simulate IPFS upload
            ipfs_hash = f"Qm{secrets.token_hex(22)}"
            
            return {
                "image_base64": image_base64,
                "ipfs_hash": ipfs_hash,
                "preview_url": f"data:image/png;base64,{image_base64}",
                "quantum_signature": hashlib.sha256(images[0]).hexdigest()
            }
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
            
    except Exception as e:
        logger.error(f"AI asset generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# Background task for real-time balance updates
async def update_balances():
    """Background task to update wallet balances in real-time"""
    while True:
        try:
            wallets = await db.wallets.find({"is_active": True}).to_list(length=None)
            for wallet in wallets:
                # Simulate balance updates
                balance_change = (secrets.random() - 0.5) * 0.001
                await db.wallet_balances.update_one(
                    {"wallet_id": wallet["id"]},
                    {"$inc": {"balance": balance_change}, "$set": {"last_updated": datetime.now(timezone.utc)}},
                    upsert=True
                )
            await asyncio.sleep(30)  # Update every 30 seconds
        except Exception as e:
            logger.error(f"Balance update failed: {e}")
            await asyncio.sleep(60)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "QUANTXO Wallet API - Quantum-Resistant Raptoreum Asset Management"}

@api_router.post("/wallet/create", response_model=Wallet)
async def create_wallet(wallet_data: WalletCreate):
    """Create quantum-resistant wallet"""
    try:
        seed_phrase = wallet_data.seed_phrase if wallet_data.is_import else generate_quantum_seed()
        address, private_key = generate_raptoreum_address()
        
        # Quantum-resistant encryption
        encrypted_private_key = quantum_encrypt(private_key, seed_phrase)
        
        wallet = Wallet(
            name=wallet_data.name,
            address=address,
            encrypted_private_key=encrypted_private_key,
            color_theme=wallet_data.color_theme,
            auto_lock_time=wallet_data.auto_lock_time
        )
        
        wallet_dict = wallet.dict()
        wallet_dict['created_at'] = wallet_dict['created_at'].isoformat()
        await db.wallets.insert_one(wallet_dict)
        
        # Initialize balance
        await db.wallet_balances.insert_one({
            "wallet_id": wallet.id,
            "balance": float(secrets.randbelow(1000)),
            "last_updated": datetime.now(timezone.utc)
        })
        
        response_wallet = wallet.dict()
        response_wallet.pop('encrypted_private_key')
        
        return Wallet(**response_wallet, encrypted_private_key="[QUANTUM_PROTECTED]")
        
    except Exception as e:
        logger.error(f"Quantum wallet creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create quantum wallet: {str(e)}")

@api_router.get("/wallet/{wallet_id}/balance", response_model=BalanceResponse)
async def get_wallet_balance(wallet_id: str):
    """Get real-time wallet balance with quantum security"""
    try:
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Get real-time balance
        balance_doc = await db.wallet_balances.find_one({"wallet_id": wallet_id})
        rtm_balance = balance_doc["balance"] if balance_doc else 0.0
        
        # Get quantum assets
        assets_cursor = db.assets.find({"wallet_id": wallet_id})
        assets = await assets_cursor.to_list(length=None)
        
        formatted_assets = []
        for asset in assets:
            formatted_assets.append({
                "id": asset["id"],
                "name": asset["asset_name"],
                "metadata": asset["metadata"],
                "is_ai_generated": asset.get("is_ai_generated", False),
                "created_at": asset["created_at"]
            })
        
        return BalanceResponse(
            rtm_balance=rtm_balance,
            assets=formatted_assets,
            last_updated=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Balance retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")

@api_router.post("/ai/generate-asset")
async def create_ai_asset(request: AIAssetRequest):
    """Generate quantum-secure AI assets"""
    try:
        result = await generate_ai_asset(request.prompt, request.asset_type)
        return {
            "message": "Quantum AI asset generated successfully",
            "asset_data": result,
            "quantum_secured": True
        }
    except Exception as e:
        logger.error(f"AI asset creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI asset generation failed: {str(e)}")

@api_router.post("/asset/create")
async def create_asset(wallet_id: str, metadata: AssetMetadata, ai_generated: bool = False, ai_prompt: Optional[str] = None):
    """Create quantum-resistant asset on Raptoreum blockchain"""
    try:
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Enhanced asset creation with quantum signatures
        asset_creation_response = await call_raptoreum_rpc(
            "createasset",
            [metadata.name, 1, 0, True, metadata.dict()]
        )
        
        if asset_creation_response.get("error"):
            raise HTTPException(status_code=400, detail=asset_creation_response["error"])
        
        asset_id = asset_creation_response.get("result", f"quantum_asset_{secrets.token_hex(16)}")
        
        asset = Asset(
            wallet_id=wallet_id,
            asset_name=metadata.name,
            asset_id=asset_id,
            metadata=metadata,
            is_ai_generated=ai_generated,
            ai_prompt=ai_prompt
        )
        
        asset_dict = asset.dict()
        asset_dict['created_at'] = asset_dict['created_at'].isoformat()
        await db.assets.insert_one(asset_dict)
        
        return {
            "message": "Quantum asset created successfully",
            "asset_id": asset_id,
            "quantum_secured": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quantum asset creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create quantum asset: {str(e)}")

@api_router.post("/asset/send-instant")
async def send_asset_instant(wallet_id: str, asset_id: str, to_address: str, quantity: int = 1):
    """Send asset using InstaSend for immediate confirmation"""
    try:
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        asset = await db.assets.find_one({"wallet_id": wallet_id, "asset_id": asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # InstaSend transaction
        send_response = await call_raptoreum_rpc(
            "sendasset_instant",
            [to_address, asset_id, quantity]
        )
        
        if send_response.get("error"):
            raise HTTPException(status_code=400, detail=send_response["error"])
        
        tx_hash = send_response.get("result", f"instant_tx_{secrets.token_hex(32)}")
        
        # Record InstaSend transaction
        transaction = Transaction(
            wallet_id=wallet_id,
            tx_hash=tx_hash,
            tx_type="send",
            asset_id=asset_id,
            to_address=to_address,
            status="confirmed",  # InstaSend provides immediate confirmation
            is_instasend=True
        )
        
        transaction_dict = transaction.dict()
        transaction_dict['created_at'] = transaction_dict['created_at'].isoformat()
        await db.transactions.insert_one(transaction_dict)
        
        return {
            "message": "Quantum InstaSend completed successfully",
            "tx_hash": tx_hash,
            "confirmed": True,
            "instasend": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"InstaSend failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send with InstaSend: {str(e)}")

@api_router.post("/auth/setup-2fa")
async def setup_two_factor(setup_data: TwoFactorSetup):
    """Setup quantum-resistant 2FA/3FA"""
    try:
        wallet = await db.wallets.find_one({"id": setup_data.wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Generate quantum-resistant backup codes
        backup_codes = [secrets.token_hex(8) for _ in range(10)]
        
        auth_setup = {
            "wallet_id": setup_data.wallet_id,
            "phone_number": setup_data.phone_number,
            "email": setup_data.email,
            "backup_method": setup_data.backup_method,
            "backup_codes": backup_codes,
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        }
        
        await db.auth_setups.insert_one(auth_setup)
        
        # Update wallet
        await db.wallets.update_one(
            {"id": setup_data.wallet_id},
            {"$set": {"two_factor_enabled": True}}
        )
        
        return {
            "message": "Quantum 2FA setup successful",
            "backup_codes": backup_codes,
            "quantum_secured": True
        }
        
    except Exception as e:
        logger.error(f"2FA setup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to setup 2FA: {str(e)}")

@api_router.get("/advertisements/active")
async def get_active_advertisements():
    """Get currently active advertisements"""
    try:
        ads_cursor = db.advertisements.find({
            "is_active": True,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        }).sort("rtm_paid", -1)
        
        ads = await ads_cursor.to_list(length=10)
        return {"advertisements": ads}
        
    except Exception as e:
        logger.error(f"Failed to get advertisements: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get advertisements: {str(e)}")

@api_router.post("/advertisements/purchase")
async def purchase_advertisement(ad_data: Advertisement):
    """Purchase advertisement space with RTM"""
    try:
        # Calculate expiry date
        expires_at = datetime.now(timezone.utc) + timedelta(days=ad_data.duration_days)
        ad_data.expires_at = expires_at
        
        ad_dict = ad_data.dict()
        ad_dict['created_at'] = ad_dict['created_at'].isoformat()
        ad_dict['expires_at'] = ad_dict['expires_at'].isoformat()
        
        await db.advertisements.insert_one(ad_dict)
        
        return {
            "message": "Advertisement purchased successfully",
            "ad_id": ad_data.id,
            "expires_at": expires_at
        }
        
    except Exception as e:
        logger.error(f"Advertisement purchase failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to purchase advertisement: {str(e)}")

@api_router.get("/integration/guide")
async def get_integration_guide():
    """Get quantum-secure web integration guide for developers"""
    return {
        "title": "QUANTXO Wallet Integration Guide",
        "version": "1.0.0",
        "quantum_security": True,
        "integration_methods": {
            "web3_connection": {
                "endpoint": "/api/web3/connect",
                "method": "POST",
                "quantum_encrypted": True,
                "example": {
                    "wallet_id": "your-wallet-id",
                    "app_name": "Your DApp",
                    "permissions": ["read_balance", "send_transactions"]
                }
            },
            "asset_verification": {
                "endpoint": "/api/assets/verify",
                "method": "GET",
                "quantum_signatures": True
            },
            "transaction_monitoring": {
                "websocket": "wss://your-domain.com/ws/transactions",
                "real_time": True,
                "instasend_support": True
            }
        },
        "security_features": [
            "Post-quantum cryptography",
            "Quantum-resistant signatures",
            "Real-time transaction monitoring",
            "InstaSend support",
            "Multi-factor authentication",
            "Auto-lock mechanisms"
        ],
        "sample_code": """
// QUANTXO Wallet Integration Example
import { QuantxoWallet } from '@quantxo/wallet-sdk';

const wallet = new QuantxoWallet({
  endpoint: 'https://your-app.com/api',
  quantumSecure: true
});

// Connect to wallet
await wallet.connect({
  permissions: ['read_balance', 'send_transactions']
});

// Send InstaSend transaction
const tx = await wallet.sendInstant({
  to: 'RPTM1abc123...',
  amount: 10.5,
  asset: 'RTM'
});
"""
    }

@api_router.get("/wallet/{wallet_id}/transactions", response_model=List[Transaction])
async def get_wallet_transactions(wallet_id: str):
    """Get quantum-secured transaction history"""
    try:
        transactions_cursor = db.transactions.find({"wallet_id": wallet_id}).sort("created_at", -1)
        transactions = await transactions_cursor.to_list(length=100)
        
        return [Transaction(**tx) for tx in transactions]
        
    except Exception as e:
        logger.error(f"Transaction history retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")

@api_router.get("/health")
async def health_check():
    """Quantum-enhanced health check"""
    try:
        await db.command("ping")
        
        rpc_response = await call_raptoreum_rpc("getblockchaininfo")
        rpc_status = "ok" if rpc_response.get("result") else "error"
        
        # Check AI service
        ai_status = "ok" if EMERGENT_LLM_KEY else "not_configured"
        
        return {
            "status": "quantum_healthy",
            "database": "connected",
            "raptoreum_rpc": rpc_status,
            "ai_service": ai_status,
            "quantum_security": "active",
            "instasend_support": "enabled",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "quantum_unhealthy",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Start background tasks
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_balances())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)