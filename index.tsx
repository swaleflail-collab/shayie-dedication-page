

// Declare global variables from CDN scripts
declare const d3: any;
declare const XLSX: any;

// --- DOM Element References ---
// Views
const uploadContainer = document.getElementById('upload-container');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const adminContainer = document.getElementById('admin-container');
const userContainer = document.getElementById('user-container');
const visContainer = document.getElementById('vis-container');

// Elements
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const svgElement = d3.select("#family-tree");
const userHint = document.getElementById('user-hint');
const adminHint = document.getElementById('admin-hint');

// Dashboard Stats Elements
const statsCountEl = document.getElementById('stats-count');
const statsDepthEl = document.getElementById('stats-depth');
const btnResetData = document.getElementById('btn-reset-data');

// Login Elements
const loginTitle = document.getElementById('login-title');
const loginSubtitle = document.getElementById('login-subtitle');

// Registration Elements
const regUsernameInput = document.getElementById('reg-username') as HTMLInputElement;
const regPasswordInput = document.getElementById('reg-password') as HTMLInputElement;
const regConfirmInput = document.getElementById('reg-confirm') as HTMLInputElement;
const btnDoRegister = document.getElementById('btn-do-register');
const btnRegisterBack = document.getElementById('btn-register-back');
const registerErrorMsg = document.getElementById('register-error-msg');

// Navigation Buttons
const goToLoginBtn = document.getElementById('go-to-login');
const goToRegisteredLoginBtn = document.getElementById('go-to-registered-login');
const goToUserBtn = document.getElementById('go-to-user');
const backHomeBtn = document.getElementById('btn-back-home');
const userStartBtn = document.getElementById('btn-user-start');
const userBackBtn = document.getElementById('btn-user-back');
const loginBtn = document.getElementById('btn-login');
const logoutBtn = document.getElementById('btn-logout');
const btnVisBack = document.getElementById('btn-vis-back');
const btnLoadSaved = document.getElementById('btn-load-saved');

// Admin Buttons
const btnAdminVis = document.getElementById('btn-admin-vis');
const btnExportExcel = document.getElementById('btn-export-excel');
const btnManageUsers = document.getElementById('btn-manage-users');
const btnActivityLogs = document.getElementById('btn-activity-logs');

// User Management Modal Elements
const userManModal = document.getElementById('user-man-modal');
const btnCloseUserMan = document.getElementById('btn-close-user-man');
const userManListView = document.getElementById('user-man-list-view');
const userManFormView = document.getElementById('user-man-form-view');
const userListTbody = document.getElementById('user-list-tbody');
const btnShowAddUser = document.getElementById('btn-show-add-user');
const userFormTitle = document.getElementById('user-form-title');
const manUsernameInput = document.getElementById('man-username') as HTMLInputElement;
const manPasswordInput = document.getElementById('man-password') as HTMLInputElement;
const btnSaveUser = document.getElementById('btn-save-user');
const btnCancelUserForm = document.getElementById('btn-cancel-user-form');

// Activity Log Modal Elements
const activityLogModal = document.getElementById('activity-log-modal');
const btnCloseLog = document.getElementById('btn-close-log');
const logListTbody = document.getElementById('log-list-tbody');
const btnClearLogs = document.getElementById('btn-clear-logs');


// Inputs
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginErrorMsg = document.getElementById('login-error-msg');

// User Modal Elements
const addChildModal = document.getElementById('add-child-modal');
const modalParentName = document.getElementById('modal-parent-name');
const newChildNameInput = document.getElementById('new-child-name') as HTMLInputElement;
const btnSaveChild = document.getElementById('btn-save-child');
const btnCancelChild = document.getElementById('btn-cancel-child');

// Admin Modal Elements
const adminNodeModal = document.getElementById('admin-node-modal');
const adminModalTitle = document.getElementById('admin-modal-title');
const adminEditNameInput = document.getElementById('admin-edit-name') as HTMLInputElement;
const adminEditColorInput = document.getElementById('admin-edit-color') as HTMLInputElement;
const adminChildNameInput = document.getElementById('admin-child-name') as HTMLInputElement;
const btnAdminUpdate = document.getElementById('btn-admin-update');
const btnAdminAddChild = document.getElementById('btn-admin-add-child');
const btnAdminDelete = document.getElementById('btn-admin-delete');
const btnAdminCancel = document.getElementById('btn-admin-cancel');


