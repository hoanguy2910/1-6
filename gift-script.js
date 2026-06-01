// Utility to split text into inline-block spans for letter-by-letter animations
function splitTextIntoSpans(element) {
    const text = element.innerHTML;
    let newHTML = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    
    const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const chars = node.textContent.split('');
            return chars.map(c => c.trim() === '' ? ' ' : `<span class="char" style="display: inline-block; transform-origin: center;">${c}</span>`).join('');
        } else if (node.nodeName === 'BR') {
            return '<br>';
        } else if (node.nodeName === 'SPAN') {
            let spanContent = '';
            node.childNodes.forEach(child => {
                spanContent += processNode(child);
            });
            return `<span style="display: inline-block;">${spanContent}</span>`;
        }
        return node.outerHTML || '';
    };
    
    tempDiv.childNodes.forEach(child => {
        newHTML += processNode(child);
    });
    element.innerHTML = newHTML;
}

// ==================== STARFIELD BACKGROUND ====================
function initStarfield() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const starCount = Math.min(1000, Math.floor(window.innerWidth * window.innerHeight / 2000));

    // Create stars
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random() * 0.7 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            color: Math.random() > 0.5 ? '#ff1493' : '#ffffff'
        });
    }

    // Initialize global starfield controller
    window.starfield = {
        canvas: canvas,
        ctx: ctx,
        stars: stars,
        mode: 'drift', // 'drift', 'gather', 'explode'
        textTargets: [],
        fireworks: [],
        
        setMode(mode) {
            this.mode = mode;
            if (mode === 'gather') {
                this.generateTextTargets("Nhân ngày");
            } else if (mode === 'explode') {
                this.triggerExplosion();
            }
        },
        
        generateTextTargets(text) {
            const offscreen = document.createElement('canvas');
            const octx = offscreen.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            offscreen.width = w;
            offscreen.height = h;
            
            octx.fillStyle = '#ffffff';
            octx.font = `bold ${Math.min(w * 0.12, 100)}px "Caveat", cursive`;
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';
            octx.fillText(text, w / 2, h / 2);
            
            const imgData = octx.getImageData(0, 0, w, h);
            const data = imgData.data;
            const targets = [];
            
            const step = Math.max(2, Math.floor((w * h) / 100000));
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    const index = (y * w + x) * 4;
                    if (data[index + 3] > 128) {
                        targets.push({ x, y });
                    }
                }
            }
            
            targets.sort(() => Math.random() - 0.5);
            this.textTargets = targets;
            
            this.stars.forEach((star, i) => {
                if (targets.length > 0) {
                    const target = targets[i % targets.length];
                    star.targetX = target.x;
                    star.targetY = target.y;
                    star.gatherSpeed = 0.02 + Math.random() * 0.04;
                } else {
                    star.targetX = star.x;
                    star.targetY = star.y;
                }
            });
        },

        triggerExplosion() {
            const w = canvas.width;
            const h = canvas.height;
            this.stars.forEach(star => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 12;
                star.vx = Math.cos(angle) * speed;
                star.vy = Math.sin(angle) * speed;
            });
            
            this.createFireworks(w / 2, h / 2);
        },

        createFireworks(cx, cy) {
            const colors = ['#ff1493', '#ff69b4', '#ff00ff', '#00ffff', '#ffff00', '#ff4500'];
            for (let i = 0; i < 150; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 8;
                this.fireworks.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: 1 + Math.random() * 2.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: 0.01 + Math.random() * 0.025
                });
            }
        }
    };

    function animateStars() {
        // Clear with fade trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const mode = window.starfield.mode;

        window.starfield.stars.forEach(star => {
            if (mode === 'drift') {
                star.x += star.vx;
                star.y += star.vy;

                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;
            } else if (mode === 'gather') {
                if (star.targetX !== undefined) {
                    star.x += (star.targetX - star.x) * star.gatherSpeed;
                    star.y += (star.targetY - star.y) * star.gatherSpeed;
                }
            } else if (mode === 'explode') {
                star.x += star.vx;
                star.y += star.vy;
                star.vx *= 0.97;
                star.vy *= 0.97;
            }

            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw and update fireworks
        for (let i = window.starfield.fireworks.length - 1; i >= 0; i--) {
            const fw = window.starfield.fireworks[i];
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += 0.04; // gravity
            fw.alpha -= fw.decay;

            if (fw.alpha <= 0) {
                window.starfield.fireworks.splice(i, 1);
            } else {
                ctx.fillStyle = fw.color;
                ctx.globalAlpha = fw.alpha;
                ctx.beginPath();
                ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animateStars);
    }

    animateStars();

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ==================== STAGE MANAGEMENT ====================
class StageManager {
    constructor() {
        this.currentStage = 2;
        this.tapCount = 0;
        this.images = [];
        this.sphere = null;
        this.audioContext = null;
        this.musicPlayed = false;
    }

    nextStage() {
        console.log(`Transitioning from stage ${this.currentStage} to stage ${this.currentStage + 1}`);
        
        // Hide current stage
        const currentStage = document.querySelector(`.stage-${this.currentStage}`);
        if (currentStage) {
            currentStage.classList.remove('active');
        }
        
        // Move to next stage
        this.currentStage++;
        
        // Show next stage
        const nextStageEl = document.querySelector(`.stage-${this.currentStage}`);
        if (nextStageEl) {
            nextStageEl.classList.add('active');
            console.log(`Stage ${this.currentStage} is now active`);
            
            // Trigger stage-specific actions
            this.handleStageTransition();
        }
    }

    handleStageTransition() {
        switch(this.currentStage) {
            case 3:
                this.setupStage3();
                break;
            case 4:
                this.setupStage4();
                break;
            case 5:
                this.setupStage5();
                break;
        }
    }

    setupStage2() {
        const glowCircle = document.querySelector('.glow-circle');
        let holdTimer;
        let isHolding = false;
        let completed = false;

        const startHold = () => {
            console.log('Hold started');
            if (isHolding || completed) return;
            isHolding = true;
            glowCircle.classList.add('holding');
            
            holdTimer = setTimeout(() => {
                console.log('Hold completed - moving to stage 3');
                glowCircle.classList.remove('holding');
                isHolding = false;
                completed = true;
                this.playSound();
                this.nextStage();
            }, 2000);
        };

        const endHold = () => {
            console.log('Hold ended');
            if (isHolding && !completed) {
                isHolding = false;
                glowCircle.classList.remove('holding');
                clearTimeout(holdTimer);
            }
        };

        glowCircle.addEventListener('mousedown', startHold);
        document.addEventListener('mouseup', endHold);
        document.addEventListener('mouseleave', endHold);
        glowCircle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold();
        });
        document.addEventListener('touchend', endHold);
    }

    setupStage3() {
        // Set starfield to gather mode to form text
        if (window.starfield) {
            window.starfield.setMode('gather');
        }

        // Hide HTML text initially, then fade in as stars align
        const textHappy = document.querySelector('.text-happy');
        if (textHappy) {
            textHappy.style.opacity = '0';
            setTimeout(() => {
                gsap.to(textHappy, { opacity: 1, duration: 1.0, scale: 1.1, ease: "power2.out" });
            }, 800);
        }

        // Transition to Stage 4 after 3 seconds
        const self = this;
        setTimeout(() => {
            console.log('Stage 3 auto transition to stage 4');
            self.nextStage();
        }, 3000);
    }

    setupStage4() {
        const textTitle = document.querySelector('.text-title');
        if (textTitle) {
            // Split characters for individual letter animations
            splitTextIntoSpans(textTitle);
            
            // Stagger in characters with bounce
            const chars = textTitle.querySelectorAll('.char');
            gsap.fromTo(chars, 
                { opacity: 0, scale: 0, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.02, ease: "back.out(1.7)" }
            );

            // Wait 2.8 seconds, then explode the characters and transition to Stage 5
            setTimeout(() => {
                // Trigger starfield fireworks explosion
                if (window.starfield) {
                    window.starfield.setMode('explode');
                }

                // Explode the characters of the text like fireworks
                chars.forEach(char => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 300 + Math.random() * 500;
                    const targetX = Math.cos(angle) * distance;
                    const targetY = Math.sin(angle) * distance;
                    
                    gsap.to(char, {
                        x: targetX,
                        y: targetY,
                        rotation: Math.random() * 720 - 360,
                        scale: Math.random() * 2 + 1,
                        opacity: 0,
                        duration: 1.5,
                        ease: "power2.out"
                    });
                });

                // Transition to stage 5 after the explosion finishes (1.5 seconds)
                setTimeout(() => {
                    // Reset starfield to drift mode for Stage 5
                    if (window.starfield) {
                        window.starfield.setMode('drift');
                    }
                    this.nextStage();
                }, 1500);

            }, 3800);
        } else {
            // Fallback
            setTimeout(() => {
                this.nextStage();
            }, 3000);
        }
    }

    setupStage5() {
        this.autoLoadImages();
    }

    autoLoadImages() {
        // Tự động tạo danh sách 41 ảnh từ 1 (1).jpg đến 1 (41).jpg
        const imageUrls = [];
        for (let i = 1; i <= 41; i++) {
            imageUrls.push(`1 (${i}).jpg`);
        }

        // hiện luôn danh sách ảnh
        this.images = imageUrls;

        // tạo quả cầu ngay
        this.replicateImages(this.images);
    }

    replicateImages(baseImages) {
        if (baseImages.length === 0) {
            console.error('No images loaded');
            return;
        }

        this.images = [];
        const minNeeded = 30;

        while (this.images.length < minNeeded) {
            for (let img of baseImages) {
                if (this.images.length < minNeeded) {
                    this.images.push(img);
                }
            }
        }

        this.initializeSphere();
        this.setupContinueButton();
    }

    initializeSphere() {
        const container = document.getElementById('sphereContainer');
        if (!container) {
            console.error('sphereContainer not found!');
            return;
        }
        
        container.innerHTML = '';

        this.sphere = new ImageSphere(container, this.images);
        this.sphere.init();
    }

    setupContinueButton() {
        const continueBtn = document.getElementById('continueBtn');
        
        // Show button after 3 seconds
        setTimeout(() => {
            continueBtn.style.display = 'block';
        }, 10000);
        
        // Click to transition
        continueBtn.addEventListener('click', () => {
            this.playSound();
            this.transitionToGallery();
        });
    }

    transitionToGallery() {
    document.querySelector('.stage-5').classList.remove('active');

    this.currentStage = 6;
    document.querySelector('.stage-6').classList.add('active');

    this.initializeGallery();

    // sau 3 giây qua stage 7
    setTimeout(() => {
        document
            .querySelector('.stage-6')
            .classList.remove('active');

        this.currentStage = 7;

        document
            .querySelector('.stage-7')
            .classList.add('active');

        this.setupStage7();
    }, 7000);
}

    initializeGallery() {
    const container =
        document.getElementById('galleryContainer');

    container.innerHTML = '';

    const gallery =
        new ImageGallery(
            container,
            this.images
        );

    gallery.init();
}
    setupStage7() {

    const envelope =
        document.getElementById('flyingEnvelope');

    const letter =
        document.getElementById('letterCard');

    if (!envelope || !letter) return;

    setTimeout(() => {
        envelope.classList.add('fly-in');
    }, 200);

    envelope.onclick = () => {

        envelope.style.opacity = '0';
        envelope.style.pointerEvents = 'none';

        setTimeout(() => {

            envelope.style.display = 'none';

            letter.classList.remove('hidden');
            letter.classList.add('show');

        }, 350);
    };
}
    playSound() {
        if (!this.musicPlayed) {
            this.musicPlayed = true;
            
            // Create simple beep sound using Web Audio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch(e) {
                console.log('Audio not available');
            }
        }
    }
}

