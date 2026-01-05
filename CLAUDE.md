# CLAUDE.md - FLINCO Application Documentation

## Project Overview

**FLINCO** is a cleaning and maintenance report generation system designed for property management. It consists of three standalone HTML applications that work together to create, manage, and generate professional cleaning reports with before/after photo documentation.

### Project Type
- **Stack**: Vanilla JavaScript (no frameworks)
- **Architecture**: Three self-contained single-page applications (SPAs)
- **Backend**: Firebase (Firestore + Storage)
- **Language**: French (UI and content)
- **Deployment**: Static HTML files (can be hosted on any web server)

## Repository Structure

```
flinco-app/
├── index.html           # Standalone premium report generator
├── flinco-admin.html    # Admin interface for creating pre-reports
├── flinco-agent.html    # Agent interface for photo upload and completion
└── README.md            # Minimal project description
```

## Application Components

### 1. index.html - Premium Reports Generator
**Purpose**: Standalone tool for creating cleaning reports from scratch.

**Key Features**:
- PDF quote import and parsing (extracts rooms and tasks)
- Manual room and task creation
- Before/after photo upload
- Client information management
- PDF report generation (client-side using jsPDF)
- Logo upload support

**Data Flow**:
- Self-contained (no Firebase dependency)
- All data stored in browser memory
- Generates PDF locally and downloads to user's device

**Main Functions**:
- `parseDevisFlinco(text)` - Extracts structured data from FLINCO quote PDFs
- `createRoomWithTasks(roomName, tasks)` - Creates room cards with task lists
- `generatePDF()` - Generates the final PDF report with photos

**PDF Parsing Logic**:
- Extracts quote number: `/Devis\s*N°?\s*(\d+)/i`
- Extracts address: `/(\d+[^a-z]*(?:RUE|AVENUE|BOULEVARD|PLACE|IMPASSE|CHEMIN|ALLÉE)[^a-z]+)/i`
- Parses task numbers (1.0-1.4 = Entrée, 1.5-1.9 = Cuisine, 1.10-1.13 = SDB)

### 2. flinco-admin.html - Admin Dashboard
**Purpose**: Administrative interface for creating pre-reports and managing missions.

**Key Features**:
- PDF quote import (same parsing as index.html)
- Manual mission creation
- Room and task management
- Generate unique links for agents
- View and manage all reports
- Firebase integration for data persistence

**Firebase Collections**:
- `reports/` - Stores mission data with structure:
  ```javascript
  {
    quote: "DEV-2024-001",
    date: "2024-01-05",
    address: "15 rue de la Paix, 75001 Paris",
    agent: "Jean Dupont",
    agency: "Century 21",
    rooms: {
      "CUISINE": { tasks: ["Nettoyer le four", "..."] },
      // ...
    },
    status: "pending" | "completed",
    createdAt: Timestamp,
    completedAt: Timestamp | null,
    pdfUrl: string | null
  }
  ```

**Main Functions**:
- `generateLink()` - Creates report in Firestore and generates agent URL
- `loadReports()` - Fetches and displays all reports
- `shareWhatsApp()` - Opens WhatsApp with pre-filled message

**URLs Generated**:
- Format: `{baseUrl}/flinco-agent.html?id={reportId}`

### 3. flinco-agent.html - Agent Interface
**Purpose**: Mobile-friendly interface for agents to upload before/after photos.

**Key Features**:
- Load mission details from Firebase via URL parameter
- Photo upload with camera integration (`capture="environment"`)
- Image compression (max 1200px, 70% JPEG quality)
- Real-time progress tracking
- General room photos + task-specific photos
- PDF generation and upload to Firebase Storage
- Auto-update report status to "completed"

**Data Flow**:
1. Load report data from Firestore using `?id=` parameter
2. Agent uploads photos (stored in browser memory)
3. On submit: Generate PDF → Upload to Storage → Update Firestore
4. Display success message

