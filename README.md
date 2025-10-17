# OnSwitch Cyber Patriot Coaching Website

This is the source code for the OnSwitch Cyber Patriot coaching website hosted at [onswitch.ca](https://onswitch.ca).

## Features

- **Public Pages**: Home, About, Contact
- **Authentication**: Gmail-based authentication via Firebase
- **Training Materials**: Protected resources for registered students
- **Assignment System**: Homework and tasks for students
- **Admin Panel**: User management and content administration

## Local Development

1. Install Ruby and Jekyll:
   ```bash
   gem install bundler jekyll
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```

4. Visit `http://localhost:4000`

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Google provider
3. Enable Firestore database
4. Update the Firebase configuration in `_includes/firebase-config.html`

## GitHub Pages Deployment

1. Push to the `main` branch
2. Enable GitHub Pages in repository settings
3. Set custom domain to `onswitch.ca`
4. Configure DNS records:
   - A records pointing to GitHub Pages IPs
   - CNAME record for www.onswitch.ca

## Custom Domain Setup

Add `CNAME` file with your domain and configure DNS:

```
onswitch.ca
```

## License

© 2025 OnSwitch. All rights reserved.