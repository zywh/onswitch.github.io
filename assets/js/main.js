// Authentication and User Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.init();
    }

    init() {
        // Monitor auth state changes
        auth.onAuthStateChanged((user) => {
            this.handleAuthStateChange(user);
        });

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.signIn());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    async signIn() {
        try {
            this.showLoading(true);
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            
            // Save user to Firestore
            await this.saveUserToFirestore(user);
            
            console.log('User signed in:', user.displayName);
        } catch (error) {
            console.error('Sign in error:', error);
            this.showMessage('Sign in failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            console.log('User signed out');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async saveUserToFirestore(user) {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!userDoc.exists) {
            // New user
            userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            userData.role = 'student'; // Default role
            userData.approved = false; // Require admin approval
        }

        await userRef.set(userData, { merge: true });
    }

    async handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            // User is signed in
            await this.loadUserRole(user.uid);
            this.updateUI(true);
            this.showUserInfo(user);
        } else {
            // User is signed out
            this.userRole = null;
            this.updateUI(false);
            this.hideUserInfo();
        }
    }

    async loadUserRole(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.userRole = userData.role || 'student';
                
                // Check if user is approved
                if (!userData.approved && this.userRole !== 'admin') {
                    this.showMessage('Your account is pending approval. Contact the coach for access.', 'warning');
                }
            }
        } catch (error) {
            console.error('Error loading user role:', error);
        }
    }

    updateUI(isSignedIn) {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const authRequired = document.querySelectorAll('.auth-required');
        const adminRequired = document.querySelectorAll('.admin-required');

        if (isSignedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';

            // Show auth-required elements for approved users
            if (this.isUserApproved()) {
                authRequired.forEach(el => el.style.display = 'block');
            }

            // Show admin elements for admin users
            if (this.isAdmin()) {
                adminRequired.forEach(el => el.style.display = 'block');
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            authRequired.forEach(el => el.style.display = 'none');
            adminRequired.forEach(el => el.style.display = 'none');
        }
    }

    showUserInfo(user) {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        if (userAvatar && user.photoURL) {
            userAvatar.src = user.photoURL;
        }

        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
    }

    hideUserInfo() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        if (userAvatar) userAvatar.src = '';
        if (userName) userName.textContent = '';
    }

    isSignedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.userRole === 'admin';
    }

    isUserApproved() {
        return this.isAdmin() || (this.currentUser && this.userRole && this.userRole !== 'pending');
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="message-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(messageEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// Utility functions for protected pages
function requireAuth() {
    if (!window.authManager || !window.authManager.isSignedIn()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!window.authManager || !window.authManager.isAdmin()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function requireApproval() {
    if (!window.authManager || !window.authManager.isUserApproved()) {
        window.authManager.showMessage('Your account is pending approval.', 'warning');
        window.location.href = '/';
        return false;
    }
    return true;
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Training Materials Management
class TrainingManager {
    constructor() {
        this.materials = [];
        this.assignments = [];
    }

    async loadMaterials() {
        try {
            const snapshot = await db.collection('training-materials')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            this.materials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return this.materials;
        } catch (error) {
            console.error('Error loading materials:', error);
            return [];
        }
    }

    async loadAssignments() {
        try {
            const snapshot = await db.collection('assignments')
                .where('published', '==', true)
                .orderBy('dueDate', 'asc')
                .get();

            this.assignments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return this.assignments;
        } catch (error) {
            console.error('Error loading assignments:', error);
            return [];
        }
    }

    async downloadMaterial(materialId) {
        try {
            const material = this.materials.find(m => m.id === materialId);
            if (!material || !material.fileUrl) {
                throw new Error('Material not found or no file available');
            }

            // Log download
            await db.collection('downloads').add({
                userId: window.authManager.currentUser.uid,
                materialId: materialId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Open file in new tab
            window.open(material.fileUrl, '_blank');
        } catch (error) {
            console.error('Error downloading material:', error);
            window.authManager.showMessage('Error downloading file: ' + error.message, 'error');
        }
    }

    async submitAssignment(assignmentId, submissionData) {
        try {
            if (!window.authManager.currentUser) {
                throw new Error('User not authenticated');
            }

            const submissionRef = db.collection('submissions').doc();
            
            await submissionRef.set({
                assignmentId: assignmentId,
                userId: window.authManager.currentUser.uid,
                userEmail: window.authManager.currentUser.email,
                userName: window.authManager.currentUser.displayName,
                ...submissionData,
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'submitted'
            });

            window.authManager.showMessage('Assignment submitted successfully!', 'success');
        } catch (error) {
            console.error('Error submitting assignment:', error);
            window.authManager.showMessage('Error submitting assignment: ' + error.message, 'error');
        }
    }
}

// Initialize training manager
window.trainingManager = new TrainingManager();