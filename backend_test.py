#!/usr/bin/env python3
"""
Backend API Testing for Rent My Vroom Application
Tests the backend API endpoints and documents missing functionality.
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class RentMyVroomTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.merchant_token = None
        self.renter_token = None
        self.merchant_id = None
        self.renter_id = None
        self.vehicle_id = None
        self.booking_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_test("Basic API Connectivity", True, f"Status: {response.status_code}")
                else:
                    self.log_test("Basic API Connectivity", False, f"Unexpected response: {data}")
            else:
                self.log_test("Basic API Connectivity", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Basic API Connectivity", False, f"Connection error: {str(e)}")

    def test_status_endpoints(self):
        """Test the implemented status check endpoints"""
        # Test POST /api/status
        try:
            payload = {"client_name": "test_client"}
            response = requests.post(f"{self.api_url}/status", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "client_name" in data and "timestamp" in data:
                    self.log_test("POST /api/status", True, f"Created status check with ID: {data['id']}")
                else:
                    self.log_test("POST /api/status", False, f"Missing fields in response: {data}")
            else:
                self.log_test("POST /api/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/status", False, f"Error: {str(e)}")

        # Test GET /api/status
        try:
            response = requests.get(f"{self.api_url}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/status", True, f"Retrieved {len(data)} status checks")
                else:
                    self.log_test("GET /api/status", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("GET /api/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/status", False, f"Error: {str(e)}")

    def test_authentication_endpoints(self):
        """Test authentication endpoints (expected to be missing)"""
        # Test POST /auth/register
        merchant_data = {
            "email": "merchant@test.com",
            "password": "Test123!",
            "firstName": "John",
            "lastName": "Doe",
            "role": "MERCHANT",
            "businessName": "Test Rentals",
            "businessAddress": "123 Main St"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/register", json=merchant_data, timeout=10)
            if response.status_code == 200:
                self.log_test("POST /auth/register (Merchant)", True, "Merchant registration successful")
            else:
                self.log_test("POST /auth/register (Merchant)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /auth/register (Merchant)", False, f"Endpoint not implemented: {str(e)}")

        # Test POST /auth/login
        login_data = {"email": "merchant@test.com", "password": "Test123!"}
        try:
            response = requests.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.merchant_token = data["access_token"]
                    self.log_test("POST /auth/login", True, "Login successful, token received")
                else:
                    self.log_test("POST /auth/login", False, f"No access_token in response: {data}")
            else:
                self.log_test("POST /auth/login", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /auth/login", False, f"Endpoint not implemented: {str(e)}")

    def test_vehicle_endpoints(self):
        """Test vehicle management endpoints (expected to be missing)"""
        if not self.merchant_token:
            self.log_test("Vehicle Endpoints", False, "No merchant token available - skipping vehicle tests")
            return

        headers = {"Authorization": f"Bearer {self.merchant_token}"}
        
        # Test POST /vehicles
        vehicle_data = {
            "make": "Toyota",
            "model": "Camry",
            "year": 2022,
            "color": "Black",
            "licensePlate": "ABC123",
            "pricePerHour": 10,
            "pricePerDay": 75,
            "seats": 5,
            "fuelType": "Petrol",
            "transmission": "Automatic",
            "location": "Downtown",
            "description": "Great car",
            "features": ["AC", "GPS"],
            "images": ["data:image/jpeg;base64,test"]
        }
        
        try:
            response = requests.post(f"{self.api_url}/vehicles", json=vehicle_data, headers=headers, timeout=10)
            if response.status_code == 201:
                data = response.json()
                if "id" in data:
                    self.vehicle_id = data["id"]
                    self.log_test("POST /vehicles", True, f"Vehicle created with ID: {self.vehicle_id}")
                else:
                    self.log_test("POST /vehicles", False, f"No ID in response: {data}")
            else:
                self.log_test("POST /vehicles", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /vehicles", False, f"Endpoint not implemented: {str(e)}")

        # Test GET /vehicles
        try:
            response = requests.get(f"{self.api_url}/vehicles", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /vehicles", True, f"Retrieved {len(data)} vehicles")
                else:
                    self.log_test("GET /vehicles", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("GET /vehicles", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /vehicles", False, f"Endpoint not implemented: {str(e)}")

    def test_booking_endpoints(self):
        """Test booking endpoints (expected to be missing)"""
        if not self.renter_token or not self.vehicle_id:
            self.log_test("Booking Endpoints", False, "No renter token or vehicle ID - skipping booking tests")
            return

        headers = {"Authorization": f"Bearer {self.renter_token}"}
        
        # Test POST /bookings
        booking_data = {
            "vehicleId": self.vehicle_id,
            "startDate": (datetime.now() + timedelta(days=1)).isoformat(),
            "endDate": (datetime.now() + timedelta(days=3)).isoformat()
        }
        
        try:
            response = requests.post(f"{self.api_url}/bookings", json=booking_data, headers=headers, timeout=10)
            if response.status_code == 201:
                data = response.json()
                if "id" in data:
                    self.booking_id = data["id"]
                    self.log_test("POST /bookings", True, f"Booking created with ID: {self.booking_id}")
                else:
                    self.log_test("POST /bookings", False, f"No ID in response: {data}")
            else:
                self.log_test("POST /bookings", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /bookings", False, f"Endpoint not implemented: {str(e)}")

    def test_messaging_endpoints(self):
        """Test messaging endpoints (expected to be missing)"""
        if not self.booking_id:
            self.log_test("Messaging Endpoints", False, "No booking ID - skipping messaging tests")
            return

        # Test POST /messages/{bookingId}
        message_data = {"content": "When can I pick up?"}
        
        try:
            response = requests.post(f"{self.api_url}/messages/{self.booking_id}", 
                                   json=message_data, timeout=10)
            if response.status_code == 201:
                self.log_test("POST /messages/{bookingId}", True, "Message sent successfully")
            else:
                self.log_test("POST /messages/{bookingId}", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /messages/{bookingId}", False, f"Endpoint not implemented: {str(e)}")

    def test_review_endpoints(self):
        """Test review endpoints (expected to be missing)"""
        if not self.booking_id:
            self.log_test("Review Endpoints", False, "No booking ID - skipping review tests")
            return

        # Test POST /reviews
        review_data = {
            "bookingId": self.booking_id,
            "rating": 5,
            "comment": "Great experience!"
        }
        
        try:
            response = requests.post(f"{self.api_url}/reviews", json=review_data, timeout=10)
            if response.status_code == 201:
                self.log_test("POST /reviews", True, "Review created successfully")
            else:
                self.log_test("POST /reviews", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /reviews", False, f"Endpoint not implemented: {str(e)}")

    def test_port_4000_connectivity(self):
        """Test if anything is running on port 4000 as mentioned in the review request"""
        try:
            response = requests.get("http://localhost:4000/api/", timeout=5)
            if response.status_code == 200:
                self.log_test("Port 4000 Connectivity", True, "Service responding on port 4000")
            else:
                self.log_test("Port 4000 Connectivity", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Port 4000 Connectivity", False, f"No service on port 4000: {str(e)}")

    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("RENT MY VROOM BACKEND API TESTING")
        print("=" * 80)
        print()
        
        # Test basic connectivity first
        self.test_basic_connectivity()
        
        # Test port 4000 as mentioned in review request
        self.test_port_4000_connectivity()
        
        # Test implemented endpoints
        self.test_status_endpoints()
        
        # Test expected but missing endpoints
        self.test_authentication_endpoints()
        self.test_vehicle_endpoints()
        self.test_booking_endpoints()
        self.test_messaging_endpoints()
        self.test_review_endpoints()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print()
        
        print("DETAILED RESULTS:")
        print("-" * 40)
        
        # Group results
        implemented = []
        missing = []
        
        for result in self.test_results:
            if result["success"]:
                implemented.append(result)
            else:
                if "not implemented" in result["details"] or "Connection refused" in result["details"]:
                    missing.append(result)
                else:
                    # These are actual failures of implemented endpoints
                    print(f"❌ CRITICAL ISSUE: {result['test']}")
                    print(f"   {result['details']}")
                    print()
        
        if implemented:
            print("✅ WORKING ENDPOINTS:")
            for result in implemented:
                print(f"   • {result['test']}")
            print()
        
        if missing:
            print("❌ MISSING ENDPOINTS:")
            for result in missing:
                print(f"   • {result['test']}")
            print()
        
        print("ANALYSIS:")
        print("-" * 40)
        print("• Backend is running on port 8001, not port 4000 as expected in review request")
        print("• Only basic status check endpoints are implemented")
        print("• Complete Rent My Vroom functionality is missing:")
        print("  - Authentication system (/auth/register, /auth/login, /auth/profile, /auth/refresh)")
        print("  - Vehicle management (/vehicles)")
        print("  - Booking system (/bookings)")
        print("  - Messaging system (/messages)")
        print("  - Review system (/reviews)")
        print("  - User management (/users)")
        print("• Models and auth utilities are defined but not used in routes")
        print("• Frontend is configured to use port 4000 but backend runs on 8001")


if __name__ == "__main__":
    # Test both ports
    print("Testing backend on port 8001 (actual running port)...")
    tester = RentMyVroomTester("http://localhost:8001")
    tester.run_all_tests()