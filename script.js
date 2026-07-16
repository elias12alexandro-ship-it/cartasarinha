/* ==========================================================================
   1. CONTROLE DE ÁUDIO GLOBAL (PLAYLIST COM 3 MÚSICAS)
   ========================================================================== */

const AudioController = {
    audio: null,
    button: null,
    isPlaying: false,
    currentTrackIndex: 0,
    playlist: [
        'assets/audio/musica1.mp3',
        'assets/audio/musica2.mp3',
        'assets/audio/musica3.mp3'
    ],

    init() {
        this.audio = document.getElementById('background-music');
        this.button = document.getElementById('music-control');
        
        if (!this.button || !this.audio) return;

        this.loadTrack(this.currentTrackIndex);
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.button.addEventListener('click', () => this.toggle());
    },

    loadTrack(index) {
        if (this.audio) {
            this.audio.src = this.playlist[index];
            this.audio.load();
        }
    },

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying && this.audio) {
            this.audio.play().catch(err => console.log("Erro ao tocar a próxima música: ", err));
        }
    },

    playFirstTime() {
        if (this.audio) {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    if (this.button) this.button.classList.remove("hidden");
                })
                .catch(err => {
                    console.log("Áudio aguardando clique do usuário devido às políticas do navegador.");
                });
        }
    },

    toggle() {
        if (!this.audio) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.button.classList.remove('playing');
        } else {
            this.audio.play().catch(err => console.log("Erro ao dar play: ", err));
            this.button.classList.add('playing');
        }
        this.isPlaying = !this.isPlaying;
    }
};

/* ==========================================================================
   2. GERENCIADOR DA GALERIA E DO LIGHTBOX (VISUALIZADOR)
   ========================================================================== */

let fotoAtualIndex = 0;

const obterImagensGaleria = () => {
    const imagens = [];
    const totalFotos = (typeof CONFIG !== 'undefined') ? CONFIG.TOTAL_PHOTOS : 20;

    for (let i = 1; i <= totalFotos; i++) {
        const numFormatado = String(i).padStart(2, '0');
        let legenda = "";

        // Tenta buscar a legenda em window.legendasFotos (objeto) ou LEGENDAS_FOTOS (array)
        if (typeof window.legendasFotos !== 'undefined' && window.legendasFotos[numFormatado]) {
            legenda = window.legendasFotos[numFormatado];
        } else if (typeof LEGENDAS_FOTOS !== 'undefined' && LEGENDAS_FOTOS[i - 1]) {
            legenda = LEGENDAS_FOTOS[i - 1];
        }

        imagens.push({
            // Alterado de .png para .jpg (JPEG) conforme solicitado
            src: `assets/fotos/foto${numFormatado}.jpg`,
            legenda: legenda
        });
    }
    return imagens;
};

const renderizarGaleria = () => {
    const grid = document.getElementById('gallery-grid');
    const imagens = obterImagensGaleria();
    
    if (!grid || imagens.length === 0) return;
    grid.innerHTML = '';

    imagens.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.innerHTML = `
            <div class="image-container">
                <img src="${item.src}" alt="${item.legenda}">
            </div>
            <p class="caption">${item.legenda}</p>
        `;
        
        card.addEventListener('click', () => abrirLightbox(index));
        grid.appendChild(card);
    });
};

const abrirLightbox = (index) => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const imagens = obterImagensGaleria();

    if (!lightbox || !lightboxImg || !imagens[index]) return;

    fotoAtualIndex = index;
    const item = imagens[index];
    
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.legenda;
    
    lightbox.classList.remove('hidden');
    lightbox.classList.add('show');
};

const fecharLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.classList.add('hidden'), 300);
    }
};

const mudarFotoLightbox = (direcao) => {
    const imagens = obterImagensGaleria();
    if (imagens.length === 0) return;

    fotoAtualIndex = (fotoAtualIndex + direcao + imagens.length) % imagens.length;
    abrirLightbox(fotoAtualIndex);
};