// --- Application State ---
// 'viewer': Standard read-only
// 'user_editor': Can add children
// 'admin': Full control
type AppMode = 'viewer' | 'user_editor' | 'admin';
type LoginTarget = 'admin' | 'user';

let appMode: AppMode = 'viewer';
let loginTarget: LoginTarget = 'admin'; // Default
let currentTreeData: any[] = []; // Keep track of current data for editing
let selectedParentId: number | null = null; // Track which node was clicked
let editingUserIndex: number | null = null; // Track which user is being edited in Admin Panel
let currentUser: string = 'Guest'; // Track currently logged in user

// --- Event Listeners ---
fileInput.addEventListener('change', handleFileSelect);

// Navigation Logic
goToLoginBtn.addEventListener('click', () => {
    loginTarget = 'admin';
    loginTitle.innerHTML = '<i class="fas fa-shield-alt text-gradient"></i> تسجيل دخول المشرفين';
    loginSubtitle.textContent = 'لوحة التحكم والخدمات';
    usernameInput.value = '';
    passwordInput.value = '';
    switchView('login');
});

goToRegisteredLoginBtn.addEventListener('click', () => {
    loginTarget = 'user';
    loginTitle.innerHTML = '<i class="fas fa-user-circle text-gradient"></i> تسجيل دخول الأعضاء';
    loginSubtitle.textContent = 'المساهمة في الشجرة';
    usernameInput.value = '';
    passwordInput.value = '';
    switchView('login');
});

goToUserBtn.addEventListener('click', () => {
    regUsernameInput.value = '';
    regPasswordInput.value = '';
    regConfirmInput.value = '';
    registerErrorMsg.style.display = 'none';
    switchView('register');
});

backHomeBtn.addEventListener('click', () => switchView('upload'));
btnRegisterBack.addEventListener('click', () => switchView('upload'));
btnDoRegister.addEventListener('click', handleRegister);

// If Admin goes back from Vis, they go to Admin Panel. Others go to Home.
btnVisBack.addEventListener('click', () => {
    if (appMode === 'admin') {
        switchView('admin');
    } else {
        switchView('upload');
    }
});
userBackBtn.addEventListener('click', () => {
    logActivity('LOGOUT', 'User logged out');
    currentUser = 'Guest';
    switchView('upload');
});

userStartBtn.addEventListener('click', () => {
    appMode = 'user_editor';
    loadSavedTree();
});

// Load Saved Tree Listener
if (btnLoadSaved) {
    btnLoadSaved.addEventListener('click', () => {
        appMode = 'viewer';
        loadSavedTree();
    });
}

logoutBtn.addEventListener('click', () => {
    logActivity('LOGOUT', 'Admin logged out');
    // Clear inputs on logout
    usernameInput.value = '';
    passwordInput.value = '';
    appMode = 'viewer'; // Reset permissions
    currentUser = 'Guest';
    switchView('upload');
});

loginBtn.addEventListener('click', handleLogin);

// Admin Dashboard Buttons
btnAdminVis.addEventListener('click', () => {
    appMode = 'admin';
    loadSavedTree();
});
btnExportExcel.addEventListener('click', exportToExcel);
btnResetData.addEventListener('click', resetSystemData);
if(btnManageUsers) {
    btnManageUsers.addEventListener('click', openUserManagement);
}
if(btnActivityLogs) {
    btnActivityLogs.addEventListener('click', openActivityLogs);
}


// Add enter key support for login
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// User Modal Listeners
btnCancelChild.addEventListener('click', closeAddChildModal);
btnSaveChild.addEventListener('click', saveNewChild);
newChildNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveNewChild();
});

