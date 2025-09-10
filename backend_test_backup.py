import requests
import sys
import json
from datetime import datetime

class TalonWalletAPITester:
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

    def test_invalid_endpoints(self):
        """Test error handling for invalid endpoints"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid wallet ID
        success, _ = self.run_test(
            "Invalid Wallet Balance",
            "GET",
            "wallet/invalid-id/balance",
            404
        )
        
        # Test missing required fields for QR generation
        success2, _ = self.run_test(
            "QR Generation Missing Address",
            "POST",
            "qr/generate",
            422,  # Validation error
            data={"wallet_name": "Test"}
        )
        
        return success and success2

def main():
    print("🚀 Starting RaptorQ Wallet API Tests")
    print("=" * 50)
    
    tester = TalonWalletAPITester()
    
    # Blockchain Pruning tests (PRIORITY FOCUS as per review request)
    pruning_tests = [
        tester.test_blockchain_prune_mobile,
        tester.test_blockchain_prune_desktop,
        tester.test_blockchain_prune_custom_storage,
        tester.test_blockchain_pruning_status,
        tester.test_blockchain_prune_edge_cases,
    ]
    
    # QR Code functionality tests (regression testing)
    qr_tests = [
        tester.test_qr_generation_basic,
        tester.test_qr_generation_with_amount,
        tester.test_qr_generation_with_message,
        tester.test_qr_generation_full_params,
        tester.test_rtm_address_validation_valid,
        tester.test_rtm_address_validation_invalid,
        tester.test_rtm_address_validation_edge_cases,
    ]
    
    # Core functionality tests
    core_tests = [
        tester.test_health_check,
        tester.test_root_endpoint,
        tester.test_invalid_endpoints
    ]
    
    # Combine all tests - Pruning tests first (priority), then QR regression tests
    tests = pruning_tests + qr_tests + core_tests
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())