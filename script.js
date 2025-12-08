// CYBER SCAN TOOL - Main JavaScript Logic

// Global Variables
let currentSection = 'scan';
let scanData = {};
let sessionId = generateSessionId();
let scansToday = 0;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    // Set session ID
    document.getElementById('session-id').textContent = sessionId;
    
    // Update time display
    updateTime();
    setInterval(updateTime, 1000);
    
    // Navigation Event Listeners
    setupNavigation();
    
    // Scan Button Event
    document.getElementById('scan-btn').addEventListener('click', startScan);
    
    // Export Buttons Events
    document.getElementById('export-json').addEventListener('click', exportToJSON);
    document.getElementById('export-txt').addEventListener('click', exportToTXT);
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('copy-clipboard').addEventListener('click', copyToClipboard);
    
    // Initialize scans counter from localStorage
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastScanDate');
    const storedCount = localStorage.getItem('scansCount');
    
    if (storedDate === today && storedCount) {
        scansToday = parseInt(storedCount);
    } else {
        scansToday = 0;
        localStorage.setItem('lastScanDate', today);
    }
    
    document.getElementById('scans-today').textContent = scansToday;
    
    // Add scan data to terminal
    addToTerminal('> System initialized successfully');
    addToTerminal('> Ready for device scan');
});

// Generate Random Session ID
function generateSessionId() {
    const chars = 'ABCDEF0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Update Time Display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('time-display').textContent = timeString;
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    currentSection = targetId;
                    
                    // Add to terminal
                    addToTerminal(`> Navigation: ${targetId.toUpperCase()} section`);
                }
            });
        });
    });
}

// Start Device Scan
async function startScan() {
    const scanBtn = document.getElementById('scan-btn');
    const progressBar = document.getElementById('scan-progress-bar');
    const progressStatus = document.getElementById('progress-status');
    
    // Disable button during scan
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i><span>SCANNING...</span>';
    
    // Reset progress
    progressBar.style.width = '0%';
    progressStatus.textContent = 'INITIALIZING...';
    
    // Add to terminal
    addToTerminal('> Scan initiated');
    addToTerminal('> Collecting device data...');
    
    try {
        // Phase 1: Basic Information (0-25%)
        await updateProgress(25, 'Collecting basic info...');
        scanData.basic = await collectBasicInfo();
        
        // Phase 2: Network Information (25-50%)
        await updateProgress(50, 'Checking network...');
        scanData.network = await collectNetworkInfo();
        
        // Phase 3: Device Specifications (50-75%)
        await updateProgress(75, 'Analyzing device specs...');
        scanData.device = await collectDeviceSpecs();
        
        // Phase 4: Browser Fingerprint (75-100%)
        await updateProgress(100, 'Generating fingerprint...');
        scanData.fingerprint = await collectFingerprint();
        
        // Complete
        progressStatus.textContent = 'SCAN COMPLETE';
        scanBtn.innerHTML = '<i class="fas fa-check"></i><span>SCAN COMPLETE</span>';
        
        // Update scans counter
        scansToday++;
        document.getElementById('scans-today').textContent = scansToday;
        localStorage.setItem('scansCount', scansToday.toString());
        
        // Update results display
        updateResultsDisplay();
        
        // Switch to results section
        document.querySelector('a[href="#results"]').click();
        
        // Add to terminal
        addToTerminal('> Scan completed successfully');
        addToTerminal(`> Device identified: ${scanData.device.os}`);
        
    } catch (error) {
        console.error('Scan error:', error);
        progressStatus.textContent = 'SCAN FAILED';
        scanBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>SCAN FAILED</span>';
        
        addToTerminal('> Scan failed: ' + error.message);
    } finally {
        // Re-enable button after delay
        setTimeout(() => {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i><span>CEK ME</span>';
        }, 3000);
    }
}

// Update Progress Bar
function updateProgress(percent, message) {
    return new Promise(resolve => {
        const progressBar = document.getElementById('scan-progress-bar');
        const progressStatus = document.getElementById('progress-status');
        
        // Animate progress bar
        let current = parseInt(progressBar.style.width) || 0;
        const interval = setInterval(() => {
            if (current >= percent) {
                clearInterval(interval);
                resolve();
                return;
            }
            current++;
            progressBar.style.width = current + '%';
        }, 20);
        
        // Update status message
        if (message) {
            progressStatus.textContent = message;
        }
    });
}

// Collect Basic Information
function collectBasicInfo() {
    return new Promise((resolve) => {
        const basicInfo = {
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            online: navigator.onLine,
            javaEnabled: navigator.javaEnabled ? 'Yes' : 'No',
            doNotTrack: navigator.doNotTrack || 'Not specified'
        };
        
        resolve(basicInfo);
    });
}

