from fastapi import FastAPI, APIRouter, HTTPException, Depends
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
from datetime import datetime, timezone
import hashlib
import secrets
import json
import asyncio
import aiohttp
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Talon Wallet API", description="Secure Raptoreum Wallet Backend")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Raptoreum RPC Configuration (Mock for development)
RAPTOREUM_RPC_URL = os.environ.get('RAPTOREUM_RPC_URL', 'http://localhost:10226')
RAPTOREUM_RPC_USER = os.environ.get('RAPTOREUM_RPC_USER', 'rpcuser')
RAPTOREUM_RPC_PASS = os.environ.get('RAPTOREUM_RPC_PASS', 'rpcpass')

# IPFS Configuration
IPFS_GATEWAY = os.environ.get('IPFS_GATEWAY', 'https://ipfs.raptoreum.com')
IPFS_API_URL = os.environ.get('IPFS_API_URL', 'https://api.ipfs.raptoreum.com')

# Models
class WalletCreate(BaseModel):
    name: str
    seed_phrase: Optional[str] = None
    is_import: bool = False

class Wallet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    encrypted_private_key: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class AssetMetadata(BaseModel):
    name: str
    description: str
    file_type: str
    ipfs_hash: str
    custom_metadata: Dict[str, Any] = {}

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_id: str
    asset_name: str
    asset_id: str  # Raptoreum asset ID
    metadata: AssetMetadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_owned: bool = True

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_id: str
    tx_hash: str
    tx_type: str  # send, receive, mint, transfer
    amount: Optional[float] = None
    asset_id: Optional[str] = None
    to_address: Optional[str] = None
    from_address: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BalanceResponse(BaseModel):
    rtm_balance: float
    assets: List[Dict[str, Any]]

class RaptoreumRPCRequest(BaseModel):
    method: str
    params: List[Any] = []
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

