#  Emotion Detection & Productivity Tracker

> AI-powered emotion detection with real-time productivity tracking and analytics

##  Features

-  Real-time emotion detection via webcam
- 📊 Productivity tracking with focus scores  
-  Work notes and session management
-  Comprehensive analytics dashboard
-  PDF/CSV export with authentication
-  JWT authentication & secure API

##  Project Structure

\\\
emotion-detection-app/
 api/          # Serverless API endpoints
 css/          # Stylesheets
 js/           # Frontend JavaScript
 database/     # Database schemas
 models/       # Face-API.js models
 scripts/      # Utility scripts
 test/         # Test files
 docs/         # Documentation
 backup/       # Backup files
\\\

##  Quick Start

1. **Install dependencies**
   \\\ash
   npm install
   \\\

2. **Setup environment**
   \\\ash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   \\\

3. **Initialize database**
   \\\ash
   node scripts/init-clean-db.js
   \\\

4. **Start server**
   \\\ash
   npm run dev
   \\\

5. **Open browser**
   \\\
   http://localhost:3000
   \\\

### Demo Account
\\\
Email: demo@emotiontracker.com
Password: demo123
\\\

##  Usage

1. Login with demo account
2. Start work session
3. Camera detects emotions every 5s
4. Add notes during session
5. End session when done
6. Export PDF/CSV report

##  Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JS, Face-API.js  
**Backend:** Node.js, Express, Vercel Serverless  
**Database:** Neon PostgreSQL  
**Auth:** JWT + Bcrypt

##  Documentation

- [Database Guide](docs/DATABASE-FIX.md)
- [Deployment Guide](docs/DEPLOY-VERCEL.md)
- [User Guide](docs/HUONG-DAN-SU-DUNG.md)
- [Testing Guide](docs/TESTING-GUIDE.md)

##  Testing

\\\ash
# Check database
node test/check-all-tables.js

# End-to-end test
node test/test-end-to-end.js
\\\

##  Deployment

See [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)

##  Author

**Nguyen Quang Huy**  
GitHub: [@nguyenquanghuy12345678](https://github.com/nguyenquanghuy12345678)

##  License

MIT License

---

**Made with  by Nguyen Quang Huy**
