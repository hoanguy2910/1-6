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

    function animateStars() {
        // Clear with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            // Update position
            star.x += star.vx;
            star.y += star.vy;

            // Wrap around screen
            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;

            // Draw star
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });

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
        // Auto transition after animation
        const self = this;
        setTimeout(() => {
            console.log('Stage 3 auto transition to stage 4');
            self.nextStage();
        }, 1500);
    }

    setupStage4() {
        // Auto transition after animation
        const self = this;
        setTimeout(() => {
            console.log('Stage 4 auto transition to stage 5');
            self.nextStage();
        }, 2000);
    }

    setupStage5() {
        this.autoLoadImages();
    }

    autoLoadImages() {
        // ===== THÊM ẢNH TẠI ĐÂY =====
        const imageUrls = [
            'z7886977001364_b23cbb171a501e431c441b0a642b55ad.jpg',
            'z7886977007971_5f094330d1de6b95d5f2c6035e314896.jpg',
            '1 (2).jpg',
            '1 (3).jpg',
            '1 (5).jpg',
            '1 (6).jpg',
            '1 (4).jpg',
            '1 (1).jpg', '1 (7).jpg', '1 (8).jpg', '1 (9).jpg', '1 (10).jpg', '1 (11).jpg', '1 (12).jpg', '1 (13).jpg', '1 (14).jpg', '1 (15).jpg', 
            '1 (16).jpg', '1 (17).jpg', '1 (18).jpg', '1 (19).jpg', '1 (20).jpg', '1 (21).jpg', '1 (22).jpg', '1 (23).jpg', '1 (24).jpg', '1 (25).jpg', 
            '1 (26).jpg', '1 (27).jpg', '1 (28).jpg', '1 (29).jpg', '1 (30).jpg', '1 (31).jpg', '1 (32).jpg', '1 (33).jpg', '1 (34).jpg', '1 (35).jpg', 
            '1 (36).jpg', '1 (37).jpg', '1 (38).jpg', '1 (39).jpg', '1 (40).jpg'
        ];
        // =============================

const loadedImages = [];

    // hiện quả cầu ngay
    this.images = [];
    this.replicateImages([
        imageUrls[0]
    ]);

    imageUrls.forEach((url) => {
        const img = new Image();

        img.onload = () => {
            loadedImages.push(url);

            // cập nhật luôn khi có ảnh mới
            this.images = [...loadedImages];

            if (this.sphere) {
                this.initializeSphere();
            }
        };

        img.src = url;
    });
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
        }, 5000);
        
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
    }, 5000);
}

    initializeGallery() {
        const gallery = new ImageGallery(document.getElementById('galleryContainer'), this.images);
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

        let loadedCount = 0;
        
        // Draw all images onto canvas
        for (let index = 0; index < cols * rows; index++) {
    const imgSrc =
        this.images[index % this.images.length];
            const img = new Image();
            img.onload = () => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = col * imgSize;
                const y = row * imgSize;
                // thu nhỏ ảnh lại để có khoảng hở
                    const padding = 2;

                    ctx.drawImage(
                        img,
                        x + padding,
                        y + padding,
                        imgSize - padding * 2,
                        imgSize - padding * 2
                    );
                loadedCount++;
                
                // Refresh texture when all images loaded
                if (loadedCount === cols * rows) {
    texture.needsUpdate = true;
}
            };
            img.onerror = () => {
                loadedCount++;
            };
            img.src = imgSrc;
        }

        // Create larger sphere geometry
        const geometry =
    new THREE.SphereGeometry(3.8, 128, 128);
        const texture = new THREE.CanvasTexture(canvas);

texture.colorSpace = THREE.SRGBColorSpace;

texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestMipMapNearestFilter;

texture.generateMipmaps = true;
texture.needsUpdate = true;
        
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
            img.style.backgroundImage = `url(${imgSrc})`;
            
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
