// --- Core State & Persistence ---
const DEFAULT_STATE = {
    isAuthenticated: false,
    currentUser: null,
    vehicles: [
        { id: 'V001', plate: 'KA-01-MH-1234', type: 'Heavy Truck', capacity: 15, status: 'available', lastService: '2024-01-10' },
        { id: 'V002', plate: 'KA-05-AB-5678', type: 'Delivery Van', capacity: 2, status: 'in-trip', lastService: '2024-02-15' },
        { id: 'V003', plate: 'KA-03-XY-9012', type: 'Trailer', capacity: 25, status: 'maintenance', lastService: '2024-02-20' },
    ],
    drivers: [
        { id: 'D001', name: 'John Doe', license: 'DL-12345', status: 'available', score: 4.8 },
        { id: 'D002', name: 'Jane Smith', license: 'DL-67890', status: 'on-trip', score: 4.9 },
    ],
    trips: [
        { id: 'T1001', driverId: 'D002', vehicleId: 'V002', destination: 'Central Hub', cargoWeight: 1.5, status: 'dispatched', timestamp: Date.now() }
    ],
    maintenance: [
        { id: 'M101', vehicleId: 'V003', task: 'Engine Oil Change', cost: 150, status: 'in-progress' }
    ]
};

let state = JSON.parse(localStorage.getItem('fleetflow_state')) || DEFAULT_STATE;

function saveState() {
    localStorage.setItem('fleetflow_state', JSON.stringify(state));
}

// --- Utilities ---
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'ri-checkbox-circle-line' : (type === 'danger' ? 'ri-error-warning-line' : 'ri-information-line');
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
};

const showModal = (contentHtml) => {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = contentHtml;
    overlay.style.display = 'flex';
};

const closeModal = () => {
    document.getElementById('modal-overlay').style.display = 'none';
};