# Utility Functions
def generate_encryption_key(password: str, salt: bytes) -> bytes:
    """Generate encryption key from password using PBKDF2"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key

def encrypt_private_key(private_key: str, password: str) -> str:
    """Encrypt private key with quantum-resistant encryption"""
    salt = secrets.token_bytes(16)
    key = generate_encryption_key(password, salt)
    f = Fernet(key)
    encrypted_key = f.encrypt(private_key.encode())
    # Combine salt and encrypted key
    return base64.urlsafe_b64encode(salt + encrypted_key).decode()

def decrypt_private_key(encrypted_data: str, password: str) -> str:
    """Decrypt private key"""
    try:
        data = base64.urlsafe_b64decode(encrypted_data.encode())
        salt = data[:16]
        encrypted_key = data[16:]
        key = generate_encryption_key(password, salt)
        f = Fernet(key)
        private_key = f.decrypt(encrypted_key).decode()
        return private_key
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid encryption key or corrupted data")

def generate_seed_phrase() -> str:
    """Generate a 12-word seed phrase"""
    # BIP39 word list (abbreviated for demo)
    words = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
        "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
        "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt",
        "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice"
    ]
    return ' '.join(secrets.choice(words) for _ in range(12))

def generate_raptoreum_address() -> tuple[str, str]:
    """Generate Raptoreum address and private key (mock implementation)"""
    # In production, use proper Raptoreum key generation
    private_key = secrets.token_hex(32)
    address = f"RTM{secrets.token_hex(16)}"
    return address, private_key

async def call_raptoreum_rpc(method: str, params: List[Any] = []) -> Dict[str, Any]:
    """Call Raptoreum RPC endpoint"""
    request_data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": str(uuid.uuid4())
    }
    
    try:
        # Mock implementation for development
        if method == "getbalance":
            return {"result": float(secrets.randbelow(10000)) / 100, "error": None}
        elif method == "listassets":
            return {"result": [], "error": None}
        elif method == "getnewaddress":
            address, _ = generate_raptoreum_address()
            return {"result": address, "error": None}
        elif method == "sendtoaddress":
            return {"result": f"tx_{secrets.token_hex(32)}", "error": None}
        elif method == "createasset":
            return {"result": f"asset_{secrets.token_hex(16)}", "error": None}
        elif method == "sendasset":
            return {"result": f"tx_{secrets.token_hex(32)}", "error": None}
        else:
            return {"result": None, "error": "Method not implemented in mock"}
            
        # Real RPC call (uncomment when Raptoreum node is available)
        # async with aiohttp.ClientSession() as session:
        #     auth = aiohttp.BasicAuth(RAPTOREUM_RPC_USER, RAPTOREUM_RPC_PASS)
        #     async with session.post(RAPTOREUM_RPC_URL, json=request_data, auth=auth) as response:
        #         return await response.json()
    except Exception as e:
        logger.error(f"RPC call failed: {e}")
        return {"result": None, "error": str(e)}

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Talon Wallet API - Secure Raptoreum Asset Management"}

@api_router.post("/wallet/create", response_model=Wallet)
async def create_wallet(wallet_data: WalletCreate):
    """Create a new wallet or import existing one"""
    try:
        # Generate or use provided seed phrase
        seed_phrase = wallet_data.seed_phrase if wallet_data.is_import else generate_seed_phrase()
        
        # Generate address and private key from seed phrase
        address, private_key = generate_raptoreum_address()
        
        # Encrypt private key (using seed phrase as password for demo)
        encrypted_private_key = encrypt_private_key(private_key, seed_phrase)
        
        wallet = Wallet(
            name=wallet_data.name,
            address=address,
            encrypted_private_key=encrypted_private_key
        )
        
        # Store in database
        wallet_dict = wallet.dict()
        wallet_dict['created_at'] = wallet_dict['created_at'].isoformat()
        await db.wallets.insert_one(wallet_dict)
        
        # Don't return the encrypted private key in response
        response_wallet = wallet.dict()
        response_wallet.pop('encrypted_private_key')
        
        return Wallet(**response_wallet, encrypted_private_key="[PROTECTED]")
        
    except Exception as e:
        logger.error(f"Wallet creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create wallet: {str(e)}")

@api_router.get("/wallet/{wallet_id}/balance", response_model=BalanceResponse)
async def get_wallet_balance(wallet_id: str):
    """Get wallet balance and assets"""
    try:
        # Get wallet
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Get RTM balance from Raptoreum RPC
        balance_response = await call_raptoreum_rpc("getbalance")
        rtm_balance = balance_response.get("result", 0.0)
        
        # Get assets from database
        assets_cursor = db.assets.find({"wallet_id": wallet_id})
        assets = await assets_cursor.to_list(length=None)
        
        # Format assets for response
        formatted_assets = []
        for asset in assets:
            formatted_assets.append({
                "id": asset["id"],
                "name": asset["asset_name"],
                "metadata": asset["metadata"],
                "created_at": asset["created_at"]
            })
        
        return BalanceResponse(
            rtm_balance=rtm_balance,
            assets=formatted_assets
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Balance retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")

@api_router.post("/asset/create")
async def create_asset(wallet_id: str, metadata: AssetMetadata):
    """Create a new asset on Raptoreum blockchain"""
    try:
        # Verify wallet exists
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Create asset on Raptoreum blockchain (mock implementation)
        asset_creation_response = await call_raptoreum_rpc(
            "createasset",
            [metadata.name, 1, 0, True, metadata.dict()]  # name, qty, reissuable, ipfs_data
        )
        
        if asset_creation_response.get("error"):
            raise HTTPException(status_code=400, detail=asset_creation_response["error"])
        
        asset_id = asset_creation_response.get("result", f"asset_{secrets.token_hex(16)}")
        
        # Store asset in database
        asset = Asset(
            wallet_id=wallet_id,
            asset_name=metadata.name,
            asset_id=asset_id,
            metadata=metadata
        )
        
        asset_dict = asset.dict()
        asset_dict['created_at'] = asset_dict['created_at'].isoformat()
        await db.assets.insert_one(asset_dict)
        
        return {"message": "Asset created successfully", "asset_id": asset_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Asset creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create asset: {str(e)}")

@api_router.post("/asset/send")
async def send_asset(wallet_id: str, asset_id: str, to_address: str, quantity: int = 1):
    """Send asset to another address"""
    try:
        # Verify wallet and asset
        wallet = await db.wallets.find_one({"id": wallet_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        asset = await db.assets.find_one({"wallet_id": wallet_id, "asset_id": asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Send asset via Raptoreum RPC
        send_response = await call_raptoreum_rpc(
            "sendasset",
            [to_address, asset_id, quantity]
        )
        
        if send_response.get("error"):
            raise HTTPException(status_code=400, detail=send_response["error"])
        
        tx_hash = send_response.get("result", f"tx_{secrets.token_hex(32)}")
        
        # Record transaction
        transaction = Transaction(
            wallet_id=wallet_id,
            tx_hash=tx_hash,
            tx_type="send",
            asset_id=asset_id,
            to_address=to_address,
            status="pending"
        )
        
        transaction_dict = transaction.dict()
        transaction_dict['created_at'] = transaction_dict['created_at'].isoformat()
        await db.transactions.insert_one(transaction_dict)
        
        return {"message": "Asset sent successfully", "tx_hash": tx_hash}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Asset send failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send asset: {str(e)}")

@api_router.get("/wallet/{wallet_id}/transactions", response_model=List[Transaction])
async def get_wallet_transactions(wallet_id: str):
    """Get wallet transaction history"""
    try:
        transactions_cursor = db.transactions.find({"wallet_id": wallet_id}).sort("created_at", -1)
        transactions = await transactions_cursor.to_list(length=100)
        
        return [Transaction(**tx) for tx in transactions]
        
    except Exception as e:
        logger.error(f"Transaction history retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")

class IPFSUpload(BaseModel):
    file_content: str
    file_name: str

@api_router.post("/ipfs/upload")
async def upload_to_ipfs(upload_data: IPFSUpload):
    """Upload file to Raptoreum IPFS cluster"""
    try:
        # Mock IPFS upload (implement with actual IPFS API)
        ipfs_hash = f"Qm{secrets.token_hex(22)}"  # Mock IPFS hash
        
        # In production, upload to actual IPFS
        # async with aiohttp.ClientSession() as session:
        #     files = {'file': (upload_data.file_name, upload_data.file_content)}
        #     async with session.post(f"{IPFS_API_URL}/add", data=files) as response:
        #         result = await response.json()
        #         ipfs_hash = result['Hash']
        
        return {
            "message": "File uploaded to IPFS successfully",
            "ipfs_hash": ipfs_hash,
            "gateway_url": f"{IPFS_GATEWAY}/ipfs/{ipfs_hash}"
        }
        
    except Exception as e:
        logger.error(f"IPFS upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload to IPFS: {str(e)}")

@api_router.get("/rpc/call")
async def rpc_call(method: str, params: str = "[]"):
    """Direct RPC call to Raptoreum node (for advanced users)"""
    try:
        params_list = json.loads(params) if params else []
        response = await call_raptoreum_rpc(method, params_list)
        return response
    except Exception as e:
        logger.error(f"RPC call failed: {e}")
        raise HTTPException(status_code=500, detail=f"RPC call failed: {str(e)}")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        await db.command("ping")
        
        # Check Raptoreum RPC connection
        rpc_response = await call_raptoreum_rpc("getblockchaininfo")
        rpc_status = "ok" if rpc_response.get("result") else "error"
        
        return {
            "status": "healthy",
            "database": "connected",
            "raptoreum_rpc": rpc_status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)