// Student Portal JavaScript - Pure Client-Side Version

// Global variables
let currentStudent = null;
let attendanceData = [];

// Default data stored in JavaScript
const students = [
    {
        id: 'S001',
        name: 'Prithvish Raj Shukla',
        username: 'Prithvish',
        password: '123'
    },
    {
        id: 'S002',
        name: 'Kavya Singh',
        username: 'Kavya',
        password: '123'
    },
    {
        id: 'S003',
        name: 'Kislaya Agarwal',
        username: 'Kislaya',
        password: '123'
    }
];

const defaultAttendanceData = {
    'S001': [
        {
            subject: 'Theory of Computation',
            totalClasses: 40,
            attendedClasses: 32,
            percentage: 80
        },
        {
            subject: 'Web Technology',
            totalClasses: 35,
            attendedClasses: 24,
            percentage: 69
        },
        {
            subject: 'DSA2',
            totalClasses: 38,
            attendedClasses: 30,
            percentage: 79
        },
        {
            subject: 'DBMS',
            totalClasses: 42,
            attendedClasses: 39,
            percentage: 93
        },
        {
            subject: 'Operating Systems',
            totalClasses: 30,
            attendedClasses: 18,
            percentage: 60
        }
    ],
    'S002': [
        {
            subject: 'Computer Networks',
            totalClasses: 36,
            attendedClasses: 28,
            percentage: 78
        },
        {
            subject: 'Software Engineering',
            totalClasses: 38,
            attendedClasses: 25,
            percentage: 66
        },
        {
            subject: 'Web Technology',
            totalClasses: 35,
            attendedClasses: 31,
            percentage: 89
        },
        {
            subject: 'DBMS',
            totalClasses: 40,
            attendedClasses: 35,
            percentage: 88
        }
    ],
    'S003': [
        {
            subject: 'Theory of Computation',
            totalClasses: 38,
            attendedClasses: 35,
            percentage: 92
        },
        {
            subject: 'DSA2',
            totalClasses: 40,
            attendedClasses: 28,
            percentage: 70
        },
        {
            subject: 'Operating Systems',
            totalClasses: 36,
            attendedClasses: 27,
            percentage: 75
        },
        {
            subject: 'DBMS',
            totalClasses: 42,
            attendedClasses: 38,
            percentage: 90
        },
        {
            subject: 'Object-Oriented Programming',
            totalClasses: 32,
            attendedClasses: 24,
            percentage: 75
        }
    ]
};

/**
 * Handle login functionality
 */
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Find student by username and password
    const student = students.find(s => s.username === username && s.password === password);
    
    if (student) {
        // Store session in localStorage
        localStorage.setItem('currentStudent', JSON.stringify(student));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Initialize attendance data if not exists
        if (!localStorage.getItem('attendanceData')) {
            localStorage.setItem('attendanceData', JSON.stringify(defaultAttendanceData));
        }
        
        // Redirect to dashboard
        window.location.href = 'src/html/dashboard.html';
    } else {
        // Show error
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.style.display = 'block';
        }
    }
}

/**
 * Handle logout functionality
 */
function handleLogout() {
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '../../index.html';
}

/**
 * Check if user is logged in
 */
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPath = window.location.pathname;
    
    if (!isLoggedIn && !currentPath.includes('index.html') && currentPath !== '/') {
        window.location.href = '../../index.html';
        return false;
    }
    
    if (isLoggedIn && (currentPath.includes('index.html') || currentPath === '/')) {
        window.location.href = 'src/html/dashboard.html';
        return false;
    }
    
    return true;
}

/**
 * Calculate attendance percentage
 */
function calculatePercentage(attended, total) {
    return total > 0 ? Math.round((attended / total) * 100) : 0;
}

/**
 * Calculate classes needed to reach 75% attendance
 * Formula: (attended + x) / (total + x) >= 0.75
 * Solving: x >= (0.75 * total - attended) / 0.25
 */
function calculateClassesNeeded(attended, total) {
    const targetPercentage = 0.75;
    const numerator = (targetPercentage * total) - attended;
    const denominator = 1 - targetPercentage;
    
    if (numerator <= 0) return 0;
    
    return Math.ceil(numerator / denominator);
}

