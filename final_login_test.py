#!/usr/bin/env python3
"""
Final Login Authentication Test
Verify all critical login endpoints are working after fixes
"""

import requests
import json
import time

def test_critical_login_endpoints():
    """Test the specific endpoints mentioned in the review request"""
    base_url = "https://raptorq-wallet.preview.emergentagent.com/api"
    
    print("🚨 FINAL LOGIN AUTHENTICATION TEST")
    print("=" * 60)
    
    tests = [
        # 1. Login Authentication Issues
        {
            "name": "Wallet Balance Loading (Login)",
            "method": "GET",
            "url": f"{base_url}/wallet/RBZTestAddress1234567890123456789/balance",
            "critical": True
        },
        {
            "name": "Blockchain Info (Password Screen)",
            "method": "GET", 
            "url": f"{base_url}/raptoreum/blockchain-info",
            "critical": True
        },
        {
            "name": "System Status (Session Validation)",
            "method": "GET",
            "url": f"{base_url}/system/status",
            "critical": True
        },
        
        # 2. Backend Service Health
        {
            "name": "Root API Endpoint",
            "method": "GET",
            "url": f"{base_url}/",
            "critical": True
        },
        {
            "name": "Premium Services",
            "method": "GET",
            "url": f"{base_url}/services/premium",
            "critical": False
        },
        
        # 3. Blockchain Integration
        {
            "name": "Smartnodes Owned",
            "method": "GET",
            "url": f"{base_url}/raptoreum/smartnodes/owned/RBZTestAddress1234567890123456789",
            "critical": False
        },
        {
            "name": "Smartnodes All (Fixed)",
            "method": "GET",
            "url": f"{base_url}/raptoreum/smartnodes/all",
            "critical": False
        },
        
        # 4. Recent Code Changes
        {
            "name": "Asset Explorer",
            "method": "GET",
            "url": f"{base_url}/raptoreum/assets/all",
            "critical": False
        },
        {
            "name": "Console RPC",
            "method": "POST",
            "url": f"{base_url}/raptoreum/rpc",
            "data": {"command": "help"},
            "critical": False
        }
    ]
    
    passed = 0
    failed = 0
    critical_failed = 0
    
    for test in tests:
        print(f"\n🔍 Testing {test['name']}...")
        
        try:
            if test['method'] == 'GET':
                response = requests.get(test['url'], timeout=10)
            else:
                response = requests.post(test['url'], json=test.get('data', {}), timeout=10)
            
            if response.status_code == 200:
                print(f"✅ PASSED - Status: {response.status_code}")
                passed += 1
                
                # Check specific response data
                if 'balance' in test['url']:
                    data = response.json()
                    balance = data.get('balance', 'N/A')
                    print(f"   Balance: {balance} RTM")
                    if balance == 5000.0:
                        print(f"   ❌ CRITICAL: Fake 5000 RTM balance!")
                        if test['critical']:
                            critical_failed += 1
                    else:
                        print(f"   ✅ Real balance")
                        
                elif 'blockchain-info' in test['url']:
                    data = response.json()
                    blocks = data.get('blocks', 0)
                    sync_progress = data.get('sync_progress_percent', 0)
                    print(f"   Block Height: {blocks}")
                    print(f"   Sync Progress: {sync_progress}%")
                    
                elif 'smartnodes/all' in test['url']:
                    data = response.json()
                    total_count = data.get('total_count', 0)
                    returned_count = data.get('returned_count', 0)
                    print(f"   Total Smartnodes: {total_count}")
                    print(f"   Returned: {returned_count}")
                    
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                print(f"   Error: {response.text[:200]}")
                failed += 1
                if test['critical']:
                    critical_failed += 1
                    
        except requests.exceptions.Timeout:
            print(f"❌ TIMEOUT")
            failed += 1
            if test['critical']:
                critical_failed += 1
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            failed += 1
            if test['critical']:
                critical_failed += 1
    
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"🚨 Critical Failed: {critical_failed}")
    
    if critical_failed == 0:
        print(f"\n🎉 LOGIN AUTHENTICATION SHOULD WORK")
        print(f"All critical endpoints are functioning properly")
        return True
    else:
        print(f"\n🚨 LOGIN AUTHENTICATION WILL FAIL")
        print(f"{critical_failed} critical endpoints are not working")
        return False

if __name__ == "__main__":
    success = test_critical_login_endpoints()
    exit(0 if success else 1)