"""
Test script to verify backend endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*50)
    print("Testing Health Check Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_registration_otp():
    """Test sending registration OTP"""
    print("\n" + "="*50)
    print("Testing Send Registration OTP")
    print("="*50)
    
    data = {"mobileNumber": "03001234567"}
    response = requests.post(f"{BASE_URL}/auth/send-registration-otp", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json().get('otp')
    return None

def test_register(otp):
    """Test user registration"""
    print("\n" + "="*50)
    print("Testing User Registration")
    print("="*50)
    
    data = {
        "name": "Test",
        "surname": "User",
        "mobileNumber": "03001234567",
        "email": "test@example.com",
        "province": "Punjab",
        "district": "Lahore",
        "tehsil": "Model Town",
        "village": "Test Village",
        "address": "123 Test Street",
        "otpCode": otp
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json().get('token')
    return None

def test_login():
    """Test user login"""
    print("\n" + "="*50)
    print("Testing Send Login OTP")
    print("="*50)
    
    data = {"mobileNumber": "03001234567"}
    response = requests.post(f"{BASE_URL}/auth/send-login-otp", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        otp = response.json().get('otp')
        
        print("\n" + "="*50)
        print("Testing User Login")
        print("="*50)
        
        login_data = {
            "mobileNumber": "03001234567",
            "otpCode": otp
        }
        
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {login_response.status_code}")
        print(f"Response: {json.dumps(login_response.json(), indent=2)}")
        
        if login_response.status_code == 200:
            return login_response.json().get('token')
    
    return None

def test_get_profile(token):
    """Test getting user profile"""
    print("\n" + "="*50)
    print("Testing Get User Profile")
    print("="*50)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/user/profile", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" GrowGuardians Backend API Test Suite")
    print("="*60)
    
    try:
        # Test 1: Health Check
        if not test_health():
            print("\n❌ Health check failed! Backend may not be running.")
            exit(1)
        
        print("\n✅ Health check passed!")
        
        # Test 2: Registration Flow
        otp = test_registration_otp()
        if otp:
            print(f"\n✅ OTP sent successfully! OTP: {otp}")
            
            token = test_register(otp)
            if token:
                print(f"\n✅ Registration successful!")
                print(f"Token: {token[:50]}...")
                
                # Test 3: Get Profile
                if test_get_profile(token):
                    print("\n✅ Profile retrieved successfully!")
            else:
                print("\n❌ Registration failed!")
        
        # Test 4: Login Flow
        print("\n" + "="*60)
        print(" Testing Login Flow (if user already exists)")
        print("="*60)
        
        login_token = test_login()
        if login_token:
            print(f"\n✅ Login successful!")
            print(f"Token: {login_token[:50]}...")
            
            # Test profile with login token
            if test_get_profile(login_token):
                print("\n✅ Profile retrieved with login token!")
        
        print("\n" + "="*60)
        print(" ✅ All Tests Completed!")
        print("="*60)
        print("\nBackend is working properly! ✨")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend!")
        print("Please make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
