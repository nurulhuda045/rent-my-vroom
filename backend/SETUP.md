# 🚀 Quick Start Guide

## ✅ What's Been Built

I've successfully created a complete **NestJS backend** for the RentMyVroom vehicle rental platform with the following:

### ✨ Completed Features

1. **✅ Project Setup**
   - NestJS 10 with TypeScript
   - Prisma ORM with PostgreSQL
   - Environment configuration
   - All dependencies installed

2. **✅ Database Schema**
   - User model (with roles: MERCHANT, RENTER, ADMIN)
   - Vehicle model
   - Booking model (with status tracking)
   - Message model
   - Review model
   - RefreshToken model
   - All relationships and indexes configured

3. **✅ Authentication Module**
   - User registration
   - Login with JWT
   - Refresh token flow
   - Logout functionality
   - Profile retrieval
   - Password hashing with bcrypt

4. **✅ Users Module**
   - Profile management
   - License upload (for renters)
   - License approval (for admins)
   - Pending license queue

5. **✅ Vehicles Module**
   - Create vehicles (merchants)
   - List all vehicles (public)
   - Get merchant's vehicles
   - Update vehicles
   - Delete vehicles
   - Vehicle details with bookings

6. **✅ Bookings Module**
   - Create booking requests (renters)
   - View renter bookings
   - View merchant bookings
   - Accept/reject bookings (merchants)
   - Complete bookings (merchants)
   - Automatic price calculation
   - License verification

7. **✅ Messages Module**
   - Send messages within bookings
   - Retrieve booking messages
   - Read/unread status tracking
   - Access control

8. **✅ Reviews Module**
   - Create reviews (renters, post-rental)
   - View merchant reviews
   - Average rating calculation
   - Review validation

9. **✅ Uploads Module**
   - Cloudflare R2 integration
   - Presigned URL generation
   - Support for vehicle images and licenses

10. **✅ Notifications Module**
    - Email service with Nodemailer
    - License approval emails
    - New booking notifications
    - Booking acceptance/rejection emails
    - Booking completion emails

11. **✅ Security & Best Practices**
    - Role-based access control
    - JWT authentication guards
    - Input validation with class-validator
    - Rate limiting configuration
    - CORS setup
    - Swagger API documentation

## 🎯 Next Steps

### 1. Setup Database (Required)

Make sure PostgreSQL is running, then update `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/rentmyvroom
```

Then run:

```bash
npx prisma migrate dev --name init
```

### 2. Configure Email (Optional for testing)

Update `.env` with your SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

For Gmail, you'll need to create an [App Password](https://support.google.com/accounts/answer/185833).

### 3. Configure Cloudflare R2 (Optional for testing)

Update `.env` with your R2 credentials:

```env
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-public-url.com
```

### 4. Start the Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API Base:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

## 🧪 Testing the API

### Option 1: Swagger UI (Recommended)

1. Open http://localhost:3000/api
2. Try the endpoints interactively
3. See request/response schemas

### Option 2: cURL Examples

**Register a Merchant:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MERCHANT",
    "businessName": "John'\''s Car Rentals",
    "businessAddress": "123 Main Street"
  }'
```

**Register a Renter:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "renter@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "RENTER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `accessToken` from the response and use it in subsequent requests:

**Create a Vehicle (Merchant):**
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Black",
    "licensePlate": "ABC-1234",
    "pricePerHour": 10.50,
    "pricePerDay": 75.00,
    "seats": 5,
    "fuelType": "Petrol",
    "transmission": "Automatic",
    "description": "Comfortable sedan perfect for city driving",
    "features": ["AC", "GPS", "Bluetooth"],
    "isAvailable": true
  }'
```

**Get All Vehicles:**
```bash
curl http://localhost:3000/vehicles
```

## 📁 Project Structure

```
rentmyvroom/
├── src/
│   ├── auth/              # Authentication (JWT, register, login)
│   ├── users/             # User management & license approval
│   ├── vehicles/          # Vehicle CRUD operations
│   ├── bookings/          # Booking lifecycle management
│   ├── messages/          # Booking-based messaging
│   ├── reviews/           # Reviews & ratings
│   ├── uploads/           # Cloudflare R2 file uploads
│   ├── notifications/     # Email notifications
│   ├── prisma/            # Database service
│   ├── common/            # Shared guards & decorators
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── nest-cli.json          # NestJS config
├── Readme.md              # Full documentation
└── SETUP.md               # This file

```

## 🎨 API Endpoints Summary

### Authentication (Public)
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Authentication (Protected)
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Get profile

### Users
- `POST /users/upload-license` - Upload license (Renter)
- `PATCH /users/approve/:userId` - Approve license (Admin)
- `GET /users/me` - Get my profile
- `PATCH /users/me` - Update profile
- `GET /users/pending-licenses` - Pending approvals (Admin)

### Vehicles
- `POST /vehicles` - Create (Merchant)
- `GET /vehicles` - List all (Public)
- `GET /vehicles/my` - My vehicles (Merchant)
- `GET /vehicles/:id` - Get details (Public)
- `PATCH /vehicles/:id` - Update (Merchant)
- `DELETE /vehicles/:id` - Delete (Merchant)

### Bookings
- `POST /bookings` - Create (Renter)
- `GET /bookings/renter` - My bookings (Renter)
- `GET /bookings/merchant` - Received bookings (Merchant)
- `PATCH /bookings/:id/accept` - Accept (Merchant)
- `PATCH /bookings/:id/reject` - Reject (Merchant)
- `PATCH /bookings/:id/complete` - Complete (Merchant)

### Messages
- `POST /messages/:bookingId` - Send message
- `GET /messages/:bookingId` - Get messages

### Reviews
- `POST /reviews` - Create review (Renter)
- `GET /reviews/merchant/:merchantId` - Get reviews

### Uploads
- `POST /uploads/presign` - Get presigned URL

## 🔧 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### Prisma Client Not Found
```bash
npx prisma generate
```

### Port Already in Use
Change PORT in .env or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Email Not Sending
- Email is optional for testing
- Check SMTP credentials
- For Gmail, use App Password

## 📊 Database Management

**View Data:**
```bash
npx prisma studio
```

**Reset Database:**
```bash
npx prisma migrate reset
```

**Create Migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

## 🎉 You're All Set!

The backend is fully functional with:
- ✅ Complete authentication system
- ✅ All CRUD operations
- ✅ Role-based access control
- ✅ Email notifications
- ✅ File upload support
- ✅ API documentation

Start the server and begin testing! 🚀

```bash
npm run start:dev
```

Then visit http://localhost:3000/api for interactive API docs.
