#!/usr/bin/env python3
"""
Login Authentication Debug Test
Focus on debugging runtime errors during login process as requested
"""

import requests
import json
import time
from datetime import datetime

class LoginDebugTester:
    def __init__(self, base_url="https://raptorq-wallet.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.errors_found = []

    def log_error(self, test_name, error_details):
        """Log errors found during testing"""
        self.errors_found.append({
            "test": test_name,
            "error": error_details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, timeout=15):
        """Run a single API test with detailed error reporting"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            print(f"   Status Code: {response.status_code}")
            
            # Check for any 500 errors (server errors)
            if response.status_code >= 500:
                error_detail = f"Server Error {response.status_code}: {response.text}"
                self.log_error(name, error_detail)
                print(f"❌ SERVER ERROR: {error_detail}")
                return False, {}
            
            # Check for any 400 errors (client errors)
            if 400 <= response.status_code < 500:
                error_detail = f"Client Error {response.status_code}: {response.text}"
                self.log_error(name, error_detail)
                print(f"⚠️ CLIENT ERROR: {error_detail}")
                
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    # Check for any error messages in response
                    if 'error' in response_data:
                        self.log_error(name, f"Response contains error: {response_data['error']}")
                        print(f"⚠️ Response contains error: {response_data['error']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}: {response.text}"
                self.log_error(name, error_detail)
                print(f"❌ Failed - {error_detail}")
                return False, {}

        except requests.exceptions.Timeout:
            error_detail = f"Request timeout after {timeout}s"
            self.log_error(name, error_detail)
            print(f"❌ TIMEOUT: {error_detail}")
            return False, {}
        except requests.exceptions.ConnectionError as e:
            error_detail = f"Connection error: {str(e)}"
            self.log_error(name, error_detail)
            print(f"❌ CONNECTION ERROR: {error_detail}")
            return False, {}
        except Exception as e:
            error_detail = f"Unexpected error: {str(e)}"
            self.log_error(name, error_detail)
            print(f"❌ UNEXPECTED ERROR: {error_detail}")
            return False, {}

    def test_login_authentication_endpoints(self):
        """Test all authentication endpoints mentioned in review request"""
        print("🚨 TESTING LOGIN AUTHENTICATION ENDPOINTS")
        print("=" * 60)
        
        # Test wallet balance endpoint (for balance loading during login)
        test_addresses = [
            "RBZTestAddress1234567890123456789",
            "RNewWallet1234567890123456789012",
            "RFreshAddress123456789012345678"
        ]
        
        for address in test_addresses:
            success, response = self.run_test(
                f"Wallet Balance Loading - {address[:15]}...",
                "GET",
                f"wallet/{address}/balance",
                200
            )
            
            if success:
                balance = response.get('balance', 'N/A')
                print(f"   Balance: {balance} RTM")
                
                # Check for fake 5000 RTM balance
                if balance == 5000.0:
                    self.log_error(f"Wallet Balance - {address}", "CRITICAL: Fake 5000 RTM balance detected!")
                    print(f"   ❌ CRITICAL: Fake 5000 RTM balance!")
                elif isinstance(balance, (int, float)) and balance >= 0:
                    print(f"   ✅ Real balance returned")
                else:
                    self.log_error(f"Wallet Balance - {address}", f"Invalid balance format: {balance}")
                    print(f"   ⚠️ Invalid balance format")

    def test_blockchain_sync_endpoints(self):
        """Test blockchain sync endpoints for password screen"""
        print("\n🚨 TESTING BLOCKCHAIN SYNC ENDPOINTS")
        print("=" * 60)
        
        # Test blockchain info endpoint (for sync data during password screen)
        success, response = self.run_test(
            "Blockchain Info for Password Screen",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            blocks = response.get('blocks', 0)
            sync_progress = response.get('sync_progress_percent', 0)
            is_syncing = response.get('is_syncing', False)
            connections = response.get('connections', 0)
            
            print(f"   Block Height: {blocks}")
            print(f"   Sync Progress: {sync_progress}%")
            print(f"   Is Syncing: {is_syncing}")
            print(f"   Connections: {connections}")
            
            # Check for realistic data
            if blocks < 100000:
                self.log_error("Blockchain Info", f"Block height too low: {blocks}")
                print(f"   ❌ Block height suspiciously low")
            elif blocks > 2700000:
                print(f"   ✅ Realistic mainnet block height")
            else:
                print(f"   ⚠️ Block height may be outdated")
                
            # Check sync progress consistency
            if is_syncing and sync_progress >= 100:
                self.log_error("Blockchain Info", "Inconsistent sync data - shows 100% while syncing")
                print(f"   ❌ Inconsistent sync data")
            else:
                print(f"   ✅ Consistent sync data")

    def test_session_validation_endpoints(self):
        """Test session validation endpoints"""
        print("\n🚨 TESTING SESSION VALIDATION")
        print("=" * 60)
        
        # Test system status (general health check)
        success, response = self.run_test(
            "System Status for Session Validation",
            "GET",
            "system/status",
            200
        )
        
        if success:
            blockchain_status = response.get('blockchain', 'unknown')
            wallet_status = response.get('wallet', 'unknown')
            quantum_security = response.get('quantum_security', 'unknown')
            
            print(f"   Blockchain Status: {blockchain_status}")
            print(f"   Wallet Status: {wallet_status}")
            print(f"   Quantum Security: {quantum_security}")
            
            if blockchain_status == 'healthy' and wallet_status == 'healthy':
                print(f"   ✅ System healthy for login")
            else:
                self.log_error("System Status", f"Unhealthy system: blockchain={blockchain_status}, wallet={wallet_status}")
                print(f"   ❌ System not healthy for login")

    def test_backend_service_health(self):
        """Test core backend services health"""
        print("\n🚨 TESTING BACKEND SERVICE HEALTH")
        print("=" * 60)
        
        # Test root endpoint
        success, response = self.run_test(
            "Backend Root Endpoint",
            "GET",
            "",
            200
        )
        
        if success:
            message = response.get('message', '')
            version = response.get('version', '')
            created_by = response.get('created_by', '')
            
            print(f"   Message: {message}")
            print(f"   Version: {version}")
            print(f"   Created By: {created_by}")
            
            if 'RaptorQ' in message and 'Binarai' in created_by:
                print(f"   ✅ Proper branding")
            else:
                self.log_error("Root Endpoint", "Branding issues detected")
                print(f"   ⚠️ Branding issues")

    def test_blockchain_integration_errors(self):
        """Test blockchain integration for errors"""
        print("\n🚨 TESTING BLOCKCHAIN INTEGRATION ERRORS")
        print("=" * 60)
        
        # Test continuous sync endpoints
        success, response = self.run_test(
            "Continuous Sync Status",
            "GET",
            "raptoreum/blockchain-info",
            200
        )
        
        if success:
            # Check for any error indicators in response
            error_indicators = ['error', 'failed', 'timeout', 'unavailable']
            response_str = json.dumps(response).lower()
            
            found_errors = [indicator for indicator in error_indicators if indicator in response_str]
            if found_errors:
                self.log_error("Blockchain Integration", f"Error indicators found: {found_errors}")
                print(f"   ⚠️ Error indicators found: {found_errors}")
            else:
                print(f"   ✅ No error indicators in blockchain response")
        
        # Test network stats loading
        if success:
            hashrate = response.get('networkhashps', 0)
            difficulty = response.get('difficulty', 0)
            
            print(f"   Network Hashrate: {hashrate}")
            print(f"   Difficulty: {difficulty}")
            
            if hashrate > 0 and difficulty > 0:
                print(f"   ✅ Network stats loading properly")
            else:
                self.log_error("Network Stats", f"Invalid network stats: hashrate={hashrate}, difficulty={difficulty}")
                print(f"   ❌ Invalid network stats")

    def test_smartnode_loading(self):
        """Test smartnode loading functionality"""
        print("\n🚨 TESTING SMARTNODE LOADING")
        print("=" * 60)
        
        test_address = "RBZTestAddress1234567890123456789"
        
        # Test owned smartnodes
        success, response = self.run_test(
            "Owned Smartnodes Loading",
            "GET",
            f"raptoreum/smartnodes/owned/{test_address}",
            200
        )
        
        if success:
            smartnodes = response.get('smartnodes', [])
            print(f"   Owned Smartnodes: {len(smartnodes)}")
            
            if len(smartnodes) > 0:
                node = smartnodes[0]
                status = node.get('status', 'unknown')
                earnings = node.get('earnings', 0)
                print(f"   Sample Node Status: {status}")
                print(f"   Sample Node Earnings: {earnings} RTM")
                
                if status in ['ENABLED', 'PRE_ENABLED', 'NEW_START_REQUIRED']:
                    print(f"   ✅ Valid smartnode status")
                else:
                    self.log_error("Smartnode Status", f"Invalid status: {status}")
                    print(f"   ⚠️ Invalid smartnode status")
        
        # Test all smartnodes (with shorter timeout due to previous timeout issues)
        success, response = self.run_test(
            "All Smartnodes Loading",
            "GET",
            "raptoreum/smartnodes/all",
            200,
            timeout=10
        )
        
        if success:
            all_smartnodes = response.get('smartnodes', [])
            total_count = response.get('total_count', 0)
            print(f"   Network Smartnodes: {len(all_smartnodes)}")
            print(f"   Total Count: {total_count}")
            
            if len(all_smartnodes) > 0:
                print(f"   ✅ Smartnode network data loaded")
            else:
                print(f"   ⚠️ No network smartnodes found")

    def test_recent_code_changes(self):
        """Test recent code additions for errors"""
        print("\n🚨 TESTING RECENT CODE CHANGES")
        print("=" * 60)
        
        # Test real smartnode API calls
        test_address = "RBZTestAddress1234567890123456789"
        success, response = self.run_test(
            "Real Smartnode API Calls",
            "GET",
            f"raptoreum/smartnodes/owned/{test_address}",
            200
        )
        
        # Test asset explorer integration
        success, response = self.run_test(
            "Asset Explorer Integration",
            "GET",
            "raptoreum/assets/all",
            200
        )
        
        if success:
            assets = response.get('assets', [])
            print(f"   Assets Available: {len(assets)}")
            
        # Test console RPC commands
        success, response = self.run_test(
            "Console RPC Commands",
            "POST",
            "raptoreum/rpc",
            200,
            data={"command": "help"}
        )
        
        if success:
            result = response.get('result', '')
            execution_time = response.get('execution_time', 'N/A')
            print(f"   RPC Execution Time: {execution_time}")
            
            if 'Available Raptoreum RPC Commands' in str(result):
                print(f"   ✅ RPC console working")
            else:
                self.log_error("RPC Console", "RPC help command not working properly")
                print(f"   ❌ RPC console issues")

    def test_import_and_syntax_errors(self):
        """Test for import errors and syntax issues"""
        print("\n🚨 TESTING FOR IMPORT/SYNTAX ERRORS")
        print("=" * 60)
        
        # Test multiple endpoints quickly to catch import errors
        endpoints_to_test = [
            ("Root API", "GET", "", 200),
            ("System Status", "GET", "system/status", 200),
            ("Premium Services", "GET", "services/premium", 200),
            ("Legal Disclaimer", "GET", "legal/disclaimer", 200),
            ("Platform Guides", "GET", "platform/guides", 200)
        ]
        
        import_errors = 0
        for name, method, endpoint, expected_status in endpoints_to_test:
            success, response = self.run_test(name, method, endpoint, expected_status, timeout=5)
            if not success:
                import_errors += 1
        
        if import_errors == 0:
            print(f"   ✅ No import/syntax errors detected")
        else:
            print(f"   ❌ {import_errors} endpoints failed - possible import/syntax issues")

    def run_all_login_debug_tests(self):
        """Run all login debugging tests"""
        print("🚨 URGENT: DEBUG RUNTIME ERRORS DURING LOGIN PROCESS")
        print("=" * 80)
        print("Focus: Authentication endpoints, blockchain sync, session validation")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test categories
        self.test_login_authentication_endpoints()
        self.test_blockchain_sync_endpoints()
        self.test_session_validation_endpoints()
        self.test_backend_service_health()
        self.test_blockchain_integration_errors()
        self.test_smartnode_loading()
        self.test_recent_code_changes()
        self.test_import_and_syntax_errors()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print("\n" + "=" * 80)
        print("🔍 LOGIN DEBUG TEST SUMMARY")
        print("=" * 80)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"⏱️ Duration: {duration:.2f} seconds")
        
        if self.errors_found:
            print(f"\n🚨 CRITICAL ERRORS FOUND ({len(self.errors_found)}):")
            print("-" * 60)
            for i, error in enumerate(self.errors_found, 1):
                print(f"{i}. {error['test']}")
                print(f"   Error: {error['error']}")
                print(f"   Time: {error['timestamp']}")
                print()
        else:
            print(f"\n✅ NO CRITICAL ERRORS FOUND")
        
        # Determine if login should work
        critical_failures = len([e for e in self.errors_found if 'CRITICAL' in e['error']])
        if critical_failures > 0:
            print(f"🚨 LOGIN LIKELY TO FAIL - {critical_failures} critical issues found")
        elif len(self.errors_found) > 5:
            print(f"⚠️ LOGIN MAY HAVE ISSUES - {len(self.errors_found)} errors found")
        else:
            print(f"✅ LOGIN SHOULD WORK - No critical issues detected")

if __name__ == "__main__":
    tester = LoginDebugTester()
    tester.run_all_login_debug_tests()