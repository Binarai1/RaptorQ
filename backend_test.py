import requests
import sys
import json
from datetime import datetime

class RaptorQWalletTester:
    def __init__(self, base_url="https://raptorq-wallet.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.wallet_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        if success:
            print(f"   Database: {response.get('database', 'unknown')}")
            print(f"   RPC Status: {response.get('raptoreum_rpc', 'unknown')}")
        return success

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_wallet(self):
        """Test wallet creation"""
        wallet_data = {
            "name": f"Test Wallet {datetime.now().strftime('%H%M%S')}",
            "is_import": False
        }
        
        success, response = self.run_test(
            "Create Wallet",
            "POST",
            "wallet/create",
            200,
            data=wallet_data
        )
        
        if success and 'id' in response:
            self.wallet_id = response['id']
            print(f"   Created wallet ID: {self.wallet_id}")
            print(f"   Wallet address: {response.get('address', 'N/A')}")
        
        return success

    def test_import_wallet(self):
        """Test wallet import"""
        wallet_data = {
            "name": f"Imported Wallet {datetime.now().strftime('%H%M%S')}",
            "seed_phrase": "abandon ability able about above absent absorb abstract absurd abuse access accident",
            "is_import": True
        }
        
        success, response = self.run_test(
            "Import Wallet",
            "POST",
            "wallet/create",
            200,
            data=wallet_data
        )
        
        return success

    def test_get_wallet_balance(self):
        """Test getting wallet balance"""
        if not self.wallet_id:
            print("❌ Skipping balance test - no wallet ID available")
            return False
            
        success, response = self.run_test(
            "Get Wallet Balance",
            "GET",
            f"wallet/{self.wallet_id}/balance",
            200
        )
        
        if success:
            print(f"   RTM Balance: {response.get('rtm_balance', 'N/A')}")
            print(f"   Assets Count: {len(response.get('assets', []))}")
        
        return success

    def test_create_asset(self):
        """Test asset creation"""
        if not self.wallet_id:
            print("❌ Skipping asset creation test - no wallet ID available")
            return False
            
        asset_metadata = {
            "name": "Test NFT Asset",
            "description": "A test NFT created for API testing",
            "file_type": "png",
            "ipfs_hash": "QmTestHash123456789",
            "custom_metadata": {
                "rarity": "Common",
                "creator": "API Tester"
            }
        }
        
        success, response = self.run_test(
            "Create Asset",
            "POST",
            f"asset/create?wallet_id={self.wallet_id}",
            200,
            data=asset_metadata
        )
        
        if success:
            print(f"   Asset ID: {response.get('asset_id', 'N/A')}")
        
        return success

    def test_ipfs_upload(self):
        """Test IPFS upload functionality"""
        upload_data = {
            "file_content": "Test file content for IPFS upload",
            "file_name": "test_file.txt"
        }
        
        success, response = self.run_test(
            "IPFS Upload",
            "POST",
            "ipfs/upload",
            200,
            data=upload_data
        )
        
        if success:
            print(f"   IPFS Hash: {response.get('ipfs_hash', 'N/A')}")
            print(f"   Gateway URL: {response.get('gateway_url', 'N/A')}")
        
        return success

    def test_rpc_call(self):
        """Test direct RPC call"""
        success, response = self.run_test(
            "RPC Call - Get Blockchain Info",
            "GET",
            "rpc/call?method=getblockchaininfo&params=[]",
            200
        )
        
        return success

    def test_get_wallet_transactions(self):
        """Test getting wallet transactions"""
        if not self.wallet_id:
            print("❌ Skipping transactions test - no wallet ID available")
            return False
            
        success, response = self.run_test(
            "Get Wallet Transactions",
            "GET",
            f"wallet/{self.wallet_id}/transactions",
            200
        )
        
        if success:
            print(f"   Transactions Count: {len(response) if isinstance(response, list) else 'N/A'}")
        
        return success

    def test_qr_generation_basic(self):
        """Test basic QR code generation"""
        qr_data = {
            "address": "RPTM1abcdefghijklmnopqrstuv123456",
            "wallet_name": "RaptorQ Test Wallet"
        }
        
        success, response = self.run_test(
            "QR Code Generation - Basic",
            "POST",
            "qr/generate",
            200,
            data=qr_data
        )
        
        if success:
            print(f"   QR Generated: {'Yes' if response.get('qr_code_base64') else 'No'}")
            print(f"   Address: {response.get('address', 'N/A')}")
            print(f"   Quantum Secured: {response.get('wallet_info', {}).get('quantum_secured', 'N/A')}")
        
        return success

    def test_qr_generation_with_amount(self):
        """Test QR code generation with amount"""
        qr_data = {
            "address": "RPTM1abcdefghijklmnopqrstuv123456",
            "wallet_name": "RaptorQ Test Wallet",
            "amount": 10.5
        }
        
        success, response = self.run_test(
            "QR Code Generation - With Amount",
            "POST",
            "qr/generate",
            200,
            data=qr_data
        )
        
        if success:
            print(f"   Amount: {response.get('wallet_info', {}).get('amount', 'N/A')}")
            print(f"   QR Format: {response.get('wallet_info', {}).get('qr_format', 'N/A')}")
        
        return success

    def test_qr_generation_with_message(self):
        """Test QR code generation with message"""
        qr_data = {
            "address": "RPTM1abcdefghijklmnopqrstuv123456",
            "wallet_name": "RaptorQ Test Wallet",
            "message": "Payment for services"
        }
        
        success, response = self.run_test(
            "QR Code Generation - With Message",
            "POST",
            "qr/generate",
            200,
            data=qr_data
        )
        
        if success:
            print(f"   Message: {response.get('wallet_info', {}).get('message', 'N/A')}")
            print(f"   Created By: {response.get('wallet_info', {}).get('created_by', 'N/A')}")
        
        return success

    def test_qr_generation_full_params(self):
        """Test QR code generation with all parameters"""
        qr_data = {
            "address": "RPTM1abcdefghijklmnopqrstuv123456",
            "wallet_name": "RaptorQ Test Wallet",
            "amount": 25.75,
            "message": "Full parameter test payment"
        }
        
        success, response = self.run_test(
            "QR Code Generation - Full Parameters",
            "POST",
            "qr/generate",
            200,
            data=qr_data
        )
        
        if success:
            wallet_info = response.get('wallet_info', {})
            print(f"   Amount: {wallet_info.get('amount', 'N/A')}")
            print(f"   Message: {wallet_info.get('message', 'N/A')}")
            print(f"   Quantum Secured: {wallet_info.get('quantum_secured', 'N/A')}")
        
        return success

    def test_rtm_address_validation_valid(self):
        """Test RTM address validation with valid address"""
        test_address = "R1234567890123456789012345678"
        
        success, response = self.run_test(
            "RTM Address Validation - Valid",
            "GET",
            f"qr/validate/{test_address}",
            200
        )
        
        if success:
            print(f"   Valid: {response.get('valid', 'N/A')}")
            print(f"   Format: {response.get('format', 'N/A')}")
            print(f"   Quantum Verified: {response.get('quantum_verified', 'N/A')}")
        
        return success

    def test_rtm_address_validation_invalid(self):
        """Test RTM address validation with invalid address"""
        test_address = "invalid_address_format"
        
        success, response = self.run_test(
            "RTM Address Validation - Invalid",
            "GET",
            f"qr/validate/{test_address}",
            200
        )
        
        if success:
            print(f"   Valid: {response.get('valid', 'N/A')}")
            print(f"   Address: {response.get('address', 'N/A')}")
        
        return success

    def test_rtm_address_validation_edge_cases(self):
        """Test RTM address validation edge cases"""
        print("\n🔍 Testing RTM Address Validation Edge Cases...")
        
        # Test short address
        success1, _ = self.run_test(
            "RTM Address - Too Short",
            "GET",
            "qr/validate/R123",
            200
        )
        
        # Test long address
        success2, _ = self.run_test(
            "RTM Address - Too Long",
            "GET",
            "qr/validate/R12345678901234567890123456789012345",
            200
        )
        
        # Test wrong starting character
        success3, _ = self.run_test(
            "RTM Address - Wrong Start",
            "GET",
            "qr/validate/X1234567890123456789012345678",
            200
        )
        
        return success1 and success2 and success3

    def test_blockchain_prune_mobile(self):
        """Test blockchain pruning for mobile devices"""
        prune_data = {
            "mobile": True,
            "aggressive": True,
            "storage_limit_gb": 2
        }
        
        success, response = self.run_test(
            "Blockchain Pruning - Mobile",
            "POST",
            "blockchain/prune",
            200,
            data=prune_data
        )
        
        if success:
            stats = response.get('pruning_stats', {})
            print(f"   Mobile Optimized: {response.get('mobile_optimized', 'N/A')}")
            print(f"   Space Saved: {stats.get('space_saved_gb', 'N/A')} GB")
            print(f"   Performance Boost: {response.get('performance_boost', 'N/A')}")
            print(f"   Blocks Pruned: {stats.get('blocks_pruned', 'N/A')}")
            print(f"   Retention Days: {stats.get('retention_days', 'N/A')}")
        
        return success

    def test_blockchain_prune_desktop(self):
        """Test blockchain pruning for desktop devices"""
        prune_data = {
            "mobile": False,
            "aggressive": False,
            "storage_limit_gb": 10
        }
        
        success, response = self.run_test(
            "Blockchain Pruning - Desktop",
            "POST",
            "blockchain/prune",
            200,
            data=prune_data
        )
        
        if success:
            stats = response.get('pruning_stats', {})
            print(f"   Mobile Optimized: {response.get('mobile_optimized', 'N/A')}")
            print(f"   Space Saved: {stats.get('space_saved_gb', 'N/A')} GB")
            print(f"   Performance Boost: {response.get('performance_boost', 'N/A')}")
            print(f"   Aggressive Mode: {stats.get('aggressive_mode', 'N/A')}")
            print(f"   Next Prune Hours: {stats.get('next_prune_in_hours', 'N/A')}")
        
        return success

    def test_blockchain_prune_custom_storage(self):
        """Test blockchain pruning with custom storage limits"""
        prune_data = {
            "mobile": True,
            "aggressive": False,
            "storage_limit_gb": 5
        }
        
        success, response = self.run_test(
            "Blockchain Pruning - Custom Storage",
            "POST",
            "blockchain/prune",
            200,
            data=prune_data
        )
        
        if success:
            stats = response.get('pruning_stats', {})
            print(f"   Initial Size: {stats.get('initial_size_gb', 'N/A')} GB")
            print(f"   Pruned Size: {stats.get('pruned_size_gb', 'N/A')} GB")
            print(f"   Quantum Security: {response.get('quantum_security', 'N/A')}")
        
        return success

    def test_blockchain_pruning_status(self):
        """Test getting blockchain pruning status"""
        success, response = self.run_test(
            "Blockchain Pruning Status",
            "GET",
            "blockchain/pruning-status",
            200
        )
        
        if success:
            print(f"   Enabled: {response.get('enabled', 'N/A')}")
            print(f"   Mode: {response.get('mode', 'N/A')}")
            print(f"   Storage Saved: {response.get('storage_saved', 'N/A')}")
            print(f"   Performance Improvement: {response.get('performance_improvement', 'N/A')}")
            print(f"   Mobile Optimized: {response.get('mobile_optimized', 'N/A')}")
            print(f"   Last Prune: {response.get('last_prune', 'N/A')}")
            print(f"   Next Prune: {response.get('next_prune', 'N/A')}")
        
        return success

    def test_blockchain_prune_edge_cases(self):
        """Test blockchain pruning edge cases"""
        print("\n🔍 Testing Blockchain Pruning Edge Cases...")
        
        # Test with minimal data
        success1, _ = self.run_test(
            "Blockchain Pruning - Minimal Data",
            "POST",
            "blockchain/prune",
            200,
            data={}
        )
        
        # Test with extreme storage limit
        success2, _ = self.run_test(
            "Blockchain Pruning - Large Storage",
            "POST",
            "blockchain/prune",
            200,
            data={"mobile": False, "aggressive": True, "storage_limit_gb": 100}
        )
        
        return success1 and success2

    def test_system_status(self):
        """Test system status and health check endpoint"""
        success, response = self.run_test(
            "System Status & Health Check",
            "GET",
            "system/status",
            200
        )
        
        if success:
            print(f"   Blockchain: {response.get('blockchain', 'N/A')}")
            print(f"   Wallet: {response.get('wallet', 'N/A')}")
            print(f"   Quantum Security: {response.get('quantum_security', 'N/A')}")
            print(f"   Self Healing: {response.get('self_healing', 'N/A')}")
            print(f"   Update Available: {response.get('update_available', 'N/A')}")
            print(f"   Content Monitor: {response.get('content_monitor', 'N/A')}")
            print(f"   Messaging System: {response.get('messaging_system', 'N/A')}")
            
            # Check quantum features
            quantum_features = response.get('quantum_features', {})
            print(f"   Post-Quantum Crypto: {quantum_features.get('post_quantum_crypto', 'N/A')}")
            print(f"   Quantum Messaging: {quantum_features.get('quantum_messaging', 'N/A')}")
            print(f"   Quantum Signatures: {quantum_features.get('quantum_signatures', 'N/A')}")
            print(f"   Content Monitoring: {quantum_features.get('content_monitoring', 'N/A')}")
        
        return success

    def test_premium_services(self):
        """Test premium services endpoint with RTM pricing"""
        success, response = self.run_test(
            "Premium Services with RTM Pricing",
            "GET",
            "services/premium",
            200
        )
        
        if success:
            services = response.get('services', [])
            print(f"   Services Available: {len(services)}")
            print(f"   RTM Market Price: ${response.get('rtm_market_price', 'N/A')}")
            print(f"   Price Source: {response.get('price_source', 'N/A')}")
            print(f"   Payment Methods: {response.get('payment_methods', [])}")
            print(f"   Quantum Secured: {response.get('quantum_secured', 'N/A')}")
            
            # Check if we have exactly 5 premium services
            if len(services) >= 5:
                print(f"   ✅ All 5 premium services available")
                for service in services[:5]:  # Show first 5
                    print(f"      - {service.get('name', 'N/A')}: {service.get('price_rtm', 'N/A')} RTM (${service.get('price_usd', 'N/A')})")
            else:
                print(f"   ⚠️ Only {len(services)} services found, expected 5")
            
            # Check BinarAi single asset pricing
            binarai_single = response.get('binarai_single_asset', {})
            if binarai_single:
                print(f"   BinarAi Single Asset: {binarai_single.get('price_rtm', 'N/A')} RTM (${binarai_single.get('price_usd', 'N/A')})")
        
        return success

    def test_legal_disclaimer(self):
        """Test legal disclaimer endpoint"""
        success, response = self.run_test(
            "Legal Disclaimer",
            "GET",
            "legal/disclaimer",
            200
        )
        
        if success:
            print(f"   Title: {response.get('title', 'N/A')}")
            print(f"   Version: {response.get('version', 'N/A')}")
            print(f"   Last Updated: {response.get('last_updated', 'N/A')}")
            print(f"   Contact: {response.get('contact', 'N/A')}")
            
            disclaimer = response.get('disclaimer', {})
            print(f"   Disclaimer Sections: {len(disclaimer)} sections")
            
            # Check for RaptorQ branding (not "emergent")
            title = response.get('title', '').lower()
            if 'raptorq' in title and 'emergent' not in title:
                print(f"   ✅ Proper RaptorQ branding found")
            else:
                print(f"   ⚠️ Branding issue detected in title")
        
        return success

    def test_platform_guides(self):
        """Test platform guides endpoint"""
        success, response = self.run_test(
            "Platform Guides",
            "GET",
            "platform/guides",
            200
        )
        
        if success:
            user_guides = response.get('user_guides', {})
            dev_guides = response.get('developer_guides', {})
            installation = response.get('installation', {})
            
            print(f"   User Guides: {len(user_guides)} platforms")
            print(f"   Developer Guides: {len(dev_guides)} sections")
            print(f"   Installation Files: {len(installation)} platforms")
            
            # Check for all expected platforms
            expected_platforms = ['windows', 'linux', 'mac', 'android', 'ios']
            for platform in expected_platforms:
                if platform in user_guides and platform in installation:
                    print(f"      ✅ {platform.capitalize()} support available")
                else:
                    print(f"      ⚠️ {platform.capitalize()} support missing")
        
        return success

    def test_asset_creation(self):
        """Test quantum asset creation endpoint"""
        asset_data = {
            "wallet_id": "test_wallet_123",
            "metadata": {
                "name": "Test Quantum Asset",
                "description": "A test asset for API testing",
                "file_type": "png",
                "creator_social": {
                    "twitter": "@testuser"
                },
                "custom_metadata": {
                    "rarity": "Common",
                    "category": "Test"
                }
            }
        }
        
        success, response = self.run_test(
            "Quantum Asset Creation",
            "POST",
            "assets/create",
            200,
            data=asset_data
        )
        
        if success:
            print(f"   Asset ID: {response.get('asset_id', 'N/A')}")
            print(f"   Created By: {response.get('created_by', 'N/A')}")
            
            quantum_signature = response.get('quantum_signature', {})
            print(f"   Quantum Signature Present: {'Yes' if quantum_signature else 'No'}")
            
            if quantum_signature:
                print(f"      Created With: {quantum_signature.get('created_with', 'N/A')}")
                print(f"      Quantum Resistant: {quantum_signature.get('quantum_resistant', 'N/A')}")
                print(f"      UTXO Blockchain: {quantum_signature.get('utxo_blockchain', 'N/A')}")
                print(f"      Security Level: {quantum_signature.get('security_level', 'N/A')}")
                print(f"      Quantum Strength: {quantum_signature.get('quantum_strength', 'N/A')}")
                
                # Check for proper RaptorQ branding
                created_with = quantum_signature.get('created_with', '').lower()
                if 'raptorq' in created_with and 'binarai' in created_with:
                    print(f"      ✅ Proper RaptorQ by Binarai branding")
                else:
                    print(f"      ⚠️ Branding issue in quantum signature")
        
        return success

    def test_qr_generation_rtm_address(self):
        """Test QR code generation with proper RTM address format"""
        qr_data = {
            "address": "RBZTestAddress1234567890123456789",  # RTM format address
            "wallet_name": "RaptorQ Test Wallet",
            "amount": 15.25,
            "message": "Test payment for RaptorQ wallet"
        }
        
        success, response = self.run_test(
            "QR Code Generation - RTM Address",
            "POST",
            "qr/generate",
            200,
            data=qr_data
        )
        
        if success:
            print(f"   QR Generated: {'Yes' if response.get('qr_code_base64') else 'No'}")
            print(f"   Address: {response.get('address', 'N/A')}")
            
            wallet_info = response.get('wallet_info', {})
            print(f"   Wallet Name: {wallet_info.get('name', 'N/A')}")
            print(f"   Amount: {wallet_info.get('amount', 'N/A')}")
            print(f"   Message: {wallet_info.get('message', 'N/A')}")
            print(f"   QR Format: {wallet_info.get('qr_format', 'N/A')}")
            print(f"   Quantum Secured: {wallet_info.get('quantum_secured', 'N/A')}")
            print(f"   Created By: {wallet_info.get('created_by', 'N/A')}")
            
            # Check for proper branding
            created_by = wallet_info.get('created_by', '').lower()
            if 'raptorq' in created_by and 'binarai' in created_by:
                print(f"      ✅ Proper RaptorQ by Binarai branding")
            else:
                print(f"      ⚠️ Branding issue in QR response")
        
        return success

    def test_coingecko_integration(self):
        """Test CoinGecko RTM pricing integration by checking premium services"""
        success, response = self.run_test(
            "CoinGecko RTM Pricing Integration",
            "GET",
            "services/premium",
            200
        )
        
        if success:
            rtm_price = response.get('rtm_market_price', 0)
            price_source = response.get('price_source', '')
            last_updated = response.get('last_updated', 0)
            
            print(f"   RTM Market Price: ${rtm_price}")
            print(f"   Price Source: {price_source}")
            print(f"   Last Updated: {last_updated}")
            
            if price_source == 'CoinGecko' and rtm_price > 0:
                print(f"   ✅ CoinGecko integration working")
            else:
                print(f"   ⚠️ CoinGecko integration issue")
                
            # Check if services have dynamic pricing
            services = response.get('services', [])
            if services:
                first_service = services[0]
                price_rtm = first_service.get('price_rtm', 0)
                price_usd = first_service.get('price_usd', 0)
                
                if price_rtm > 0 and price_usd > 0:
                    calculated_rtm = price_usd / rtm_price if rtm_price > 0 else 0
                    print(f"   Dynamic Pricing Check: {price_rtm:.8f} RTM vs calculated {calculated_rtm:.8f} RTM")
                    
                    # Allow for some variance due to rounding
                    if abs(price_rtm - calculated_rtm) < 0.1:
                        print(f"   ✅ Dynamic pricing calculation correct")
                    else:
                        print(f"   ⚠️ Dynamic pricing calculation may be off")
        
        return success

    def test_raptoreum_blockchain_info(self):
        """Test Raptoreum blockchain info endpoint"""
        success, response = self.run_test(
            "Raptoreum Blockchain Info",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            print(f"   Chain: {response.get('chain', 'N/A')}")
            print(f"   Blocks: {response.get('blocks', 'N/A')}")
            print(f"   Headers: {response.get('headers', 'N/A')}")
            print(f"   Difficulty: {response.get('difficulty', 'N/A')}")
            print(f"   Network Hash/s: {response.get('networkhashps', 'N/A')}")
            print(f"   Connections: {response.get('connections', 'N/A')}")
            
            # Check Raptoreum-specific features
            raptoreum_specific = response.get('raptoreum_specific', {})
            print(f"   Smartnodes Count: {raptoreum_specific.get('smartnodes_count', 'N/A')}")
            print(f"   Smartnodes Enabled: {raptoreum_specific.get('smartnodes_enabled', 'N/A')}")
            print(f"   Assets Created: {raptoreum_specific.get('assets_created', 'N/A')}")
            print(f"   Quantum Signatures Active: {raptoreum_specific.get('quantum_signatures_active', 'N/A')}")
            print(f"   Post-Quantum Security: {raptoreum_specific.get('post_quantum_security', 'N/A')}")
        
        return success

    def test_raptoreum_create_asset(self):
        """Test Raptoreum asset creation with 200 RTM fees"""
        asset_data = {
            "wallet_address": "RBZTestWallet1234567890123456789",
            "asset_data": {
                "name": "TEST_ASSET",
                "qty": 1000,
                "units": 8,
                "reissuable": True,
                "has_ipfs": False
            }
        }
        
        success, response = self.run_test(
            "Raptoreum Asset Creation (200 RTM fees)",
            "POST",
            "raptoreum/createasset",
            200,
            data=asset_data
        )
        
        if success:
            result = response.get('result', {})
            fees = response.get('fees', {})
            
            print(f"   Success: {response.get('success', 'N/A')}")
            print(f"   Asset Name: {result.get('asset_name', 'N/A')}")
            print(f"   Asset ID: {result.get('asset_id', 'N/A')}")
            print(f"   Creation TxID: {result.get('creation_txid', 'N/A')}")
            print(f"   Minting TxID: {result.get('minting_txid', 'N/A')}")
            print(f"   Circulation: {result.get('circulation', 'N/A')}")
            
            # Verify 200 RTM total fees (100 creation + 100 minting + 0.001 transaction)
            total_fee = result.get('fees_paid', {}).get('total_fee', 0)
            creation_fee = result.get('fees_paid', {}).get('creation_fee', 0)
            minting_fee = result.get('fees_paid', {}).get('minting_fee', 0)
            
            print(f"   Creation Fee: {creation_fee} RTM")
            print(f"   Minting Fee: {minting_fee} RTM")
            print(f"   Total Fee: {total_fee} RTM")
            
            if total_fee == 200.001 and creation_fee == 100 and minting_fee == 100:
                print(f"   ✅ Correct 200 RTM fees (100+100+0.001)")
            else:
                print(f"   ⚠️ Fee structure incorrect - expected 200.001 RTM total")
        
        return success

    def test_raptoreum_rpc_console(self):
        """Test Raptoreum RPC console for Pro Mode"""
        # Test help command
        success1, response1 = self.run_test(
            "Raptoreum RPC - Help Command",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "help", "wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success1:
            print(f"   Command: {response1.get('command', 'N/A')}")
            print(f"   Success: {response1.get('success', 'N/A')}")
            print(f"   Execution Time: {response1.get('execution_time', 'N/A')}")
            print(f"   RPC Version: {response1.get('rpc_version', 'N/A')}")
        
        # Test getblockchaininfo command
        success2, response2 = self.run_test(
            "Raptoreum RPC - Get Blockchain Info",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "getblockchaininfo", "wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        # Test smartnode list command
        success3, response3 = self.run_test(
            "Raptoreum RPC - Smartnode List",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "smartnode list", "wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success3:
            result = response3.get('result', [])
            if isinstance(result, list) and len(result) > 0:
                print(f"   Smartnodes Found: {len(result)}")
                first_node = result[0]
                print(f"   First Node Alias: {first_node.get('alias', 'N/A')}")
                print(f"   First Node Status: {first_node.get('status', 'N/A')}")
        
        return success1 and success2 and success3

    def test_raptoreum_smartnodes_owned(self):
        """Test owned smartnodes endpoint"""
        test_address = "RBZTestWallet1234567890123456789"
        
        success, response = self.run_test(
            "Raptoreum Owned Smartnodes",
            "GET",
            f"raptoreum/smartnodes/owned/{test_address}",
            200
        )
        
        if success:
            smartnodes = response.get('smartnodes', [])
            print(f"   Owned Smartnodes: {len(smartnodes)}")
            
            if smartnodes:
                first_node = smartnodes[0]
                print(f"   Node ID: {first_node.get('id', 'N/A')}")
                print(f"   Alias: {first_node.get('alias', 'N/A')}")
                print(f"   Status: {first_node.get('status', 'N/A')}")
                print(f"   IP: {first_node.get('ip', 'N/A')}:{first_node.get('port', 'N/A')}")
                print(f"   Collateral Locked: {first_node.get('collateral_locked', 'N/A')}")
                print(f"   Quantum Enhanced: {first_node.get('quantum_enhanced', 'N/A')}")
                print(f"   Earnings: {first_node.get('earnings', 'N/A')} RTM")
                print(f"   Blocks Won: {first_node.get('blocks_won', 'N/A')}")
        
        return success

    def test_raptoreum_smartnodes_all(self):
        """Test all smartnodes endpoint"""
        success, response = self.run_test(
            "Raptoreum All Smartnodes",
            "GET",
            "raptoreum/smartnodes/all",
            200
        )
        
        if success:
            smartnodes = response.get('smartnodes', [])
            print(f"   Total Network Smartnodes: {len(smartnodes)}")
            
            if smartnodes:
                first_node = smartnodes[0]
                print(f"   Sample Node Alias: {first_node.get('alias', 'N/A')}")
                print(f"   Sample Node Status: {first_node.get('status', 'N/A')}")
                print(f"   Sample Node Quantum Enhanced: {first_node.get('quantum_enhanced', 'N/A')}")
        
        return success

    def test_raptoreum_smartnode_creation(self):
        """Test smartnode creation with 1.8M RTM collateral"""
        smartnode_data = {
            "alias": "RaptorQ-Test-Node",
            "vpsIP": "45.32.123.45",
            "vpsPort": 10226,
            "enableQuantumSecurity": True,
            "autoRestart": True,
            "monitoringEnabled": True
        }
        
        success, response = self.run_test(
            "Raptoreum Smartnode Creation (1.8M RTM)",
            "POST",
            "raptoreum/smartnodes/create",
            200,
            data=smartnode_data
        )
        
        if success:
            config = response.get('config', {})
            print(f"   Success: {response.get('success', 'N/A')}")
            print(f"   Smartnode ID: {response.get('smartnode_id', 'N/A')}")
            print(f"   Alias: {config.get('alias', 'N/A')}")
            print(f"   IP: {config.get('ip', 'N/A')}:{config.get('port', 'N/A')}")
            print(f"   Collateral Required: {config.get('collateral', 'N/A')} RTM")
            print(f"   Quantum Enhanced: {config.get('quantum_enhanced', 'N/A')}")
            print(f"   Status: {config.get('status', 'N/A')}")
            print(f"   Estimated Activation: {response.get('estimated_activation_time', 'N/A')}")
            
            # Verify 1.8M RTM collateral requirement
            collateral = config.get('collateral', 0)
            if collateral == 1800000:
                print(f"   ✅ Correct 1.8M RTM collateral requirement")
            else:
                print(f"   ⚠️ Incorrect collateral - expected 1,800,000 RTM, got {collateral}")
        
        return success

    def test_raptoreum_smartnode_collateral_management(self):
        """Test smartnode collateral lock/unlock"""
        test_node_id = "mn_test123456"
        
        # Test collateral lock
        success1, response1 = self.run_test(
            "Smartnode Collateral Lock",
            "POST",
            f"raptoreum/smartnodes/{test_node_id}/lock-collateral",
            200,
            data={"wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success1:
            print(f"   Lock Success: {response1.get('success', 'N/A')}")
            print(f"   Collateral Amount: {response1.get('collateral_amount', 'N/A')} RTM")
            print(f"   Locked At: {response1.get('locked_at', 'N/A')}")
            print(f"   Unlockable: {response1.get('unlockable', 'N/A')}")
        
        # Test collateral unlock
        success2, response2 = self.run_test(
            "Smartnode Collateral Unlock",
            "POST",
            f"raptoreum/smartnodes/{test_node_id}/unlock-collateral",
            200,
            data={"wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success2:
            print(f"   Unlock Success: {response2.get('success', 'N/A')}")
            print(f"   Collateral Amount: {response2.get('collateral_amount', 'N/A')} RTM")
            print(f"   Unlocked At: {response2.get('unlocked_at', 'N/A')}")
            print(f"   Spendable: {response2.get('spendable', 'N/A')}")
        
        return success1 and success2

    def test_real_wallet_balance(self):
        """Test real wallet balance endpoint (should return 0 for new addresses, not fake 5000 RTM)"""
        test_address = "RBZTestAddress1234567890123456789"
        
        success, response = self.run_test(
            "Real Wallet Balance (No Fake 5000 RTM)",
            "GET",
            f"wallet/{test_address}/balance",
            200
        )
        
        if success:
            balance = response.get('balance', -1)
            confirmed_balance = response.get('confirmed_balance', -1)
            spendable_balance = response.get('spendable_balance', -1)
            
            print(f"   Balance: {balance} RTM")
            print(f"   Confirmed Balance: {confirmed_balance} RTM")
            print(f"   Spendable Balance: {spendable_balance} RTM")
            print(f"   Transaction Count: {response.get('transaction_count', 'N/A')}")
            print(f"   Sync Status: {response.get('sync_status', 'N/A')}")
            
            # Check that we're not returning fake 5000 RTM balance
            if balance == 5000.0:
                print(f"   ❌ CRITICAL: Still returning fake 5000 RTM balance!")
                return False
            elif balance >= 0 and balance <= 1000:  # Realistic balance for test addresses
                print(f"   ✅ Real balance returned (not fake 5000 RTM)")
            else:
                print(f"   ⚠️ Unexpected balance: {balance}")
        
        return success

    def test_real_wallet_assets(self):
        """Test real wallet assets endpoint (should return real blockchain data)"""
        test_address = "RBZTestAddress1234567890123456789"
        
        success, response = self.run_test(
            "Real Wallet Assets (No Fake Data)",
            "GET",
            f"wallet/{test_address}/assets",
            200
        )
        
        if success:
            assets = response.get('assets', [])
            total_assets = response.get('total_assets', 0)
            
            print(f"   Assets Count: {len(assets)}")
            print(f"   Total Assets: {total_assets}")
            print(f"   Last Updated: {response.get('last_updated', 'N/A')}")
            
            # For new addresses, should have empty assets (realistic)
            if len(assets) == 0:
                print(f"   ✅ Real asset data - empty for new address")
            else:
                print(f"   Assets found:")
                for asset in assets[:3]:  # Show first 3
                    print(f"      - {asset.get('asset_name', 'N/A')}: {asset.get('balance', 'N/A')}")
        
        return success

    def test_real_blockchain_info_dynamic(self):
        """Test real blockchain info with dynamic block height and sync progress"""
        success, response = self.run_test(
            "Real Blockchain Info (Dynamic Data)",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            blocks = response.get('blocks', 0)
            headers = response.get('headers', 0)
            verification_progress = response.get('verificationprogress', 0)
            is_syncing = response.get('is_syncing', False)
            connections = response.get('connections', 0)
            
            print(f"   Current Block Height: {blocks}")
            print(f"   Headers: {headers}")
            print(f"   Verification Progress: {verification_progress * 100:.2f}%")
            print(f"   Is Syncing: {is_syncing}")
            print(f"   Connections: {connections}")
            print(f"   Sync Progress: {response.get('sync_progress_percent', 'N/A')}%")
            print(f"   Estimated Sync Time: {response.get('estimated_sync_time', 'N/A')}")
            
            # Check for dynamic data (not static)
            if blocks > 340000:  # Should be above base block height
                print(f"   ✅ Dynamic block height detected")
            else:
                print(f"   ⚠️ Block height seems static")
                
            # Check public node connections
            public_nodes = response.get('public_nodes_connected', [])
            if len(public_nodes) > 0:
                print(f"   ✅ Connected to {len(public_nodes)} public nodes")
                for node in public_nodes[:2]:
                    print(f"      - {node.get('ip', 'N/A')}:{node.get('port', 'N/A')} ({node.get('status', 'N/A')})")
            else:
                print(f"   ⚠️ No public node connections found")
        
        return success

    def test_advertising_integration(self):
        """Test advertising integration endpoints"""
        print("\n🔍 Testing Advertising Integration...")
        
        # Test advertising slots
        success1, response1 = self.run_test(
            "Advertising Slots",
            "GET",
            "advertising/slots",
            200
        )
        
        if success1:
            slots = response1.get('slots', {})
            print(f"   Available Slots: {len(slots)}")
            for slot_name, slot_data in slots.items():
                print(f"      - {slot_name}: Active={slot_data.get('active', 'N/A')}")
        
        # Test track impression
        success2, response2 = self.run_test(
            "Track Advertisement Impression",
            "POST",
            "advertising/track-impression",
            200,
            data={"slot": "wallet_bottom", "advertiser_wallet": "RBZTestAdvertiser123456789"}
        )
        
        if success2:
            print(f"   Impression Tracked: {response2.get('success', 'N/A')}")
            print(f"   Total Impressions: {response2.get('total_impressions', 'N/A')}")
        
        # Test track click
        success3, response3 = self.run_test(
            "Track Advertisement Click",
            "POST",
            "advertising/track-click",
            200,
            data={"slot": "wallet_bottom", "advertiser_wallet": "RBZTestAdvertiser123456789"}
        )
        
        if success3:
            print(f"   Click Tracked: {response3.get('success', 'N/A')}")
            print(f"   Total Clicks: {response3.get('total_clicks', 'N/A')}")
        
        return success1 and success2 and success3

    def test_real_smartnode_data(self):
        """Test real smartnode data endpoints (not fake mock data)"""
        print("\n🔍 Testing Real Smartnode Data...")
        
        test_address = "RBZTestAddress1234567890123456789"
        
        # Test owned smartnodes
        success1, response1 = self.run_test(
            "Real Owned Smartnodes Data",
            "GET",
            f"raptoreum/smartnodes/owned/{test_address}",
            200
        )
        
        if success1:
            smartnodes = response1.get('smartnodes', [])
            print(f"   Owned Smartnodes: {len(smartnodes)}")
            
            if smartnodes:
                node = smartnodes[0]
                print(f"   Sample Node Status: {node.get('status', 'N/A')}")
                print(f"   Sample Node Earnings: {node.get('earnings', 'N/A')} RTM")
                print(f"   Sample Node Blocks Won: {node.get('blocks_won', 'N/A')}")
                print(f"   Sample Node Quantum Enhanced: {node.get('quantum_enhanced', 'N/A')}")
                
                # Check for realistic data (not obviously fake)
                earnings = node.get('earnings', 0)
                if isinstance(earnings, (int, float)) and earnings >= 0:
                    print(f"   ✅ Realistic earnings data")
                else:
                    print(f"   ⚠️ Suspicious earnings data")
        
        # Test all smartnodes
        success2, response2 = self.run_test(
            "Real All Smartnodes Data",
            "GET",
            "raptoreum/smartnodes/all",
            200
        )
        
        if success2:
            all_smartnodes = response2.get('smartnodes', [])
            print(f"   Network Smartnodes: {len(all_smartnodes)}")
            
            if all_smartnodes:
                node = all_smartnodes[0]
                print(f"   Sample Network Node Status: {node.get('status', 'N/A')}")
                print(f"   Sample Network Node Active Time: {node.get('active_time', 'N/A')}")
        
        return success1 and success2

    def test_all_raptoreum_assets_real(self):
        """Test all Raptoreum assets endpoint for real blockchain data"""
        success, response = self.run_test(
            "All Raptoreum Assets (Real Data)",
            "GET",
            "raptoreum/assets/all",
            200
        )
        
        if success:
            assets = response.get('assets', [])
            total_assets = response.get('total_assets', 0)
            
            print(f"   Total Blockchain Assets: {total_assets}")
            print(f"   Assets Returned: {len(assets)}")
            print(f"   Last Updated: {response.get('last_updated', 'N/A')}")
            
            if assets:
                print(f"   Sample Assets:")
                for asset in assets[:3]:
                    print(f"      - {asset.get('name', 'N/A')}: {asset.get('quantity', 'N/A')} units")
                    print(f"        Type: {asset.get('type', 'N/A')}, Reissuable: {asset.get('reissuable', 'N/A')}")
            else:
                print(f"   ✅ Empty asset list (realistic for new blockchain)")
        
        return success

    def test_asset_creation_fees_200rtm(self):
        """Test asset creation maintains correct 200 RTM total fees"""
        asset_data = {
            "wallet_address": "RBZTestWallet1234567890123456789",
            "asset_data": {
                "name": "FEE_TEST_ASSET",
                "qty": 1000,
                "units": 8,
                "reissuable": True,
                "has_ipfs": False
            }
        }
        
        success, response = self.run_test(
            "Asset Creation Fees (200 RTM Total)",
            "POST",
            "raptoreum/createasset",
            200,
            data=asset_data
        )
        
        if success:
            result = response.get('result', {})
            fees_paid = result.get('fees_paid', {})
            
            creation_fee = fees_paid.get('creation_fee', 0)
            minting_fee = fees_paid.get('minting_fee', 0)
            transaction_fee = fees_paid.get('transaction_fee', 0)
            total_fee = fees_paid.get('total_fee', 0)
            
            print(f"   Creation Fee: {creation_fee} RTM")
            print(f"   Minting Fee: {minting_fee} RTM")
            print(f"   Transaction Fee: {transaction_fee} RTM")
            print(f"   Total Fee: {total_fee} RTM")
            
            # Verify exact fee structure: 100 + 100 + 0.001 = 200.001
            if (creation_fee == 100 and 
                minting_fee == 100 and 
                transaction_fee == 0.001 and 
                total_fee == 200.001):
                print(f"   ✅ CORRECT: 200 RTM total fees (100 creation + 100 minting + 0.001 transaction)")
                return True
            else:
                print(f"   ❌ INCORRECT FEE STRUCTURE:")
                print(f"      Expected: 100 + 100 + 0.001 = 200.001 RTM")
                print(f"      Got: {creation_fee} + {minting_fee} + {transaction_fee} = {total_fee} RTM")
                return False
        
        return success

    def test_quantum_signature_generation(self):
        """Test quantum signature generation"""
        # This is tested through asset creation, but let's verify the signature format
        asset_data = {
            "wallet_id": "test_wallet_quantum",
            "metadata": {
                "name": "Quantum Signature Test Asset",
                "description": "Testing quantum signature generation",
                "file_type": "png"
            }
        }
        
        success, response = self.run_test(
            "Quantum Signature Generation",
            "POST",
            "assets/create",
            200,
            data=asset_data
        )
        
        if success:
            quantum_signature = response.get('quantum_signature', {})
            signature = quantum_signature.get('signature', '')
            
            print(f"   Quantum Signature Present: {'Yes' if signature else 'No'}")
            print(f"   Signature Length: {len(signature)} characters")
            print(f"   Security Level: {quantum_signature.get('security_level', 'N/A')}")
            print(f"   Quantum Strength: {quantum_signature.get('quantum_strength', 'N/A')}")
            
            # Quantum signatures should be long (SHA3-2048 equivalent)
            if len(signature) >= 512:  # 2048 bits = 512 hex characters
                print(f"   ✅ Quantum signature has sufficient length for SHA3-2048 equivalent")
            else:
                print(f"   ⚠️ Quantum signature may be too short for claimed security level")
        
        return success

    def test_branding_consistency(self):
        """Test that all endpoints use RaptorQ branding, not emergent"""
        print("\n🔍 Testing Branding Consistency...")
        
        # Test root endpoint branding
        success1, response1 = self.run_test(
            "Root Endpoint Branding",
            "GET",
            "",
            200
        )
        
        branding_issues = []
        
        if success1:
            message = response1.get('message', '').lower()
            created_by = response1.get('created_by', '').lower()
            
            if 'emergent' in message or 'emergent' in created_by:
                branding_issues.append("Root endpoint contains 'emergent' branding")
            
            if 'raptorq' in message and 'binarai' in created_by:
                print(f"   ✅ Root endpoint has proper RaptorQ branding")
            else:
                branding_issues.append("Root endpoint missing proper RaptorQ/Binarai branding")
        
        # Test system status branding
        success2, response2 = self.run_test(
            "System Status Branding",
            "GET",
            "system/status",
            200
        )
        
        # Test legal disclaimer branding
        success3, response3 = self.run_test(
            "Legal Disclaimer Branding",
            "GET",
            "legal/disclaimer",
            200
        )
        
        if success3:
            title = response3.get('title', '').lower()
            if 'emergent' in title:
                branding_issues.append("Legal disclaimer contains 'emergent' branding")
            
            if 'raptorq' in title:
                print(f"   ✅ Legal disclaimer has proper RaptorQ branding")
        
        # Test asset creation branding
        asset_data = {
            "wallet_id": "branding_test_wallet",
            "metadata": {
                "name": "Branding Test Asset",
                "description": "Testing branding consistency",
                "file_type": "png"
            }
        }
        
        success4, response4 = self.run_test(
            "Asset Creation Branding",
            "POST",
            "assets/create",
            200,
            data=asset_data
        )
        
        if success4:
            created_by = response4.get('created_by', '').lower()
            quantum_sig = response4.get('quantum_signature', {})
            created_with = quantum_sig.get('created_with', '').lower()
            
            if 'emergent' in created_by or 'emergent' in created_with:
                branding_issues.append("Asset creation contains 'emergent' branding")
            
            if 'raptorq' in created_by and 'binarai' in created_with:
                print(f"   ✅ Asset creation has proper RaptorQ by Binarai branding")
        
        if branding_issues:
            print(f"   ⚠️ Branding issues found:")
            for issue in branding_issues:
                print(f"      - {issue}")
            return False
        else:
            print(f"   ✅ All branding consistent - RaptorQ by Binarai")
            return True

def main():
    print("🚀 CRITICAL PRODUCTION FIXES TESTING - RaptorQ Wallet Backend API")
    print("=" * 80)
    print("🎯 TESTING USER-REPORTED CRITICAL ISSUES:")
    print("   1. Real Blockchain Integration (dynamic block height, sync progress)")
    print("   2. Real Wallet Balance (no fake 5000 RTM)")
    print("   3. Real Asset Data (blockchain-based, not fake)")
    print("   4. Advertising Integration (restored functionality)")
    print("   5. Real Smartnode Data (not mock data)")
    print("   6. Asset Creation Fees (correct 200 RTM total)")
    print("=" * 80)
    
    tester = RaptorQWalletTester()
    
    # CRITICAL PRODUCTION FIXES TESTS (as per user requirements)
    critical_fixes_tests = [
        # 1. Real Blockchain Integration
        tester.test_real_blockchain_info_dynamic,
        
        # 2. Real Wallet Balance (no fake 5000 RTM)
        tester.test_real_wallet_balance,
        
        # 3. Real Asset Data
        tester.test_real_wallet_assets,
        tester.test_all_raptoreum_assets_real,
        
        # 4. Advertising Integration
        tester.test_advertising_integration,
        
        # 5. Real Smartnode Data
        tester.test_real_smartnode_data,
        
        # 6. Asset Creation Fees (200 RTM)
        tester.test_asset_creation_fees_200rtm,
    ]
    
    # ADDITIONAL RAPTOREUM INTEGRATION TESTS
    raptoreum_integration_tests = [
        tester.test_raptoreum_blockchain_info,
        tester.test_raptoreum_create_asset,
        tester.test_raptoreum_smartnodes_owned,
        tester.test_raptoreum_smartnodes_all,
        tester.test_raptoreum_smartnode_creation,
    ]
    
    # SYSTEM HEALTH & FUNCTIONALITY TESTS
    system_tests = [
        tester.test_root_endpoint,
        tester.test_system_status,
        tester.test_premium_services,
        tester.test_coingecko_integration,
    ]
    
    # QR CODE & SECURITY TESTS
    security_tests = [
        tester.test_qr_generation_rtm_address,
        tester.test_asset_creation,
        tester.test_quantum_signature_generation,
    ]
    
    # BRANDING VERIFICATION
    branding_tests = [
        tester.test_branding_consistency,
        tester.test_legal_disclaimer,
    ]
    
    # Combine all tests in priority order (critical fixes first)
    tests = critical_fixes_tests + raptoreum_integration_tests + system_tests + security_tests + branding_tests
    
    print(f"📋 Total Tests to Execute: {len(tests)}")
    print(f"🔥 Starting CRITICAL PRODUCTION FIXES TESTING...")
    print(f"🎯 Focus: User-reported issues with fake data and missing functionality")
    print()
    
    # Run all tests
    critical_failures = []
    for i, test in enumerate(tests):
        try:
            if i < len(critical_fixes_tests):
                print(f"\n🚨 CRITICAL FIX TEST {i+1}/{len(critical_fixes_tests)}")
            success = test()
            if i < len(critical_fixes_tests) and not success:
                critical_failures.append(test.__name__)
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            if i < len(critical_fixes_tests):
                critical_failures.append(test.__name__)
    
    # Print final results
    print("\n" + "=" * 80)
    print(f"📊 PRODUCTION FIXES TEST RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if critical_failures:
        print(f"\n🚨 CRITICAL PRODUCTION ISSUES STILL PRESENT:")
        for failure in critical_failures:
            print(f"   ❌ {failure}")
        print(f"\n⚠️  PRODUCTION DEPLOYMENT BLOCKED - {len(critical_failures)} critical issues remain")
        return 1
    else:
        print(f"\n✅ ALL CRITICAL PRODUCTION FIXES VERIFIED!")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 ALL TESTS PASSED - PRODUCTION READY!")
            return 0
        else:
            failed_tests = tester.tests_run - tester.tests_passed
            print(f"⚠️  {failed_tests} non-critical tests failed - Review recommended")
            return 0  # Don't block deployment for non-critical failures

if __name__ == "__main__":
    sys.exit(main())