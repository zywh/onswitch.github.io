// Authentication and User Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.userApproved = false;
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
        this.userApproved = false;
        
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
                this.userApproved = !!userData.approved;
                
                // Check if user is approved
                if (!this.userApproved && this.userRole !== 'admin') {
                    this.showMessage('Your account is pending approval. Contact the coach for access.', 'warning');
                }
            } else {
                this.userRole = 'student';
                this.userApproved = false;
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

            // Show auth-required elements for approved users only
            if (this.isUserApproved()) {
                authRequired.forEach(el => el.style.display = 'block');
            } else {
                authRequired.forEach(el => el.style.display = 'none');
            }

            // Show admin elements for admin users
            if (this.isAdmin()) {
                adminRequired.forEach(el => el.style.display = 'block');
            } else {
                adminRequired.forEach(el => el.style.display = 'none');
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
        return this.isAdmin() || (this.currentUser && this.userApproved);
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

            // Show loading state
            const downloadButton = document.querySelector(`button[onclick="downloadMaterial('${materialId}')"]`);
            if (downloadButton) {
                const originalText = downloadButton.innerHTML;
                downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
                downloadButton.disabled = true;
                
                setTimeout(() => {
                    downloadButton.innerHTML = originalText;
                    downloadButton.disabled = false;
                }, 2000);
            }

            // Log download activity
            await db.collection('downloads').add({
                userId: window.authManager.currentUser.uid,
                userEmail: window.authManager.currentUser.email,
                userName: window.authManager.currentUser.displayName,
                materialId: materialId,
                materialTitle: material.title,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                downloadType: material.type
            });

            // Update material download count
            await db.collection('training-materials').doc(materialId).update({
                downloadCount: firebase.firestore.FieldValue.increment(1)
            });

            // Handle different file types
            if (material.type === 'link') {
                // External link - open in new tab
                window.open(material.fileUrl, '_blank', 'noopener,noreferrer');
            } else {
                // File download - create download link
                const link = document.createElement('a');
                link.href = material.fileUrl;
                link.download = material.fileName || material.title;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            window.authManager.showMessage(`Downloaded: ${material.title}`, 'success');

        } catch (error) {
            console.error('Error downloading material:', error);
            window.authManager.showMessage('Error downloading file: ' + error.message, 'error');
        }
    }

    async getUserProgress() {
        try {
            if (!window.authManager.currentUser) return null;

            const userId = window.authManager.currentUser.uid;
            
            // Get download count
            const downloadsSnapshot = await db.collection('downloads')
                .where('userId', '==', userId)
                .get();
            
            // Get submission count
            const submissionsSnapshot = await db.collection('submissions')
                .where('userId', '==', userId)
                .get();

            // Get assignments for pending count
            const assignmentsSnapshot = await db.collection('assignments')
                .where('published', '==', true)
                .get();

            const completedAssignments = submissionsSnapshot.docs.length;
            const totalAssignments = assignmentsSnapshot.docs.length;
            const pendingAssignments = totalAssignments - completedAssignments;

            return {
                downloadsCount: downloadsSnapshot.docs.length,
                assignmentsCompleted: completedAssignments,
                assignmentsPending: pendingAssignments,
                recentActivity: await this.getRecentActivity(userId)
            };

        } catch (error) {
            console.error('Error getting user progress:', error);
            return null;
        }
    }

    async getRecentActivity(userId) {
        try {
            const activities = [];
            
            // Get recent downloads
            const downloadsSnapshot = await db.collection('downloads')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
            
            downloadsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'download',
                    title: `Downloaded: ${data.materialTitle}`,
                    timestamp: data.timestamp,
                    icon: 'download'
                });
            });

            // Get recent submissions
            const submissionsSnapshot = await db.collection('submissions')
                .where('userId', '==', userId)
                .orderBy('submittedAt', 'desc')
                .limit(5)
                .get();
            
            submissionsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'submission',
                    title: `Submitted assignment`,
                    timestamp: data.submittedAt,
                    icon: 'upload'
                });
            });

            // Sort by timestamp
            activities.sort((a, b) => {
                const aTime = a.timestamp?.toDate() || new Date(0);
                const bTime = b.timestamp?.toDate() || new Date(0);
                return bTime - aTime;
            });

            return activities.slice(0, 10);

        } catch (error) {
            console.error('Error getting recent activity:', error);
            return [];
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