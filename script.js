import { animate, stagger } from "https://esm.run/framer-motion@11";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadLyrics();
    runEntryAnimations();
    setupAudioControls();
    initParticles();
});

async function loadLyrics() {
    try {
        const response = await fetch('lyrics.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lyricsData = await response.json();
        const container = document.getElementById('lyrics-container');
        if (!container) return;

        container.innerHTML = ''; 

        lyricsData.forEach((section, index) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'lyrics-section opacity-0';
            sectionDiv.dataset.sectionIndex = index;
            
            const title = document.createElement('h3');
            title.className = 'lyrics-title text-2xl';
            title.textContent = section.type;

            const text = document.createElement('div');
            text.className = 'lyrics-text';
            
            section.lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'lyrics-line';
                lineDiv.textContent = line;
                text.appendChild(lineDiv);
            });
            
            sectionDiv.appendChild(title);
            sectionDiv.appendChild(text);
            container.appendChild(sectionDiv);
        });

        animateLyricsSections();

    } catch (error) {
        console.error("Failed to load lyrics:", error);
        const container = document.getElementById('lyrics-container');
        if (container) {
            container.innerHTML = `<p class="text-center text-red-400">无法加载歌词。</p>`;
        }
    }
}

function runEntryAnimations() {
    animate(
        'header',
        { opacity: 1, y: 0 },
        { duration: 1, delay: 0.2, ease: "easeOut" }
    );
    animate(
        '#player-section',
        { opacity: 1, y: 0 },
        { duration: 1, delay: 0.5, ease: "easeOut" }
    );
}

function animateLyricsSections() {
    const sections = document.querySelectorAll('.lyrics-section');
    animate(
        sections,
        { opacity: 1, y: 0 },
        { 
            duration: 0.8, 
            delay: stagger(0.15, { startDelay: 0.8 }), 
            ease: "easeOut" 
        }
    );
}

function setupAudioControls() {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const record = document.getElementById('record');
    const recordContainer = document.querySelector('.record-container');
    const recordArm = document.querySelector('.record-arm');
    const recordArmHead = document.querySelector('.record-arm-head');
    
    // 播放/暂停按钮
    playBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playBtn.innerHTML = '<i data-lucide="pause" class="w-5 h-5 text-amber-400"></i>';
            record.classList.add('record-playing');
            recordContainer.classList.add('playing');
        } else {
            audioPlayer.pause();
            playBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 text-amber-400"></i>';
            record.classList.remove('record-playing');
            recordContainer.classList.remove('playing');
        }
        lucide.createIcons();
    });
    
    // 音量控制
    let isMuted = false;
    volumeBtn.addEventListener('click', () => {
        if (isMuted) {
            audioPlayer.volume = 1;
            volumeBtn.innerHTML = '<i data-lucide="volume-2" class="w-5 h-5 text-amber-400"></i>';
        } else {
            audioPlayer.volume = 0;
            volumeBtn.innerHTML = '<i data-lucide="volume-x" class="w-5 h-5 text-amber-400"></i>';
        }
        isMuted = !isMuted;
        lucide.createIcons();
    });
    
    // 更新时间显示
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        highlightCurrentLyrics(audioPlayer.currentTime);
    });
    
    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // 歌词高亮
    function highlightCurrentLyrics(currentTime) {
        const sections = document.querySelectorAll('.lyrics-section');
        let activeSectionIndex = -1;
        
        // 简化版：每10秒切换一段歌词
        const sectionDuration = audioPlayer.duration / sections.length;
        activeSectionIndex = Math.floor(currentTime / sectionDuration);
        
        sections.forEach((section, index) => {
            if (index === activeSectionIndex) {
                section.classList.add('active');
                
                // 滚动到可视区域
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                section.classList.remove('active');
            }
        });
    }
}

// 粒子背景效果
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2,
            color: `rgba(234, 179, 8, ${Math.random() * 0.2 + 0.05})`
        });
    }
    
    // 绘制粒子
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // 移动粒子
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            
            // 边界处理
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
        
        requestAnimationFrame(drawParticles);
    }
    
    drawParticles();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}