/**
 * Calculate how many classes can be safely missed while maintaining 75%
 */
function calculateSafeLeaves(attended, total) {
    const currentPercentage = attended / total;
    if (currentPercentage < 0.75) return 0;
    
    // Find maximum x where (attended) / (total + x) >= 0.75
    const maxMiss = Math.floor(attended / 0.75) - total;
    return Math.max(0, maxMiss);
}

/**
 * Get attendance status based on percentage
 */
function getAttendanceStatus(percentage) {
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'warning';
    return 'danger';
}

/**
 * Get attendance badge class
 */
function getBadgeClass(percentage) {
    const status = getAttendanceStatus(percentage);
    return `badge-${status === 'good' ? 'good' : status === 'warning' ? 'warning' : 'danger'}`;
}

/**
 * Get progress bar class
 */
function getProgressClass(percentage) {
    const status = getAttendanceStatus(percentage);
    return `progress-${status === 'good' ? 'good' : status === 'warning' ? 'warning' : 'danger'}`;
}

/**
 * Analyze leave requirements for all subjects
 */
function analyzeLeaveRequirements(attendanceRecords) {
    return attendanceRecords.map(record => {
        const percentage = record.percentage;
        let analysis = {
            subject: record.subject,
            currentAttendance: percentage,
            totalClasses: record.totalClasses,
            attendedClasses: record.attendedClasses,
            status: 'safe',
            message: ''
        };

        if (percentage >= 75) {
            const canMiss = calculateSafeLeaves(record.attendedClasses, record.totalClasses);
            analysis.status = 'safe';
            analysis.canMiss = canMiss;
            analysis.message = canMiss > 0 
                ? `You can safely miss ${canMiss} more classes and still maintain 75% attendance.`
                : `You're at the minimum required attendance. Avoid missing any classes.`;
        } else {
            const needed = calculateClassesNeeded(record.attendedClasses, record.totalClasses);
            analysis.status = percentage >= 60 ? 'warning' : 'critical';
            analysis.classesNeeded = needed;
            analysis.message = `You need to attend ${needed} consecutive classes to reach 75% attendance.`;
        }

        return analysis;
    });
}

/**
 * Generate recommendations based on attendance data
 */
function generateRecommendations(leaveAnalysis) {
    const recommendations = [];
    
    const criticalSubjects = leaveAnalysis.filter(a => a.status === 'critical');
    const warningSubjects = leaveAnalysis.filter(a => a.status === 'warning');
    const safeSubjects = leaveAnalysis.filter(a => a.status === 'safe');

    if (criticalSubjects.length > 0) {
        recommendations.push(
            `🚨 URGENT: You have ${criticalSubjects.length} subject(s) with critical attendance. Focus on attending these classes: ${criticalSubjects.map(s => s.subject).join(', ')}.`
        );
    }

    if (warningSubjects.length > 0) {
        recommendations.push(
            `⚠️ WARNING: ${warningSubjects.length} subject(s) need attention. Try not to miss classes in: ${warningSubjects.map(s => s.subject).join(', ')}.`
        );
    }

    if (safeSubjects.length > 0) {
        const totalSafeLeaves = safeSubjects.reduce((sum, s) => sum + (s.canMiss || 0), 0);
        if (totalSafeLeaves > 0) {
            recommendations.push(
                `✅ GOOD: You have some flexibility in ${safeSubjects.length} subject(s). You can safely miss a total of ${totalSafeLeaves} classes across these subjects.`
            );
        }
    }

    if (recommendations.length === 0) {
        recommendations.push('📚 Keep up the good work! Maintain your current attendance pattern.');
    }

    return recommendations;
}

/**
 * Load student session data from localStorage
 */
function loadStudentSession() {
    const studentData = localStorage.getItem('currentStudent');
    if (studentData) {
        currentStudent = JSON.parse(studentData);
        updateWelcomeMessage();
        return true;
    }
    return false;
}

/**
 * Update welcome message
 */
