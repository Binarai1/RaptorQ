import requests
import sys
import json
from datetime import datetime

class MainnetProductionTester:
    def __init__(self, base_url="https://raptorq-wallet.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_failures = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
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

    def test_real_block_height_from_raptoreum_network(self):
        """Test /api/raptoreum/blockchain-info attempts connection to real Raptoreum explorer API"""
        success, response = self.run_test(
            "Real Block Height from Raptoreum Network",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            blocks = response.get('blocks', 0)
            chain = response.get('chain', '')
            verification_progress = response.get('verificationprogress', 0)
            
            print(f"   Chain: {chain}")
            print(f"   Current Block Height: {blocks}")
            print(f"   Verification Progress: {verification_progress * 100:.2f}%")
            
            # Check if we're getting real mainnet block heights (not fake 347,825)
            if blocks == 347825:
                print(f"   ❌ CRITICAL: Still returning fake block height 347,825!")
                self.critical_failures.append("Fake block height 347,825 detected")
                return False
            elif blocks > 2800000:  # Real Raptoreum mainnet should be above this
                print(f"   ✅ Real mainnet block height detected: {blocks}")
            else:
                print(f"   ⚠️ Block height {blocks} seems low for mainnet")
                
            # Verify it's mainnet
            if chain == "main":
                print(f"   ✅ Connected to Raptoreum mainnet")
            else:
                print(f"   ❌ Not connected to mainnet: {chain}")
                self.critical_failures.append(f"Not connected to mainnet: {chain}")
                return False
                
        return success

    def test_real_network_data_hashrate_difficulty(self):
        """Test real network hashrate (~2.5 TH/s) and difficulty (45K-50K range)"""
        success, response = self.run_test(
            "Real Network Data - Hashrate & Difficulty",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            hashrate = response.get('networkhashps', 0)
            difficulty = response.get('difficulty', 0)
            connections = response.get('connections', 0)
            
            print(f"   Network Hashrate: {hashrate:,.0f} H/s ({hashrate/1e12:.2f} TH/s)")
            print(f"   Difficulty: {difficulty:,.2f}")
            print(f"   Connections: {connections}")
            
            # Check hashrate is in realistic range (~2.5 TH/s = 2.5e12 H/s)
            if hashrate == 0:
                print(f"   ❌ CRITICAL: Network hashrate is zero (fake data)!")
                self.critical_failures.append("Network hashrate is zero")
                return False
            elif 1e12 <= hashrate <= 5e12:  # 1-5 TH/s range
                print(f"   ✅ Realistic network hashrate: {hashrate/1e12:.2f} TH/s")
            else:
                print(f"   ⚠️ Hashrate outside expected range: {hashrate/1e12:.2f} TH/s")
            
            # Check difficulty is in realistic range (45K-50K)
            if difficulty == 0:
                print(f"   ❌ CRITICAL: Difficulty is zero (fake data)!")
                self.critical_failures.append("Difficulty is zero")
                return False
            elif 40000 <= difficulty <= 60000:  # 40K-60K range (allowing some variance)
                print(f"   ✅ Realistic difficulty: {difficulty:,.0f}")
            else:
                print(f"   ⚠️ Difficulty outside expected range: {difficulty:,.0f}")
            
            # Check connections allow up to 100 (not limited to 8)
            if connections <= 8:
                print(f"   ⚠️ Low connection count: {connections} (should allow up to 100)")
            elif connections <= 100:
                print(f"   ✅ Good connection count: {connections} (max 100 for sync)")
            else:
                print(f"   ✅ High connection count: {connections}")
                
        return success

    def test_dynamic_best_block_information(self):
        """Test moving/dynamic best block information (not static 350,000)"""
        success, response = self.run_test(
            "Dynamic Best Block Information",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            blocks = response.get('blocks', 0)
            headers = response.get('headers', 0)
            bestblockhash = response.get('bestblockhash', '')
            is_syncing = response.get('is_syncing', False)
            sync_progress = response.get('sync_progress_percent', 0)
            
            print(f"   Current Blocks: {blocks}")
            print(f"   Headers: {headers}")
            print(f"   Best Block Hash: {bestblockhash[:20]}...")
            print(f"   Is Syncing: {is_syncing}")
            print(f"   Sync Progress: {sync_progress:.2f}%")
            
            # Check for static 350,000 block height
            if blocks == 350000:
                print(f"   ❌ CRITICAL: Static block height 350,000 detected!")
                self.critical_failures.append("Static block height 350,000")
                return False
            
            # Check that block hash is not obviously fake/static
            if bestblockhash and len(bestblockhash) >= 64:
                print(f"   ✅ Valid block hash format")
            else:
                print(f"   ⚠️ Invalid or missing block hash")
            
            # Check sync status is realistic (not always 100% when syncing)
            if is_syncing and sync_progress >= 100:
                print(f"   ⚠️ Sync status inconsistent: syncing but 100% complete")
            elif not is_syncing and sync_progress >= 99.9:
                print(f"   ✅ Properly synced: {sync_progress:.2f}%")
            elif is_syncing:
                print(f"   ✅ Realistic sync in progress: {sync_progress:.2f}%")
                
        return success

    def test_public_nodes_connection(self):
        """Test connection to public Raptoreum nodes"""
        success, response = self.run_test(
            "Public Nodes Connection",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            public_nodes = response.get('public_nodes_connected', [])
            connections = response.get('connections', 0)
            
            print(f"   Total Connections: {connections}")
            print(f"   Public Nodes Listed: {len(public_nodes)}")
            
            if len(public_nodes) > 0:
                print(f"   ✅ Connected to {len(public_nodes)} public Raptoreum nodes:")
                for i, node in enumerate(public_nodes[:5]):  # Show first 5
                    ip = node.get('ip', 'N/A')
                    port = node.get('port', 'N/A')
                    status = node.get('status', 'N/A')
                    print(f"      {i+1}. {ip}:{port} ({status})")
            else:
                print(f"   ❌ CRITICAL: No public node connections found!")
                self.critical_failures.append("No public node connections")
                return False
                
        return success

    def test_console_commands_real_data(self):
        """Test /api/raptoreum/rpc with getblockchaininfo and getwalletinfo for real data"""
        print(f"\n🔍 Testing Console Commands Real Data...")
        
        # Test getblockchaininfo command
        success1, response1 = self.run_test(
            "RPC getblockchaininfo Command",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "getblockchaininfo", "wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success1:
            result = response1.get('result', {})
            if isinstance(result, dict):
                blocks = result.get('blocks', 0)
                chain = result.get('chain', '')
                difficulty = result.get('difficulty', 0)
                
                print(f"   RPC Blocks: {blocks}")
                print(f"   RPC Chain: {chain}")
                print(f"   RPC Difficulty: {difficulty}")
                
                # Verify real data (not fake)
                if blocks > 2800000 and chain == "main" and difficulty > 0:
                    print(f"   ✅ RPC returning real blockchain data")
                else:
                    print(f"   ⚠️ RPC data may be fake or incomplete")
            else:
                print(f"   ⚠️ RPC result format unexpected: {type(result)}")
        
        # Test getwalletinfo command
        success2, response2 = self.run_test(
            "RPC getwalletinfo Command",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "getwalletinfo", "wallet_address": "RBZTestWallet1234567890123456789"}
        )
        
        if success2:
            result = response2.get('result', {})
            if isinstance(result, dict):
                balance = result.get('balance', -1)
                txcount = result.get('txcount', -1)
                walletname = result.get('walletname', '')
                
                print(f"   RPC Wallet Balance: {balance} RTM")
                print(f"   RPC Transaction Count: {txcount}")
                print(f"   RPC Wallet Name: {walletname}")
                
                # Check for fake 5000 RTM balance
                if balance == 5000.0:
                    print(f"   ❌ CRITICAL: RPC still returning fake 5000 RTM balance!")
                    self.critical_failures.append("RPC fake 5000 RTM balance")
                    return False
                elif balance >= 0:
                    print(f"   ✅ RPC returning real wallet balance (not fake 5000 RTM)")
                else:
                    print(f"   ⚠️ RPC balance format unexpected")
            else:
                print(f"   ⚠️ RPC wallet result format unexpected: {type(result)}")
        
        return success1 and success2

    def test_advertising_banner_active(self):
        """Test /api/advertising/slots shows header_banner is active with quantum-themed content"""
        success, response = self.run_test(
            "Advertising Banner Active",
            "GET",
            "advertising/slots",
            200
        )
        
        if success:
            slots = response.get('slots', {})
            header_banner = slots.get('header_banner', {})
            
            print(f"   Available Slots: {len(slots)}")
            print(f"   Header Banner Present: {'Yes' if header_banner else 'No'}")
            
            if header_banner:
                active = header_banner.get('active', False)
                title = header_banner.get('title', '')
                description = header_banner.get('description', '')
                banner_url = header_banner.get('banner_url', '')
                
                print(f"   Header Banner Active: {active}")
                print(f"   Banner Title: {title}")
                print(f"   Banner Description: {description[:100]}...")
                print(f"   Banner URL: {banner_url}")
                
                if active:
                    print(f"   ✅ Header banner is active")
                    
                    # Check for quantum-themed content
                    content = f"{title} {description}".lower()
                    quantum_keywords = ['quantum', 'rtm', 'raptoreum', 'crypto', 'blockchain']
                    found_keywords = [kw for kw in quantum_keywords if kw in content]
                    
                    if found_keywords:
                        print(f"   ✅ Quantum-themed content found: {', '.join(found_keywords)}")
                    else:
                        print(f"   ⚠️ No quantum-themed keywords found in content")
                else:
                    print(f"   ❌ CRITICAL: Header banner is not active!")
                    self.critical_failures.append("Header banner not active")
                    return False
            else:
                print(f"   ❌ CRITICAL: Header banner slot not found!")
                self.critical_failures.append("Header banner slot missing")
                return False
                
        return success

    def test_production_wallet_balance_zero_rtm(self):
        """Test wallet balance endpoints return 0 RTM for new wallets (not fake 5000 RTM)"""
        test_addresses = [
            "RBZNewWallet1234567890123456789",
            "RBZFreshWallet1234567890123456789",
            "RBZTestWallet1234567890123456789"
        ]
        
        all_success = True
        
        for address in test_addresses:
            success, response = self.run_test(
                f"Production Wallet Balance - {address[-10:]}",
                "GET",
                f"wallet/{address}/balance",
                200
            )
            
            if success:
                balance = response.get('balance', -1)
                confirmed_balance = response.get('confirmed_balance', -1)
                spendable_balance = response.get('spendable_balance', -1)
                
                print(f"   Balance: {balance} RTM")
                print(f"   Confirmed Balance: {confirmed_balance} RTM")
                print(f"   Spendable Balance: {spendable_balance} RTM")
                
                # Critical check: no fake 5000 RTM balance
                if balance == 5000.0:
                    print(f"   ❌ CRITICAL: Still returning fake 5000 RTM balance!")
                    self.critical_failures.append(f"Fake 5000 RTM balance for {address}")
                    all_success = False
                elif balance == 0.0:
                    print(f"   ✅ Correct: New wallet has 0 RTM balance")
                elif 0 < balance <= 1000:
                    print(f"   ✅ Realistic: Small test balance {balance} RTM")
                else:
                    print(f"   ⚠️ Unexpected balance: {balance} RTM")
            else:
                all_success = False
        
        return all_success

    def test_updated_pricing_binarai_100_usd(self):
        """Test BinarAi unlimited is now $100 (not $25)"""
        success, response = self.run_test(
            "Updated Pricing - BinarAi $100",
            "GET",
            "services/premium",
            200
        )
        
        if success:
            services = response.get('services', [])
            binarai_service = None
            
            # Find BinarAi unlimited service
            for service in services:
                if 'binarai' in service.get('name', '').lower() and 'unlimited' in service.get('name', '').lower():
                    binarai_service = service
                    break
            
            if binarai_service:
                price_usd = binarai_service.get('price_usd', 0)
                price_rtm = binarai_service.get('price_rtm', 0)
                name = binarai_service.get('name', '')
                
                print(f"   Service: {name}")
                print(f"   Price USD: ${price_usd}")
                print(f"   Price RTM: {price_rtm}")
                
                if price_usd == 100.0:
                    print(f"   ✅ CORRECT: BinarAi unlimited is $100 (updated from $25)")
                elif price_usd == 25.0:
                    print(f"   ❌ CRITICAL: BinarAi still priced at $25 (should be $100)!")
                    self.critical_failures.append("BinarAi pricing not updated to $100")
                    return False
                else:
                    print(f"   ⚠️ Unexpected BinarAi price: ${price_usd}")
            else:
                print(f"   ❌ CRITICAL: BinarAi unlimited service not found!")
                self.critical_failures.append("BinarAi unlimited service missing")
                return False
                
        return success

    def test_comprehensive_mainnet_integration(self):
        """Comprehensive test of all mainnet production requirements"""
        print(f"\n🔍 Comprehensive Mainnet Integration Test...")
        
        success, response = self.run_test(
            "Comprehensive Mainnet Integration",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            # Extract all key metrics
            blocks = response.get('blocks', 0)
            chain = response.get('chain', '')
            difficulty = response.get('difficulty', 0)
            hashrate = response.get('networkhashps', 0)
            connections = response.get('connections', 0)
            verification_progress = response.get('verificationprogress', 0)
            is_syncing = response.get('is_syncing', False)
            public_nodes = response.get('public_nodes_connected', [])
            
            print(f"   === MAINNET INTEGRATION SUMMARY ===")
            print(f"   Chain: {chain}")
            print(f"   Block Height: {blocks:,}")
            print(f"   Difficulty: {difficulty:,.0f}")
            print(f"   Hashrate: {hashrate/1e12:.2f} TH/s")
            print(f"   Connections: {connections}")
            print(f"   Sync Progress: {verification_progress*100:.2f}%")
            print(f"   Is Syncing: {is_syncing}")
            print(f"   Public Nodes: {len(public_nodes)}")
            
            # Comprehensive validation
            issues = []
            
            if chain != "main":
                issues.append(f"Not mainnet: {chain}")
            
            if blocks <= 2800000:
                issues.append(f"Block height too low: {blocks}")
                
            if difficulty <= 0:
                issues.append("Difficulty is zero")
                
            if hashrate <= 0:
                issues.append("Hashrate is zero")
                
            if connections <= 8:
                issues.append(f"Low connections: {connections}")
                
            if len(public_nodes) == 0:
                issues.append("No public nodes")
            
            if issues:
                print(f"   ❌ MAINNET INTEGRATION ISSUES:")
                for issue in issues:
                    print(f"      - {issue}")
                self.critical_failures.extend(issues)
                return False
            else:
                print(f"   ✅ MAINNET INTEGRATION FULLY OPERATIONAL")
                
        return success

def main():
    print("🚀 MAINNET PRODUCTION FIXES TESTING - RaptorQ Wallet")
    print("=" * 80)
    print("🎯 TESTING SPECIFIC USER REQUIREMENTS:")
    print("   1. Real Block Height from Raptoreum Network (not fake 347,825)")
    print("   2. Real Network Data (~2.5 TH/s hashrate, 45K-50K difficulty, up to 100 connections)")
    print("   3. Dynamic Best Block Information (not static 350,000)")
    print("   4. Console Commands Real Data (getblockchaininfo, getwalletinfo)")
    print("   5. Advertising Banner Active (header_banner with quantum content)")
    print("   6. Production Wallet Balance (0 RTM for new wallets, not fake 5000 RTM)")
    print("   7. Updated Pricing (BinarAi unlimited $100, not $25)")
    print("=" * 80)
    
    tester = MainnetProductionTester()
    
    # Define mainnet production tests in order of criticality
    mainnet_tests = [
        tester.test_real_block_height_from_raptoreum_network,
        tester.test_real_network_data_hashrate_difficulty,
        tester.test_dynamic_best_block_information,
        tester.test_public_nodes_connection,
        tester.test_console_commands_real_data,
        tester.test_advertising_banner_active,
        tester.test_production_wallet_balance_zero_rtm,
        tester.test_updated_pricing_binarai_100_usd,
        tester.test_comprehensive_mainnet_integration,
    ]
    
    print(f"📋 Total Mainnet Production Tests: {len(mainnet_tests)}")
    print(f"🔥 Starting MAINNET PRODUCTION TESTING...")
    print()
    
    # Run all mainnet production tests
    for i, test in enumerate(mainnet_tests):
        try:
            print(f"\n🚨 MAINNET TEST {i+1}/{len(mainnet_tests)}")
            success = test()
            if not success:
                print(f"   ❌ CRITICAL FAILURE in {test.__name__}")
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.critical_failures.append(f"{test.__name__}: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 80)
    print(f"📊 MAINNET PRODUCTION TEST RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.critical_failures:
        print(f"\n🚨 CRITICAL MAINNET PRODUCTION ISSUES:")
        for i, failure in enumerate(tester.critical_failures, 1):
            print(f"   {i}. ❌ {failure}")
        print(f"\n⚠️  MAINNET PRODUCTION DEPLOYMENT BLOCKED")
        print(f"🔧 {len(tester.critical_failures)} critical issues must be resolved")
        return 1
    else:
        print(f"\n✅ ALL MAINNET PRODUCTION FIXES VERIFIED!")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 MAINNET PRODUCTION READY - ALL TESTS PASSED!")
            return 0
        else:
            failed_tests = tester.tests_run - tester.tests_passed
            print(f"⚠️  {failed_tests} tests had issues - Review recommended")
            return 0

if __name__ == "__main__":
    sys.exit(main())