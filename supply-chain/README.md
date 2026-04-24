# Global Supply Chain Frontend 🌐🎨

A modern, responsive Next.js 15 frontend for a comprehensive AI-powered logistics and supply chain management system.

## 🚀 Overview

This frontend application provides an intuitive user interface for managing maritime and land-based cargo movement. It integrates real-time data visualization, weather alerts, route optimization, and intelligent task assignments through an interactive dashboard. Built with Next.js 15, TypeScript, and Tailwind CSS for a seamless user experience.

---

## 📦 Project Context

This is the **frontend component** of the **Global Supply Chain (Glosupchain)** project. For the complete project including backend services, AI agents, and ML models, visit the main repository:

🔗 **[Main Repository: kushalkambar5/glosupchain](https://github.com/kushalkambar5/glosupchain)**

### Full Architecture
The complete Glosupchain system consists of:
- **Frontend** (This Repository): Next.js 15 UI for operator dashboards
- **Agent Backend**: Python FastAPI with LangGraph and Google Gemini API for AI-powered decisions
- **ML Service**: Python FastAPI for intelligent driver assignment and route optimization
- **Database**: PostgreSQL with Drizzle ORM

---

## ✨ Frontend Features

### 📊 Dashboard & Analytics
- **Real-time Data Visualization**: Interactive maps and charts displaying live vessel tracking, driver locations, and shipment status
- **Weather Alerts Dashboard**: Visual representation of weather hazards affecting supply routes with affected zone highlighting
- **Assignment Management UI**: Comprehensive interface for viewing and managing driver assignments and shipments

### ⛴️ Maritime Operations
- **Ship Reroute Management**: Visual interface for reviewing AI-suggested reroutes with before/after route comparison
- **Real-time Ship Tracking Map**: Interactive map component displaying live AIS data with path visualization
- **Port & Navigation Controls**: User-friendly ship route management forms with waypoint editing

### 🚛 Land Logistics Dashboard
- **Driver Assignment Interface**: Intuitive assignment workflow for allocating tasks to available drivers
- **Route Optimization Views**: Visual route comparison and selection interface
- **Driver Profile Management**: Update driver information and availability status

### 📱 Responsive Components
- **Mobile-First Design**: Fully responsive UI components using Tailwind CSS and Glassmorphism design
- **Pagination & Controls**: Efficient data browsing for large datasets
- **Real-time Location Tracking**: Live driver and shipment location updates with map visualization

### 🔐 User Management
- **Role-Based Access Control**: Admin, Manager, and Driver role interfaces
- **Authentication UI**: Secure login and registration flows with NextAuth integration
- **Manager Type Selection**: Interface for different manager types (Road/Ship managers)

---

## 📁 Project Structure

```text
supply-chain/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── driver/               # Driver-related endpoints
│   │   ├── manager/              # Manager operations
│   │   └── ...                   # Additional service integrations
│   ├── admin/                    # Admin dashboard pages
│   ├── driver/                   # Driver interface pages
│   ├── manager/                  # Manager dashboard pages
│   ├── login/                    # Authentication pages
│   ├── roads/ & roads-reroutes/  # Road management interfaces
│   ├── ship/ & ship-reroutes/    # Maritime management interfaces
│   ├── weather/                  # Weather alerts interface
│   ├── zones/                    # Zone management pages
│   └── layout.tsx                # Root layout with Providers
├── components/                   # Reusable React components
│   ├── Maps/                     # Map visualization components
│   ├── Forms/                    # Form components for assignments
│   ├── Cards/                    # Info and assignment cards
│   ├── Buttons/                  # Custom button components
│   └── ...                       # Additional UI components
├── db/                           # Database schema & configuration
├── lib/                          # Utility functions & auth setup
└── public/                       # Static assets
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Glassmorphism design patterns
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: NextAuth.js with secure session management
- **Maps & Geolocation**: Leaflet/Mapbox integration for real-time tracking
- **State Management**: React hooks & Context API
- **Form Handling**: Custom form components with validation
- **API Integration**: REST API client for backend services
- **Development**: ESLint, Drizzle migrations, Next.js optimizations

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ (with npm or yarn)
- PostgreSQL database (local or remote)
- Environment variables configured (see .env.example)

### Installation & Setup

1. **Clone and Install Dependencies**
```bash
cd supply-chain
npm install
```

2. **Configure Environment Variables**
Create a `.env.local` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/glosupchain
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8080
```

3. **Setup Database**
```bash
# Run Drizzle migrations
npx drizzle-kit migrate
```

4. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production
```bash
npm run build
npm start
```
```

---

## 📡 Frontend API Integration

- **Frontend Server**: `http://localhost:3000` (Next.js)
- **Agent API**: Communicates with `http://localhost:8000` (FastAPI backend)
- **ML Service API**: Integrates with `http://localhost:8080/api/v1/assign` for autonomous assignments
- **Real-time Features**: WebSocket connections for live tracking and notifications

---

## 👨‍💻 Contributing - Frontend

We welcome frontend contributions! Here are areas where you can help:

- **UI Components**: Enhance existing components or create new reusable components
- **Pages**: Improve existing pages or add new dashboard features
- **Maps & Visualization**: Optimize real-time tracking and route visualization
- **Performance**: Optimize rendering and API call efficiency
- **Accessibility**: Improve WCAG compliance and user experience
- **Testing**: Add unit and integration tests for components
- **Styling**: Enhance the Glassmorphism design patterns and responsive layouts
- **Documentation**: Improve component documentation and usage guides

### How to Contribute
1. Fork and create a feature branch (`feature/your-feature`)
2. Make your changes following the existing code style
3. Test your changes thoroughly (`npm run dev`)
4. Submit a pull request with a clear description of your changes

---

## 📄 License

This project is licensed under the MIT License.
