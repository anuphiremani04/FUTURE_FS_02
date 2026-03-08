// ========================================
// APP.JS - Main Application Logic
// ========================================

class CRMApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.navigationInitialized = false;
        this.searchBarInitialized = false;
        this.darkModeInitialized = false;
        this.notificationsInitialized = false;
        this.authResizeObserver = null;
        this.initEventListeners();
        this.checkAuth();
    }

    initEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        this.initAuthModeToggle();

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Real-time validation
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            
            if (emailInput) {
                emailInput.addEventListener('blur', () => this.validateEmailField(emailInput.value, 'loginEmailError'));
                emailInput.addEventListener('input', () => this.clearError('loginEmailError'));
            }
            if (passwordInput) {
                passwordInput.addEventListener('input', () => this.clearError('loginPasswordError'));
            }
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));

            const registerName = document.getElementById('registerName');
            const registerEmail = document.getElementById('registerEmail');
            const registerPassword = document.getElementById('registerPassword');
            const registerConfirmPassword = document.getElementById('registerConfirmPassword');

            if (registerName) {
                registerName.addEventListener('input', () => this.clearError('registerNameError'));
            }
            if (registerEmail) {
                registerEmail.addEventListener('blur', () => this.validateEmailField(registerEmail.value, 'registerEmailError'));
                registerEmail.addEventListener('input', () => this.clearError('registerEmailError'));
            }
            if (registerPassword) {
                registerPassword.addEventListener('input', () => this.clearError('registerPasswordError'));
            }
            if (registerConfirmPassword) {
                registerConfirmPassword.addEventListener('input', () => this.clearError('registerConfirmPasswordError'));
            }
        }
    }

    initAuthModeToggle() {
        const showLoginBtn = document.getElementById('showLoginBtn');
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authFormsWrap = document.getElementById('authFormsWrap');

        if (!showLoginBtn || !showRegisterBtn || !loginForm || !registerForm) return;

        const getActiveForm = () => loginForm.classList.contains('active') ? loginForm : registerForm;

        const setWrapHeight = (targetForm, animate = true) => {
            if (!authFormsWrap || !targetForm) return;
            if (!animate) {
                authFormsWrap.style.height = `${targetForm.scrollHeight}px`;
                return;
            }

            const currentHeight = authFormsWrap.getBoundingClientRect().height || getActiveForm().scrollHeight;
            authFormsWrap.style.height = `${currentHeight}px`;

            requestAnimationFrame(() => {
                authFormsWrap.style.height = `${targetForm.scrollHeight}px`;
            });
        };

        const switchMode = (mode) => {
            const isLogin = mode === 'login';
            loginForm.classList.toggle('active', isLogin);
            registerForm.classList.toggle('active', !isLogin);
            showLoginBtn.classList.toggle('active', isLogin);
            showRegisterBtn.classList.toggle('active', !isLogin);
            this.clearAuthMessages();

            const targetForm = isLogin ? loginForm : registerForm;
            setWrapHeight(targetForm, true);
        };

        showLoginBtn.addEventListener('click', () => switchMode('login'));
        showRegisterBtn.addEventListener('click', () => switchMode('register'));

        // Set initial wrap height and keep it synced when form content changes.
        setWrapHeight(getActiveForm(), false);

        if (typeof ResizeObserver !== 'undefined' && authFormsWrap) {
            if (this.authResizeObserver) {
                this.authResizeObserver.disconnect();
            }

            this.authResizeObserver = new ResizeObserver(() => {
                setWrapHeight(getActiveForm(), false);
            });

            this.authResizeObserver.observe(loginForm);
            this.authResizeObserver.observe(registerForm);
        }
    }

    validateEmailField(email, errorId) {
        const emailError = document.getElementById(errorId);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailError) return emailRegex.test(email);
        
        if (!emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.remove('success');
            emailError.classList.add('show');
            return false;
        }
        emailError.classList.remove('show');
        emailError.classList.remove('success');
        return true;
    }

    clearAuthMessages() {
        [
            'loginEmailError',
            'loginPasswordError',
            'loginFormError',
            'registerNameError',
            'registerEmailError',
            'registerPasswordError',
            'registerConfirmPasswordError',
            'registerFormError'
        ].forEach((id) => this.clearError(id));
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
            element.classList.remove('success');
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const formError = document.getElementById('loginFormError');

        // Validation
        if (!this.validateEmailField(email, 'loginEmailError')) {
            return;
        }

        if (password.length < 3) {
            const passwordError = document.getElementById('loginPasswordError');
            passwordError.textContent = 'Password must be at least 3 characters';
            passwordError.classList.remove('success');
            passwordError.classList.add('show');
            return;
        }

        if (formError) {
            formError.classList.remove('show');
            formError.classList.remove('success');
        }

        try {
            const result = await storage.login(email, password);
            this.currentUser = {
                ...result.user,
                loginTime: new Date().toLocaleString()
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            window.location.href = 'dashboard.html';
        } catch (error) {
            formError.textContent = 'Invalid email or password. Please check your credentials or register a new account.';
            formError.classList.remove('success');
            formError.classList.add('show');
            document.getElementById('loginPassword').value = '';
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const formMessage = document.getElementById('registerFormError');

        this.clearAuthMessages();

        if (!name) {
            const nameError = document.getElementById('registerNameError');
            nameError.textContent = 'Please enter your full name';
            nameError.classList.add('show');
            return;
        }

        if (!this.validateEmailField(email, 'registerEmailError')) {
            return;
        }

        if (password.length < 3) {
            const passwordError = document.getElementById('registerPasswordError');
            passwordError.textContent = 'Password must be at least 3 characters';
            passwordError.classList.add('show');
            return;
        }

        if (confirmPassword !== password) {
            const confirmError = document.getElementById('registerConfirmPasswordError');
            confirmError.textContent = 'Passwords do not match';
            confirmError.classList.add('show');
            return;
        }

        try {
            await storage.register({ name, email, password });
        } catch (error) {
            const emailError = document.getElementById('registerEmailError');
            emailError.textContent = error.message || 'Unable to register right now';
            emailError.classList.add('show');
            return;
        }

        if (formMessage) {
            formMessage.textContent = 'Account created successfully. Please sign in.';
            formMessage.classList.add('show');
            formMessage.classList.add('success');
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.reset();

        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.value = email;

        const showLoginBtn = document.getElementById('showLoginBtn');
        if (showLoginBtn) showLoginBtn.click();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (currentPage === 'index.html' && token) {
            // Redirect to dashboard if already logged in
            window.location.href = 'dashboard.html';
            return;
        }

        if (currentPage !== 'index.html' && !token) {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
            return;
        }

        if (token) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            storage.ready
                .then(() => {
                    this.loadPage('dashboard');
                })
                .catch(() => {
                    storage.clearSession();
                    window.location.href = 'index.html';
                });
        }
    }

    logout() {
        const logoutModal = document.getElementById('logoutConfirmModal');
        if (logoutModal) {
            logoutModal.classList.add('active');
            return;
        }

        this.confirmLogout();
    }

    async confirmLogout() {
        await storage.logout();
        window.location.href = 'index.html';
    }

    initNavigation() {
        if (this.navigationInitialized) {
            this.updateActiveLink();
            return;
        }

        const navLinks = document.querySelectorAll('.sidebar-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.loadPage(page);
            });
        });

        this.navigationInitialized = true;

        // Set active link
        this.updateActiveLink();
    }

    initSearchBar() {
        if (this.searchBarInitialized) return;

        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                if (query === '') {
                    // Reset to current page data
                    if (this.currentPage === 'leads') {
                        this.renderLeadsTable();
                    } else if (this.currentPage === 'clients') {
                        this.renderClientsTable();
                    }
                    return;
                }

                // Search based on current page
                if (this.currentPage === 'leads') {
                    const searchResults = storage.searchLeads(query);
                    this.renderLeadsTable(searchResults);
                } else if (this.currentPage === 'clients') {
                    const searchResults = storage.searchClients(query);
                    this.renderClientsTable(searchResults);
                }
            });

            this.searchBarInitialized = true;
        }
    }

    loadPage(page) {
        this.currentPage = page;
        
        // Hide all sections
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(section => section.classList.remove('active'));

        // Show requested section
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.updateNavbarTitle(page);
            this.updateActiveLink();

            // Initialize page-specific functionality
            if (page === 'dashboard') {
                this.initDashboard();
            } else if (page === 'leads') {
                this.initLeadsPage();
            } else if (page === 'clients') {
                this.initClientsPage();
            } else if (page === 'pipeline') {
                this.initPipelinePage();
            } else if (page === 'followups') {
                this.initFollowupsPage();
            } else if (page === 'reports') {
                this.initReportsPage();
            }
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    updateNavbarTitle(page) {
        const navbarTitle = document.querySelector('.navbar-title');
        const titles = {
            'dashboard': 'Dashboard',
            'leads': 'Lead Management',
            'clients': 'Client Management',
            'pipeline': 'Sales Pipeline',
            'followups': 'Follow-up Reminders',
            'reports': 'Reports & Analytics'
        };
        if (navbarTitle) {
            navbarTitle.textContent = titles[page] || 'CRM System';
        }
    }

    updateActiveLink() {
        const navLinks = document.querySelectorAll('.sidebar-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    initDarkMode() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';

        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            if (darkModeBtn) darkModeBtn.textContent = '☀️';
        }

        if (darkModeBtn && !this.darkModeInitialized) {
            darkModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDarkMode);
                darkModeBtn.textContent = isDarkMode ? '☀️' : '🌙';
                storage.addActivity('Dark Mode', isDarkMode ? 'Enabled' : 'Disabled', 'settings');
            });

            this.darkModeInitialized = true;
        }

        if (!document.body.classList.contains('theme-ready')) {
            requestAnimationFrame(() => {
                document.body.classList.add('theme-ready');
            });
        }
    }

    initNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn && !this.notificationsInitialized) {
            notificationBtn.addEventListener('click', () => {
                this.showNotificationPanel();
            });

            this.notificationsInitialized = true;
        }
    }

    showNotificationPanel() {
        const overdueFollowups = storage.getFollowups().filter(
            f => !f.completed && new Date(f.dueDate) < new Date()
        );

        if (overdueFollowups.length > 0) {
            const message = `You have ${overdueFollowups.length} overdue follow-up(s)`;
            this.showAlert('warning', message);
        } else {
            this.showAlert('success', 'No notifications. All follow-ups are on track!');
        }
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            ${message}
            <button class="alert-close">&times;</button>
        `;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '100px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '2001';
        alertDiv.style.maxWidth = '400px';

        document.body.appendChild(alertDiv);

        const closeBtn = alertDiv.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            alertDiv.remove();
        });

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // ========== PAGE INITIALIZATION FUNCTIONS ==========

    initDashboard() {
        // Navbar and sidebar listeners should be available across all pages.
        this.initNavigation();
        this.initSearchBar();
        this.initDarkMode();
        this.initNotifications();

        this.updateDashboardStats();

        // Initialize dashboard charts
        this.initCharts();

        // Initialize clickable dashboard cards
        this.initDashboardCardClickHandlers();
    }

    initDashboardCardClickHandlers() {
        const clickableCards = document.querySelectorAll('.clickable-card');
        
        clickableCards.forEach(card => {
            if (card._hasListener) return;

            card.addEventListener('click', () => {
                const action = card.dataset.action;
                const details = this.getDashboardMetricDetails(action);
                this.showDashboardMetricDetails(details);
            });

            card._hasListener = true;
        });
    }

    getDashboardMetricDetails(action) {
        const leads = storage.getLeads();
        const clients = storage.getClients();
        const toLower = (value) => (value || '').toString().trim().toLowerCase();

        switch (action) {
            case 'viewActiveClients': {
                const activeClients = clients.filter((client) => toLower(client.status) === 'active');
                return {
                    title: 'Active Clients',
                    subtitle: 'Clients currently marked as active',
                    columns: ['Client', 'Company', 'Status', 'Deal Value'],
                    rows: activeClients.map((client) => [
                        client.name,
                        client.company,
                        client.status,
                        this.formatCurrency(client.dealValue || 0)
                    ])
                };
            }

            case 'viewPendingDeals': {
                const pendingLeads = leads.filter((lead) => {
                    const status = toLower(lead.status);
                    return status === 'contacted' || status === 'qualified';
                });

                return {
                    title: 'Pending Deals',
                    subtitle: 'Leads in Contacted or Qualified status',
                    columns: ['Lead', 'Company', 'Status', 'Value'],
                    rows: pendingLeads.map((lead) => [
                        lead.name,
                        lead.company,
                        lead.status,
                        this.formatCurrency(lead.value || 0)
                    ])
                };
            }

            case 'viewRevenue': {
                const sortedClients = [...clients].sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0));
                return {
                    title: 'Revenue Details',
                    subtitle: 'Client deals sorted by value',
                    columns: ['Client', 'Company', 'Deal Value', 'Status'],
                    rows: sortedClients.map((client) => [
                        client.name,
                        client.company,
                        this.formatCurrency(client.dealValue || 0),
                        client.status
                    ])
                };
            }

            case 'viewHighPriorityLeads': {
                const highPriorityLeads = leads.filter((lead) => Number(lead.score || 0) >= 70);
                return {
                    title: 'High-Priority Leads',
                    subtitle: 'Leads with score 70 or above',
                    columns: ['Lead', 'Company', 'Score', 'Status'],
                    rows: highPriorityLeads.map((lead) => [
                        lead.name,
                        lead.company,
                        String(lead.score || 0),
                        lead.status
                    ])
                };
            }

            case 'viewConvertedLeads': {
                const convertedLeads = leads.filter((lead) => toLower(lead.status) === 'converted');
                return {
                    title: 'Converted Leads',
                    subtitle: 'Leads successfully converted to clients',
                    columns: ['Lead', 'Company', 'Source', 'Value'],
                    rows: convertedLeads.map((lead) => [
                        lead.name,
                        lead.company,
                        lead.source,
                        this.formatCurrency(lead.value || 0)
                    ])
                };
            }

            case 'viewAllLeads':
            default: {
                return {
                    title: 'All Leads',
                    subtitle: 'All records included in this metric',
                    columns: ['Lead', 'Company', 'Status', 'Score', 'Value'],
                    rows: leads.map((lead) => [
                        lead.name,
                        lead.company,
                        lead.status,
                        String(lead.score || 0),
                        this.formatCurrency(lead.value || 0)
                    ])
                };
            }
        }
    }

    showDashboardMetricDetails(details) {
        const modal = document.getElementById('metricDetailsModal');
        const title = document.getElementById('metricDetailsTitle');
        const subtitle = document.getElementById('metricDetailsSubtitle');
        const tableHead = document.getElementById('metricDetailsHead');
        const tableBody = document.getElementById('metricDetailsBody');
        const count = document.getElementById('metricDetailsCount');

        if (!modal || !title || !subtitle || !tableHead || !tableBody || !count) return;

        title.textContent = details.title;
        subtitle.textContent = details.subtitle;
        count.textContent = `${details.rows.length} record(s)`;

        tableHead.innerHTML = details.columns
            .map((column) => `<th>${this.escapeHtml(column)}</th>`)
            .join('');

        if (details.rows.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${details.columns.length}" class="metric-empty-state">No records found.</td></tr>`;
        } else {
            tableBody.innerHTML = details.rows
                .map((row) => `<tr>${row.map((cell) => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`)
                .join('');
        }

        modal.classList.add('active');
    }

    formatCurrency(amount) {
        return `$${Number(amount || 0).toLocaleString()}`;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    initLeadsPage() {
        this.renderLeadsTable();
        this.setupLeadsFilters();
        // Modal setup is handled in DOMContentLoaded
    }

    setupAddLeadModal() {
        // Modal setup is handled in DOMContentLoaded event
    }

    initClientsPage() {
        this.renderClientsTable();
        // Modal setup is handled in DOMContentLoaded
    }

    setupAddClientModal() {
        // Modal setup is handled in DOMContentLoaded event
    }

    initFollowupsPage() {
        this.renderFollowupsTable();
        // Modal setup is handled in DOMContentLoaded
    }

    setupAddFollowupModal() {
        // Modal setup is handled in DOMContentLoaded event
    }

    initPipelinePage() {
        this.renderPipelineBoard();
    }

    initReportsPage() {
        // This will be handled in reports.js with Chart.js
    }

    // ========== UTILITY METHODS ==========

    renderLeadsTable(leadsToRender = null) {
        const leads = leadsToRender || storage.getLeads();
        const tableBody = document.querySelector('#leadsTable tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = '';

        leads.forEach(lead => {
            const row = document.createElement('tr');
            const statusBadgeClass = this.getStatusBadgeClass(lead.status);
            const scoreBadgeClass = storage.getLeadQualityClass(lead.score || 0);
            const leadQuality = storage.getLeadQuality(lead.score || 0);
            
            row.innerHTML = `
                <td><strong>${lead.name}</strong></td>
                <td>${lead.company}</td>
                <td>${lead.email}</td>
                <td>${lead.phone}</td>
                <td><span class="badge ${statusBadgeClass}">${lead.status}</span></td>
                <td>${lead.source}</td>
                <td><span class="badge ${scoreBadgeClass}" title="Score: ${lead.score || 0}/100">${lead.score || 0} <i class="fas fa-star"></i></span><br><small style="color: #64748b;">${leadQuality}</small></td>
                <td>${lead.salesperson}</td>
                <td>$${lead.value?.toLocaleString() || 0}</td>
                <td>
                    <div class="table-actions-cell">
                        <button class="table-btn view" onclick="app.editLead('${lead.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="table-btn delete" onclick="app.deleteLead('${lead.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderClientsTable(clientsToRender = null) {
        const clients = clientsToRender || storage.getClients();
        const tableBody = document.querySelector('#clientsTable tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = '';

        clients.forEach(client => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><strong>${client.name}</strong></td>
                <td>${client.company}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>$${client.dealValue?.toLocaleString() || 0}</td>
                <td><span class="badge badge-success">${client.status}</span></td>
                <td>
                    <div class="table-actions-cell">
                        <button class="table-btn edit" onclick="app.editClient('${client.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="table-btn delete" onclick="app.deleteClient('${client.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderFollowupsTable() {
        const followups = storage.getFollowups();
        const tableBody = document.querySelector('#followupsTable tbody');
        
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];

        followups.forEach(followup => {
            const row = document.createElement('tr');
            const isOverdue = followup.dueDate < today && !followup.completed;
            const isCompleted = followup.completed;
            
            row.innerHTML = `
                <td><strong>${followup.title}</strong></td>
                <td>${followup.relatedTo}</td>
                <td>${followup.dueDate}</td>
                <td>
                    <span class="badge ${isCompleted ? 'badge-success' : isOverdue ? 'badge-danger' : 'badge-warning'}">
                        ${isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                </td>
                <td>${followup.description || '-'}</td>
                <td>
                    <div class="table-actions-cell">
                        ${!isCompleted ? `<button class="table-btn success" onclick="app.markFollowupComplete('${followup.id}')">
                            <i class="fas fa-check"></i> Complete
                        </button>` : ''}
                        <button class="table-btn delete" onclick="app.deleteFollowup('${followup.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderPipelineBoard() {
        const leads = storage.getLeads();
        const pipelineStages = ['New Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
        
        const boardContainer = document.getElementById('pipelineBoard');
        if (!boardContainer) return;

        boardContainer.innerHTML = '';

        pipelineStages.forEach(stage => {
            const stageLeads = leads.filter(l => l.pipeline === stage);
            const column = document.createElement('div');
            column.className = 'kanban-column';
            
            let columnHTML = `
                <div class="kanban-header">
                    <span>${stage}</span>
                    <span class="kanban-count">${stageLeads.length}</span>
                </div>
                <div class="kanban-cards" data-pipeline="${stage}">
            `;

            stageLeads.forEach(lead => {
                columnHTML += `
                    <div class="kanban-card" draggable="true" data-lead-id="${lead.id}" data-pipeline="${stage}">
                        <div class="kanban-card-title">${lead.name}</div>
                        <div class="kanban-card-company">${lead.company}</div>
                        <div class="kanban-card-footer">
                            <span style="font-size: 12px;">$${lead.value?.toLocaleString() || 0}</span>
                            <span style="font-size: 11px; color: #94a3b8;">${lead.salesperson}</span>
                        </div>
                    </div>
                `;
            });

            if (stageLeads.length === 0) {
                columnHTML += '<div class="kanban-empty">No leads in this stage<br>Drag a lead card here</div>';
            }

            columnHTML += '</div>';
            column.innerHTML = columnHTML;
            boardContainer.appendChild(column);
        });

        this.initDragAndDrop();
    }

    initDragAndDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.currentTarget.classList.add('dragging');
            });

            card.addEventListener('dragend', (e) => {
                e.currentTarget.classList.remove('dragging');
            });
        });

        const columns = document.querySelectorAll('.kanban-cards');
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.kanban-card.dragging');
                if (draggingCard) {
                    const leadId = draggingCard.getAttribute('data-lead-id');
                    const newPipeline = column.getAttribute('data-pipeline');
                    const oldPipeline = draggingCard.getAttribute('data-pipeline');
                    
                    if (newPipeline !== oldPipeline) {
                        await storage.updateLead(leadId, { pipeline: newPipeline });
                        this.renderPipelineBoard();
                        this.refreshDashboardVisuals();
                        app.showAlert('success', `Lead moved to ${newPipeline}`);
                    }
                }
            });
        });
    }

    setupLeadsFilters() {
        // Status filter
        const statusSelect = document.getElementById('statusFilter');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                const status = e.target.value;
                this.filterLeadsByStatus(status);
            });
        }

        // Source filter
        const sourceSelect = document.getElementById('sourceFilter');
        if (sourceSelect) {
            sourceSelect.addEventListener('change', (e) => {
                const source = e.target.value;
                this.filterLeadsBySource(source);
            });
        }

        // Search
        const searchInput = document.getElementById('leadsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                this.searchLeads(query);
            });
        }

        // Export CSV
        const exportBtn = document.getElementById('exportLeadsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                storage.exportLeadsToCSV();
                app.showAlert('success', 'Leads exported to CSV successfully!');
            });
        }
    }

    filterLeadsByStatus(status) {
        const leads = status === 'all' ? storage.getLeads() : storage.filterLeadsByStatus(status);
        this.renderLeadsTable(leads);
    }

    filterLeadsBySource(source) {
        const leads = source === 'all' ? storage.getLeads() : storage.getLeads().filter(l => l.source === source);
        this.renderLeadsTable(leads);
    }

    searchLeads(query) {
        if (query === '') {
            this.renderLeadsTable();
        } else {
            const results = storage.searchLeads(query);
            this.renderLeadsTable(results);
        }
    }

    getStatusBadgeClass(status) {
        const statusClasses = {
            'New': 'badge-primary',
            'Contacted': 'badge-info',
            'Qualified': 'badge-warning',
            'Lost': 'badge-danger',
            'Converted': 'badge-success'
        };
        return statusClasses[status] || 'badge-primary';
    }

    setupAddLeadModal() {
        const addLeadBtn = document.getElementById('addLeadBtn');
        const addLeadModal = document.getElementById('addLeadModal');
        const closeBtn = addLeadModal?.querySelector('.modal-close-btn');
        const form = addLeadModal?.querySelector('form');

        if (addLeadBtn) {
            addLeadBtn.addEventListener('click', () => {
                if (addLeadModal) addLeadModal.classList.add('active');
                this.clearAddLeadForm();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (addLeadModal) addLeadModal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddLeadForm();
            });
        }

        if (addLeadModal) {
            addLeadModal.addEventListener('click', (e) => {
                if (e.target === addLeadModal) {
                    addLeadModal.classList.remove('active');
                }
            });
        }
    }

    clearAddLeadForm() {
        const form = document.querySelector('#addLeadModal form');
        if (form) {
            form.reset();
        }
    }



    editLead(leadId) {
        const lead = storage.getLead(leadId);
        if (!lead) return;

        // For now, just show an alert. Can be expanded to show an edit modal
        this.showAlert('info', `Editing: ${lead.name} - Feature available in extended version`);
    }

    async deleteLead(leadId) {
        if (confirm('Are you sure you want to delete this lead?')) {
            const lead = storage.getLead(leadId);
            await storage.deleteLead(leadId);
            this.renderLeadsTable();
            this.showAlert('success', `Lead "${lead?.name}" deleted successfully!`);
            this.refreshDashboardVisuals();
        }
    }

    setupAddClientModal() {
        const addClientBtn = document.getElementById('addClientBtn');
        const addClientModal = document.getElementById('addClientModal');
        const closeBtn = addClientModal?.querySelector('.modal-close-btn');
        const form = addClientModal?.querySelector('form');

        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => {
                if (addClientModal) addClientModal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (addClientModal) addClientModal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddClientForm();
            });
        }

        if (addClientModal) {
            addClientModal.addEventListener('click', (e) => {
                if (e.target === addClientModal) {
                    addClientModal.classList.remove('active');
                }
            });
        }
    }



    editClient(clientId) {
        const client = storage.getClient(clientId);
        if (!client) return;

        this.showAlert('info', `Editing: ${client.name} - Feature available in extended version`);
    }

    async deleteClient(clientId) {
        if (confirm('Are you sure you want to delete this client?')) {
            const client = storage.getClient(clientId);
            await storage.deleteClient(clientId);
            this.renderClientsTable();
            this.showAlert('success', `Client "${client?.name}" deleted successfully!`);
            this.refreshDashboardVisuals();
        }
    }

    setupAddFollowupModal() {
        const addFollowupBtn = document.getElementById('addFollowupBtn');
        const addFollowupModal = document.getElementById('addFollowupModal');
        const closeBtn = addFollowupModal?.querySelector('.modal-close-btn');
        const form = addFollowupModal?.querySelector('form');

        if (addFollowupBtn) {
            addFollowupBtn.addEventListener('click', () => {
                if (addFollowupModal) addFollowupModal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (addFollowupModal) addFollowupModal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddFollowupForm();
            });
        }

        if (addFollowupModal) {
            addFollowupModal.addEventListener('click', (e) => {
                if (e.target === addFollowupModal) {
                    addFollowupModal.classList.remove('active');
                }
            });
        }
    }



    async markFollowupComplete(followupId) {
        await storage.markFollowupComplete(followupId);
        this.renderFollowupsTable();
        this.showAlert('success', 'Follow-up marked as completed!');
    }

    async deleteFollowup(followupId) {
        if (confirm('Are you sure you want to delete this follow-up?')) {
            const followup = storage.getFollowup(followupId);
            await storage.deleteFollowup(followupId);
            this.renderFollowupsTable();
            this.showAlert('success', `Follow-up "${followup?.title}" deleted successfully!`);
        }
    }

    updateDashboardStats() {
        const stats = storage.getStatistics();
        const averageScore = storage.getAverageLeadScore();
        const highPriorityLeads = storage.getHighPriorityLeadsCount();
        const conversionRate = storage.getConversionRatePercentage();

        const statCards = {
            'totalLeads': stats.totalLeads,
            'activeClients': stats.activeClients,
            'pendingDeals': stats.pendingDeals,
            'totalRevenue': '$' + stats.totalRevenue.toLocaleString(),
            'averageLeadScore': averageScore,
            'highPriorityLeads': highPriorityLeads,
            'conversionRatePercentage': conversionRate + '%'
        };

        for (const [key, value] of Object.entries(statCards)) {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        }
    }

    refreshDashboardVisuals() {
        this.updateDashboardStats();
        this.initCharts();
    }

    initCharts() {
        // Delegate chart rendering to reports.js
        if (typeof window.initCharts === 'function') {
            window.initCharts();
            // Run once more after layout settles to prevent zero-size canvas renders.
            setTimeout(() => {
                if (typeof window.initCharts === 'function') {
                    window.initCharts();
                }
            }, 200);
        }
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CRMApp();

    // Ensure charts render on initial dashboard load.
    setTimeout(() => {
        if (app && app.currentPage === 'dashboard') {
            app.initCharts();
        }
    }, 250);

    // Setup modal form handlers for dashboard.html
    setTimeout(() => {
        // Add button handlers to open modals
        const addLeadBtn = document.getElementById('addLeadBtn');
        if (addLeadBtn && !addLeadBtn._hasListener) {
            addLeadBtn.addEventListener('click', () => {
                const modal = document.getElementById('addLeadModal');
                if (modal) modal.classList.add('active');
            });
            addLeadBtn._hasListener = true;
        }

        const addClientBtn = document.getElementById('addClientBtn');
        if (addClientBtn && !addClientBtn._hasListener) {
            addClientBtn.addEventListener('click', () => {
                const modal = document.getElementById('addClientModal');
                if (modal) modal.classList.add('active');
            });
            addClientBtn._hasListener = true;
        }

        const addFollowupBtn = document.getElementById('addFollowupBtn');
        if (addFollowupBtn && !addFollowupBtn._hasListener) {
            addFollowupBtn.addEventListener('click', () => {
                const modal = document.getElementById('addFollowupModal');
                if (modal) modal.classList.add('active');
            });
            addFollowupBtn._hasListener = true;
        }

        // Logout confirmation modal handlers
        const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
        if (confirmLogoutBtn && !confirmLogoutBtn._hasListener) {
            confirmLogoutBtn.addEventListener('click', () => {
                app.confirmLogout();
            });
            confirmLogoutBtn._hasListener = true;
        }

        const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
        if (cancelLogoutBtn && !cancelLogoutBtn._hasListener) {
            cancelLogoutBtn.addEventListener('click', () => {
                const modal = document.getElementById('logoutConfirmModal');
                if (modal) modal.classList.remove('active');
            });
            cancelLogoutBtn._hasListener = true;
        }

        // Add Lead Modal
        const addLeadForm = document.querySelector('#addLeadModal form');
        if (addLeadForm && !addLeadForm._hasListener) {
            addLeadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(addLeadForm);
                const lead = {
                    name: formData.get('name'),
                    company: formData.get('company'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    source: formData.get('source'),
                    status: 'New',
                    salesperson: formData.get('salesperson'),
                    notes: formData.get('notes'),
                    value: parseInt(formData.get('value')) || 0
                };

                if (!lead.name || !lead.company || !lead.email || !lead.phone) {
                    app.showAlert('warning', 'Please fill in all required fields');
                    return;
                }

                await storage.addLead(lead);
                app.renderLeadsTable();
                const modal = document.getElementById('addLeadModal');
                if (modal) modal.classList.remove('active');
                app.showAlert('success', `Lead "${lead.name}" added successfully!`);
                app.refreshDashboardVisuals();
                addLeadForm.reset();
            });
            addLeadForm._hasListener = true;
        }

        // Add Client Modal
        const addClientForm = document.querySelector('#addClientModal form');
        if (addClientForm && !addClientForm._hasListener) {
            addClientForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(addClientForm);
                const client = {
                    name: formData.get('name'),
                    company: formData.get('company'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    assignedTo: formData.get('assignedTo'),
                    dealValue: parseInt(formData.get('dealValue')) || 0,
                    status: 'Active',
                    notes: formData.get('notes')
                };

                if (!client.name || !client.company || !client.email || !client.phone || !client.dealValue) {
                    app.showAlert('warning', 'Please fill in all required fields');
                    return;
                }

                await storage.addClient(client);
                app.renderClientsTable();
                const modal = document.getElementById('addClientModal');
                if (modal) modal.classList.remove('active');
                app.showAlert('success', `Client "${client.name}" added successfully!`);
                app.refreshDashboardVisuals();
                addClientForm.reset();
            });
            addClientForm._hasListener = true;
        }

        // Add Followup Modal
        const addFollowupForm = document.querySelector('#addFollowupModal form');
        if (addFollowupForm && !addFollowupForm._hasListener) {
            addFollowupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(addFollowupForm);
                const followup = {
                    title: formData.get('title'),
                    relatedTo: formData.get('relatedTo'),
                    dueDate: formData.get('dueDate'),
                    description: formData.get('description')
                };

                if (!followup.title || !followup.relatedTo || !followup.dueDate) {
                    app.showAlert('warning', 'Please fill in all required fields');
                    return;
                }

                await storage.addFollowup(followup);
                app.renderFollowupsTable();
                const modal = document.getElementById('addFollowupModal');
                if (modal) modal.classList.remove('active');
                app.showAlert('success', `Follow-up "${followup.title}" created successfully!`);
                addFollowupForm.reset();
            });
            addFollowupForm._hasListener = true;
        }

        // Modal close button handlers
        const closeButtons = document.querySelectorAll('.modal-close-btn');
        closeButtons.forEach(btn => {
            if (!btn._hasListener) {
                btn.addEventListener('click', (e) => {
                    const modal = btn.closest('.modal');
                    if (modal) modal.classList.remove('active');
                });
                btn._hasListener = true;
            }
        });

        // Modal backdrop click handlers
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (!modal._hasListener) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
                modal._hasListener = true;
            }
        });
    }, 100);
});
