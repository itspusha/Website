document.addEventListener('DOMContentLoaded', function () {
    // STAR CANVAS (Mouse Trail Effect)
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let stars = [];

    // Resize canvas when window size changes
    window.addEventListener('resize', function () {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Star {
        constructor(x, y, velocityX, velocityY) {
            this.x = x;
            this.y = y;
            this.finalSize = Math.random() * 1.5;
            this.size = this.finalSize * 1.5; // Starting size is twice the final size
            this.alpha = 1;
            this.velocityX = velocityX * 0.05;
            this.velocityY = 1 + Math.random() + velocityY * 0.05;
            this.gravity = 0.02;
            this.drag = 0.97;
            this.turbulence = () => Math.random() * 1 - 0.5;
            this.timeElapsed = 0.4; // Time since the star was created
        }

        draw() {
            ctx.fillStyle = `rgba(236, 255, 0, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update(deltaTime) {
            this.x += this.velocityX + this.turbulence();
            this.velocityX *= this.drag;
            this.y += this.velocityY;
            this.velocityY += this.gravity;
            this.alpha = Math.max(0, this.alpha - 0.005);

            this.timeElapsed += deltaTime;
            if (this.timeElapsed < 2000) { // 2000 milliseconds = 2 seconds
                this.size = this.finalSize * 2 - (this.finalSize * this.timeElapsed / 2000);
            } else {
                this.size = this.finalSize;
            }
        }
    }

    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;

    // Function to add new star on mouse move
    function addStar(e) {
        // Calculate mouse velocity
        mouseVelocityX = e.clientX - lastMouseX;
        mouseVelocityY = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Random offset for mouse velocity
        let randomOffsetX = (Math.random() - 0.5) * 100; // Adjust the multiplier for more or less randomness
        let randomOffsetY = (Math.random() - 0.5) * 100;

        // Create new star with modified velocity
        stars.push(new Star(e.clientX, e.clientY, mouseVelocityX + randomOffsetX, mouseVelocityY + randomOffsetY));
    }

    // Attach mousemove event to the canvas
    canvas.addEventListener('mousemove', addStar);

    let lastTime = 0;

    // Update the animation
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Update and draw each star
        stars.forEach(star => star.update(deltaTime));
        stars.forEach(star => star.draw());

        // Remove stars that have faded out or moved off-screen
        stars = stars.filter(star => star.alpha > 0 && star.y < height && star.x > 0 && star.x < width);

        // Request the next frame
        requestAnimationFrame(update);
    }

    // Start the animation
    update();

    // RAIN EFFECT
    const rainContainer = document.getElementById('rain');

    function createRain() {
        for (let i = 0; i < 100; i++) {
            let raindrop = document.createElement('div');
            raindrop.classList.add('raindrop');
            raindrop.style.left = `${Math.random() * 100}vw`;
            raindrop.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`;
            rainContainer.appendChild(raindrop);
        }
    }
    createRain();

    // AUDIO CONTROLS
    const audio = document.getElementById('background-audio');
    const volumeControl = document.getElementById('volume');
    const playPauseButton = document.getElementById('play-pause');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;

    // Handle volume change
    volumeControl.addEventListener('input', (event) => {
        audio.volume = event.target.value;
    });

    // Handle play/pause button click
    playPauseButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseIcon.src = 'pause.png'; // Set to Pause icon when playing
        } else {
            audio.pause();
            playPauseIcon.src = 'play.png'; // Set to Play icon when paused
        }
    });

    document.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    });

    // DECRYPTION TEXT EFFECT
    const normalTextElement = document.getElementById('normalText');
    const messages = [
        "Rattle do be a wizard ong",
        "You ain't like me",
        "Doing some wizardry",
        "Keep crying",
        "Who are you?"
    ];

    let currentMessageIndex = 0;

    function generateEncryptedText(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    async function waveReveal(message, encryptedMessage) {
        for (let i = 0; i <= message.length; i++) {
            // Reveal one character, keep rest encrypted from the original encrypted message
            normalTextElement.textContent = message.substring(0, i) + encryptedMessage.substring(i);
            await new Promise(resolve => setTimeout(resolve, 70)); // Faster transition (was 100)
        }
    }

    async function waveEncrypt(message, encryptedMessage) {
        for (let i = 0; i <= message.length; i++) {
            // Encrypt the first characters, leave the rest as is
            normalTextElement.textContent = encryptedMessage.substring(0, i) + message.substring(i);
            await new Promise(resolve => setTimeout(resolve, 70)); // Faster transition (was 100)
        }
    }

    async function cycleMessages() {
        while (true) {
            const currentMessage = messages[currentMessageIndex];

            // Step 1: Fully encrypted (show immediately)
            const encryptedMessage = generateEncryptedText(currentMessage.length); // Generate encrypted message once
            normalTextElement.textContent = encryptedMessage;

            // Step 2: Immediately start decryption (no pause after encrypted)
            await waveReveal(currentMessage, encryptedMessage);

            // Step 3: Pause on revealed message for 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000)); // Show fully revealed message

            // Step 4: Encrypt (left to right)
            await waveEncrypt(currentMessage, encryptedMessage);

            // Step 5: Move to next message
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        }
    }

    window.onload = () => {
        cycleMessages();
    };

    // DETECTING DEVTOOLS OPENED
    const detectDevTools = () => {
        let devtoolsOpen = false;
        const threshold = 160;  // Threshold for detecting large devtools window size
        const checkDevTools = setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                devtoolsOpen = true;
            } else {
                devtoolsOpen = false;
            }

            // Redirect to google.com if DevTools are detected
            if (devtoolsOpen) {
                window.location.href = "https://www.google.com";
            }
        }, 1000); // Check every second
    };

    // Call the detectDevTools function when the page loads
    detectDevTools();
});
