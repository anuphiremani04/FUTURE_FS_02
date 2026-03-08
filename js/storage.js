// ========================================
// STORAGE.JS - API Data Management (Node + MySQL)
// ========================================

class StorageManager {
    constructor() {
        this.apiBase = window.location.origin.includes('5000') ? '/api' : 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken') || '';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

        this.leads = [];
        this.clients = [];
        this.followups = [];
        this.activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');

        this.analytics = {
            leadsPerMonth: {},
            conversionRate: {},
            revenue: {}
        };

        this.ready = this.initializeStorage();
    }

    async initializeStorage() {
        if (!this.token) return;

        try {
            await this.refreshAllData();
        } catch (error) {
            this.clearSession();
        }
    }

    setToken(token) {
        this.token = token || '';
        if (this.token) {
            localStorage.setItem('authToken', this.token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    clearSession() {
        this.setToken('');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.leads = [];
        this.clients = [];
        this.followups = [];
        this.analytics = { leadsPerMonth: {}, conversionRate: {}, revenue: {} };
    }

    async apiRequest(endpoint, options = {}) {
        const { auth = true, method = 'GET', body = null } = options;

        const headers = {
            'Content-Type': 'application/json'
        };

        if (auth && this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                this.clearSession();
            }
            throw new Error(data.message || `Request failed with ${response.status}`);
        }

        return data;
    }

    async login(email, password) {
        const result = await this.apiRequest('/login', {
            auth: false,
            method: 'POST',
            body: { email, password }
        });

        this.setToken(result.token);
        this.currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        await this.refreshAllData();
        this.addActivity('Logged In', `User ${email} logged in`, 'auth');

        return result;
    }

    async register(payload) {
        const result = await this.apiRequest('/register', {
            auth: false,
            method: 'POST',
            body: payload
        });

        return result;
    }

    async logout() {
        this.addActivity('Logged Out', 'User logged out', 'auth');
        this.clearSession();
    }

    async refreshAllData() {
        await Promise.all([this.loadLeads(), this.loadClients(), this.loadFollowups()]);
        await this.loadAnalytics();
    }

    async loadLeads() {
        const data = await this.apiRequest('/leads');
        this.leads = Array.isArray(data) ? data : [];
        return this.leads;
    }

    async loadClients() {
        const data = await this.apiRequest('/clients');
        this.clients = Array.isArray(data) ? data : [];
        return this.clients;
    }

    async loadFollowups() {
        const data = await this.apiRequest('/followups');
        this.followups = Array.isArray(data) ? data : [];
        return this.followups;
    }

    async loadAnalytics() {
        const [leadsPerMonth, conversionRate, revenue] = await Promise.all([
            this.apiRequest('/analytics/leads-per-month'),
            this.apiRequest('/analytics/conversion-rate'),
            this.apiRequest('/analytics/revenue')
        ]);

        this.analytics = {
            leadsPerMonth: leadsPerMonth || {},
            conversionRate: conversionRate || {},
            revenue: revenue || {}
        };

        return this.analytics;
    }

    getDateString(daysOffset = 0) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    }

    // ========== LEAD SCORING HELPERS ==========
    getLeadQuality(score) {
        if (score >= 70) return 'Hot Lead';
        if (score >= 40) return 'Warm Lead';
        return 'Cold Lead';
    }

    getLeadQualityClass(score) {
        if (score >= 70) return 'badge-success';
        if (score >= 40) return 'badge-warning';
        return 'badge-danger';
    }

    // ========== LEADS ==========
    getLeads() {
        return this.leads;
    }

    async addLead(lead) {
        const created = await this.apiRequest('/leads', {
            method: 'POST',
            body: lead
        });

        this.leads.unshift(created);
        await this.loadAnalytics();
        this.addActivity('Created', `New lead: ${created.name}`, 'lead');
        return created;
    }

    async updateLead(id, updatedLead) {
        const updated = await this.apiRequest(`/leads/${id}`, {
            method: 'PUT',
            body: updatedLead
        });

        const index = this.leads.findIndex((l) => String(l.id) === String(id));
        if (index >= 0) {
            this.leads[index] = updated;
        }

        await this.loadAnalytics();
        this.addActivity('Updated', `Lead: ${updated.name}`, 'lead');
        return updated;
    }

    async deleteLead(id) {
        await this.apiRequest(`/leads/${id}`, { method: 'DELETE' });
        this.leads = this.leads.filter((l) => String(l.id) !== String(id));
        await this.loadAnalytics();
        this.addActivity('Deleted', `Lead ID: ${id}`, 'lead');
    }

    getLead(id) {
        return this.leads.find((lead) => String(lead.id) === String(id));
    }

    // ========== CLIENTS ==========
    getClients() {
        return this.clients;
    }

    async addClient(client) {
        const created = await this.apiRequest('/clients', {
            method: 'POST',
            body: client
        });

        this.clients.unshift(created);
        await this.loadAnalytics();
        this.addActivity('Created', `New client: ${created.name}`, 'client');
        return created;
    }

    async updateClient(id, updatedClient) {
        const updated = await this.apiRequest(`/clients/${id}`, {
            method: 'PUT',
            body: updatedClient
        });

        const index = this.clients.findIndex((c) => String(c.id) === String(id));
        if (index >= 0) {
            this.clients[index] = updated;
        }

        await this.loadAnalytics();
        this.addActivity('Updated', `Client: ${updated.name}`, 'client');
        return updated;
    }

    async deleteClient(id) {
        await this.apiRequest(`/clients/${id}`, { method: 'DELETE' });
        this.clients = this.clients.filter((c) => String(c.id) !== String(id));
        await this.loadAnalytics();
        this.addActivity('Deleted', `Client ID: ${id}`, 'client');
    }

    getClient(id) {
        return this.clients.find((client) => String(client.id) === String(id));
    }

    // ========== FOLLOWUPS ==========
    getFollowups() {
        return this.followups;
    }

    async addFollowup(followup) {
        const created = await this.apiRequest('/followups', {
            method: 'POST',
            body: followup
        });

        this.followups.push(created);
        this.addActivity('Created', `Follow-up: ${created.title}`, 'followup');
        return created;
    }

    async updateFollowup(id, updatedFollowup) {
        const updated = await this.apiRequest(`/followups/${id}`, {
            method: 'PUT',
            body: updatedFollowup
        });

        const index = this.followups.findIndex((f) => String(f.id) === String(id));
        if (index >= 0) {
            this.followups[index] = updated;
        }

        return updated;
    }

    async markFollowupComplete(id) {
        return this.updateFollowup(id, { completed: true, status: 'Completed' });
    }

    async deleteFollowup(id) {
        await this.apiRequest(`/followups/${id}`, { method: 'DELETE' });
        this.followups = this.followups.filter((f) => String(f.id) !== String(id));
        this.addActivity('Deleted', `Follow-up ID: ${id}`, 'followup');
    }

    getFollowup(id) {
        return this.followups.find((f) => String(f.id) === String(id));
    }

    // ========== ACTIVITY ==========
    getActivityLog() {
        return this.activityLog;
    }

    addActivity(action, description, type = 'general') {
        const activity = {
            id: `A${Date.now()}`,
            action,
            description,
            type,
            timestamp: new Date().toLocaleString(),
            user: this.currentUser?.name || 'Admin'
        };

        this.activityLog.unshift(activity);
        if (this.activityLog.length > 100) this.activityLog.pop();

        localStorage.setItem('activityLog', JSON.stringify(this.activityLog));
    }

    // ========== STATS ==========
    getStatistics() {
        const normalize = (value) => String(value || '').trim().toLowerCase();

        return {
            totalLeads: this.leads.length,
            activeClients: this.clients.filter((c) => normalize(c.status) === 'active').length,
            pendingDeals: this.leads.filter((l) => ['contacted', 'qualified'].includes(normalize(l.status))).length,
            totalRevenue: this.clients.reduce((sum, c) => sum + Number(c.dealValue || 0), 0),
            convertedLeads: this.leads.filter((l) => normalize(l.status) === 'converted').length,
            overdueFollowups: this.followups.filter((f) => !f.completed && new Date(f.dueDate) < new Date()).length
        };
    }

    // ========== SEARCH/FILTER ==========
    searchLeads(query) {
        const lowerQuery = query.toLowerCase();
        return this.leads.filter((lead) =>
            String(lead.name || '').toLowerCase().includes(lowerQuery) ||
            String(lead.company || '').toLowerCase().includes(lowerQuery) ||
            String(lead.email || '').toLowerCase().includes(lowerQuery) ||
            String(lead.phone || '').includes(query)
        );
    }

    searchClients(query) {
        const lowerQuery = query.toLowerCase();
        return this.clients.filter((client) =>
            String(client.name || '').toLowerCase().includes(lowerQuery) ||
            String(client.company || '').toLowerCase().includes(lowerQuery) ||
            String(client.email || '').toLowerCase().includes(lowerQuery) ||
            String(client.phone || '').includes(query)
        );
    }

    filterLeadsByStatus(status) {
        return this.leads.filter((lead) => lead.status === status);
    }

    filterLeadsByPipeline(pipeline) {
        return this.leads.filter((lead) => lead.pipeline === pipeline);
    }

    // ========== EXPORT ==========
    exportLeadsToCSV() {
        const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Salesperson', 'Value', 'Date Added'];
        const rows = this.leads.map((lead) => [
            lead.id,
            lead.name,
            lead.company,
            lead.email,
            lead.phone,
            lead.status,
            lead.source,
            lead.salesperson,
            lead.value,
            lead.dateAdded
        ]);

        let csv = `${headers.join(',')}\n`;
        rows.forEach((row) => {
            csv += `${row.map((cell) => `"${cell}"`).join(',')}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ========== ANALYTICS ==========
    getMonthlyLeadStats() {
        const monthlyStats = {};
        this.leads.forEach((lead) => {
            const date = new Date(lead.dateAdded);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyStats[key] = (monthlyStats[key] || 0) + 1;
        });
        return monthlyStats;
    }

    getSalesPerformance() {
        const performance = {};
        this.leads.forEach((lead) => {
            const salesperson = lead.salesperson || 'Unassigned';
            if (!performance[salesperson]) {
                performance[salesperson] = { total: 0, converted: 0, value: 0 };
            }
            performance[salesperson].total += 1;
            if (lead.status === 'Converted') {
                performance[salesperson].converted += 1;
                performance[salesperson].value += Number(lead.value || 0);
            }
        });
        return performance;
    }

    getRevenueAnalytics() {
        return this.analytics.revenue || {};
    }

    getAverageLeadScore() {
        if (!this.leads.length) return 0;
        const total = this.leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0);
        return (total / this.leads.length).toFixed(1);
    }

    getHighPriorityLeadsCount() {
        return this.leads.filter((lead) => Number(lead.score || 0) >= 70).length;
    }

    getConversionRatePercentage() {
        if (!this.leads.length) return 0;
        const converted = this.leads.filter((lead) => String(lead.status || '').trim().toLowerCase() === 'converted').length;
        return ((converted / this.leads.length) * 100).toFixed(1);
    }

    getLeadsPerMonth() {
        return this.analytics.leadsPerMonth || {};
    }

    getConversionRateBySource() {
        return this.analytics.conversionRate || {};
    }

    getSalesRevenueByMonth() {
        return this.analytics.revenue || {};
    }

    async clearAllData() {
        const leadDeletes = this.leads.map((lead) => this.apiRequest(`/leads/${lead.id}`, { method: 'DELETE' }));
        const clientDeletes = this.clients.map((client) => this.apiRequest(`/clients/${client.id}`, { method: 'DELETE' }));
        const followupDeletes = this.followups.map((followup) => this.apiRequest(`/followups/${followup.id}`, { method: 'DELETE' }));

        await Promise.allSettled([...leadDeletes, ...clientDeletes, ...followupDeletes]);

        this.leads = [];
        this.clients = [];
        this.followups = [];
        this.analytics = { leadsPerMonth: {}, conversionRate: {}, revenue: {} };
        this.activityLog = [];
        localStorage.removeItem('activityLog');
    }
}

const storage = new StorageManager();
