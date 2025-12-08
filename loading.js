// LOADING ANIMATION LOGIC

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('intro-video');
    const progressText = document.getElementById('progress-text');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const skipBtn = document.getElementById('skip-btn');
    const splashScreen = document.getElementById('splash-screen');
    const mainInterface = document.getElementById('main-interface');
    
    // Progress variables
    let progress = 0;
    const totalProgress = 100;
    const circumference = 2 * Math.PI * 90; // r=90
    const dashOffset = circumference;
    
    // Terminal messages sequence
    const terminalMessages = [
        "mount /dev/cyberscan /mnt/system",
        "kernel.load security_module",
        "initialize network_stack",
        "start fingerprint_engine",
        "load device_database",
        "encrypt session_channel",
        "verify integrity_checks",
        "start web_interface"
    ];
    
    let messageIndex = 0;
    
    // System check updates
    const systemCheck = document.getElementById('system-check');
    const connection = document.getElementById('connection');
    const security = document.getElementById('security');
    const loadingMessage = document.getElementById('loading-message');
    const terminalCommand = document.getElementById('terminal-command');
    
    // Video event listeners
    video.addEventListener('loadeddata', function() {
        startLoadingSequence();
    });
    
    video.addEventListener('ended', function() {
        // Video ended, complete loading
        progress = 100;
        updateProgressDisplay();
        completeLoading();
    });
    
    // Skip button
    skipBtn.addEventListener('click', function() {
        video.pause();
        progress = 100;
        updateProgressDisplay();
        completeLoading();
    });
    
    // Start loading sequence
    function startLoadingSequence() {
        // Start progress animation
        const progressInterval = setInterval(function() {
            if (progress >= totalProgress) {
                clearInterval(progressInterval);
                return;
            }
            
            // Increment progress based on video playback
            if (!video.ended) {
                const videoProgress = (video.currentTime / video.duration) * 80;
                progress = Math.min(videoProgress + 10, 95); // Cap at 95%
            } else {
                progress = Math.min(progress + 1, 100);
            }
            
            updateProgressDisplay();
            
            // Update system checks
            updateSystemChecks();
            
            // Update terminal command
            updateTerminalCommand();
            
        }, 150);
        
        // Update loading message
        const messageInterval = setInterval(function() {
            if (progress >= 100) {
                clearInterval(messageInterval);
                return;
            }
            
            if (messageIndex < terminalMessages.length) {
                loadingMessage.textContent = "> " + terminalMessages[messageIndex];
                messageIndex++;
            }
            
        }, 800);
    }
    
    // Update progress display
    function updateProgressDisplay() {
        // Update percentage text
        progressText.textContent = Math.floor(progress) + '%';
        
        // Update circle progress
        const offset = dashOffset - (progress / 100) * dashOffset;
        progressCircle.style.strokeDashoffset = offset;
        
        // Update stroke color based on progress
        if (progress < 30) {
            progressCircle.style.stroke = '#ff0033';
        } else if (progress < 70) {
            progressCircle.style.stroke = '#ff6600';
        } else {
            progressCircle.style.stroke = '#00ff00';
        }
    }
    
    // Update system checks
    function updateSystemChecks() {
        if (progress >= 20) {
            systemCheck.textContent = 'OK';
            systemCheck.style.color = '#00ff00';
            systemCheck.style.textShadow = '0 0 5px #00ff00';
        }
        
        if (progress >= 50) {
            connection.textContent = 'ESTABLISHED';
            connection.style.color = '#00ff00';
            connection.style.textShadow = '0 0 5px #00ff00';
        }
        
        if (progress >= 80) {
            security.textContent = 'ENCRYPTED';
            security.style.color = '#00ff00';
            security.style.textShadow = '0 0 5px #00ff00';
        }
    }
    
    // Update terminal command
    function updateTerminalCommand() {
        const commands = [
            "sudo systemctl start cyberscan",
            "check_modules --all",
            "verify_encryption_keys",
            "init_fingerprint_db",
            "load_web_interface --port=8080",
            "start_monitoring --level=high",
            "secure_session --user=root"
        ];
        
        if (progress < 100) {
            const cmdIndex = Math.floor((progress / 100) * commands.length);
            terminalCommand.textContent = commands[cmdIndex] || commands[commands.length - 1];
        }
    }
    
    // Complete loading
    function completeLoading() {
        // Final updates
        progressText.textContent = '100%';
        systemCheck.textContent = 'OK';
        connection.textContent = 'ESTABLISHED';
        security.textContent = 'ENCRYPTED';
        loadingMessage.textContent = "> SYSTEM READY";
        terminalCommand.textContent = "start_interface --user=admin";
        
        // Add glow effects
        progressCircle.style.stroke = '#00ff00';
        progressCircle.style.filter = 'drop-shadow(0 0 10px #00ff00)';
        
        // Wait a moment then transition
        setTimeout(function() {
            // Fade out splash screen
            splashScreen.style.opacity = '0';
            splashScreen.style.transition = 'opacity 0.8s ease';
            
            setTimeout(function() {
                splashScreen.style.display = 'none';
                mainInterface.style.display = 'block';
                
                // Fade in main interface
                setTimeout(function() {
                    mainInterface.style.opacity = '1';
                    mainInterface.style.transition = 'opacity 0.5s ease';
                }, 50);
                
                // Play transition sound (optional)
                playTransitionSound();
                
            }, 800);
        }, 1000);
    }
    
    // Play transition sound (optional)
    function playTransitionSound() {
        // You could add a sound effect here
        // For example: new Audio('transition.mp3').play();
    }
    
    // Handle video errors
    video.addEventListener('error', function() {
        console.error('Video failed to load, using fallback');
        startLoadingSequence();
        
        // Complete loading after timeout
        setTimeout(function() {
            progress = 100;
            updateProgressDisplay();
            completeLoading();
        }, 5000);
    });
    
    // Auto-start if video already loaded
    if (video.readyState >= 2) {
        startLoadingSequence();
    }
});