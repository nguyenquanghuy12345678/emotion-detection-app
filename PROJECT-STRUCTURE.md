#  Project Structure

## Root Directory
\\\
emotion-detection-app/
├── 📄 index.html              # Main application page
  server.js               # Express server
  package.json            # Dependencies
  vercel.json             # Vercel config
  .env                    # Environment variables
  README.md               # Documentation
\\\

## API Endpoints (/api)
\\\
api/
 auth/
    login.js               # POST /api/auth/login
    register.js            # POST /api/auth/register
    me.js                  # GET /api/auth/me
 sessions/
    start.js               # POST /api/sessions/start
    end.js                 # POST /api/sessions/end/:id
 emotions/
    index.js               # POST /api/emotions
 notes/
    index.js               # GET/POST/DELETE /api/notes
 productivity/
    stats.js               # GET /api/productivity/stats
 exports/
     index.js               # POST /api/exports
\\\

## Frontend Assets
\\\
css/
 styles.css                 # Main styles
 productivity.css           # Productivity UI styles

js/
 app.js                     # Main application
 auth-ui.js                 # Authentication UI
 camera.js                  # Camera handling
 emotions.js                # Emotion detection
 productivity.js            # Productivity tracking
 export-service-pro.js      # Export functionality
 config.js                  # Configuration
\\\

## Database
\\\
database/
 schema-clean.sql           # Clean database schema
 database.js                # Database connection
\\\

## Scripts
\\\
scripts/
 init-clean-db.js          # Initialize database
 init-database.js          # Alternative init script
 migrate-database.js       # Migration script
 pre-deploy-check.js       # Pre-deployment checks
\\\

## Tests
\\\
test/
 check-all-tables.js       # Verify database tables
 check-schema.js           # Check database schema
 test-data-flow.js         # Test data flow
 test-databases.js         # Test database connections
 test-end-to-end.js        # End-to-end testing
\\\

## Documentation
\\\
docs/
 DATABASE-FIX.md           # Database setup guide
 DEPLOY-VERCEL.md          # Deployment instructions
 READY-TO-USE.md           # Quick start guide
 TESTING-GUIDE.md          # Testing documentation
 HUONG-DAN-SU-DUNG.md      # User guide (Vietnamese)
 EXPORT-AUTHENTICATION.md  # Export feature docs
 CHANGELOG.md              # Version history
\\\

## Backup Files
\\\
backup/
 index-full-backup.html    # HTML backup
 test-auth.html            # Auth test page
 README-old.md             # Old README
\\\

## Face-API.js Models
\\\
models/
 face_expression_model-*    # Expression detection
 tiny_face_detector_model-* # Face detection
\\\

## Database Tables (8 tables)

1. **users** - User accounts and authentication
2. **work_sessions** - Work session tracking
3. **emotion_history** - Detected emotions log
4. **work_notes** - Session notes
5. **productivity_stats** - Daily statistics
6. **export_history** - Export records
7. **alert_logs** - System alerts
8. **absence_logs** - Absence tracking

## Key Files Description

### Core Application
- **index.html** - Single-page application
- **server.js** - Express server for local development
- **js/app.js** - Main application logic
- **js/emotions.js** - Face-API.js emotion detection

### Authentication
- **api/auth/*** - JWT-based authentication
- **js/auth-ui.js** - Login/register UI

### Productivity
- **js/productivity.js** - Session tracking, notes, stats
- **api/productivity/stats.js** - Analytics endpoint

### Export
- **js/export-service-pro.js** - PDF/CSV generation
- **api/exports/** - Export logging

### Database
- **database/schema-clean.sql** - Complete schema
- **scripts/init-clean-db.js** - Setup script

## Environment Variables

Required in \.env\:
\\\env
DATABASE_URL=postgresql://...  # Neon PostgreSQL
JWT_SECRET=your_secret_key     # JWT signing key
NODE_ENV=production            # Environment
\\\

## npm Scripts

\\\json
{
  \"dev\": \"node server.js\",
  \"start\": \"node server.js\"
}
\\\

---

**Last Updated:** 2025-11-25