/* ==========================================================================
   3. EXIBIÇÃO DA CARTA (CARREGAMENTO INSTANTÂNEO)
   ========================================================================== */

const iniciarTypewriter = () => {
    const container = document.getElementById('typewriter-container');
    const assinatura = document.getElementById('letter-sig');
    
    // Obtém o texto do arquivo carta.js
    const textoCompleto = window.cartaText || "";
    
    if (!container || !textoCompleto) return;
    
    // Injeta todo o texto instantaneamente
    container.innerHTML = textoCompleto;
    container.classList.add('typing-finished');
    
    // Exibe a assinatura imediatamente
    if (assinatura) assinatura.classList.add('show');
    
    // Revela o mural de fotos e o encerramento suavemente após um pequeno delay
    setTimeout(() => {
        const gallerySec = document.getElementById("gallery-section");
        const finalSec = document.getElementById("final-section");
        const finalText = document.getElementById("final-text-p");
        const finalSigs = document.getElementById("final-sigs");

        if (gallerySec) {
            gallerySec.classList.remove("hidden");
            setTimeout(() => gallerySec.classList.add("show"), 50);
        }

        if (finalSec) {
            finalSec.classList.remove("hidden");
            setTimeout(() => {
                finalSec.classList.add("show");
                if (finalText) {
                    finalText.textContent = (typeof MENSAGEM_FINAL_TEXTO !== 'undefined') 
                        ? MENSAGEM_FINAL_TEXTO 
                        : "Que possamos criar ainda mais memórias lindas juntos. Obrigado por tudo!";
                }
                setTimeout(() => {
                    if (finalSigs) finalSigs.classList.add("show");
                }, 1000);
            }, 500);
        }
    }, 1500); // 1.5 segundos de delay para que ela veja o papel da carta antes das fotos subirem
};

/* ==========================================================================
   4. SISTEMA DE PARTÍCULAS (ESTRELAS DE FUNDO)
   ========================================================================== */

const initParticles = () => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const numStars = (typeof CONFIG !== 'undefined') ? CONFIG.TOTAL_STARS : 150;
    const stars = [];

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random(),
            speed: Math.random() * 0.02 + 0.005
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#aa8410'; // Cor dourada sutil

        stars.forEach(star => {
            star.opacity += star.speed;
            if (star.opacity > 1 || star.opacity < 0) {
                star.speed = -star.speed;
            }
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
};

/* ==========================================================================
   5. INICIALIZAÇÃO DE EVENTOS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    AudioController.init();
    renderizarGaleria();
    initParticles();

    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    const lightbox = document.getElementById('lightbox');

    if (btnClose) btnClose.addEventListener('click', fecharLightbox);
    if (btnPrev) btnPrev.addEventListener('click', () => mudarFotoLightbox(-1));
    if (btnNext) btnNext.addEventListener('click', () => mudarFotoLightbox(1));
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) fecharLightbox();
        });
    }

    const envelopeWrapper = document.querySelector(".envelope-wrapper");

    if (envelopeWrapper) {
        const abrirCarta = (e) => {
            e.preventDefault();
            
            envelopeWrapper.classList.add("open");
            AudioController.playFirstTime();

            setTimeout(() => {
                envelopeWrapper.classList.add("fade-out");
                
                setTimeout(() => {
                    const envelopeScreen = document.getElementById("envelope-screen");
                    const mainContent = document.getElementById("main-content");

                    if (envelopeScreen) envelopeScreen.classList.add("hidden");
                    if (mainContent) {
                        mainContent.classList.remove("hidden");
                        mainContent.classList.add("show");
                        
                        // Executa o carregamento da carta
                        iniciarTypewriter();
                    }
                }, 1000);
            }, 1200);
        };

        envelopeWrapper.addEventListener("click", abrirCarta);
        envelopeWrapper.addEventListener("touchstart", abrirCarta, { passive: false });
    }
});