**Main Functions**:
- `compressImage(dataUrl, callback)` - Reduces image size for upload
- `updateProgress()` - Calculates completion percentage
- `generateAndSavePDF()` - Creates PDF and saves to Firebase

**Firebase Storage Path**:
- `reports/{reportId}/FLINCO_Rapport_{quote}_{date}.pdf`

## Technology Stack

### Core Technologies
- **HTML5** - Semantic markup
- **CSS3** - Custom properties (CSS variables), Grid, Flexbox
- **Vanilla JavaScript** - ES6+ (no transpilation)

### External Libraries (CDN)
- **Firebase SDK 10.7.1** (App, Firestore, Storage)
- **jsPDF 2.5.1** - PDF generation
- **PDF.js 3.11.174** - PDF parsing

### Design System
**index.html** - Light theme with blue gradients
- Primary: `#0f3460`
- Accent: `#82acff`
- Background: `linear-gradient(135deg, #0f3460 0%, #16213e 100%)`

**flinco-admin.html** - Dark theme
- Primary: `#0f3460`
- Accent: `#82acff`
- Background: `#0a0f1c`
- Card: `#111827`

**flinco-agent.html** - Light theme (mobile-first)
- Primary: `#0f3460`
- Success: `#10b981`
- Background: `#f1f5f9`

## Firebase Configuration

### Shared Config (in all files)
```javascript
{
  apiKey: "AIzaSyAn4qRaIREAnzFmz-7Oj9UH5GHwSYxXuVY",
  authDomain: "flinco-v2.firebaseapp.com",
  projectId: "flinco-v2",
  storageBucket: "flinco-v2.firebasestorage.app",
  messagingSenderId: "152962665758",
  appId: "1:152962665758:web:2d444f4334ed8b1eae4d0f"
}
```

**Note**: This is a public configuration (Firebase security is handled via Firestore rules).

## Development Workflow

### Local Development
1. Serve files with any HTTP server:
   ```bash
   python3 -m http.server 8000
   # OR
   npx serve .
   ```
2. Access applications:
   - `http://localhost:8000/index.html` (standalone)
   - `http://localhost:8000/flinco-admin.html` (admin)
   - `http://localhost:8000/flinco-agent.html?id=TEST` (agent)

### Testing Workflow
1. Use admin interface to create a test report
2. Copy the generated agent link
3. Open link to test photo upload flow
4. Verify PDF generation and Firebase upload

### Git Workflow
- Main branch: `main` (or default branch)
- Feature branches: `claude/claude-md-{sessionId}-{randomId}`
- Always commit with descriptive messages
- Push to designated branch before creating PRs

## Key Development Conventions

### Code Style
1. **Inline Everything**: All CSS and JavaScript is inline in HTML files
2. **No Build System**: Direct browser execution, no compilation
3. **Global State**: Each app manages state in global variables
4. **French Language**: All UI text, comments, and variable names in French
5. **Mobile-First**: Agent interface prioritizes mobile UX

### Naming Conventions
```javascript
// Variables: camelCase
let reportData = {};
const firebaseConfig = {};

// Functions: camelCase with descriptive names
function parseDevisFlinco(text) { }
function generateAndSavePDF() { }

// IDs: kebab-case
<div id="rooms-container"></div>
<button id="generate-btn"></button>

// Classes: kebab-case
<div class="room-card"></div>
<span class="progress-fill"></span>
```

### Data Structure Patterns
```javascript
// Room structure (index.html & flinco-agent.html)
rooms = {
  "CUISINE": {
    generalPhotos: { avant: base64|null, apres: base64|null },
    tasks: [
      {
        id: "task_1",
        name: "Nettoyer le four",
        photos: { avant: base64|null, apres: base64|null }
      }
    ]
  }
}

// Photo structure (flinco-agent.html)
photos = {
  "CUISINE": {
    general: { avant: base64|null, apres: base64|null },
    tasks: {
      "Nettoyer le four": { avant: base64|null, apres: base64|null }
    }
  }
}
```

