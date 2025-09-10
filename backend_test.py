import requests
import sys
import json
from datetime import datetime

class RaptorQWalletTester:
    def __init__(self, base_url="https://quantum-crypto-4.preview.emergentagent.com"):
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
        
        if branding_issues:
            print(f"   ⚠️ Branding issues found:")
            for issue in branding_issues:
                print(f"      - {issue}")
            return False
        else:
            print(f"   ✅ All branding consistent - RaptorQ by Binarai")
            return True

def main():
    print("🚀 Starting RaptorQ Wallet Backend API Tests")
    print("=" * 60)
    print("🎯 Focus: System Status, QR Generation, Premium Services, Blockchain Pruning, Legal & Asset Management")
    print("=" * 60)
    
    tester = RaptorQWalletTester()
    
    # Priority tests based on review request
    priority_tests = [
        tester.test_system_status,
        tester.test_qr_generation_rtm_address,
        tester.test_premium_services,
        tester.test_coingecko_integration,
        tester.test_blockchain_prune_mobile,
        tester.test_blockchain_prune_desktop,
        tester.test_legal_disclaimer,
        tester.test_platform_guides,
        tester.test_asset_creation,
        tester.test_branding_consistency,
    ]
    
    # Additional QR Code tests (comprehensive testing)
    qr_tests = [
        tester.test_qr_generation_basic,
        tester.test_qr_generation_with_amount,
        tester.test_qr_generation_with_message,
        tester.test_qr_generation_full_params,
    ]
    
    # Additional blockchain pruning tests
    pruning_tests = [
        tester.test_blockchain_prune_custom_storage,
        tester.test_blockchain_pruning_status,
        tester.test_blockchain_prune_edge_cases,
    ]
    
    # Core functionality tests
    core_tests = [
        tester.test_root_endpoint,
    ]
    
    # Combine all tests - Priority tests first
    tests = priority_tests + qr_tests + pruning_tests + core_tests
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())