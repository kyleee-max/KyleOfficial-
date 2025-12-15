// LOAD CONFIG
function initUI() {
    const c = window.config || {
        margaName: 'MARGA',
        isOpenMember: false,
        cnList: [],
        bioList: []
    };

    document.getElementById('margaName').innerText = c.margaName;
}
async function loadConfig() {
    try {
        const local = localStorage.getItem('margaConfig');
        if (local) {
            window.config = JSON.parse(local);
        } else {
            const res = await fetch('config.json');
            window.config = await res.json();
        }
        updateUI();
    } catch (e) {
        console.error(e);
        alert('Config gagal dimuat');
    }
}
// UPDATE UI
function updateUI() {
    const c = window.config;
    
    // Nama marga
    document.getElementById('margaName').textContent = c.margaName || 'MARGA';
    document.getElementById('welcomeTitle').textContent = c.margaName || 'Nama Marga';
    
    // Avatar
    const avatar = document.getElementById('groupAvatar');
    const fallback = document.getElementById('avatarFallback');
    if (c.groupAvatar) {
        avatar.src = c.groupAvatar;
        avatar.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        avatar.style.display = 'none';
        fallback.style.display = 'flex';
    }
    
    // Status
    const badge = document.getElementById('statusBadge');
    const startBtn = document.getElementById('startBtn');
    const closeAlert = document.getElementById('closeAlert');
    
    if (c.isOpenMember) {
        badge.innerHTML = '<i class="fas fa-user-plus"></i><span>OPEN</span>';
        startBtn.disabled = false;
        closeAlert.style.display = 'none';
    } else {
        badge.innerHTML = '<i class="fas fa-lock"></i><span>CLOSED</span>';
        startBtn.disabled = true;
        closeAlert.style.display = 'block';
    }
    
    // Contoh CN/Bio
    document.getElementById('cnExample').textContent = c.cnList[0] || 'Belum diatur';
    document.getElementById('bioExample').textContent = c.bioList[0] || 'Belum diatur';
    
    // Group link
    document.getElementById('groupLink').href = c.groupLink || '#';
}

// PAGE NAVIGATION
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + 'Page').classList.add('active');
}

function startSelection() {
    if (!window.config.isOpenMember) return;
    showPage('username');
}

function goToWelcome() { showPage('welcome'); }
function goToUsername() { showPage('username'); }
function goToAccount() { showPage('account'); }
function goToIntro() {
    showPage('intro');
}
// TIKTOK API
async function checkUsername() {
    const username = document.getElementById('usernameInput').value;
    if (!username) return;
    
    try {
        const res = await fetch(`https://api.deline.web.id/stalker/ttstalk?username=${username}`);
        const data = await res.json();
        
        if (!data.status) throw new Error("User tidak ditemukan");
        
        const user = data.result.user;
        const stats = data.result.stats;
        
        // Update profile page
        document.getElementById('profileName').textContent = user.nickname;
        document.getElementById('profileUsername').textContent = '@' + user.uniqueId;
        document.getElementById('profileBio').textContent = user.signature || 'Tidak ada bio';
        document.getElementById('profileImg').src = user.avatarLarger;
        
        document.getElementById('followers').textContent = stats.followerCount;
        document.getElementById('following').textContent = stats.followingCount;
        document.getElementById('likes').textContent = stats.heartCount;
        document.getElementById('videos').textContent = stats.videoCount;
        
        // Validasi
        const cnValid = validateCN(user.nickname);
        const bioValid = validateBio(user.signature);
        
        document.getElementById('cnValid').innerHTML = cnValid ? 
            '<i class="fas fa-check-circle"></i><span>CN: Valid</span>' : 
            '<i class="fas fa-times-circle"></i><span>CN: Invalid</span>';
        
        document.getElementById('bioValid').innerHTML = bioValid ? 
            '<i class="fas fa-check-circle"></i><span>Bio: Valid</span>' : 
            '<i class="fas fa-times-circle"></i><span>Bio: Invalid</span>';
        
        if (cnValid && bioValid) {
            showPage('account');
        } else {
            let errorMsg = '';
            if (!cnValid && !bioValid) errorMsg = 'CN dan Bio tidak sesuai';
            else if (!cnValid) errorMsg = 'CN tidak sesuai';
            else if (!bioValid) errorMsg = 'Bio tidak sesuai';
            
            document.getElementById('error').textContent = errorMsg;
        }
        
    } catch (error) {
        document.getElementById('error').textContent = error.message;
    }
}

function validateCN(nickname) {
    const cnList = window.config.cnList;
    if (!cnList.length) return true;
    
    const nickLower = nickname.toLowerCase();
    return cnList.some(cn => nickLower.includes(cn.toLowerCase()));
}

function validateBio(bio) {
    const bioList = window.config.bioList;
    if (!bioList.length) return true;
    if (!bio) return false;
    
    return bioList.some(b => bio === b);
}

// INTRO FORM
function submitIntro() {
    const name = document.getElementById('inputName').value;
    const gender = document.getElementById('inputGender').value;
    const city = document.getElementById('inputCity').value;
    const age = document.getElementById('inputAge').value;
    const waifu = document.getElementById('inputWaifu').value;
    
    if (!name || !gender || !city || !age || !waifu) {
        alert('Lengkapi semua data');
        return;
    }
    
    window.introData = { name, gender, city, age, waifu };
    updateResultPage();
    showPage('result');
}

function updateResultPage() {
    document.getElementById('resultUser').textContent = document.getElementById('profileUsername').textContent;
    document.getElementById('resultName').textContent = window.introData.name;
    document.getElementById('resultGender').textContent = window.introData.gender;
    document.getElementById('resultCity').textContent = window.introData.city;
    document.getElementById('resultAge').textContent = window.introData.age + ' tahun';
    document.getElementById('resultWaifu').textContent = window.introData.waifu;
}

function copyIntro() {
    const intro = `Kartu Intro:\nNama: ${window.introData.name}\nGender: ${window.introData.gender}\nKota: ${window.introData.city}\nUsia: ${window.introData.age}\nWaifu/Husbu: ${window.introData.waifu}`;
    navigator.clipboard.writeText(intro);
    alert('Intro disalin!');
}

// INIT
loadConfig();