function updateWelcomeMessage() {
    const welcomeElements = document.querySelectorAll('#welcomeMessage');
    const message = currentStudent ? `Welcome, ${currentStudent.name}` : 'Welcome';
    
    welcomeElements.forEach(element => {
        if (element) {
            element.textContent = message;
        }
    });
}

/**
 * Load attendance data from localStorage
 */
function loadAttendanceFromStorage() {
    const storedData = localStorage.getItem('attendanceData');
    const allAttendanceData = storedData ? JSON.parse(storedData) : defaultAttendanceData;
    
    if (currentStudent && allAttendanceData[currentStudent.id]) {
        attendanceData = allAttendanceData[currentStudent.id];
    } else {
        attendanceData = [];
    }
}

/**
 * Load and display dashboard data
 */
function loadDashboardData() {
    if (!checkLogin()) return;
    
    loadStudentSession();
    loadAttendanceFromStorage();
    
    if (attendanceData.length === 0) {
        return;
    }

    // Calculate overall statistics
    const totalClasses = attendanceData.reduce((sum, record) => sum + record.totalClasses, 0);
    const totalAttended = attendanceData.reduce((sum, record) => sum + record.attendedClasses, 0);
    const overallPercentage = calculatePercentage(totalAttended, totalClasses);
    
    // Update dashboard elements
    const overallAttendanceEl = document.getElementById('overallAttendance');
    const totalSubjectsEl = document.getElementById('totalSubjects');
    const attendanceStatusEl = document.getElementById('attendanceStatus');
    const subjectsListEl = document.getElementById('subjectsList');
    const criticalSubjectsEl = document.getElementById('criticalSubjects');
    const safeLeavesEl = document.getElementById('safeLeaves');

    if (overallAttendanceEl) {
        overallAttendanceEl.textContent = `${overallPercentage}%`;
    }

    if (totalSubjectsEl) {
        totalSubjectsEl.textContent = attendanceData.length.toString();
    }

    if (attendanceStatusEl) {
        const status = getAttendanceStatus(overallPercentage);
        attendanceStatusEl.textContent = status === 'good' ? 'Good' : status === 'warning' ? 'Warning' : 'Critical';
        attendanceStatusEl.className = `stat-value ${status}`;
    }

    if (subjectsListEl) {
        subjectsListEl.innerHTML = attendanceData.map(record => `
            <div style="margin-bottom: 8px;">
                <strong>${record.subject}</strong> - ${record.percentage}%
            </div>
        `).join('');
    }

    // Calculate leave analysis for critical subjects
    const leaveAnalysis = analyzeLeaveRequirements(attendanceData);
    const criticalCount = leaveAnalysis.filter(a => a.status === 'critical').length;
    const safeLeaves = leaveAnalysis
        .filter(a => a.status === 'safe')
        .reduce((sum, a) => sum + (a.canMiss || 0), 0);

    if (criticalSubjectsEl) {
        criticalSubjectsEl.textContent = criticalCount.toString();
    }

    if (safeLeavesEl) {
        safeLeavesEl.textContent = safeLeaves.toString();
    }
}

/**
 * Load and display attendance data
 */
