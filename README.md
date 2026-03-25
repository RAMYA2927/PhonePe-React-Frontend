# PhonePay API Backend

A complete PhonePe clone backend API built with Spring Boot, MongoDB, and Spring Security.

## 🚀 Live Deployment

**API Base URL**: https://phonepay-api-backend-1.onrender.com

**API Documentation**: https://phonepay-api-backend-1.onrender.com/swagger-ui/index.html

**Health Check**: https://phonepay-api-backend-1.onrender.com/actuator/health

## 📋 Features

- ✅ User Authentication & Registration
- ✅ Wallet Management
- ✅ Money Transfers
- ✅ Transaction History
- ✅ RESTful API Design
- ✅ Swagger/OpenAPI Documentation
- ✅ Spring Security Integration
- ✅ MongoDB Database
- ✅ Production Deployment

## 🔧 Tech Stack

- **Backend**: Spring Boot 3.2.5
- **Database**: MongoDB
- **Security**: Spring Security with BCrypt
- **Documentation**: Swagger/OpenAPI 3
- **Deployment**: Render (Docker)
- **Java Version**: 17

## 📖 API Documentation

Visit the live Swagger UI to explore and test all API endpoints:
https://phonepay-api-backend-1.onrender.com/swagger-ui/index.html

## 🚦 Health Check

Monitor the application status:
https://phonepay-api-backend-1.onrender.com/actuator/health

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/RAMYA2927/PhonePay-API-Backend.git

# Navigate to project
cd PhonePay-API-Backend

# Run the application
./mvnw spring-boot:run
```

## 📝 Environment Variables

- `SPRING_DATA_MONGODB_URI` - MongoDB connection string
- `PORT` - Application port (default: 9091)
- `SPRING_PROFILES_ACTIVE` - Spring profile (production/development)

## 🎯 Frontend Deployment

The React frontend has been configured for deployment and includes configuration files for multiple platforms:

### Deployment Options

1. **Render** (Recommended)
   - Uses `render.yaml` configuration
   - Static site hosting
   - Auto-deploys from GitHub

2. **Netlify**
   - Uses `netlify.toml` configuration
   - Drag and drop `frontend/build` folder to Netlify
   - Or connect GitHub repository

3. **Vercel**
   - Uses `vercel.json` configuration
   - Import project from GitHub
   - Zero-config deployment

### Local Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Production Build

```bash
# Build for production
cd frontend && npm run build

# Serve built files (for testing)
npx serve -s build
```

### Environment Configuration

The frontend is configured to connect to the production backend at:
- API URL: `https://phonepay-api-backend-1.onrender.com`

This is set via `.env.production` file and can be modified for different deployment environments.
