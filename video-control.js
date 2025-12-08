// VIDEO CONTROL LOGIC

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('intro-video');
    
    // Ensure video plays automatically
    video.play().catch(function(error) {
        console.log('Autoplay prevented:', error);
        
        // Show play button overlay if autoplay blocked
        showPlayButton();
    });
    
    // Handle video playback issues
    video.addEventListener('error', function(e) {
        console.error('Video error:', e);
        
        // Try alternative source
        tryAlternativeSource();
    });
    
    // Track video progress for analytics
    video.addEventListener('timeupdate', function() {
        const progress = (video.currentTime / video.duration) * 100;
        
        // You could send progress to analytics here
        // Example: trackVideoProgress(progress);
    });
    
    // Video ended - ensure loading completes
    video.addEventListener('ended', function() {
        console.log('Video ended, proceeding to main interface');
    });
});

// Show play button if autoplay blocked
function showPlayButton() {
    const playOverlay = document.createElement('div');
    playOverlay.id = 'play-overlay';
    playOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
        font-family: 'Orbitron', sans-serif;
        text-align: center;
    `;
    
    playOverlay.innerHTML = `
        <h2 style="margin-bottom: 2rem; color: #ff0033; text-shadow: 0 0 10px #ff0033;">
            CYBER SCAN TOOL
        </h2>
        <p style="margin-bottom: 2rem; max-width: 500px;">
            Press play to start the system initialization sequence.
        </p>
        <button id="manual-play-btn" style="
            background: linear-gradient(45deg, #ff0033, #cc0029);
            color: white;
            border: none;
            padding: 1rem 3rem;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            font-weight: bold;
            letter-spacing: 2px;
            transition: all 0.3s;
        ">
            <i class="fas fa-play" style="margin-right: 10px;"></i>
            START INITIALIZATION
        </button>
    `;
    
    document.body.appendChild(playOverlay);
    
    // Add event listener to play button
    document.getElementById('manual-play-btn').addEventListener('click', function() {
        const video = document.getElementById('intro-video');
        video.play().then(() => {
            playOverlay.remove();
        }).catch(error => {
            console.error('Manual play failed:', error);
            // If still fails, skip video
            playOverlay.remove();
            document.getElementById('skip-btn').click();
        });
    });
}

// Try alternative video source
function tryAlternativeSource() {
    const video = document.getElementById('intro-video');
    
    // Alternative sources (you can add more)
    const alternativeSources = [
        'https://files.catbox.moe/wqbpcn.mp4',
        // Add backup sources here
    ];
    
    let currentSourceIndex = 0;
    
    function tryNextSource() {
        if (currentSourceIndex < alternativeSources.length) {
            console.log('Trying alternative source:', alternativeSources[currentSourceIndex]);
            video.src = alternativeSources[currentSourceIndex];
            video.load();
            video.play().catch(() => {
                currentSourceIndex++;
                setTimeout(tryNextSource, 1000);
            });
        } else {
            console.log('All video sources failed, skipping video');
            document.getElementById('skip-btn').click();
        }
    }
    
    tryNextSource();
}

// Track video analytics (optional)
function trackVideoProgress(progress) {
    // This function could send progress data to your analytics
    // For example: Google Analytics, or your own backend
    
    const milestones = [25, 50, 75, 95, 100];
    
    milestones.forEach(milestone => {
        if (progress >= milestone && progress < milestone + 1) {
            console.log(`Video reached ${milestone}%`);
            // Send analytics event
            // Example: ga('send', 'event', 'Video', 'Progress', `${milestone}%`);
        }
    });
}

// Handle video visibility change
document.addEventListener('visibilitychange', function() {
    const video = document.getElementById('intro-video');
    
    if (document.hidden) {
        // Page is hidden, pause video
        if (!video.paused) {
            video.pause();
        }
    } else {
        // Page is visible, resume video if it was playing
        if (video.currentTime > 0 && !video.ended) {
            video.play().catch(e => console.log('Resume failed:', e));
        }
    }
});

// Handle page refresh/closing
window.addEventListener('beforeunload', function() {
    // You could save video progress here
    const video = document.getElementById('intro-video');
    const progress = video.currentTime;
    
    // Save to localStorage
    localStorage.setItem('videoLastProgress', progress);
    localStorage.setItem('videoLastTime', Date.now());
});

// Resume from last position (optional)
function resumeFromLastPosition() {
    const lastProgress = localStorage.getItem('videoLastProgress');
    const lastTime = localStorage.getItem('videoLastTime');
    
    if (lastProgress && lastTime) {
        const timePassed = Date.now() - parseInt(lastTime);
        
        // Only resume if less than 5 minutes passed
        if (timePassed < 5 * 60 * 1000) {
            const video = document.getElementById('intro-video');
            
            video.addEventListener('loadedmetadata', function() {
                if (parseFloat(lastProgress) < video.duration) {
                    video.currentTime = parseFloat(lastProgress);
                }
            });
        }
    }
}

// Initialize resume on load
if (localStorage.getItem('videoLastProgress')) {
    // Small delay to ensure video is loaded
    setTimeout(resumeFromLastPosition, 1000);
}