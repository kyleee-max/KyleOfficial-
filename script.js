/* ==========================================
   KAEL SENPAI - CLEAN LOGIC (NO FAV SONG)
   ========================================== */

// 1. Ambil Element Audio & Button
const bgm = document.getElementById('bgMusic'); 
const bgmBtn = document.getElementById('audioToggle');

// 2. Fungsi Update UI Tombol
function updateBgmBtn(isPlaying) {
    if (isPlaying) {
        bgmBtn.innerHTML = '<i class="fas fa-pause"></i> Music Active';
        bgmBtn.style.color = "#0088ff";
    } else {
        bgmBtn.innerHTML = '<i class="fas fa-play"></i> Background Sound';
        bgmBtn.style.color = "#444";
    }
}

// 3. Autoplay Hack (Trigger saat user pertama kali klik layar)
function initSystem() {
    bgm.play().then(() => {
        updateBgmBtn(true);
        // Lepas listener biar gak trigger berkali-kali
        document.removeEventListener('click', initSystem);
        document.removeEventListener('touchstart', initSystem);
    }).catch(err => console.log("Menunggu interaksi user..."));
}

document.addEventListener('click', initSystem);
document.addEventListener('touchstart', initSystem);

// 4. Manual Toggle (Klik tombol buat Play/Pause)
bgmBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Biar gak bentrok sama initSystem
    if (bgm.paused) {
        bgm.play();
        updateBgmBtn(true);
    } else {
        bgm.pause();
        updateBgmBtn(false);
    }
});

// 5. Jaga-jaga kalo audio error/gagal load
bgm.onerror = () => {
    console.error("Gagal load file audio. Cek nama filenya!");
    bgmBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Audio Error';
};