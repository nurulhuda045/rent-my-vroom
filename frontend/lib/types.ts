export enum UserRole {
  MERCHANT = 'MERCHANT',
  RENTER = 'RENTER',
  ADMIN = 'ADMIN',
}

export enum LicenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  businessName?: string;
  businessAddress?: string;
  licenseUrl?: string;
  licenseStatus: LicenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  merchantId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  pricePerHour: number;
  pricePerDay: number;
  seats: number;
  fuelType: string;
  transmission: string;
  mileage?: number;
  description?: string;
  features: string[];
  images: string[];
  location?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  renterId: string;
  merchantId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  renterNotes?: string;
  merchantNotes?: string;
  totalPrice: number;
  vehicle?: Vehicle;
  renter?: User;
  merchant?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  sender?: User;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  renterId: string;
  merchantId: string;
  rating: number;
  comment?: string;
  renter?: User;
  createdAt: string;
}