// Admin Modal Listeners
btnAdminCancel.addEventListener('click', () => {
    adminNodeModal.classList.remove('show');
    setTimeout(() => { adminNodeModal.style.display = 'none'; }, 300);
    selectedParentId = null;
});
btnAdminUpdate.addEventListener('click', handleAdminUpdate);
btnAdminAddChild.addEventListener('click', handleAdminAddChild);
btnAdminDelete.addEventListener('click', handleAdminDelete);

// User Management Modal Listeners
if(btnCloseUserMan) btnCloseUserMan.addEventListener('click', () => {
    userManModal.classList.remove('show');
    setTimeout(() => { userManModal.style.display = 'none'; }, 300);
});
if(btnShowAddUser) btnShowAddUser.addEventListener('click', () => {
    editingUserIndex = null;
    manUsernameInput.value = '';
    manPasswordInput.value = '';
    userFormTitle.textContent = "إضافة مستخدم جديد";
    userManListView.style.display = 'none';
    userManFormView.style.display = 'block';
});
if(btnCancelUserForm) btnCancelUserForm.addEventListener('click', () => {
    userManFormView.style.display = 'none';
    userManListView.style.display = 'block';
});
if(btnSaveUser) btnSaveUser.addEventListener('click', handleSaveUser);

// Activity Log Modal Listeners
if(btnCloseLog) btnCloseLog.addEventListener('click', () => {
    activityLogModal.classList.remove('show');
    setTimeout(() => { activityLogModal.style.display = 'none'; }, 300);
});
if(btnClearLogs) btnClearLogs.addEventListener('click', clearActivityLog);


// --- Functions ---

/**
 * Switch between different application views (SPA logic).
 */
function switchView(viewName: string) {
    // Hide all first
    uploadContainer.style.display = 'none';
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'none';
    adminContainer.style.display = 'none';
    userContainer.style.display = 'none';
    visContainer.style.display = 'none';
    loadingSpinner.style.display = 'none';
    
    // Reset specific states
    uploadContainer.classList.remove('active');
    loginContainer.classList.remove('active');
    registerContainer.classList.remove('active');
    adminContainer.classList.remove('active');
    userContainer.classList.remove('active');
    
    errorMessage.style.display = 'none';
    loginErrorMsg.style.display = 'none';

    // Show selected
    switch (viewName) {
        case 'upload':
            uploadContainer.style.display = 'block';
            setTimeout(() => uploadContainer.classList.add('active'), 10);
            break;
        case 'login':
            loginContainer.style.display = 'block';
            setTimeout(() => loginContainer.classList.add('active'), 10);
            break;
        case 'register':
            registerContainer.style.display = 'block';
            setTimeout(() => registerContainer.classList.add('active'), 10);
            break;
        case 'admin':
            adminContainer.style.display = 'block';
            updateDashboardStats();
            setTimeout(() => adminContainer.classList.add('active'), 10);
            break;
        case 'user_start':
            userContainer.style.display = 'block';
            setTimeout(() => userContainer.classList.add('active'), 10);
            break;
        case 'visualization':
            visContainer.style.display = 'block';
            // Show hints based on role
            userHint.style.display = (appMode === 'user_editor') ? 'flex' : 'none';
            adminHint.style.display = (appMode === 'admin') ? 'flex' : 'none';
            break;
        case 'loading':
            loadingSpinner.style.display = 'block';
            break;
    }
}

function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
        showError('Please select a file.');
        return;
    }

    switchView('loading');

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Assume first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            processAndRenderData(jsonData);
            
            // Log for admin upload
            logActivity('UPLOAD', `Uploaded file: ${file.name}`);
        } catch (err) {
            console.error(err);
            showError('Error processing file. Please ensure it is a valid Excel file.');
            switchView('admin'); // Go back to admin on error
        }
    };
    reader.readAsArrayBuffer(file);
}

function loadSavedTree() {
    const saved = localStorage.getItem('familyTreeData');
    if (saved) {
        try {
            currentTreeData = JSON.parse(saved);
            renderTree(currentTreeData);
            switchView('visualization');
        } catch (e) {
            console.error("Failed to load saved tree", e);
            // Fallback if data is corrupted
            loadMockData();
        }
    } else {
        // Load mock data if nothing saved
        loadMockData();
    }
}

