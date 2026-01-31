# RentMyVroom API

Vehicle Rental Platform API Documentation

**Version:** 1.0

---

## Table of Contents

- [auth](#auth)
- [users](#users)
- [vehicles](#vehicles)
- [bookings](#bookings)
- [messages](#messages)
- [reviews](#reviews)
- [uploads](#uploads)
- [Schemas](#schemas)

---

## auth
Authentication endpoints

### POST /auth/register
**Summary**: Register a new user

#### Request Body

**Content-Type**: `application/json`

Schema: [RegisterDto](#registerdto)

#### Responses

| Status | Description |
|---|---|
| 201 | User successfully registered |
| 409 | Email already registered |

---

### POST /auth/login
**Summary**: Login user

#### Request Body

**Content-Type**: `application/json`

Schema: [LoginDto](#logindto)

#### Responses

| Status | Description |
|---|---|
| 200 | User successfully logged in |
| 401 | Invalid credentials |

---

### POST /auth/refresh
**Summary**: Refresh access token

#### Request Body

**Content-Type**: `application/json`

Schema: [RefreshTokenDto](#refreshtokendto)

#### Responses

| Status | Description |
|---|---|
| 200 | Token successfully refreshed |
| 401 | Invalid refresh token |

---

### POST /auth/logout
**Summary**: Logout user

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [RefreshTokenDto](#refreshtokendto)

#### Responses

| Status | Description |
|---|---|
| 200 | User successfully logged out |

---

### GET /auth/profile
**Summary**: Get current user profile

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | User profile retrieved |

---

## users
User management endpoints

### POST /users/upload-license
**Summary**: Upload driving license (Renter only)

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [UploadLicenseDto](#uploadlicensedto)

#### Responses

| Status | Description |
|---|---|
| 200 | License uploaded successfully |
| 403 | Only renters can upload licenses |

---

### PATCH /users/approve/{userId}
**Summary**: Approve or reject license (Admin only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| userId | path | Yes |  | number |

#### Request Body

**Content-Type**: `application/json`

Schema: [ApproveLicenseDto](#approvelicensedto)

#### Responses

| Status | Description |
|---|---|
| 200 | License status updated |
| 403 | Admin access required |

---

### GET /users/me
**Summary**: Get current user profile

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | Profile retrieved successfully |

---

### PATCH /users/me
**Summary**: Update current user profile

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [UpdateProfileDto](#updateprofiledto)

#### Responses

| Status | Description |
|---|---|
| 200 | Profile updated successfully |

---

### GET /users/pending-licenses
**Summary**: Get pending license approvals (Admin only)

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | Pending licenses retrieved |

---

## vehicles
Vehicle management endpoints

### POST /vehicles
**Summary**: Create a new vehicle (Merchant only)

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [CreateVehicleDto](#createvehicledto)

#### Responses

| Status | Description |
|---|---|
| 201 | Vehicle created successfully |
| 403 | Merchant access required |

---

### GET /vehicles
**Summary**: Get all vehicles

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| isAvailable | query | No |  | boolean |

#### Responses

| Status | Description |
|---|---|
| 200 | Vehicles retrieved successfully |

---

### GET /vehicles/my
**Summary**: Get my vehicles (Merchant only)

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | Vehicles retrieved successfully |

---

### GET /vehicles/{id}
**Summary**: Get vehicle by ID

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Responses

| Status | Description |
|---|---|
| 200 | Vehicle retrieved successfully |
| 404 | Vehicle not found |

---

### PATCH /vehicles/{id}
**Summary**: Update vehicle (Merchant only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Request Body

**Content-Type**: `application/json`

Schema: [UpdateVehicleDto](#updatevehicledto)

#### Responses

| Status | Description |
|---|---|
| 200 | Vehicle updated successfully |
| 403 | You can only update your own vehicles |
| 404 | Vehicle not found |

---

### DELETE /vehicles/{id}
**Summary**: Delete vehicle (Merchant only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Responses

| Status | Description |
|---|---|
| 200 | Vehicle deleted successfully |
| 403 | You can only delete your own vehicles |
| 404 | Vehicle not found |

---

## bookings
Booking management endpoints

### POST /bookings
**Summary**: Create a new booking (Renter only)

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [CreateBookingDto](#createbookingdto)

#### Responses

| Status | Description |
|---|---|
| 201 | Booking created successfully |
| 403 | License must be approved |

---

### GET /bookings/renter
**Summary**: Get my bookings as renter

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | Bookings retrieved successfully |

---

### GET /bookings/merchant
**Summary**: Get my bookings as merchant

**Security**: Bearer Auth

#### Responses

| Status | Description |
|---|---|
| 200 | Bookings retrieved successfully |

---

### PATCH /bookings/{id}/accept
**Summary**: Accept a booking (Merchant only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Request Body

**Content-Type**: `application/json`

Schema: [UpdateBookingStatusDto](#updatebookingstatusdto)

#### Responses

| Status | Description |
|---|---|
| 200 | Booking accepted |
| 403 | Can only manage your own bookings |

---

### PATCH /bookings/{id}/reject
**Summary**: Reject a booking (Merchant only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Request Body

**Content-Type**: `application/json`

Schema: [UpdateBookingStatusDto](#updatebookingstatusdto)

#### Responses

| Status | Description |
|---|---|
| 200 | Booking rejected |
| 403 | Can only manage your own bookings |

---

### PATCH /bookings/{id}/complete
**Summary**: Mark booking as completed (Merchant only)

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| id | path | Yes |  | number |

#### Responses

| Status | Description |
|---|---|
| 200 | Booking completed |
| 403 | Can only manage your own bookings |

---

## messages
Messaging endpoints

### POST /messages/{bookingId}
**Summary**: Send a message for a booking

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| bookingId | path | Yes |  | number |

#### Request Body

**Content-Type**: `application/json`

Schema: [CreateMessageDto](#createmessagedto)

#### Responses

| Status | Description |
|---|---|
| 201 | Message sent successfully |
| 403 | Can only message for your own bookings |

---

### GET /messages/{bookingId}
**Summary**: Get messages for a booking

**Security**: Bearer Auth

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| bookingId | path | Yes |  | number |

#### Responses

| Status | Description |
|---|---|
| 200 | Messages retrieved successfully |
| 403 | Can only view your own booking messages |

---

## reviews
Review endpoints

### POST /reviews
**Summary**: Create a review (Renter only)

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [CreateReviewDto](#createreviewdto)

#### Responses

| Status | Description |
|---|---|
| 201 | Review created successfully |
| 400 | Can only review completed bookings |

---

### GET /reviews/merchant/{merchantId}
**Summary**: Get reviews for a merchant

#### Parameters

| Name | In | Required | Description | Type |
|---|---|---|---|---|
| merchantId | path | Yes |  | number |

#### Responses

| Status | Description |
|---|---|
| 200 | Reviews retrieved successfully |

---

## uploads
File upload endpoints

### POST /uploads/presign
**Summary**: Get presigned URL for file upload

**Security**: Bearer Auth

#### Request Body

**Content-Type**: `application/json`

Schema: [GetPresignedUrlDto](#getpresignedurldto)

#### Responses

| Status | Description |
|---|---|
| 200 | Presigned URL generated successfully |

---

# Schemas

## RegisterDto

| Property | Type | Description | Example |
|---|---|---|---|
| email | string |  **(Required)** | `john.doe@example.com` |
| password | string |  **(Required)** | `SecurePassword123!` |
| firstName | string |  **(Required)** | `John` |
| lastName | string |  **(Required)** | `Doe` |
| phone | string |  | `+1234567890` |
| role | Enum(MERCHANT, RENTER, ADMIN) |  **(Required)** | `RENTER` |
| businessName | string |  | `My Business` |
| businessAddress | string |  | `123 Business St` |

## LoginDto

| Property | Type | Description | Example |
|---|---|---|---|
| email | string |  **(Required)** | `john.doe@example.com` |
| password | string |  **(Required)** | `SecurePassword123!` |

## RefreshTokenDto

| Property | Type | Description | Example |
|---|---|---|---|
| refreshToken | string |  **(Required)** |  |

## UploadLicenseDto

| Property | Type | Description | Example |
|---|---|---|---|
| licenseUrl | string |  **(Required)** | `https://r2.example.com/license.jpg` |

## ApproveLicenseDto

| Property | Type | Description | Example |
|---|---|---|---|
| status | Enum(PENDING, APPROVED, REJECTED) |  **(Required)** | `APPROVED` |

## UpdateProfileDto

| Property | Type | Description | Example |
|---|---|---|---|
| firstName | string |  |  |
| lastName | string |  |  |
| phone | string |  |  |
| businessName | string |  |  |
| businessAddress | string |  |  |

## CreateVehicleDto

| Property | Type | Description | Example |
|---|---|---|---|
| make | string |  **(Required)** | `Toyota` |
| model | string |  **(Required)** | `Camry` |
| year | number |  **(Required)** | `2022` |
| color | string |  **(Required)** | `Black` |
| licensePlate | string |  **(Required)** | `ABC-1234` |
| pricePerHour | number |  **(Required)** | `10.5` |
| pricePerDay | number |  **(Required)** | `75` |
| seats | number |  **(Required)** | `5` |
| fuelType | string |  **(Required)** | `Petrol` |
| transmission | string |  **(Required)** | `Automatic` |
| mileage | number |  | `50000` |
| description | string |  | `Comfortable sedan perfect for city driving` |
| features | Array<string> |  | `AC,GPS,Bluetooth` |
| images | Array<string> |  | `https://example.com/image1.jpg` |
| isAvailable | boolean |  | `true` |

## UpdateVehicleDto

| Property | Type | Description | Example |
|---|---|---|---|
| make | string |  |  |
| model | string |  |  |
| year | number |  |  |
| color | string |  |  |
| pricePerHour | number |  |  |
| pricePerDay | number |  |  |
| seats | number |  |  |
| fuelType | string |  |  |
| transmission | string |  |  |
| mileage | number |  |  |
| description | string |  |  |
| features | Array<string> |  |  |
| images | Array<string> |  |  |
| isAvailable | boolean |  |  |

## CreateBookingDto

| Property | Type | Description | Example |
|---|---|---|---|
| vehicleId | number |  **(Required)** | `1` |
| startDate | string |  **(Required)** | `2024-02-01T10:00:00Z` |
| endDate | string |  **(Required)** | `2024-02-05T10:00:00Z` |
| renterNotes | string |  | `Need the car for a weekend trip` |

## UpdateBookingStatusDto

| Property | Type | Description | Example |
|---|---|---|---|
| merchantNotes | string |  | `Approved for rental` |

## CreateMessageDto

| Property | Type | Description | Example |
|---|---|---|---|
| content | string |  **(Required)** | `When can I pick up the vehicle?` |

## CreateReviewDto

| Property | Type | Description | Example |
|---|---|---|---|
| bookingId | number |  **(Required)** | `1` |
| rating | number |  **(Required)** | `5` |
| comment | string |  | `Great experience! The car was clean and well-maintained.` |

## GetPresignedUrlDto

| Property | Type | Description | Example |
|---|---|---|---|
| fileName | string |  **(Required)** | `image.jpg` |
| contentType | string |  **(Required)** | `image/jpeg` |
| fileType | Enum(vehicle-image, license) |  **(Required)** | `vehicle-image` |