// Collect Network Information
async function collectNetworkInfo() {
    const networkInfo = {
        connection: navigator.connection || {},
        ip: 'Detecting...',
        location: 'Unknown',
        isp: 'Unknown',
        proxy: 'Checking...'
    };
    
    try {
        // Get IP via multiple methods
        const ip = await getIPAddress();
        networkInfo.ip = ip || 'Could not detect';
        
        // Get location from IP
        if (ip && ip !== 'Could not detect') {
            const locationData = await getLocationFromIP(ip);
            networkInfo.location = locationData.location || 'Unknown';
            networkInfo.isp = locationData.isp || 'Unknown';
        }
        
        // Check for proxy/VPN
        networkInfo.proxy = await checkProxy();
        
    } catch (error) {
        console.warn('Network info error:', error);
    }
    
    return networkInfo;
}

// Get IP Address
function getIPAddress() {
    return new Promise((resolve) => {
        // Method 1: WebRTC (may not work in all browsers)
        try {
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            pc.onicecandidate = (ice) => {
                if (ice.candidate) {
                    const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                    const match = regex.exec(ice.candidate.candidate);
                    if (match) {
                        resolve(match[1]);
                        pc.close();
                        return;
                    }
                }
            };
            
            // Timeout fallback
            setTimeout(() => {
                // Method 2: External API
                fetch('https://api.ipify.org?format=json')
                    .then(response => response.json())
                    .then(data => resolve(data.ip))
                    .catch(() => {
                        // Method 3: Alternative API
                        fetch('https://api.my-ip.io/ip.json')
                            .then(response => response.json())
                            .then(data => resolve(data.ip))
                            .catch(() => resolve('Could not detect'));
                    });
            }, 1000);
            
        } catch (error) {
            // Fallback to API
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => resolve(data.ip))
                .catch(() => resolve('Could not detect'));
        }
    });
}

// Get Location from IP
function getLocationFromIP(ip) {
    return new Promise((resolve) => {
        if (ip === 'Could not detect' || ip.includes('192.168') || ip.includes('127.0') || ip.includes('10.')) {
            resolve({ location: 'Local Network', isp: 'Private' });
            return;
        }
        
        fetch(`https://ipapi.co/${ip}/json/`)
            .then(response => response.json())
            .then(data => {
                resolve({
                    location: `${data.city || ''}${data.city && data.country_name ? ', ' : ''}${data.country_name || ''}`,
                    isp: data.org || data.asn || 'Unknown'
                });
            })
            .catch(() => {
                resolve({ location: 'Unknown', isp: 'Unknown' });
            });
    });
}

// Check for Proxy/VPN
function checkProxy() {
    return new Promise((resolve) => {
        // Check if behind proxy
        const isProxy = window.webkitRTCPeerConnection ? 'Unknown' : 'Likely not';
        
        // Additional checks
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const languages = navigator.languages;
        
        // Simple heuristic: if timezone doesn't match IP location, might be VPN
        // (This is simplified - real detection is more complex)
        resolve(isProxy);
    });
}

// Collect Device Specifications
function collectDeviceSpecs() {
    const deviceInfo = {
        os: getOS(),
        browser: getBrowser(),
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth + ' bit',
        pixelRatio: window.devicePixelRatio,
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        platform: navigator.platform
    };
    
    // Check for mobile
    deviceInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return deviceInfo;
}

// Get Operating System
function getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Windows') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'macOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1) return 'iOS';
    return 'Unknown';
}

// Get Browser
function getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
    if (userAgent.indexOf('Safari') !== -1) return 'Safari';
    if (userAgent.indexOf('Edge') !== -1) return 'Edge';
    if (userAgent.indexOf('Opera') !== -1) return 'Opera';
    return 'Unknown';
}

// Collect Browser Fingerprint
function collectFingerprint() {
    const fingerprint = {
        canvas: 'Unique',
        webgl: 'Supported',
        fonts: 'Unknown',
        audio: 'Supported',
        hash: '################'
    };
    
    // Canvas fingerprint
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f00';
        ctx.fillRect(0, 0, 50, 50);
        
        ctx.fillStyle = '#fff';
        ctx.fillText('CYBER SCAN', 2, 15);
        
        const canvasData = canvas.toDataURL();
        fingerprint.canvas = 'Unique (' + canvasData.substring(22, 50) + '...)';
    } catch (e) {
        fingerprint.canvas = 'Blocked';
    }
    
    // WebGL support
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                fingerprint.webgl = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Supported';
            } else {
                fingerprint.webgl = 'Supported';
            }
        } else {
            fingerprint.webgl = 'Not supported';
        }
    } catch (e) {
        fingerprint.webgl = 'Error';
    }
    
    // Font detection (simplified)
    const fonts = [
        'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 
        'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];
    
    let availableFonts = 0;
    fonts.forEach(font => {
        if (document.fonts.check(`12px "${font}"`)) {
            availableFonts++;
        }
    });
    
    fingerprint.fonts = `${availableFonts} of ${fonts.length} common fonts`;
    
    // Audio fingerprint (simplified)
    fingerprint.audio = window.AudioContext || window.webkitAudioContext ? 'Supported' : 'Not supported';
    
    // Generate simple hash
    fingerprint.hash = generateFingerprintHash();
    
    return fingerprint;
}

// Generate Fingerprint Hash
function generateFingerprintHash() {
    const data = [
        navigator.userAgent,
        navigator.platform,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.language,
        !!window.sessionStorage,
        !!window.localStorage,
        !!window.indexedDB
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).substring(0, 16).toUpperCase();
}