function loadAttendanceData() {
    if (!checkLogin()) return;
    
    loadStudentSession();
    loadAttendanceFromStorage();
    
    if (attendanceData.length === 0) {
        return;
    }

    // Calculate overall percentage
    const totalClasses = attendanceData.reduce((sum, record) => sum + record.totalClasses, 0);
    const totalAttended = attendanceData.reduce((sum, record) => sum + record.attendedClasses, 0);
    const overallPercentage = calculatePercentage(totalAttended, totalClasses);

    // Update overall percentage
    const overallPercentageEl = document.getElementById('overallPercentage');
    if (overallPercentageEl) {
        overallPercentageEl.textContent = `${overallPercentage}%`;
    }

    // Display subject-wise attendance
    const attendanceListEl = document.getElementById('attendanceList');
    if (attendanceListEl) {
        attendanceListEl.innerHTML = attendanceData.map(record => `
            <div class="subject-card">
                <div class="subject-header">
                    <span class="subject-name">${record.subject}</span>
                    <span class="attendance-badge ${getBadgeClass(record.percentage)}">
                        ${record.percentage}%
                    </span>
                </div>
                
                <div class="attendance-details">
                    <div class="detail-row">
                        <span class="detail-label">Total Classes:</span>
                        <span class="detail-value">${record.totalClasses}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Attended:</span>
                        <span class="detail-value">${record.attendedClasses}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Missed:</span>
                        <span class="detail-value">${record.totalClasses - record.attendedClasses}</span>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill ${getProgressClass(record.percentage)}" 
                         style="width: ${record.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Load and display leave tracker data
 */
function loadLeaveTrackerData() {
    if (!checkLogin()) return;
    
    loadStudentSession();
    loadAttendanceFromStorage();
    
    if (attendanceData.length === 0) {
        return;
    }

    const leaveAnalysis = analyzeLeaveRequirements(attendanceData);
    const recommendations = generateRecommendations(leaveAnalysis);

    // Display leave analysis
    const leaveAnalysisEl = document.getElementById('leaveAnalysis');
    if (leaveAnalysisEl) {
        leaveAnalysisEl.innerHTML = leaveAnalysis.map(analysis => `
            <div class="leave-card ${analysis.status}">
                <div class="leave-header">
                    <span class="leave-subject">${analysis.subject}</span>
                    <span class="leave-status status-${analysis.status}">
                        ${analysis.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="leave-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Attendance:</span>
                        <span class="detail-value">${analysis.currentAttendance}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Classes (Attended/Total):</span>
                        <span class="detail-value">${analysis.attendedClasses}/${analysis.totalClasses}</span>
                    </div>
                </div>
                
                <div class="leave-message ${analysis.status}">
                    ${analysis.message}
                </div>
            </div>
        `).join('');
    }

    // Display recommendations
    const recommendationsEl = document.getElementById('recommendations');
    if (recommendationsEl) {
        recommendationsEl.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <p>${rec}</p>
            </div>
        `).join('');
    }
}

// Initialize page based on current location
// UI polish helpers (visual only)
function setActiveSidebarLink() {
    const links = document.querySelectorAll('.sidebar-menu a');
    const current = window.location.pathname.split('/').pop();

    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const isActive = href === current || (href === 'dashboard.html' && current === '');
        link.classList.toggle('active', isActive);
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function enhanceButtons() {
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(btn => {
        btn.addEventListener('pointerdown', () => btn.classList.add('is-pressed'));
        ['pointerup', 'pointerleave'].forEach(evt => {
            btn.addEventListener(evt, () => btn.classList.remove('is-pressed'));
        });
    });
}

function initUIEnhancements() {
    setActiveSidebarLink();
    enhanceButtons();
    updateStudentName();
}

/**
 * Update student name in navbar
 */
function updateStudentName() {
    const studentNameEl = document.getElementById('studentName');
    if (studentNameEl && currentStudent) {
        studentNameEl.textContent = currentStudent.name;
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const navbarMenu = document.getElementById('navbarMenu');
    if (navbarMenu) {
        navbarMenu.classList.toggle('active');
    }
}

/**
 * Toggle dropdown menu
 */
function toggleDropdown(event, dropdownId) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== dropdownId) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('show');
}

/**
 * Close dropdowns when clicking outside
 */
document.addEventListener('click', function(event) {
    if (!event.target.closest('.nav-dropdown') && !event.target.closest('.navbar-user')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

/**
 * Close mobile menu when clicking a link
 */
document.addEventListener('click', function(event) {
    if (event.target.closest('.navbar-menu .nav-link') && !event.target.closest('.nav-dropdown')) {
        const navbarMenu = document.getElementById('navbarMenu');
        if (navbarMenu && navbarMenu.classList.contains('active')) {
            navbarMenu.classList.remove('active');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard.html')) {
        loadDashboardData();
    } else if (currentPath.includes('attendance.html')) {
        loadAttendanceData();
    } else if (currentPath.includes('leave-tracker.html')) {
        loadLeaveTrackerData();
    }

    initUIEnhancements();
});