// ==================== 3D IMAGE SPHERE ====================
class ImageSphere {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationY = 0;
        this.canvas = null;
    }

    init() {
        this.setupThreeJS();
        this.createSphereWithImages();
        this.setupLights();
        this.setupInteraction();
        this.animate();
    }

    setupThreeJS() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// camera lùi xa hơn để thấy quả cầu
this.camera.position.z = 6;

this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
this.renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
    }

    createSphereWithImages() {
        // Create canvas texture with grid of images - smaller size to fit more
        // cố định khoảng 30 ảnh trên texture
        const cols = 10;
        const rows = 10;
        const imgSize = 180;
        const canvasWidth = cols * imgSize;
        const canvasHeight = rows * imgSize;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Canvas texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipMapNearestFilter;
        texture.generateMipmaps = true;

        // Preload unique images to avoid duplicate downloads and speed up loading
        const uniqueUrls = [...new Set(this.images)];
        const loadedUniqueImages = {};
        let loadedCount = 0;

        const drawGrid = () => {
            for (let index = 0; index < cols * rows; index++) {
                const imgSrc = this.images[index % this.images.length];
                const img = loadedUniqueImages[imgSrc];
                if (img) {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const x = col * imgSize;
                    const y = row * imgSize;
                    const padding = 2;
                    ctx.drawImage(
                        img,
                        x + padding,
                        y + padding,
                        imgSize - padding * 2,
                        imgSize - padding * 2
                    );
                }
            }
            texture.needsUpdate = true;

            // Hide loading text when loaded
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.style.display = 'none';
            }
        };

        uniqueUrls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedUniqueImages[url] = img;
                loadedCount++;
                if (loadedCount === uniqueUrls.length) {
                    drawGrid();
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === uniqueUrls.length) {
                    drawGrid();
                }
            };
            img.src = url;
        });

        // Create larger sphere geometry
        const geometry = new THREE.SphereGeometry(3.8, 128, 128);
        
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            side: THREE.FrontSide,
            shininess: 100
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);
    }

    setupLights() {
        const light1 = new THREE.PointLight(0xffffff, 1.5, 100);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff1493, 0.8, 100);
        light2.position.set(-5, -5, 5);
        this.scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
    }

    setupInteraction() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                this.mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, false);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Quay quả cầu tự động
        this.sphere.rotation.y += 0.005;
        this.sphere.rotation.x += 0.001;

        this.renderer.render(this.scene, this.camera);
    }
}

