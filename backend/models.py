from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    MERCHANT = "MERCHANT"
    RENTER = "RENTER"
    ADMIN = "ADMIN"


class LicenseStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class BookingStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class FileType(str, Enum):
    VEHICLE_IMAGE = "vehicle-image"
    LICENSE = "license"


# DTOs
class RegisterDto(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    role: UserRole
    businessName: Optional[str] = None
    businessAddress: Optional[str] = None


class LoginDto(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenDto(BaseModel):
    refreshToken: str


class UploadLicenseDto(BaseModel):
    licenseUrl: str


class ApproveLicenseDto(BaseModel):
    status: LicenseStatus


class UpdateProfileDto(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    businessName: Optional[str] = None
    businessAddress: Optional[str] = None


class CreateVehicleDto(BaseModel):
    make: str
    model: str
    year: int
    color: str
    licensePlate: str
    pricePerHour: float
    pricePerDay: float
    seats: int
    fuelType: str
    transmission: str
    mileage: Optional[int] = None
    description: Optional[str] = None
    features: Optional[List[str]] = []
    images: Optional[List[str]] = []
    location: Optional[str] = None  # Added location as text
    isAvailable: bool = True


class UpdateVehicleDto(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    pricePerHour: Optional[float] = None
    pricePerDay: Optional[float] = None
    seats: Optional[int] = None
    fuelType: Optional[str] = None
    transmission: Optional[str] = None
    mileage: Optional[int] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    location: Optional[str] = None
    isAvailable: Optional[bool] = None


class CreateBookingDto(BaseModel):
    vehicleId: str
    startDate: datetime
    endDate: datetime
    renterNotes: Optional[str] = None


class UpdateBookingStatusDto(BaseModel):
    merchantNotes: Optional[str] = None


class CreateMessageDto(BaseModel):
    content: str


class CreateReviewDto(BaseModel):
    bookingId: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class GetPresignedUrlDto(BaseModel):
    fileName: str
    contentType: str
    fileType: FileType


# Database Models
class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: str  # Hashed
    firstName: str
    lastName: str
    phone: Optional[str] = None
    role: UserRole
    businessName: Optional[str] = None
    businessAddress: Optional[str] = None
    licenseUrl: Optional[str] = None
    licenseStatus: LicenseStatus = LicenseStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Vehicle(BaseModel):
    id: Optional[str] = None
    merchantId: str
    make: str
    model: str
    year: int
    color: str
    licensePlate: str
    pricePerHour: float
    pricePerDay: float
    seats: int
    fuelType: str
    transmission: str
    mileage: Optional[int] = None
    description: Optional[str] = None
    features: List[str] = []
    images: List[str] = []
    location: Optional[str] = None
    isAvailable: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Booking(BaseModel):
    id: Optional[str] = None
    vehicleId: str
    renterId: str
    merchantId: str
    startDate: datetime
    endDate: datetime
    status: BookingStatus = BookingStatus.PENDING
    renterNotes: Optional[str] = None
    merchantNotes: Optional[str] = None
    totalPrice: float
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Message(BaseModel):
    id: Optional[str] = None
    bookingId: str
    senderId: str
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class Review(BaseModel):
    id: Optional[str] = None
    bookingId: str
    renterId: str
    merchantId: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