// --- View Templates ---
const views = {
    dashboard: () => {
        const activeTrips = state.trips.filter(t => t.status === 'dispatched').length;
        const availableVehicles = state.vehicles.filter(v => v.status === 'available').length;
        const maintenanceCount = state.vehicles.filter(v => v.status === 'maintenance').length;

        return `
        <div class="page-view">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem;">
                <div>
                    <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em;">Command Center</h1>
                    <p style="color: var(--text-dim); margin-top: 0.5rem; font-weight: 500;">Real-time fleet intelligence and operations.</p>
                </div>
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary); background: var(--primary-glow); padding: 8px 16px; border-radius: 99px; display: flex; align-items: center; gap: 6px;">
                   <i class="ri-refresh-line" style="animation: spin 3s linear infinite;"></i> Sync: Live
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span class="stat-label">Fleet Readiness</span>
                        <div style="width: 40px; height: 40px; background: #ecfdf5; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="ri-ruler-2-line"></i>
                        </div>
                    </div>
                    <span class="stat-value" style="display: flex; align-items: baseline; gap: 8px; font-size: 2.5rem;">
                        ${availableVehicles} <small style="font-size: 1rem; color: var(--text-dim); font-weight: 600;">/ ${state.vehicles.length}</small>
                    </span>
                    <div style="height: 6px; background: #f1f5f9; border-radius: 3px; margin-top: 5px; overflow: hidden;">
                        <div class="progress-bar-fill" style="width: ${(availableVehicles / state.vehicles.length) * 100}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; max-width: 100%;"></div>
                    </div>
                </div>
                <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span class="stat-label">Active Missions</span>
                        <div style="width: 40px; height: 40px; background: #f0f9ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #0ea5e9;">
                            <i class="ri-radar-line"></i>
                        </div>
                    </div>
                    <span class="stat-value" style="font-size: 2.5rem;">${activeTrips}</span>
                    <p style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">Tracking synchronized</p>
                </div>
                <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span class="stat-label">System Health</span>
                        <div style="width: 40px; height: 40px; background: #fff7ed; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--warning);">
                            <i class="ri-heart-pulse-line"></i>
                        </div>
                    </div>
                    <span class="stat-value" style="font-size: 2.5rem;">Optimal</span>
                    <p style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">All modules operational</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 1rem;">
                <div class="data-table-container">
                    <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <h3>Active Fleet Preview</h3>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Vehicle</th><th>Type</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${state.vehicles.slice(0, 5).map(v => `
                                <tr>
                                    <td>${v.plate}</td>
                                    <td>${v.type}</td>
                                    <td><span class="status-badge status-${v.status}">${v.status.replace('-', ' ')}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="stat-card">
                    <h3>Quick Actions</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="switchView('trips')">New Dispatch</button>
                        <button class="btn" style="background: var(--glass); border: 1px solid var(--border); color: white;" onclick="switchView('vehicles')">Add Asset</button>
                    </div>
                </div>
            </div>
        </div>
    `},

    vehicles: () => `
        <div class="page-view">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Vehicle Registry</h1>
                <button class="btn btn-primary" onclick="openAddVehicleModal()"><i class="ri-add-line"></i> Add Vehicle</button>
            </div>
            <div class="data-table-container">
                <table>
                    <thead>
                        <tr><th>Plate</th><th>Type</th><th>Capacity (T)</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${state.vehicles.map(v => `
                            <tr>
                                <td>${v.plate}</td>
                                <td>${v.type}</td>
                                <td>${v.capacity}</td>
                                <td><span class="status-badge status-${v.status}">${v.status}</span></td>
                                <td>
                                    <button class="btn btn-icon" style="background: none; color: var(--text-dim);" onclick="deleteVehicle('${v.id}')"><i class="ri-delete-bin-line"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    drivers: () => `
        <div class="page-view">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Team Management</h1>
                <button class="btn btn-primary" onclick="openAddDriverModal()"><i class="ri-user-add-line"></i> Hire Driver</button>
            </div>
            <div class="data-table-container">
                <table>
                    <thead>
                        <tr><th>Name</th><th>License</th><th>Status</th><th>Performance</th></tr>
                    </thead>
                    <tbody>
                        ${state.drivers.map(d => `
                            <tr>
                                <td>${d.name}</td>
                                <td>${d.license}</td>
                                <td><span class="status-badge status-${d.status}">${d.status}</span></td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="flex: 1; height: 6px; background: var(--glass); border-radius: 3px; overflow: hidden; width: 80px;">
                                            <div style="width: ${d.score * 20}%; height: 100%; background: var(--primary);"></div>
                                        </div>
                                        <span style="font-weight: 600;">${d.score}</span>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    trips: () => {
        const availableVehicles = state.vehicles.filter(v => v.status === 'available');
        const availableDrivers = state.drivers.filter(d => d.status === 'available');

        return `
        <div class="page-view">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Trip Dispatcher</h1>
                <div class="status-badge status-in-trip" style="padding: 8px 16px;">Active Routes: ${state.trips.filter(t => t.status === 'dispatched').length}</div>
            </div>

            <div style="display: grid; grid-template-columns: 350px 1fr; gap: 2rem;">
                <div class="stat-card" style="align-self: flex-start;">
                    <h3>New Dispatch</h3>
                    <form id="dispatchForm" onsubmit="handleDispatch(event)" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase;">Vehicle Asset</label>
                            <select id="v_select" required class="form-input" style="margin-top: 6px;">
                                <option value="">Select Asset</option>
                                ${availableVehicles.map(v => `<option value="${v.id}">${v.plate} (${v.capacity}T)</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase;">Pilot Assigned</label>
                            <select id="d_select" required class="form-input" style="margin-top: 6px;">
                                <option value="">Select Pilot</option>
                                ${availableDrivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase;">Cargo Capacity (Tons)</label>
                            <input type="number" step="0.1" id="cargo_weight" required placeholder="0.0" class="form-input" style="margin-top: 6px;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase;">Destination Node</label>
                            <input type="text" id="destination" required placeholder="Enter destination..." class="form-input" style="margin-top: 6px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="height: 52px; margin-top: 1.5rem; border-radius: 14px; font-size: 1rem;">Begin Mission</button>
                    </form>
                </div>

                <div class="data-table-container">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Pilot</th><th>Asset</th><th>Cargo</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${state.trips.map(t => `
                                <tr>
                                    <td>${t.id}</td>
                                    <td>${t.driverId}</td>
                                    <td>${t.vehicleId}</td>
                                    <td>${t.cargoWeight}T</td>
                                    <td><span class="status-badge status-${t.status === 'dispatched' ? 'in-trip' : 'available'}">${t.status}</span></td>
                                    <td>
                                        ${t.status === 'dispatched' ? `
                                            <button class="btn" style="padding: 4px 12px; font-size: 0.8rem; background: var(--success);" onclick="completeTrip('${t.id}')">Complete</button>
                                        ` : '<span style="color: var(--text-dim);">History</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `},

    maintenance: () => `
        <div class="page-view">
            <h1>Service & Repairs</h1>
            <div class="data-table-container" style="margin-top: 2rem;">
                <table>
                    <thead>
                        <tr><th>Ref</th><th>Asset</th><th>Task</th><th>Cost</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${state.maintenance.map(m => `
                            <tr>
                                <td>${m.id}</td>
                                <td>${m.vehicleId}</td>
                                <td>${m.task}</td>
                                <td>$${m.cost}</td>
                                <td><span class="status-badge status-maintenance">${m.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    analytics: () => {
        const totalFuel = state.trips.reduce((acc, t) => acc + (t.cargoWeight * 15), 0);
        return `
        <div class="page-view">
            <h1 style="margin-bottom: 2rem;">Fleet Insights</h1>
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem;">
                <div class="stat-card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(56, 189, 248, 0.1)); border: 1px solid rgba(99, 102, 241, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>Fuel Consumption Trend</h3>
                        <span class="status-badge status-available">Live Efficiency: 94%</span>
                    </div>
                    <div style="height: 250px; display: flex; align-items: flex-end; justify-content: space-between; padding: 30px 10px 10px;">
                        ${[30, 50, 40, 70, 65, 85, 95].map((h, i) => `
                            <div style="flex: 1; margin: 0 8px; position: relative;">
                                <div style="height: ${h}%; background: linear-gradient(to top, var(--primary), var(--accent)); border-radius: 12px; box-shadow: 0 10px 20px var(--primary-glow); animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.1}s forwards; opacity: 0;"></div>
                                <span style="position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; color: var(--text-dim);">${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div class="stat-card">
                        <span class="stat-label">Projected Savings</span>
                        <span class="stat-value" style="color: var(--success)">+$2,410</span>
                        <p style="font-size: 0.75rem; color: var(--text-dim);">Efficiency optimization active</p>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Active Cargo</span>
                        <span class="stat-value">${state.trips.reduce((acc, t) => acc + (t.status === 'dispatched' ? t.cargoWeight : 0), 0)}T</span>
                        <p style="font-size: 0.75rem; color: var(--text-dim);">Across ${state.trips.filter(t => t.status === 'dispatched').length} active missions</p>
                    </div>
                </div>
            </div>
        </div>
    `}
};

// --- View Logic ---
window.switchView = (viewName) => {
    state.currentView = viewName;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });
    const content = document.getElementById('content');
    content.innerHTML = views[viewName] ? views[viewName]() : '<h1>View Not Found</h1>';
    saveState();
};

// --- Modal Handlers ---
window.openAddVehicleModal = () => {
    showModal(`
        <h2 style="margin-bottom: 1.5rem;">Register Asset</h2>
        <form onsubmit="handleAddVehicle(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <input type="text" id="new_v_plate" placeholder="Plate Number (e.g. KA-01-1234)" required class="form-input">
            <select id="new_v_type" class="form-input">
                <option>Heavy Truck</option>
                <option>Delivery Van</option>
                <option>Trailer</option>
            </select>
            <input type="number" id="new_v_cap" placeholder="Capacity in Tons" required class="form-input">
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="button" class="btn" style="flex: 1; background: #f1f5f9; color: var(--text-dim);" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex: 1;">Register Asset</button>
            </div>
        </form>
    `);
};

window.openAddDriverModal = () => {
    showModal(`
        <h2 style="margin-bottom: 1.5rem;">Hire Personnel</h2>
        <form onsubmit="handleAddDriver(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <input type="text" id="new_d_name" placeholder="Full Name" required class="form-input">
            <input type="text" id="new_d_lic" placeholder="License Class" required class="form-input">
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="button" class="btn" style="flex: 1; background: #f1f5f9; color: var(--text-dim);" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" style="flex: 1;">Enroll Pilot</button>
            </div>
        </form>
    `);
};

// --- Action Handlers ---
window.handleDispatch = (e) => {
    e.preventDefault();
    const vId = document.getElementById('v_select').value;
    const dId = document.getElementById('d_select').value;
    const weight = parseFloat(document.getElementById('cargo_weight').value);
    const dest = document.getElementById('destination').value;

    const vehicle = state.vehicles.find(v => v.id === vId);
    const driver = state.drivers.find(d => d.id === dId);

    if (weight > vehicle.capacity) {
        showToast('❌ Overload Error: Cargo exceeds vehicle capacity!', 'danger');
        return;
    }

    vehicle.status = 'in-trip';
    driver.status = 'on-trip';

    state.trips.unshift({
        id: 'T' + Date.now().toString().slice(-4),
        driverId: driver.name,
        vehicleId: vehicle.plate,
        cargoWeight: weight,
        destination: dest,
        status: 'dispatched'
    });

    showToast('🚀 Mission Dispatched Successfully!');
    switchView('trips');
};

window.completeTrip = (tripId) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const vehicle = state.vehicles.find(v => v.plate === trip.vehicleId);
    const driver = state.drivers.find(d => d.name === trip.driverId);

    if (vehicle) vehicle.status = 'available';
    if (driver) driver.status = 'available';
    trip.status = 'completed';

    showToast('✨ Trip Completed. Assets returned to fleet.');
    switchView('trips');
};

window.handleAddVehicle = (e) => {
    e.preventDefault();
    state.vehicles.push({
        id: 'V' + Date.now().toString().slice(-3),
        plate: document.getElementById('new_v_plate').value,
        type: document.getElementById('new_v_type').value,
        capacity: parseFloat(document.getElementById('new_v_cap').value),
        status: 'available',
        lastService: new Date().toISOString().split('T')[0]
    });
    showToast('🚛 Asset registered successfully');
    closeModal();
    switchView('vehicles');
};

window.handleAddDriver = (e) => {
    e.preventDefault();
    state.drivers.push({
        id: 'D' + Date.now().toString().slice(-3),
        name: document.getElementById('new_d_name').value,
        license: document.getElementById('new_d_lic').value,
        status: 'available',
        score: 5.0
    });
    showToast('👤 Personnel enrolled successfully');
    closeModal();
    switchView('drivers');
};

window.deleteVehicle = (id) => {
    state.vehicles = state.vehicles.filter(v => v.id !== id);
    showToast('🗑️ Asset removed from registry', 'warning');
    switchView('vehicles');
};

window.handleLogin = (e) => {
    e.preventDefault();
    state.isAuthenticated = true;
    showToast('🔐 Access Granted. Welcome back.');
    switchView('dashboard');
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Setup Sidebar clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchView(item.getAttribute('data-view')));
    });

    if (!state.isAuthenticated) {
        document.getElementById('content').innerHTML = `
            <div style="height: 100vh; position: fixed; inset: 0; background: var(--bg-dark); z-index: 2000; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #ffffff 0%, #f0fdf4 100%);">
                <div class="modal-content" style="width: 400px; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 40px 100px -20px rgba(16, 185, 129, 0.15);">
                    <div class="logo" style="justify-content: center; margin-bottom: 2rem; font-size: 2.5rem;">
                        <i class="ri-truck-line"></i><span>FleetFlow</span>
                    </div>
                    <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <input type="text" placeholder="Access ID" required class="form-input" style="height: 56px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02) inset;">
                        <input type="password" placeholder="Passkey" required class="form-input" style="height: 56px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02) inset;">
                        <button type="submit" class="btn btn-primary" style="padding: 18px; font-size: 1.1rem; border-radius: 16px; margin-top: 0.5rem; text-transform: uppercase;">Secure Area Access</button>
                    </form>
                    <p style="margin-top: 2.5rem; font-size: 0.85rem; color: var(--text-dim); font-weight: 500;">Environment: Production | v3.1 Emerald</p>
                </div>
            </div>
        `;
    } else {
        switchView(state.currentView || 'dashboard');
    }
});
