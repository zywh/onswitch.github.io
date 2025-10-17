# OnSwitch Cyber Patriot Website Deployment Guide

## GitHub Repository Setup

1. **Create a new GitHub repository** named `onswitch` (or your preferred name)

2. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OnSwitch CyberPatriot website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/onswitch.git
   git push -u origin main
   ```

## GitHub Pages Configuration

1. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy when you push to main

2. **Custom Domain Setup:**
   - In Pages settings, add your custom domain: `onswitch.ca`
   - Ensure the CNAME file is in your repository root (already included)

## DNS Configuration for onswitch.ca

Configure these DNS records with your domain registrar:

### A Records (for apex domain)
Point `onswitch.ca` to GitHub Pages IP addresses:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### CNAME Record (for www subdomain)
```
www.onswitch.ca → YOUR_USERNAME.github.io
```

### Example DNS Configuration
```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     your-username.github.io
```

## Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project named "onswitch-cyberpatriot"

2. **Enable Authentication:**
   - Authentication → Sign-in method
   - Enable "Google" provider
   - Add your domain (onswitch.ca) to authorized domains

3. **Enable Firestore:**
   - Firestore Database → Create database
   - Start in test mode (configure security rules later)

4. **Enable Storage:**
   - Storage → Get started
   - Use default security rules for now

5. **Get Firebase Config:**
   - Project Settings → General → Your apps
   - Add web app
   - Copy configuration object
   - Update `_includes/firebase-config.html` with your config

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Training materials - authenticated users can read, admins can write
    match /training-materials/{materialId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Assignments - authenticated users can read, admins can write
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Submissions - users can create/read their own, admins can read all
    match /submissions/{submissionId} {
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Contact messages - anyone can create, admins can read
    match /contact-messages/{messageId} {
      allow create: if true;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Firebase Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Training materials - admins can upload, authenticated users can download
    match /training-materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Assignment submissions - users can upload their own files
    match /submissions/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Initial Admin Setup

1. **Create your admin account:**
   - Visit your deployed site
   - Sign in with Google
   - Your user will be created with role 'student' by default

2. **Manually promote to admin:**
   - Go to Firebase Console → Firestore
   - Find your user document in the 'users' collection
   - Edit the document: set `role: 'admin'` and `approved: true`

## Deployment Checklist

- [ ] Repository created and code pushed to GitHub
- [ ] GitHub Pages enabled with GitHub Actions source
- [ ] Custom domain configured in GitHub Pages settings
- [ ] DNS records configured for onswitch.ca
- [ ] Firebase project created and configured
- [ ] Firebase config updated in website
- [ ] Security rules deployed
- [ ] Initial admin account created and promoted
- [ ] SSL certificate obtained (automatic with GitHub Pages)

## Monitoring and Maintenance

1. **Monitor deployments** in the Actions tab of your repository
2. **Check Firebase usage** in the Firebase Console
3. **Review security rules** periodically
4. **Update dependencies** regularly with `bundle update`

## Troubleshooting

- **Build failures:** Check the Actions tab for error logs
- **Authentication issues:** Verify Firebase configuration and authorized domains
- **DNS issues:** Use tools like `dig` or `nslookup` to verify DNS propagation
- **SSL issues:** May take up to 24 hours for GitHub Pages SSL to activate

## Support

For issues with:
- **GitHub Pages:** Check GitHub Pages documentation
- **Firebase:** Check Firebase documentation
- **DNS:** Contact your domain registrar
- **Website functionality:** Check browser console for JavaScript errors