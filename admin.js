/* =========================
   ADMIN ACCESS GATE
========================= */
function checkAdminAccess() {
    const isLogged = localStorage.getItem('adminLogged');
    if (isLogged === 'true') return;

    document.body.innerHTML = `
        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#0a0a0f;
            color:#fff;
            font-family:sans-serif;
        ">
            <div style="
                background:rgba(255,255,255,0.05);
                padding:30px;
                border-radius:10px;
                width:300px;
                text-align:center;
            ">
                <h2>Admin Login</h2>
                <input 
                    type="password" 
                    id="loginPass" 
                    placeholder="Password Admin"
                    style="width:100%;padding:10px;margin-top:15px"
                />
                <button 
                    style="margin-top:15px;width:100%;padding:10px;cursor:pointer"
                    onclick="adminLogin()"
                >
                    Login
                </button>
            </div>
        </div>
    `;
}

function adminLogin() {
    const pass = document.getElementById('loginPass').value;

    fetch('config.json')
        .then(r => r.json())
        .then(cfg => {
            if (pass === cfg.adminPassword) {
                localStorage.setItem('adminLogged', 'true');
                location.reload();
            } else {
                alert('Password salah');
            }
        })
        .catch(() => alert('Gagal load config'));
}

/* =========================
   LOAD CONFIG
========================= */
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        window.config = await response.json();
        updateAdminUI();
    } catch (error) {
        console.error('Gagal load config');
    }
}

/* =========================
   UPDATE ADMIN UI
========================= */
function updateAdminUI() {
    const c = window.config;

    document.getElementById('adminMargaName').value = c.margaName || '';
    document.getElementById('adminGroupAvatar').value = c.groupAvatar || '';
    document.getElementById('adminGroupLink').value = c.groupLink || '';
    document.getElementById('adminPassword').value = c.adminPassword || '';
    document.getElementById('adminMemberStatus').checked = !!c.isOpenMember;

    updateStatusText();
    updateLists();
}

function updateStatusText() {
    const isOpen = document.getElementById('adminMemberStatus').checked;
    document.getElementById('statusText').textContent = isOpen
        ? 'OPEN MEMBER'
        : 'CLOSE MEMBER';
}

function updateLists() {
    const c = window.config;

    // CN List
    const cnListDiv = document.getElementById('cnList');
    cnListDiv.innerHTML = '';
    c.cnList.forEach((cn, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <span>${cn}</span>
            <button onclick="removeItem('cnList', ${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        cnListDiv.appendChild(div);
    });

    // Bio List
    const bioListDiv = document.getElementById('bioList');
    bioListDiv.innerHTML = '';
    c.bioList.forEach((bio, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <span>${bio}</span>
            <button onclick="removeItem('bioList', ${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        bioListDiv.appendChild(div);
    });
}

/* =========================
   ADD / REMOVE ITEM
========================= */
function addCN() {
    const input = document.getElementById('newCN');
    const cn = input.value.trim();
    if (!cn) return;

    if (window.config.cnList.length >= 3) {
        alert('Maksimal 3 CN');
        return;
    }

    window.config.cnList.push(cn);
    updateLists();
    input.value = '';
}

function addBio() {
    const input = document.getElementById('newBio');
    const bio = input.value.trim();
    if (!bio) return;

    if (window.config.bioList.length >= 3) {
        alert('Maksimal 3 Bio');
        return;
    }

    window.config.bioList.push(bio);
    updateLists();
    input.value = '';
}

function removeItem(listName, index) {
    window.config[listName].splice(index, 1);
    updateLists();
}

/* =========================
   SAVE CONFIG
========================= */
async function saveConfig() {
    window.config.margaName =
        document.getElementById('adminMargaName').value;
    window.config.groupAvatar =
        document.getElementById('adminGroupAvatar').value;
    window.config.groupLink =
        document.getElementById('adminGroupLink').value;
    window.config.isOpenMember =
        document.getElementById('adminMemberStatus').checked;
    window.config.adminPassword =
        document.getElementById('adminPassword').value || 'admin123';

    try {
        // NOTE: frontend only (tanpa backend)
        localStorage.setItem('margaConfig', JSON.stringify(window.config));
        alert('Berhasil disimpan!');
    } catch (err) {
        alert('Gagal menyimpan config');
    }
}

/* =========================
   LOGOUT (OPTIONAL)
========================= */
function logoutAdmin() {
    localStorage.removeItem('adminLogged');
    location.reload();
}

/* =========================
   INIT
========================= */
checkAdminAccess();
loadConfig();

document
    .getElementById('adminMemberStatus')
    .addEventListener('change', updateStatusText);