function loadMockData() {
    // Default mock data for demonstration
    const mockData = [
        { "الرقم": 1, "الاسم": "الجد شايع", "رقم الأب": null, "color": "#1f2937" },
        { "الرقم": 2, "الاسم": "محمد", "رقم الأب": 1 },
        { "الرقم": 3, "الاسم": "صالح", "رقم الأب": 1 },
        { "الرقم": 4, "الاسم": "عبدالله", "رقم الأب": 1 },
        { "الرقم": 5, "الاسم": "فهد", "رقم الأب": 2 },
        { "الرقم": 6, "الاسم": "سلمان", "رقم الأب": 2 },
        { "الرقم": 7, "الاسم": "نايف", "رقم الأب": 3 },
        { "الرقم": 8, "الاسم": "خالد", "رقم الأب": 4 },
        { "الرقم": 9, "الاسم": "سعود", "رقم الأب": 5 }
    ];
    processAndRenderData(mockData);
}

function processAndRenderData(jsonData: any[]) {
    // Basic validation
    if (!jsonData || jsonData.length === 0) {
        showError('The file is empty.');
        switchView('admin');
        return;
    }

    // Normalize keys (remove spaces, etc if needed)
    // We expect: "الرقم", "الاسم", "رقم الأب"
    // Map to internal structure: id, name, parentId, color
    const formattedData = jsonData.map((row: any) => ({
        id: row['الرقم'],
        name: row['الاسم'],
        parentId: row['رقم الأب'],
        color: row['color'] || row['اللون'] || undefined // Preserve color if exists
    }));

    // Save to global state and LocalStorage
    currentTreeData = formattedData;
    localStorage.setItem('familyTreeData', JSON.stringify(formattedData));

    renderTree(formattedData);
    switchView('visualization');
}

/**
 * Builds the hierarchy and renders the tree using D3.
 */
