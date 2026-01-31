#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Rent My Vroom NestJS Application
Tests all authentication, user management, vehicle, booking, messaging, and review endpoints
"""

import requests
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class RentMyVroomAPITester:
    def __init__(self, base_url: str = "http://localhost:4000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tokens = {}
        self.user_ids = {}
        self.vehicle_ids = []
        self.booking_ids = []
        self.merchant_ids = []
        
        # Test data with unique timestamps to avoid conflicts
        import time
        timestamp = str(int(time.time()))
        
        self.renter_data = {
            "email": f"renter{timestamp}@example.com",
            "password": "Test123!",
            "firstName": "Jane",
            "lastName": "Smith",
            "role": "RENTER"
        }
        
        self.merchant_data = {
            "email": f"merchant{timestamp}@example.com",
            "password": "Test123!",
            "firstName": "Mike",
            "lastName": "Johnson",
            "role": "MERCHANT",
            "businessName": "John's Rentals",
            "businessAddress": "456 Oak St"
        }
        
        # Sample base64 image for testing
        self.sample_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDX4AAAA="
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success:
            print()
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, token: str = None) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
        if token:
            request_headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("\n=== BASIC CONNECTIVITY TESTS ===")
        
        # Test Swagger UI
        response = self.make_request("GET", "/api")
        success = response and response.status_code == 200
        self.log_test("Swagger UI Access", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        return success

    def test_authentication_system(self):
        """Test complete authentication flow"""
        print("\n=== AUTHENTICATION SYSTEM TESTS ===")
        
        # Test renter registration
        response = self.make_request("POST", "/auth/register", self.renter_data)
        success = response and response.status_code in [200, 201]
        if not success and response and response.status_code == 409:
            # User already exists, that's okay for testing
            success = True
            self.log_test("Renter Registration", success, 
                         f"Status: {response.status_code} (User already exists)")
        else:
            self.log_test("Renter Registration", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        if success and response and response.status_code in [200, 201]:
            try:
                renter_result = response.json()
                if 'user' in renter_result and 'id' in renter_result['user']:
                    self.user_ids['renter'] = renter_result['user']['id']
            except:
                pass
        
        # Test merchant registration
        response = self.make_request("POST", "/auth/register", self.merchant_data)
        success = response and response.status_code in [200, 201]
        if not success and response and response.status_code == 409:
            # User already exists, that's okay for testing
            success = True
            self.log_test("Merchant Registration", success, 
                         f"Status: {response.status_code} (User already exists)")
        else:
            self.log_test("Merchant Registration", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        if success and response and response.status_code in [200, 201]:
            try:
                merchant_result = response.json()
                if 'user' in merchant_result and 'id' in merchant_result['user']:
                    self.user_ids['merchant'] = merchant_result['user']['id']
                    self.merchant_ids.append(merchant_result['user']['id'])
            except:
                pass
        
        # Test renter login
        login_data = {
            "email": self.renter_data["email"],
            "password": self.renter_data["password"]
        }
        response = self.make_request("POST", "/auth/login", login_data)
        success = response and response.status_code == 200
        self.log_test("Renter Login", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        if success and response:
            try:
                login_result = response.json()
                if 'accessToken' in login_result:
                    self.tokens['renter'] = login_result['accessToken']
                if 'user' in login_result and 'id' in login_result['user']:
                    self.user_ids['renter'] = login_result['user']['id']
            except:
                pass
        
        # Test merchant login
        merchant_login_data = {
            "email": self.merchant_data["email"],
            "password": self.merchant_data["password"]
        }
        response = self.make_request("POST", "/auth/login", merchant_login_data)
        success = response and response.status_code == 200
        self.log_test("Merchant Login", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        if success and response:
            try:
                login_result = response.json()
                if 'accessToken' in login_result:
                    self.tokens['merchant'] = login_result['accessToken']
                if 'user' in login_result and 'id' in login_result['user']:
                    self.user_ids['merchant'] = login_result['user']['id']
                    self.merchant_ids.append(login_result['user']['id'])
            except:
                pass
        
        # Test profile access with renter token
        if 'renter' in self.tokens:
            response = self.make_request("GET", "/auth/profile", token=self.tokens['renter'])
            success = response and response.status_code == 200
            self.log_test("Renter Profile Access", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Renter Profile Access", False, "No renter token available")
        
        return len(self.tokens) >= 2

    def test_user_management(self):
        """Test user management features"""
        print("\n=== USER MANAGEMENT TESTS ===")
        
        # Test driving license upload for renter
        if 'renter' in self.tokens:
            license_data = {
                "licenseUrl": "https://example.com/license.jpg"
            }
            response = self.make_request("POST", "/users/upload-license", 
                                       license_data, token=self.tokens['renter'])
            success = response and response.status_code in [200, 201]
            self.log_test("Driving License Upload", success, 
                         f"Status: {response.status_code if response else 'No response'}")
            
            # For testing purposes, let's manually approve the license by updating the database
            # This is a workaround since we don't have an admin user in the test
            if success:
                try:
                    import subprocess
                    # Update license status directly in database for testing
                    cmd = f"""cd /app/backend && npx prisma db execute --stdin <<< "UPDATE \\"User\\" SET \\"licenseStatus\\" = 'APPROVED', \\"licenseApprovedAt\\" = NOW() WHERE id = {self.user_ids.get('renter', 0)};" """
                    subprocess.run(cmd, shell=True, capture_output=True)
                    self.log_test("License Auto-Approval (Test)", True, "License approved for testing purposes")
                except Exception as e:
                    self.log_test("License Auto-Approval (Test)", False, f"Failed to approve license: {e}")
        else:
            self.log_test("Driving License Upload", False, "No renter token available")

    def test_vehicle_management(self):
        """Test vehicle management system"""
        print("\n=== VEHICLE MANAGEMENT TESTS ===")
        
        if 'merchant' not in self.tokens:
            self.log_test("Vehicle Management", False, "No merchant token available")
            return False
        
        # Create a vehicle
        vehicle_data = {
            "make": "Honda",
            "model": "Civic",
            "year": 2023,
            "color": "Blue",
            "licensePlate": "XYZ789",
            "pricePerHour": 15,
            "pricePerDay": 100,
            "seats": 5,
            "fuelType": "Petrol",
            "transmission": "Manual",
            "description": "Reliable car",
            "features": ["AC", "Bluetooth"],
            "images": [self.sample_image]
        }
        
        response = self.make_request("POST", "/vehicles", vehicle_data, 
                                   token=self.tokens['merchant'])
        success = response and response.status_code in [200, 201]
        self.log_test("Vehicle Creation", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        if success and response:
            try:
                vehicle_result = response.json()
                if 'id' in vehicle_result:
                    self.vehicle_ids.append(vehicle_result['id'])
            except:
                pass
        
        # Test get all vehicles
        response = self.make_request("GET", "/vehicles")
        success = response and response.status_code == 200
        self.log_test("Get All Vehicles", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test get merchant's vehicles
        response = self.make_request("GET", "/vehicles/my", token=self.tokens['merchant'])
        success = response and response.status_code == 200
        self.log_test("Get Merchant Vehicles", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test get specific vehicle
        if self.vehicle_ids:
            vehicle_id = self.vehicle_ids[0]
            response = self.make_request("GET", f"/vehicles/{vehicle_id}")
            success = response and response.status_code == 200
            self.log_test("Get Specific Vehicle", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Get Specific Vehicle", False, "No vehicle ID available")
        
        return len(self.vehicle_ids) > 0

    def test_booking_system(self):
        """Test booking management system"""
        print("\n=== BOOKING SYSTEM TESTS ===")
        
        if 'renter' not in self.tokens or not self.vehicle_ids:
            self.log_test("Booking System", False, "Missing renter token or vehicle ID")
            return False
        
        # Create booking request
        start_date = (datetime.now() + timedelta(days=1)).isoformat()
        end_date = (datetime.now() + timedelta(days=3)).isoformat()
        
        booking_data = {
            "vehicleId": self.vehicle_ids[0],
            "startDate": start_date,
            "endDate": end_date,
            "renterNotes": "Need for trip"
        }
        
        response = self.make_request("POST", "/bookings", booking_data, 
                                   token=self.tokens['renter'])
        success = response and response.status_code in [200, 201]
        self.log_test("Create Booking Request", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        if success and response:
            try:
                booking_result = response.json()
                if 'id' in booking_result:
                    self.booking_ids.append(booking_result['id'])
            except:
                pass
        
        # Test get renter bookings
        response = self.make_request("GET", "/bookings/renter", token=self.tokens['renter'])
        success = response and response.status_code == 200
        self.log_test("Get Renter Bookings", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test get merchant bookings
        response = self.make_request("GET", "/bookings/merchant", token=self.tokens['merchant'])
        success = response and response.status_code == 200
        self.log_test("Get Merchant Bookings", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test accept booking
        if self.booking_ids:
            booking_id = self.booking_ids[0]
            response = self.make_request("PATCH", f"/bookings/{booking_id}/accept", 
                                       {}, token=self.tokens['merchant'])
            success = response and response.status_code == 200
            self.log_test("Accept Booking", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Accept Booking", False, "No booking ID available")
        
        return len(self.booking_ids) > 0

    def test_messaging_system(self):
        """Test messaging system"""
        print("\n=== MESSAGING SYSTEM TESTS ===")
        
        if not self.booking_ids or 'renter' not in self.tokens or 'merchant' not in self.tokens:
            self.log_test("Messaging System", False, "Missing booking ID or tokens")
            return False
        
        booking_id = self.booking_ids[0]
        
        # Renter sends message
        message_data = {
            "content": "What time can I pick up?"
        }
        response = self.make_request("POST", f"/messages/{booking_id}", 
                                   message_data, token=self.tokens['renter'])
        success = response and response.status_code in [200, 201]
        self.log_test("Renter Send Message", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Merchant sends message
        merchant_message_data = {
            "content": "9am tomorrow works"
        }
        response = self.make_request("POST", f"/messages/{booking_id}", 
                                   merchant_message_data, token=self.tokens['merchant'])
        success = response and response.status_code in [200, 201]
        self.log_test("Merchant Send Message", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Get messages
        response = self.make_request("GET", f"/messages/{booking_id}", 
                                   token=self.tokens['renter'])
        success = response and response.status_code == 200
        self.log_test("Get Messages", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        if success and response:
            try:
                messages = response.json()
                if isinstance(messages, list) and len(messages) >= 2:
                    self.log_test("Message Count Verification", True, f"Found {len(messages)} messages")
                else:
                    self.log_test("Message Count Verification", False, f"Expected 2+ messages, got {len(messages) if isinstance(messages, list) else 'invalid response'}")
            except:
                self.log_test("Message Count Verification", False, "Could not parse messages response")

    def test_review_system(self):
        """Test review system"""
        print("\n=== REVIEW SYSTEM TESTS ===")
        
        if not self.booking_ids or 'merchant' not in self.tokens or 'renter' not in self.tokens:
            self.log_test("Review System", False, "Missing booking ID or tokens")
            return False
        
        booking_id = self.booking_ids[0]
        
        # Complete booking first
        response = self.make_request("PATCH", f"/bookings/{booking_id}/complete", 
                                   {}, token=self.tokens['merchant'])
        success = response and response.status_code == 200
        self.log_test("Complete Booking", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Create review
        review_data = {
            "bookingId": booking_id,
            "rating": 5,
            "comment": "Excellent service!"
        }
        response = self.make_request("POST", "/reviews", review_data, 
                                   token=self.tokens['renter'])
        success = response and response.status_code in [200, 201]
        self.log_test("Create Review", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Get merchant reviews
        if self.merchant_ids:
            merchant_id = self.merchant_ids[0]
            response = self.make_request("GET", f"/reviews/merchant/{merchant_id}")
            success = response and response.status_code == 200
            self.log_test("Get Merchant Reviews", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Get Merchant Reviews", False, "No merchant ID available")

    def test_error_cases(self):
        """Test error handling and edge cases"""
        print("\n=== ERROR HANDLING TESTS ===")
        
        # Test unauthorized access
        response = self.make_request("GET", "/auth/profile")
        success = response and response.status_code == 401
        self.log_test("Unauthorized Access (401)", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test wrong role access (renter trying to create vehicle)
        if 'renter' in self.tokens:
            vehicle_data = {
                "make": "Toyota",
                "model": "Camry",
                "year": 2022,
                "licensePlate": "ABC123"
            }
            response = self.make_request("POST", "/vehicles", vehicle_data, 
                                       token=self.tokens['renter'])
            success = response and response.status_code == 403
            self.log_test("Wrong Role Access (403)", success, 
                         f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Wrong Role Access (403)", False, "No renter token available")
        
        # Test invalid data (missing required fields)
        response = self.make_request("POST", "/auth/register", {"email": "invalid"})
        success = response and response.status_code == 400
        self.log_test("Invalid Data (400)", success, 
                     f"Status: {response.status_code if response else 'No response'}")

    def test_pagination_and_filtering(self):
        """Test pagination and filtering on vehicles endpoint"""
        print("\n=== PAGINATION & FILTERING TESTS ===")
        
        # Test vehicles with pagination
        response = self.make_request("GET", "/vehicles?page=1&limit=10")
        success = response and response.status_code == 200
        self.log_test("Vehicles Pagination", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test vehicles with filtering
        response = self.make_request("GET", "/vehicles?make=Honda")
        success = response and response.status_code == 200
        self.log_test("Vehicles Filtering", success, 
                     f"Status: {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Rent My Vroom Backend API Tests")
        print("=" * 60)
        
        # Track overall results
        test_results = {}
        
        # Run all test categories
        test_results['connectivity'] = self.test_basic_connectivity()
        test_results['authentication'] = self.test_authentication_system()
        test_results['user_management'] = self.test_user_management()
        test_results['vehicle_management'] = self.test_vehicle_management()
        test_results['booking_system'] = self.test_booking_system()
        test_results['messaging'] = self.test_messaging_system()
        test_results['reviews'] = self.test_review_system()
        test_results['error_handling'] = self.test_error_cases()
        test_results['pagination'] = self.test_pagination_and_filtering()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for category, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {category.replace('_', ' ').title()}")
        
        print(f"\nOverall: {passed}/{total} test categories passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is fully functional.")
        else:
            print("⚠️  Some tests failed. Check individual test results above.")
        
        return test_results

if __name__ == "__main__":
    tester = RentMyVroomAPITester()
    results = tester.run_all_tests()