### Common Utility Functions

**String Sanitization** (for HTML safety):
```javascript
const safeName = roomName.replace(/'/g, "\\'").replace(/"/g, '\\"');
```

**Slugify** (for IDs):
```javascript
function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    // ... more replacements
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

**Date Formatting**:
```javascript
// Input: "2024-01-05" → Output: "05/01/2024"
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
```

## Common Tasks for AI Assistants

### Adding a New Feature
1. **Identify the target file(s)**: index.html, admin, or agent
2. **Read the entire file first**: Understand existing structure
3. **Maintain inline style**: Add CSS to `<style>` block, JS to `<script>`
4. **Test locally**: Verify changes work in browser
5. **Update this file**: Document new features or conventions

### Modifying Firebase Structure
1. **Impact analysis**: Check all three files for affected code
2. **Update read/write operations**: Ensure consistency
3. **Migration**: Consider existing data in production
4. **Document changes**: Update data structure examples above

### Fixing Bugs
1. **Reproduce**: Understand the user flow
2. **Check browser console**: Most errors are client-side
3. **Verify Firebase**: Check Firestore and Storage for data issues
4. **Test across files**: Bug might affect multiple apps

### Adding New Room Types or Task Categories
1. **Update parseDevisFlinco()**: Adjust task number ranges
2. **Maintain consistency**: Update in both index.html and admin
3. **Test PDF parsing**: Verify extraction logic works

### Styling Changes
1. **Use CSS variables**: Defined in `:root { }` for consistency
2. **Maintain responsive design**: Test on mobile (especially agent interface)
3. **Preserve brand colors**: Blue gradients, professional appearance

## Security Considerations

### Current Implementation
- **No authentication**: All files are publicly accessible
- **Firebase security**: Should be handled via Firestore Security Rules
- **Client-side validation only**: No server-side checks
- **Exposed API keys**: Firebase config is public (this is normal for web apps)

### Recommendations for Production
1. Implement Firebase Authentication for admin interface
2. Set Firestore Security Rules:
   ```javascript
   // Example rules
   match /reports/{reportId} {
     allow read: if true; // Agents need link access
     allow create: if request.auth != null; // Only authenticated admins
     allow update: if resource.data.status == 'pending'; // Only pending reports
     allow delete: if request.auth != null; // Only admins
   }
   ```
3. Add rate limiting for PDF generation
4. Validate uploaded images (size, type, content)
5. Implement HTTPS-only access

## Testing Checklist

When making changes, verify:

- [ ] **index.html**: Can import PDF, create rooms, generate PDF locally
- [ ] **flinco-admin.html**: Can create report, generate link, view list
- [ ] **flinco-agent.html**: Can load from link, upload photos, submit report
- [ ] **Cross-browser**: Test in Chrome, Safari, Firefox
- [ ] **Mobile**: Test agent interface on real mobile device
- [ ] **Firebase**: Verify Firestore writes and Storage uploads
- [ ] **PDF generation**: Check output quality and data accuracy
- [ ] **Error handling**: Test with invalid data, network failures

## Common Issues and Solutions

### PDF.js Worker Issues
**Problem**: "pdf.worker.js not found"
**Solution**: Verify CDN URL matches library version:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
```

### Firebase Initialization
**Problem**: "Firebase app already initialized"
**Solution**: Check for multiple `initializeApp()` calls

### Image Upload on iOS
**Problem**: Photos not uploading on iPhone
**Solution**: Ensure `accept="image/*"` and `capture="environment"` are set correctly

### PDF Generation Memory Issues
**Problem**: Browser crashes with many large images
**Solution**: Image compression is implemented (1200px max, 70% quality) - ensure it's working

### Agent Link Not Working
**Problem**: "Rapport introuvable"
**Solution**:
1. Verify report exists in Firestore
2. Check URL has correct `?id=` parameter
3. Ensure report status is "pending"

