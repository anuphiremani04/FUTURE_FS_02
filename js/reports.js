// ========================================
// REPORTS.JS - Analytics and Charts
// ========================================

let charts = {};

function initCharts() {
    // Clear previous chart instances before re-rendering.
    Object.keys(charts).forEach((key) => {
        if (charts[key] && typeof charts[key].destroy === 'function') {
            charts[key].destroy();
        }
    });
    charts = {};

    // Lead Status Chart
    if (document.getElementById('leadStatusChart')) {
        const leads = storage.getLeads();
        const statusCounts = {};
        
        leads.forEach(lead => {
            statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
        });

        const ctx = document.getElementById('leadStatusChart').getContext('2d');
        charts.leadStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#6366f1',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#10b981'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 },
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Monthly Leads Chart
    if (document.getElementById('monthlyLeadsChart')) {
        const monthlyStats = storage.getMonthlyLeadStats();
        const months = Object.keys(monthlyStats).sort();
        const values = months.map(m => monthlyStats[m]);
        const monthLabels = months.map(m => {
            const date = new Date(m + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const ctx = document.getElementById('monthlyLeadsChart').getContext('2d');
        charts.monthlyLeads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'New Leads',
                    data: values,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 },
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }

    // Conversion Rate Chart
    if (document.getElementById('conversionChart')) {
        const leads = storage.getLeads();
        const sources = [...new Set(leads.map(l => l.source))];
        
        const conversionData = sources.map(source => {
            const sourceLeads = leads.filter(l => l.source === source);
            const converted = sourceLeads.filter(l => l.status === 'Converted').length;
            return sourceLeads.length > 0 ? ((converted / sourceLeads.length) * 100).toFixed(1) : 0;
        });

        const ctx = document.getElementById('conversionChart').getContext('2d');
        charts.conversion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sources,
                datasets: [{
                    label: 'Conversion Rate (%)',
                    data: conversionData,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }

    // Sales Performance Chart
    if (document.getElementById('performanceChart')) {
        const performance = storage.getSalesPerformance();
        const salespeople = Object.keys(performance);
        const converted = salespeople.map(sp => performance[sp].converted);
        const total = salespeople.map(sp => performance[sp].total);

        const ctx = document.getElementById('performanceChart').getContext('2d');
        charts.performance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: salespeople,
                datasets: [
                    {
                        label: 'Total Leads',
                        data: total,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Converted',
                        data: converted,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    // Revenue Chart (Dashboard)
    if (document.getElementById('reportsRevenueChart')) {
        const revenueData = storage.getRevenueAnalytics();
        const months = Object.keys(revenueData).sort();
        const revenue = months.map(m => revenueData[m]);
        const monthLabels = months.map(m => {
            const date = new Date(m + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const ctx = document.getElementById('reportsRevenueChart').getContext('2d');
        charts.revenueDashboard = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenue,
                    backgroundColor: [
                        '#8b5cf6',
                        '#6366f1',
                        '#3b82f6',
                        '#10b981'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" },
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }

    // Revenue Chart (Reports)
    if (document.getElementById('revenueChart')) {
        const revenueData = storage.getRevenueAnalytics();
        const months = Object.keys(revenueData).sort();
        const revenue = months.map(m => revenueData[m]);
        const monthLabels = months.map(m => {
            const date = new Date(m + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const ctx = document.getElementById('revenueChart').getContext('2d');
        charts.revenueReports = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenue,
                    backgroundColor: [
                        '#8b5cf6',
                        '#6366f1',
                        '#3b82f6',
                        '#10b981'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" },
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }

    // Status Chart
    if (document.getElementById('statusChart')) {
        const leads = storage.getLeads();
        const statusCounts = {};
        
        leads.forEach(lead => {
            statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
        });

        const ctx = document.getElementById('statusChart').getContext('2d');
        charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#6366f1',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#10b981'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 },
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Leads Per Month Chart
    if (document.getElementById('leadsPerMonthChart')) {
        const leadsPerMonth = storage.getLeadsPerMonth();
        const months = Object.keys(leadsPerMonth).sort();
        const values = months.map(m => leadsPerMonth[m]);
        const monthLabels = months.map(m => {
            const date = new Date(m + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });

        const ctx = document.getElementById('leadsPerMonthChart').getContext('2d');
        charts.leadsPerMonth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Leads Generated',
                    data: values,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(99, 102, 241, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Leads: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }

    // Conversion Rate by Source Chart
    if (document.getElementById('conversionRateChart')) {
        const conversionBySource = storage.getConversionRateBySource();
        const sources = Object.keys(conversionBySource);
        const rates = sources.map(s => parseFloat(conversionBySource[s]));

        const ctx = document.getElementById('conversionRateChart').getContext('2d');
        charts.conversionRate = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sources,
                datasets: [{
                    label: 'Conversion Rate (%)',
                    data: rates,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#a855f7',
                        '#ec4899'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(99, 102, 241, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Poppins', sans-serif", size: 13 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x.toFixed(1) + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    }
                }
            }
        });
    }
}

// Expose chart initializer for app.js
window.initCharts = initCharts;

// Initialize charts when reports section is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be initialized
    setTimeout(() => {
        if (typeof app !== 'undefined') {
            // Override the initReportsPage method to initialize charts
            const originalInitReports = app.initReportsPage;
            app.initReportsPage = function() {
                originalInitReports.call(this);
                initCharts();
            };

            // Also initialize charts if already on reports page
            if (app.currentPage === 'reports') {
                initCharts();
            }
        }
    }, 1000);
});

// Add settings functionality
document.addEventListener('DOMContentLoaded', () => {
    const settingsDarkModeBtn = document.getElementById('settingsDarkModeBtn');
    const settingsExportBtn = document.getElementById('settingsExportBtn');
    const settingsClearBtn = document.getElementById('settingsClearBtn');

    if (settingsDarkModeBtn) {
        settingsDarkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            settingsDarkModeBtn.textContent = isDarkMode ? 'Disable' : 'Enable';
        });

        // Set initial state
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            settingsDarkModeBtn.textContent = 'Disable';
        }
    }

    if (settingsExportBtn) {
        settingsExportBtn.addEventListener('click', () => {
            storage.exportLeadsToCSV();
            if (typeof app !== 'undefined') {
                app.showAlert('success', 'Leads exported to CSV successfully!');
            }
        });
    }

    if (settingsClearBtn) {
        settingsClearBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                await storage.clearAllData();
                if (typeof app !== 'undefined') {
                    app.showAlert('success', 'All data has been cleared successfully.');
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            }
        });
    }
});
