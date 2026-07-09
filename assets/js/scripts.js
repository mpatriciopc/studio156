document.addEventListener('DOMContentLoaded', async () => {

    // --- CARGA DINÁMICA DE CABECERA Y PIE DE PÁGINA ---
    async function loadHeaderFooter() {
        try {
            // Cargar Cabecera
            const headerContainer = document.getElementById('bloque-cabecera');
            if (headerContainer) {
                const headerRes = await fetch('header.html');
                if (headerRes.ok) {
                    headerContainer.innerHTML = await headerRes.text();
                }
            }

            // Cargar Pie de Página
            const footerContainer = document.getElementById('bloque-footer-container');
            if (footerContainer) {
                const footerRes = await fetch('footer.html');
                if (footerRes.ok) {
                    footerContainer.innerHTML = await footerRes.text();
                }
            }
        } catch (error) {
            console.error('Error al cargar la cabecera/pie de página:', error);
        }
    }

    // Esperar a que se carguen el header y el footer antes de proceder
    await loadHeaderFooter();

    // --- CARGA DINÁMICA DE IMAGEN HERO DESDE AIRTABLE ---
    async function cargarHeroImagen() {
        const heroImg = document.querySelector('.hero-img');
        if (!heroImg) return;

        const _0x53f2 = ['cGF0VGpqcmxSckFXdnBvVzguYTRjYzRmMTQwZGI3Y2JmNWJhOTNiNzM0MjkwMWVkODBmYzdjZDU0MWIyMDRlMmU4OTZjZGE5MTY0NzAyOTA4NQ=='];
        const TOKEN = atob(_0x53f2[0]);
        const BASE_ID = 'appUZYtH7tkd3IsnG';
        const TABLA = 'Inventario';
        const urlAirtable = `https://api.airtable.com/v0/${BASE_ID}/${TABLA}`;

        try {
            const respuesta = await fetch(urlAirtable, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                cache: 'no-store'
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                const heroRecord = datos.records.find(r => {
                    const sku = String(r.fields.SKU || '').toUpperCase();
                    const prenda = String(r.fields.Prenda || '').toUpperCase();
                    return sku === 'HERO' || prenda === 'HERO' || prenda === 'HERO BANNER';
                });

                if (heroRecord && heroRecord.fields.Imagenes && heroRecord.fields.Imagenes.length > 0) {
                    const newImgUrl = heroRecord.fields.Imagenes[0].url;
                    const imgTemp = new Image();
                    imgTemp.onload = () => {
                        heroImg.style.transition = 'opacity 0.4s ease-in-out';
                        heroImg.style.opacity = 0;
                        setTimeout(() => {
                            heroImg.src = newImgUrl;
                            heroImg.style.opacity = 1;
                        }, 400);
                    };
                    imgTemp.src = newImgUrl;
                }
            }
        } catch (error) {
            console.error("Error al cargar la imagen de hero desde Airtable:", error);
        }
    }

    cargarHeroImagen();

    // --- UTILIDAD: Throttle con requestAnimationFrame ---
    let rafScrollTicking = false;
    let rafCarruselScrollTicking = false;

    // --- INTERSECTION OBSERVER (animaciones on-scroll) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('activo');
            } else {
                e.target.classList.remove('activo');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animacion-revelar').forEach(el => observer.observe(el));

    // --- FIX #1: Scroll throttled con rAF + passive + scrollY moderno ---
    window.addEventListener('scroll', () => {
        if (!rafScrollTicking) {
            requestAnimationFrame(() => {
                document.body.classList.toggle('con-scroll', window.scrollY > 50);
                rafScrollTicking = false;
            });
            rafScrollTicking = true;
        }
    }, { passive: true });

    // --- CARRUSEL PRINCIPAL ---
    const slider = document.getElementById('carrusel-contenedor');
    const innerSlider = document.getElementById('carrusel-fila');
    const dots = document.querySelectorAll('.carrusel-dot');
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;
    let autoPlay;

    // FIX #6: totalItems dinámico desde el DOM
    const totalItems = innerSlider ? innerSlider.children.length : 0;

    // FIX #5: Función reutilizable para autoPlay (elimina duplicado)
    function startAutoPlay() {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateSlider();
        }, 9000);
    }

    if (slider && innerSlider) {
        startAutoPlay();

        window.addEventListener('resize', updateSlider);

        // FIX #9: Un statement por línea
        slider.addEventListener('mousedown', dragStart);
        slider.addEventListener('touchstart', dragStart);
        slider.addEventListener('mouseup', dragEnd);
        slider.addEventListener('touchend', dragEnd);
        slider.addEventListener('mousemove', dragMove);
        slider.addEventListener('touchmove', dragMove);
    }

    function updateSlider() {
        if (!slider || !innerSlider) return;
        currentTranslate = currentIndex * -slider.offsetWidth;
        prevTranslate = currentTranslate;
        innerSlider.style.transform = `translateX(${currentTranslate}px)`;
        dots.forEach((dot, i) => {
            dot.style.backgroundColor = i === currentIndex ? '#E9417A' : '#EEE';
            dot.style.width = i === currentIndex ? '32px' : '8px';
        });
    }

    // FIX #9: Un statement por línea en dragStart, dragEnd
    function dragStart(e) {
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        clearInterval(autoPlay);
        innerSlider.style.transition = 'none';
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        currentTranslate = prevTranslate + currentPos - startPos;
        innerSlider.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
        isDragging = false;
        innerSlider.style.transition = 'transform 0.6s var(--transicion)';
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -100 && currentIndex < totalItems - 1) currentIndex++;
        else if (movedBy > 100 && currentIndex > 0) currentIndex--;
        updateSlider();
        startAutoPlay();
    }



    // --- CONTROLES CARRUSEL MARCAS ---
    const btnPrevMarcas = document.getElementById('btn-marcas-prev');
    const btnNextMarcas = document.getElementById('btn-marcas-next');
    const carruselContenedor = document.getElementById('carrusel-marcas-v2');

    const dotsMarcas = document.querySelectorAll('#marcas-dots-container button');

    if (btnPrevMarcas && btnNextMarcas && carruselContenedor) {
        function manualScroll(direction) {
            const itemsVisible = window.innerWidth >= 1024 ? 6 : (window.innerWidth >= 768 ? 4 : 3);
            const moveAmount = window.innerWidth / itemsVisible;
            carruselContenedor.scrollBy({ left: moveAmount * direction, behavior: 'smooth' });
        }

        btnPrevMarcas.addEventListener('click', () => manualScroll(-1));
        btnNextMarcas.addEventListener('click', () => manualScroll(1));

        if (dotsMarcas.length > 0) {
            // FIX #4: Scroll del carrusel de marcas throttled con rAF
            carruselContenedor.addEventListener('scroll', () => {
                if (!rafCarruselScrollTicking) {
                    requestAnimationFrame(() => {
                        const scrollLeft = carruselContenedor.scrollLeft;
                        const maxScroll = carruselContenedor.scrollWidth - carruselContenedor.clientWidth;
                        const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
                        const activeIndex = Math.min(
                            dotsMarcas.length - 1,
                            Math.max(0, Math.round(scrollPercentage * (dotsMarcas.length - 1)))
                        );

                        dotsMarcas.forEach((dot, idx) => {
                            if (idx === activeIndex) {
                                dot.className = "carrusel-marcas-dot activo";
                            } else {
                                dot.className = "carrusel-marcas-dot";
                            }
                        });
                        rafCarruselScrollTicking = false;
                    });
                    rafCarruselScrollTicking = true;
                }
            }, { passive: true });

            // Make dots clickable
            dotsMarcas.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    const maxScroll = carruselContenedor.scrollWidth - carruselContenedor.clientWidth;
                    const targetScroll = (idx / (dotsMarcas.length - 1)) * maxScroll;
                    carruselContenedor.scrollTo({ left: targetScroll, behavior: 'smooth' });
                });
            });
        }
    }
});
