# 🚗 Rent My Vroom - Vehicle Rental Marketplace

A complete mobile rental marketplace app built with React Native (Expo) and FastAPI, connecting vehicle merchants with renters.

## 📱 Features

### For Merchants
- ✅ Create and manage vehicle listings
- ✅ Upload multiple photos per vehicle
- ✅ Receive and manage booking requests
- ✅ Accept/Reject/Complete bookings
- ✅ Message renters about pickup details
- ✅ Track rental history

### For Renters
- ✅ Upload driving license for verification
- ✅ Browse available vehicles
- ✅ Book vehicles with date selection
- ✅ Track booking status
- ✅ Message merchants
- ✅ Rate and review merchants

### Core Features
- 🔐 JWT-based authentication with refresh tokens
- 📸 Base64 image upload (vehicles, licenses)
- 💬 Real-time messaging (polling-based)
- 🎨 Beautiful mobile-first UI
- 📱 Cross-platform (iOS, Android, Web)

## 🛠 Tech Stack

- **Frontend**: React Native (Expo), TypeScript, Expo Router
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **State Management**: Zustand, React Query
- **UI Components**: React Native core components
- **Navigation**: Expo Router (file-based routing)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (v3.11 or higher)
- **MongoDB** (local or cloud instance)
- **Expo CLI** (optional, for development)
- **Expo Go** app on your mobile device (for testing)

## 🚀 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rent-my-vroom
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `/backend` directory:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=rentmyvroom
SECRET_KEY=your-secret-key-change-in-production
```

#### Start MongoDB

Make sure MongoDB is running locally:

```bash
# If using MongoDB Community Edition
mongod

# Or if using MongoDB as a service
sudo systemctl start mongodb
```

#### Run Backend Server

```bash
# From /backend directory
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend API will be available at: `http://localhost:8001`
API Documentation: `http://localhost:8001/docs`

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd frontend
yarn install
# or
npm install
```

#### Configure Environment Variables

Create/update `.env` file in the `/frontend` directory:

```env
EXPO_TUNNEL_SUBDOMAIN=rent-my-vroom
EXPO_PACKAGER_HOSTNAME=localhost
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
EXPO_USE_FAST_RESOLVER="1"
METRO_CACHE_ROOT=./.metro-cache
```

**Important**: For Android emulator or physical device, you may need to use your machine's IP address instead of `localhost`:

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.X:8001
```

Find your IP:
- **macOS/Linux**: `ifconfig | grep "inet "`
- **Windows**: `ipconfig`

#### Start Expo Development Server

```bash
# From /frontend directory
yarn start
# or
npm start
```

The Expo dev server will start and show a QR code.

### 4. Running the App

#### On Physical Device (Recommended)
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your device

#### On iOS Simulator
```bash
yarn ios
# or
npm run ios
```

#### On Android Emulator
```bash
yarn android
# or
npm run android
```

#### On Web Browser
```bash
yarn web
# or
npm run web
```

## 📁 Project Structure

```
rent-my-vroom/
├── backend/
│   ├── server.py           # FastAPI main application
│   ├── models.py           # Pydantic models
│   ├── auth_utils.py       # JWT authentication utilities
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/         # Authentication screens
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/         # Main app tabs
│   │   │   ├── browse.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── messages.tsx
│   │   │   └── profile.tsx
│   │   ├── vehicle/
│   │   │   └── [id].tsx    # Vehicle detail screen
│   │   ├── booking/
│   │   │   └── [id].tsx    # Booking detail screen
│   │   ├── messages/
│   │   │   └── [id].tsx    # Chat screen
│   │   ├── add-vehicle.tsx
│   │   ├── license-upload.tsx
│   │   ├── _layout.tsx     # Root layout
│   │   └── index.tsx       # Entry point
│   ├── context/
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/
│   │   ├── api.ts          # API client with interceptors
│   │   └── types.ts        # TypeScript types
│   ├── package.json
│   ├── app.json            # Expo configuration
│   └── .env               # Frontend environment variables
│
└── README.md              # This file
```