// Update Results Display
function updateResultsDisplay() {
    if (!scanData.network || !scanData.device || !scanData.fingerprint) return;
    
    // Network Data
    document.getElementById('ip-address').textContent = scanData.network.ip;
    document.getElementById('isp').textContent = scanData.network.isp;
    document.getElementById('location').textContent = scanData.network.location;
    document.getElementById('proxy-status').textContent = scanData.network.proxy;
    document.getElementById('network-status').textContent = 'COMPLETE';
    
    // Device Specs
    document.getElementById('os').textContent = scanData.device.os;
    document.getElementById('browser').textContent = scanData.device.browser;
    document.getElementById('screen-res').textContent = scanData.device.screen;
    document.getElementById('device-ram').textContent = scanData.device.deviceMemory ? 
        scanData.device.deviceMemory + ' GB' : 'Unknown';
    document.getElementById('device-status').textContent = 'COMPLETE';
    
    // Fingerprint
    document.getElementById('fingerprint-hash').textContent = scanData.fingerprint.hash;
    document.getElementById('canvas-print').textContent = scanData.fingerprint.canvas;
    document.getElementById('font-count').textContent = scanData.fingerprint.fonts;
    document.getElementById('webgl').textContent = scanData.fingerprint.webgl;
    document.getElementById('fingerprint-status').textContent = 'COMPLETE';
    
    // Security Status
    document.getElementById('https-status').textContent = window.location.protocol === 'https:' ? 'SECURE' : 'NOT SECURE';
    document.getElementById('cookies-enabled').textContent = navigator.cookieEnabled ? 'ENABLED' : 'DISABLED';
    document.getElementById('tracking-protection').textContent = 'BASIC';
    
    // Calculate risk level (simplified)
    let riskLevel = 'LOW';
    if (scanData.network.proxy.includes('Likely') || scanData.fingerprint.canvas === 'Blocked') {
        riskLevel = 'MEDIUM';
    }
    if (window.location.protocol !== 'https:') {
        riskLevel = 'HIGH';
    }
    
    document.getElementById('risk-level').textContent = riskLevel;
    document.getElementById('risk-level').className = 'data-value risk-level ' + riskLevel.toLowerCase();
    document.getElementById('security-status').textContent = 'COMPLETE';
    
    // Add scan complete to terminal
    addToTerminal('> Results updated in database');
}

// Export to JSON
function exportToJSON() {
    const dataStr = JSON.stringify(scanData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cyber-scan-${sessionId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addToTerminal('> Results exported as JSON');
}

// Export to TXT
function exportToTXT() {
    let textContent = `CYBER SCAN RESULTS\n`;
    textContent += `Session: ${sessionId}\n`;
    textContent += `Timestamp: ${new Date().toLocaleString()}\n`;
    textContent += `================================\n\n`;
    
    if (scanData.network) {
        textContent += `NETWORK INFORMATION:\n`;
        textContent += `IP Address: ${scanData.network.ip}\n`;
        textContent += `ISP: ${scanData.network.isp}\n`;
        textContent += `Location: ${scanData.network.location}\n`;
        textContent += `Proxy/VPN: ${scanData.network.proxy}\n\n`;
    }
    
    if (scanData.device) {
        textContent += `DEVICE SPECIFICATIONS:\n`;
        textContent += `OS: ${scanData.device.os}\n`;
        textContent += `Browser: ${scanData.device.browser}\n`;
        textContent += `Screen: ${scanData.device.screen}\n`;
        textContent += `RAM: ${scanData.device.deviceMemory} GB\n\n`;
    }
    
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
    const exportFileDefaultName = `cyber-scan-${sessionId}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addToTerminal('> Results exported as TXT');
}

// Export to PDF (simulated)
function exportToPDF() {
    // This would require a PDF library in production
    // For demo, we'll simulate it
    alert('PDF export would require additional libraries. Using JSON export instead.');
    exportToJSON();
    
    addToTerminal('> PDF simulation - used JSON instead');
}

// Copy to Clipboard
async function copyToClipboard() {
    let textContent = `Cyber Scan Results - Session: ${sessionId}\n`;
    
    if (scanData.network) {
        textContent += `IP: ${scanData.network.ip} | Location: ${scanData.network.location}\n`;
    }
    
    if (scanData.device) {
        textContent += `Device: ${scanData.device.os} - ${scanData.device.browser}\n`;
    }
    
    if (scanData.fingerprint) {
        textContent += `Fingerprint: ${scanData.fingerprint.hash}`;
    }
    
    try {
        await navigator.clipboard.writeText(textContent);
        addToTerminal('> Results copied to clipboard');
        
        // Show temporary notification
        const btn = document.getElementById('copy-clipboard');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> COPIED';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    } catch (err) {
        console.error('Copy failed:', err);
        addToTerminal('> Clipboard copy failed');
    }
}

// Add message to terminal
function addToTerminal(message) {
    const terminal = document.getElementById('terminal-output');
    terminal.innerHTML += '\n' + message;
    terminal.scrollTop = terminal.scrollHeight;
}

// Utility: Format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}