// ==================== 3D IMAGE GALLERY ====================
class ImageGallery {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.particles = [];
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;

        this.images.forEach((imgSrc, index) => {
            const img = document.createElement('div');
            img.className = 'gallery-image';
            img.style.backgroundImage = `url("${imgSrc}")`;
            
            const x = Math.random() * (containerWidth - 200);
            const y = Math.random() * (containerHeight - 200);
            
            img.style.left = x + 'px';
            img.style.top = y + 'px';
            img.style.transform = `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)`;
            
            this.container.appendChild(img);

            this.particles.push({
                element: img,
                x: x,
                y: y,
                z: Math.random() * 500 - 250,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vz: (Math.random() - 0.5) * 2,
                rotX: Math.random() * 360,
                rotY: Math.random() * 360,
                rotVx: (Math.random() - 0.5) * 5,
                rotVy: (Math.random() - 0.5) * 5
            });
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;

            // Update rotation
            particle.rotX += particle.rotVx;
            particle.rotY += particle.rotVy;

            // Bounce off edges
            const containerWidth = this.container.clientWidth;
            const containerHeight = this.container.clientHeight;

            if (particle.x < 0 || particle.x > containerWidth - 100) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(containerWidth - 100, particle.x));
            }
            if (particle.y < 0 || particle.y > containerHeight - 100) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(containerHeight - 100, particle.y));
            }

            // Apply parallax
            const parallaxX = (particle.z / 500) * 20;
            const parallaxY = (particle.z / 500) * 20;

            particle.element.style.left = (particle.x + parallaxX) + 'px';
            particle.element.style.top = (particle.y + parallaxY) + 'px';
            particle.element.style.transform = `rotateX(${particle.rotX}deg) rotateY(${particle.rotY}deg) translateZ(${particle.z}px)`;
            particle.element.style.opacity = 0.5 + (particle.z / 500) * 0.5;
        });
    }
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    // Initialize starfield
    initStarfield();

    // Initialize background music
    initBackgroundMusic();

    // Initialize stage manager
    const stageManager = new StageManager();

    // Setup Stage 2 hold - run immediately since stage-2 is active by default
    stageManager.setupStage2();

    // Handle window resize for Three.js
    window.addEventListener('resize', () => {
        const sphereContainer = document.getElementById('sphereContainer');
        if (stageManager.sphere && stageManager.sphere.renderer) {
            const width = sphereContainer.clientWidth;
            const height = sphereContainer.clientHeight;
            stageManager.sphere.renderer.setSize(width, height);
            stageManager.sphere.camera.aspect = width / height;
            stageManager.sphere.camera.updateProjectionMatrix();
        }
    });
});

// ==================== LOCAL BACKGROUND MUSIC CONTROLLER ====================
function initBackgroundMusic() {
    const music = document.getElementById('bgMusic');
    if (!music) return;

    music.volume = 0.28; // Đặt âm lượng nhạc nền vừa phải (khoảng 28%)

    const startMusic = () => {
        music.play().then(() => {
            console.log("Background music started successfully.");
        }).catch((err) => {
            console.error("Playback failed:", err);
        });
    };

    // Tự động phát khi người dùng chạm hoặc click lần đầu để tuân thủ chính sách trình duyệt
    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("touchstart", startMusic, { once: true });
}