## 🔑 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URL | MongoDB connection string | mongodb://localhost:27017 |
| DB_NAME | Database name | rentmyvroom |
| SECRET_KEY | JWT secret key | your-secret-key |

### Frontend (`/frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| EXPO_PUBLIC_BACKEND_URL | Backend API URL | http://localhost:8001 |
| EXPO_TUNNEL_SUBDOMAIN | Expo tunnel subdomain | rent-my-vroom |
| EXPO_PACKAGER_HOSTNAME | Packager hostname | localhost |

## 🧪 Testing the App

### Manual Testing Flow

#### 1. Test Merchant Flow
```
1. Register as Merchant
   - Email: merchant@test.com
   - Password: Test123!
   - Role: Merchant
   - Business Name: Test Rentals
   - Business Address: 123 Main St

2. Login as Merchant

3. Add a Vehicle
   - Upload photos
   - Fill in vehicle details
   - Set pricing

4. View Dashboard
   - Check vehicle listings
   - Wait for booking requests
```

#### 2. Test Renter Flow
```
1. Register as Renter
   - Email: renter@test.com
   - Password: Test123!
   - Role: Renter

2. Upload License
   - Select license photo
   - Submit for approval

3. Browse Vehicles
   - View available vehicles
   - Select a vehicle

4. Create Booking
   - Choose dates
   - Submit booking request

5. Wait for Approval
   - Check booking status in Dashboard

6. Message Merchant
   - Once approved, send message
```

## 🐛 Troubleshooting

### Issue: "Network request failed"
**Solution**: 
- Check if backend is running on port 8001
- Verify EXPO_PUBLIC_BACKEND_URL in frontend/.env
- For physical devices, use your machine's IP instead of localhost
- Check firewall settings

### Issue: "Cannot connect to MongoDB"
**Solution**:
- Ensure MongoDB is running: `mongod`
- Check MONGO_URL in backend/.env
- Verify MongoDB is accessible on port 27017

### Issue: Expo app shows blank screen
**Solution**:
- Clear Metro bundler cache: `yarn start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && yarn install`
- Check terminal for error messages

### Issue: Images not displaying
**Solution**:
- Images are stored as base64 in MongoDB
- Check if image picker permissions are granted
- Verify image data is being sent to backend

### Issue: Authentication not persisting
**Solution**:
- Clear AsyncStorage cache
- Check if tokens are being saved
- Verify token refresh logic in api.ts

## 📦 Dependencies

### Frontend Key Dependencies
```json
{
  "expo": "^54.0.32",
  "expo-router": "~5.1.4",
  "react-native": "0.81.5",
  "zustand": "^5.0.10",
  "@tanstack/react-query": "^5.90.20",
  "axios": "^1.13.4",
  "expo-image-picker": "^17.0.10",
  "@react-native-community/datetimepicker": "^8.6.0"
}
```

### Backend Key Dependencies
```txt
fastapi
uvicorn
motor
pydantic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
```

## 🔒 Security Notes

- JWT tokens expire after 30 minutes (access token)
- Refresh tokens expire after 7 days
- Passwords are hashed using bcrypt
- All sensitive data should be in .env files (not committed to git)
- Change SECRET_KEY in production

## 📱 Build for Production

### Android APK
```bash
cd frontend
eas build --platform android --profile preview
```

### iOS IPA
```bash
cd frontend
eas build --platform ios --profile preview
```

**Note**: Requires Expo EAS account. See [Expo documentation](https://docs.expo.dev/build/setup/) for setup.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@rentmyvroom.com

## 🎉 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [FastAPI](https://fastapi.tiangolo.com/)
- Icons from [Ionicons](https://ionic.io/ionicons)

---

**Happy Coding! 🚗💨**