function renderTree(flatData: any[]) {
    // clear previous
    svgElement.selectAll("*").remove();

    // 1. Build hierarchy
    const stratify = d3.stratify()
        .id((d: any) => d.id)
        .parentId((d: any) => d.parentId);

    let root;
    try {
        root = stratify(flatData);
    } catch (e) {
        // Handle cases with multiple roots or loops
        // For simplicity, find the node with no parent or use the first one as root if structure is broken
        console.warn("Stratify failed, likely disjoint data. rendering partial.", e);
        showError("Data structure error: Ensure one root parent and valid IDs.");
        switchView('admin');
        return;
    }

    // Dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 2. Setup SVG
    // We will use a Group <g> to enable Zoom/Pan
    const g = svgElement
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "transparent")
        .call(d3.zoom().scaleExtent([0.1, 3]).on("zoom", (event: any) => {
            g.attr("transform", event.transform);
        }))
        .append("g");
        
    // Center initial view approximately
    g.attr("transform", `translate(${width/2}, ${height/5}) scale(0.8)`);

    // 3. Tree Layout setup
    // Use tree layout for initial positions, but then force simulation for physics
    const treeLayout = d3.tree().nodeSize([120, 280]); // Increased spacing
    treeLayout(root);

    // 4. Force Simulation Setup
    const nodes = root.descendants();
    const links = root.links();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100).strength(0.8))
        .force("charge", d3.forceManyBody().strength(-800)) // Repel nodes
        .force("collide", d3.forceCollide(70)) // Prevent overlap
        .force("y", d3.forceY((d: any) => d.depth * 280).strength(2)) // Maintain hierarchy levels strongly
        .force("x", d3.forceX(0).strength(0.1)); // Center slightly

    // 5. Draw Links (Curves)
    const link = g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "url(#link-gradient)")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.5)
        .attr("d", d3.linkVertical()
            .x((d: any) => d.x)
            .y((d: any) => d.y)
        );

    // 6. Draw Nodes
    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        // Start positions from tree layout to avoid chaos
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Node Circles
    node.append("circle")
        .attr("r", 40)
        .style("fill", (d: any) => d.data.color || (d.depth === 0 ? "#1f2937" : "#3b82f6")) // Root dark, others blue by default
        .style("stroke", "#fff")
        .style("stroke-width", 3)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.15))") // Soft shadow
        .on("mouseover", function(event: any, d: any) {
             d3.select(this)
               .transition().duration(200)
               .attr("transform", "scale(1.15)")
               .style("stroke", "#fcd34d") // Gold stroke on hover
               .style("stroke-width", 4);
               
             // Raise parent group to front
             d3.select(this.parentNode).raise();
        })
        .on("mouseout", function(event: any, d: any) {
             d3.select(this)
               .transition().duration(200)
               .attr("transform", "scale(1)")
               .style("stroke", "#fff")
               .style("stroke-width", 3);
        });

    // Node Labels (Text)
    node.append("text")
        .attr("dy", 60)
        .attr("text-anchor", "middle")
        .text((d: any) => d.data.name)
        .style("font-family", "Cairo, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "700")
        .style("fill", "#1e293b")
        .style("pointer-events", "none")
        .style("text-shadow", "0 2px 4px rgba(255,255,255,0.8)");
        
    // Initial Animation: Pop in
    node.attr("opacity", 0)
        .transition()
        .duration(800)
        .delay((d: any) => d.depth * 100)
        .attr("opacity", 1);


    // --- Interaction Logic ---
    let isDragging = false;

    function dragstarted(event: any, d: any) {
        isDragging = false; // reset
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event: any, d: any) {
        isDragging = true;
        d.fx = event.x;
        
        // Vertical Constraint:
        // Ensure parent is not below child, and child not above parent.
        const buffer = 120; // Increased buffer
        
        // 1. Check parent constraint (cannot go below parent)
        if (d.parent) {
             // Parent's current Y (use fy/fx if fixed, else y/x)
             const parentY = d.parent.fy !== undefined ? d.parent.fy : d.parent.y;
             const minY = parentY + buffer; 
             if (event.y < minY) {
                 d.fy = minY; // Clamp
             } else {
                 d.fy = event.y;
             }
        } else {
            // Root node
             d.fy = event.y;
        }
        
        // 2. Check children constraint (cannot go above any child)
        if (d.children) {
             let minChildY = Infinity;
             d.children.forEach((child:any) => {
                 const childY = child.fy !== undefined ? child.fy : child.y;
                 if (childY < minChildY) minChildY = childY;
             });
             
             if (minChildY !== Infinity) {
                 const maxY = minChildY - buffer;
                 if (d.fy > maxY) {
                     d.fy = maxY;
                 }
             }
        }
    }

    function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        // Sticky: Do not set d.fx = null, keep them where dragged
        
        // If it wasn't a real drag (just a click)
        if (!isDragging) {
            handleNodeClick(event, d);
        }
    }

    // Simulation Tick Update
    simulation.on("tick", () => {
        link.attr("d", (d: any) => {
             // Smooth bezier curve
             return `M${d.source.x},${d.source.y} C${d.source.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${d.target.y}`;
        });

        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
}

function handleNodeClick(event: any, d: any) {
    if (appMode === 'user_editor') {
        openAddChildModal(d);
    } else if (appMode === 'admin') {
        openAdminModal(d);
    }
}


// --- User Mode Functions ---

function openAddChildModal(nodeData: any) {
    selectedParentId = nodeData.data.id;
    modalParentName.textContent = nodeData.data.name;
    addChildModal.style.display = 'flex';
    setTimeout(() => addChildModal.classList.add('show'), 10);
    newChildNameInput.focus();
}

function closeAddChildModal() {
    addChildModal.classList.remove('show');
    setTimeout(() => { addChildModal.style.display = 'none'; }, 300);
    newChildNameInput.value = '';
    selectedParentId = null;
}

function saveNewChild() {
    const name = newChildNameInput.value.trim();
    if (!name || !selectedParentId) return;

    // Generate new ID (max + 1)
    const maxId = currentTreeData.reduce((max, item) => Math.max(max, item.id), 0);
    const newId = maxId + 1;

    const newChild = {
        id: newId,
        name: name,
        parentId: selectedParentId
    };

    // Update data
    currentTreeData.push(newChild);
    localStorage.setItem('familyTreeData', JSON.stringify(currentTreeData));

    // Log action
    logActivity('ADD_CHILD', `Added child '${name}' to parent ID ${selectedParentId}`);

    closeAddChildModal();
    renderTree(currentTreeData);
}

// --- Admin Functions ---

function openAdminModal(nodeData: any) {
    selectedParentId = nodeData.data.id;
    const currentName = nodeData.data.name;
    // Default blue if no color set
    const currentColor = nodeData.data.color || "#3b82f6";
    
    adminModalTitle.textContent = `Node ID: ${selectedParentId}`;
    adminEditNameInput.value = currentName;
    adminEditColorInput.value = currentColor;
    adminChildNameInput.value = '';
    
    adminNodeModal.style.display = 'flex';
    setTimeout(() => adminNodeModal.classList.add('show'), 10);
}

function handleAdminUpdate() {
    if (!selectedParentId) return;
    
    const newName = adminEditNameInput.value.trim();
    const newColor = adminEditColorInput.value;
    
    if (newName) {
        // Update in global data
        const nodeIndex = currentTreeData.findIndex(n => n.id === selectedParentId);
        if (nodeIndex !== -1) {
            const oldName = currentTreeData[nodeIndex].name;
            currentTreeData[nodeIndex].name = newName;
            currentTreeData[nodeIndex].color = newColor;
            
            localStorage.setItem('familyTreeData', JSON.stringify(currentTreeData));
            logActivity('EDIT_NODE', `Updated node ${selectedParentId}: ${oldName} -> ${newName}, Color: ${newColor}`);
            
            adminNodeModal.classList.remove('show');
            setTimeout(() => { adminNodeModal.style.display = 'none'; }, 300);
            renderTree(currentTreeData);
        }
    }
}

function handleAdminAddChild() {
    const name = adminChildNameInput.value.trim();
    if (!name || !selectedParentId) return;
    
    // Use the same logic as user add
    const maxId = currentTreeData.reduce((max, item) => Math.max(max, item.id), 0);
    const newId = maxId + 1;

    const newChild = {
        id: newId,
        name: name,
        parentId: selectedParentId
    };

    currentTreeData.push(newChild);
    localStorage.setItem('familyTreeData', JSON.stringify(currentTreeData));
    
    logActivity('ADMIN_ADD', `Admin added child '${name}' to ${selectedParentId}`);
    
    adminNodeModal.classList.remove('show');
    setTimeout(() => { adminNodeModal.style.display = 'none'; }, 300);
    renderTree(currentTreeData);
}

function handleAdminDelete() {
    if (!selectedParentId) return;
    
    if(!confirm("Are you sure? This will delete this node and ALL its descendants.")) return;
    
    // Recursive delete
    const idsToDelete = new Set<number>();
    
    function collectIds(pid: number) {
        idsToDelete.add(pid);
        const children = currentTreeData.filter(d => d.parentId === pid);
        children.forEach(c => collectIds(c.id));
    }
    
    collectIds(selectedParentId);
    
    const count = idsToDelete.size;
    currentTreeData = currentTreeData.filter(d => !idsToDelete.has(d.id));
    localStorage.setItem('familyTreeData', JSON.stringify(currentTreeData));
    
    logActivity('DELETE', `Deleted node ${selectedParentId} and ${count-1} descendants`);
    
    adminNodeModal.classList.remove('show');
    setTimeout(() => { adminNodeModal.style.display = 'none'; }, 300);
    renderTree(currentTreeData);
}

// Excel Export
function exportToExcel() {
    if (currentTreeData.length === 0) {
        alert("No data to export");
        return;
    }
    
    // Format for Arabic headers
    const exportData = currentTreeData.map(d => ({
        "الرقم": d.id,
        "الاسم": d.name,
        "رقم الأب": d.parentId,
        "اللون": d.color || ""
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FamilyTree");
    XLSX.writeFile(wb, "family_tree_data.xlsx");
    
    logActivity('EXPORT', 'Exported data to Excel');
}

// Reset System
function resetSystemData() {
    if(confirm("تحذير: سيتم حذف شجرة العائلة بالكامل وسجل النشاطات. هل أنت متأكد؟\n(لن يتم حذف المستخدمين)")) {
        localStorage.removeItem('familyTreeData');
        localStorage.removeItem('familyTreeLogs');
        currentTreeData = [];
        
        logActivity('RESET', 'System data reset performed');
        
        alert("تمت إعادة ضبط النظام بنجاح.");
        updateDashboardStats();
    }
}

// Stats
function updateDashboardStats() {
    const totalMembers = currentTreeData.length;
    let maxDepth = 0;
    
    // Calculate simple depth based on parent chains
    if (totalMembers > 0) {
        const depthMap = new Map<number, number>();
        // Initialize roots
        currentTreeData.forEach(node => {
            if (!node.parentId) depthMap.set(node.id, 1);
        });
        
        // Iterate to fill depths (naive approach, assumes order or multiple passes needed if unordered)
        // Better: recursive calc
        function getDepth(id: number): number {
            if (depthMap.has(id)) return depthMap.get(id)!;
            const node = currentTreeData.find(n => n.id === id);
            if (!node || !node.parentId) return 1;
            const d = 1 + getDepth(node.parentId);
            depthMap.set(id, d);
            return d;
        }
        
        currentTreeData.forEach(node => {
            const d = getDepth(node.id);
            if (d > maxDepth) maxDepth = d;
        });
    }

    statsCountEl.textContent = totalMembers.toString();
    statsDepthEl.textContent = `${maxDepth} أجيال`;
}

// --- Authentication Logic ---

// Hardcoded Admin Credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

function handleLogin() {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    loginErrorMsg.style.display = 'none';

    if (loginTarget === 'admin') {
        // Admin Login
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            currentUser = 'Admin';
            logActivity('LOGIN', 'Admin logged in');
            appMode = 'admin';
            switchView('admin');
        } else {
            showLoginError();
        }
    } else {
        // Registered User Login
        const users = getUsersFromStorage();
        const found = users.find((u: any) => u.username === user && u.password === pass);
        
        if (found) {
            currentUser = user;
            logActivity('LOGIN', `User '${user}' logged in`);
            appMode = 'user_editor';
            switchView('user_start');
        } else {
            showLoginError();
        }
    }
}

function showLoginError() {
    loginErrorMsg.style.display = 'block';
    // Shake animation effect
    loginContainer.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
    ], { duration: 300 });
}

// --- Registration Logic ---

function handleRegister() {
    const user = regUsernameInput.value.trim();
    const pass = regPasswordInput.value.trim();
    const confirm = regConfirmInput.value.trim();
    
    registerErrorMsg.style.display = 'none';
    
    if (!user || !pass) {
        registerErrorMsg.textContent = "الرجاء ملء جميع الحقول";
        registerErrorMsg.style.display = 'block';
        return;
    }
    
    if (pass !== confirm) {
        registerErrorMsg.textContent = "كلمة المرور غير متطابقة";
        registerErrorMsg.style.display = 'block';
        return;
    }
    
    // Check duplicates
    const users = getUsersFromStorage();
    if (users.find((u: any) => u.username === user)) {
        registerErrorMsg.textContent = "اسم المستخدم موجود مسبقاً";
        registerErrorMsg.style.display = 'block';
        return;
    }
    
    // Save
    users.push({ username: user, password: pass });
    saveUsersToStorage(users);
    
    logActivity('REGISTER', `New user registered: ${user}`);
    
    alert("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.");
    
    // Redirect to login
    goToRegisteredLoginBtn.click();
}

function getUsersFromStorage() {
    const raw = localStorage.getItem('familyTreeUsers');
    return raw ? JSON.parse(raw) : [];
}

function saveUsersToStorage(users: any[]) {
    localStorage.setItem('familyTreeUsers', JSON.stringify(users));
}

// --- User Management Logic (Admin) ---

function openUserManagement() {
    renderUserTable();
    userManModal.style.display = 'flex';
    setTimeout(() => userManModal.classList.add('show'), 10);
    // Reset views
    userManListView.style.display = 'block';
    userManFormView.style.display = 'none';
}

function renderUserTable() {
    const users = getUsersFromStorage();
    userListTbody.innerHTML = '';
    
    users.forEach((u: any, index: number) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.username}</td>
            <td style="font-family:monospace;">${'*'.repeat(u.password.length)}</td>
            <td style="text-align:center;">
                <button class="action-btn" onclick="window.editUser(${index})"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="window.deleteUser(${index})" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
            </td>
        `;
        userListTbody.appendChild(tr);
    });
}

// Expose to window for onclick handlers
(window as any).deleteUser = function(index: number) {
    if(confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
        const users = getUsersFromStorage();
        const removed = users.splice(index, 1);
        saveUsersToStorage(users);
        renderUserTable();
        logActivity('USER_MGMT', `Deleted user: ${removed[0].username}`);
    }
};

(window as any).editUser = function(index: number) {
    const users = getUsersFromStorage();
    const u = users[index];
    editingUserIndex = index;
    
    manUsernameInput.value = u.username;
    manPasswordInput.value = u.password;
    
    userFormTitle.textContent = "تعديل المستخدم";
    userManListView.style.display = 'none';
    userManFormView.style.display = 'block';
};

function handleSaveUser() {
    const user = manUsernameInput.value.trim();
    const pass = manPasswordInput.value.trim();
    
    if(!user || !pass) return;
    
    const users = getUsersFromStorage();
    
    // Check duplicates if name changed or new user
    const exists = users.findIndex((u:any) => u.username === user);
    if (exists !== -1 && exists !== editingUserIndex) {
        alert("اسم المستخدم موجود بالفعل");
        return;
    }
    
    if (editingUserIndex !== null) {
        // Update
        users[editingUserIndex] = { username: user, password: pass };
        logActivity('USER_MGMT', `Updated user: ${user}`);
    } else {
        // Create
        users.push({ username: user, password: pass });
        logActivity('USER_MGMT', `Created user: ${user}`);
    }
    
    saveUsersToStorage(users);
    
    // Return to list
    userManFormView.style.display = 'none';
    userManListView.style.display = 'block';
    renderUserTable();
}


// --- Activity Log Logic ---

function logActivity(action: string, details: string) {
    const logs = getLogs();
    const entry = {
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: action,
        details: details
    };
    logs.unshift(entry); // Add to top
    // Limit log size
    if (logs.length > 500) logs.pop();
    localStorage.setItem('familyTreeLogs', JSON.stringify(logs));
}

function getLogs() {
    const raw = localStorage.getItem('familyTreeLogs');
    return raw ? JSON.parse(raw) : [];
}

function openActivityLogs() {
    renderLogTable();
    activityLogModal.style.display = 'flex';
    setTimeout(() => activityLogModal.classList.add('show'), 10);
}

function renderLogTable() {
    const logs = getLogs();
    logListTbody.innerHTML = '';
    
    logs.forEach((log: any) => {
        const date = new Date(log.timestamp).toLocaleString('ar-SA');
        let actionColor = '#64748b';
        if(log.action === 'LOGIN') actionColor = '#3b82f6';
        if(log.action === 'DELETE') actionColor = '#ef4444';
        if(log.action.includes('ADD')) actionColor = '#10b981';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size:0.85rem; color:#94a3b8;">${date}</td>
            <td style="font-weight:700;">${log.user}</td>
            <td><span style="background:${actionColor}20; color:${actionColor}; padding: 3px 8px; border-radius:4px; font-size:0.8rem; font-weight:700;">${log.action}</span></td>
            <td>${log.details}</td>
        `;
        logListTbody.appendChild(tr);
    });
}

function clearActivityLog() {
    if(confirm("هل أنت متأكد من مسح السجلات؟")) {
        localStorage.removeItem('familyTreeLogs');
        renderLogTable();
    }
}


function showError(msg: string) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    loadingSpinner.style.display = 'none';
}

// Initial Load check
window.addEventListener('load', () => {
    // Check if we have data to enable "View Saved" button properly (optional visual cue)
    if(localStorage.getItem('familyTreeData')) {
        // Maybe change button style or show notification
    }
});
