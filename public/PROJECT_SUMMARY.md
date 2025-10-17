# OnSwitch CyberPatriot Coaching Website

## 🎯 Project Overview

This is a complete personal website for hosting CyberPatriot coaching services at **onswitch.ca**. The site includes public pages, authentication-protected training materials, and a full admin panel for managing students and content.

## ✨ Features

### Public Features
- **Professional Homepage** with hero section and feature highlights
- **About Page** showcasing coach credentials and achievements
- **Contact Page** with contact form and FAQ section
- **Responsive Design** works perfectly on all devices
- **SEO Optimized** with proper meta tags and structured data

### Authentication System
- **Gmail Authentication** via Firebase Auth
- **User Registration** with approval workflow
- **Role-based Access** (Student/Admin roles)
- **Secure Session Management**

### Student Portal (Protected)
- **Training Materials** with downloadable resources
- **Assignment System** with submission capability
- **Progress Tracking** and activity history
- **File Upload** support for assignment submissions

### Admin Panel (Admin Only)
- **User Management** - approve students, manage roles
- **Content Management** - upload training materials
- **Assignment Creation** with due dates and difficulty levels
- **Submission Review** and grading system
- **Contact Message Management**

## 🚀 Quick Start

### 1. Repository Setup
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: OnSwitch CyberPatriot website"
git remote add origin https://github.com/YOUR_USERNAME/onswitch.git
git push -u origin main
```

### 2. GitHub Pages Setup
1. Go to repository **Settings → Pages**
2. Set source to **"GitHub Actions"**
3. Add custom domain: **onswitch.ca**

### 3. Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Google provider)
3. Enable **Firestore Database**
4. Enable **Storage**
5. Update Firebase config in `_includes/firebase-config.html`

### 4. DNS Configuration
Configure these DNS records for **onswitch.ca**:

```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153  
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     your-username.github.io
```

### 5. Admin Account Setup
1. Visit your deployed site
2. Sign in with Google
3. In Firebase Console → Firestore:
   - Find your user document
   - Set `role: 'admin'` and `approved: true`

## 📁 Project Structure

```
onswitch/
├── _config.yml              # Jekyll configuration
├── _layouts/                # Page templates
│   └── default.html
├── _includes/               # Reusable components
│   ├── header.html
│   ├── footer.html
│   └── firebase-config.html
├── _sass/                   # SCSS stylesheets
│   ├── _variables.scss
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _components.scss
│   ├── _pages.scss
│   ├── _admin.scss
│   └── _responsive.scss
├── assets/
│   ├── css/
│   │   └── main.scss       # Main stylesheet
│   └── js/
│       └── main.js         # JavaScript functionality
├── .github/workflows/
│   └── jekyll.yml          # GitHub Actions deployment
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── training.html           # Training materials (protected)
├── admin.html              # Admin panel (admin only)
├── CNAME                   # Custom domain configuration
├── Gemfile                 # Ruby dependencies
├── README.md               # Project documentation
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🔧 Technology Stack

- **Frontend**: HTML5, SCSS, Vanilla JavaScript
- **Framework**: Jekyll (GitHub Pages compatible)
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: GitHub Pages
- **Domain**: Custom domain (onswitch.ca)
- **CI/CD**: GitHub Actions

## 🎨 Design Features

- **Modern UI/UX** with professional appearance
- **Mobile-first** responsive design
- **Accessibility** compliant (WCAG guidelines)
- **Fast loading** with optimized assets
- **Dark/Light** theme support
- **Smooth animations** and transitions

## 🔐 Security Features

- **Firebase Security Rules** for data protection
- **Role-based access control**
- **HTTPS enforcement** via GitHub Pages
- **XSS protection** with secure coding practices
- **CSRF protection** for form submissions

## 📱 Mobile Optimization

- **Touch-friendly** interface
- **Responsive navigation** with mobile menu
- **Optimized images** and assets
- **Fast mobile performance**
- **App-like experience** on mobile devices

## 🎓 Educational Content Management

- **Structured curriculum** organization
- **Assignment tracking** system
- **Progress monitoring** for students
- **File sharing** capabilities
- **Communication tools** for coaching

## 📈 Analytics & Monitoring

Ready for integration with:
- Google Analytics
- Firebase Analytics
- Performance monitoring
- Error tracking

## 🆘 Support & Maintenance

For detailed setup instructions, see:
- **DEPLOYMENT.md** - Complete deployment guide
- **Firebase Console** - Database and auth management
- **GitHub Actions** - Automated deployment logs

## 📄 License

© 2025 OnSwitch. All rights reserved.

---

**🎯 Ready to launch your CyberPatriot coaching website!**

Follow the setup steps above, and you'll have a professional, fully-functional coaching platform running at onswitch.ca within hours.