## Performance Optimization

### Current Optimizations
- Image compression before PDF generation (max 1200px)
- Base64 encoding for inline storage (no additional HTTP requests)
- Minimal external dependencies
- No JavaScript frameworks (smaller bundle size)

### Potential Improvements
1. **Lazy loading**: Load photos only when needed
2. **Service Workers**: Cache static assets
3. **IndexedDB**: Store draft reports locally
4. **WebP format**: Better compression than JPEG
5. **Pagination**: Limit reports shown in admin list

## Deployment

### Static Hosting Options
1. **Firebase Hosting** (recommended - same ecosystem)
   ```bash
   firebase init hosting
   firebase deploy
   ```

2. **GitHub Pages**
   - Push to `gh-pages` branch or use Actions

3. **Netlify / Vercel**
   - Drag-and-drop deploy

### Environment Variables
Currently none - Firebase config is hardcoded. For production:
1. Consider using environment-specific configs
2. Use build step to inject variables
3. Or move to Firebase Hosting config

## Troubleshooting Guide

### Development Issues

**HTML file won't load**
- Ensure you're using HTTP server, not `file://` protocol
- Check browser console for CORS errors

**Firebase errors**
- Verify internet connection
- Check Firebase console for quota limits
- Ensure project ID matches config

**PDF parsing fails**
- Log extracted text to console: `console.log(fullText)`
- Verify PDF structure matches expected format
- Check regex patterns in `parseDevisFlinco()`

### Production Issues

**Reports not saving**
- Check Firestore rules allow writes
- Verify Firebase quotas not exceeded
- Check browser console for errors

**Agent can't upload photos**
- Verify Storage rules allow uploads
- Check file size limits
- Test on different network (mobile data vs WiFi)

**PDF download fails**
- Check browser popup blocker
- Verify jsPDF is loaded correctly
- Test with fewer/smaller images

## Future Enhancement Ideas

### Features to Consider
1. **Email notifications**: Send report completion emails
2. **Admin authentication**: Secure admin interface
3. **Report templates**: Pre-defined room/task configurations
4. **Bulk operations**: Create multiple reports at once
5. **Analytics dashboard**: Track completion rates, agent performance
6. **Signature capture**: Agent/client sign-off on reports
7. **Offline mode**: PWA with offline photo upload
8. **Multi-language**: Support English, Spanish, etc.
9. **Custom branding**: Allow agencies to upload their logos
10. **Report versioning**: Track changes and revisions

### Technical Improvements
1. **TypeScript**: Add type safety
2. **Module bundler**: Webpack/Vite for better code organization
3. **Testing**: Jest + Playwright for automated tests
4. **CI/CD**: Automated deployment on git push
5. **Monitoring**: Error tracking with Sentry
6. **API layer**: Backend service for complex operations

## Glossary

### French Terms (for AI understanding)
- **Devis** - Quote/Estimate
- **Pièce** - Room
- **Tâche** - Task
- **Avant** - Before
- **Après** - After
- **Agent** - Field agent/worker
- **Agence** - Agency (real estate or property management)
- **Rapport** - Report
- **Nettoyage** - Cleaning
- **Remise en état** - Restoration/refurbishment

### Technical Terms
- **SPA** - Single Page Application
- **CDN** - Content Delivery Network
- **Base64** - Binary-to-text encoding for images
- **Firestore** - Firebase's NoSQL database
- **Storage** - Firebase's file storage service

## Contact and Support

For questions about this codebase, refer to:
1. This CLAUDE.md file
2. Inline code comments (limited, mostly in French)
3. Firebase documentation: https://firebase.google.com/docs
4. jsPDF documentation: https://github.com/parallax/jsPDF

---

**Last Updated**: 2026-01-05
**Version**: 1.0
**Maintained for**: AI Assistant Claude Code
