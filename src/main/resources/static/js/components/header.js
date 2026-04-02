document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('nav-container');
    const leftBtn = document.getElementById('nav-scroll-left');
    const rightBtn = document.getElementById('nav-scroll-right');
    const megaMenu = document.getElementById('mega-menu');
    const menuGrid = document.getElementById('mega-menu-products-grid');
    const menuTitle = document.getElementById('mega-menu-title');
    const headerElement = document.querySelector('header');
    let closeTimer;
    let openTimer;
    const productCache = {};
    const subcategoryCache = {};

    // ==================== SMART STICKY HEADER ====================
    let lastScrollY = window.scrollY;
    const hideThreshold = 100; // Only hide after scrolling down 100px
    const scrollTolerance = 10; // Scroll difference before triggering

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Don't do anything if near the very top
        if (currentScrollY < hideThreshold) {
            if (headerElement) headerElement.style.transform = 'translateY(0)';
            return;
        }

        const diff = currentScrollY - lastScrollY;
        
        // If scrolling down significantly -> Hide
        if (diff > scrollTolerance && currentScrollY > hideThreshold) {
            if (headerElement) headerElement.style.transform = 'translateY(-100%)';
            // Also close menu if hiding
            closeMenu();
        } 
        // If scrolling up significantly -> Show
        else if (diff < -scrollTolerance) {
            if (headerElement) headerElement.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // ==================== SCROLL LOGIC ====================
    const updateArrows = () => {
        if (!container) return;
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (leftBtn) leftBtn.disabled = scrollLeft <= 0;
        if (rightBtn) rightBtn.disabled = scrollLeft >= maxScroll - 1;
    };

    if (leftBtn) leftBtn.addEventListener('click', () => container.scrollLeft -= 300);
    if (rightBtn) rightBtn.addEventListener('click', () => container.scrollLeft += 300);
    if (container) {
        container.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        updateArrows();
    }

    // ==================== EDITORIAL RENDERER ====================
    // ==================== EDITORIAL RENDERER ====================
    const renderGroupedProducts = (products, subcategories, parentName) => {
        if (!menuTitle || !menuGrid) return;
        
        // Cập nhật tiêu đề lớn
        menuTitle.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                <span class="text-neutral-400 font-medium tracking-widest">MUA SẮM THEO DANH MỤC</span>
                <span class="text-primary font-black tracking-tighter">${parentName}</span>
            </div>
        `;

        let html = '';

        if (subcategories && subcategories.length > 0) {
            subcategories.forEach(parentCat => {
                // Section Header for Parent Category (e.g., ÁO)
                html += `
                    <div class="col-span-6 flex items-end justify-between border-b border-outline/10 pb-2 mt-8 mb-4 group/header">
                        <div class="flex items-center gap-3">
                            <h3 class="text-[12px] font-black tracking-[0.2em] text-primary">
                                ${parentCat.name}
                            </h3>
                        </div>
                        <a href="/category?keyword=${encodeURIComponent(parentCat.name)}" 
                           class="text-[9px] font-bold tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1 group-hover/header:translate-x-1 transition-transform">
                            Khám phá tất cả
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </a>
                    </div>
                `;

                // Grid for Sub-Items
                html += `<div class="col-span-6 grid grid-cols-6 gap-x-4 gap-y-8 w-full items-start">`;
                
                // Nút "Xem tất cả" đặc biệt ở đầu mỗi nhóm
                html += `
                    <a href="/category?keyword=${encodeURIComponent(parentCat.name)}" class="group/item cursor-pointer text-center flex flex-col items-center">
                        <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/10 flex items-center justify-center group-hover/item:border-secondary transition-all bg-neutral-100 group-hover/item:bg-white duration-500">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover/item:text-secondary"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </div>
                        <span class="text-[9px] font-bold tracking-widest text-neutral-500 group-hover/item:text-secondary transition-colors">
                            Xem tất cả
                        </span>
                    </a>
                `;

                if (parentCat.children && parentCat.children.length > 0) {
                    parentCat.children.forEach(sub => {
                        html += `
                            <a href="/category?keyword=${encodeURIComponent(sub.name)}" class="group/item cursor-pointer text-center flex flex-col items-center">
                                <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/5 group-hover/item:border-secondary transition-all duration-500 relative shadow-sm group-hover/item:shadow-md">
                                    <img src="${sub.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E'}" 
                                         alt="${sub.name}"
                                         onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E';"
                                         class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 opacity-95 group-hover/item:opacity-100">
                                    <div class="absolute inset-0 bg-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                </div>
                                <span class="text-[9px] font-bold uppercase tracking-tight group-hover/item:text-secondary transition-colors leading-tight max-w-[85px] w-full">
                                    ${sub.name}
                                </span>
                            </a>
                        `;
                    });
                } else {
                    html += `
                        <a href="/category?keyword=${encodeURIComponent(parentCat.name)}" class="group/item cursor-pointer text-center flex flex-col items-center">
                            <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/5 group-hover/item:border-secondary transition-all duration-500 relative shadow-sm group-hover/item:shadow-md">
                                <img src="${parentCat.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E'}" 
                                     alt="${parentCat.name}"
                                     onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E';"
                                     class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 opacity-95 group-hover/item:opacity-100">
                                <div class="absolute inset-0 bg-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                            </div>
                            <span class="text-[9px] font-bold tracking-tight group-hover/item:text-secondary transition-colors leading-tight max-w-[85px] w-full">
                                ${parentCat.name}
                            </span>
                        </a>
                    `;
                }
                html += `</div>`;
            });
        } else if (products && products.length > 0) {
            // FALLBACK: Nếu không có subcategories thì hiển thị chính các sản phẩm như các items hình tròn
            html += `
                <div class="col-span-6 flex items-end justify-between border-b border-outline/10 pb-2 mt-8 mb-4">
                    <h3 class="text-[12px] font-black tracking-[0.2em] text-primary">SẢN PHẨM NỔI BẬT</h3>
                </div>
                <div class="col-span-6 grid grid-cols-6 gap-x-4 gap-y-8 w-full items-start">
            `;
            
            products.slice(0, 12).forEach(p => {
                html += `
                    <a href="/product-detail/${p.productId}" class="group/item cursor-pointer text-center flex flex-col items-center">
                        <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/5 group-hover/item:border-secondary transition-all duration-500 relative shadow-sm group-hover/item:shadow-md">
                            <img src="${p.primaryImageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E'}" 
                                 alt="${p.name}"
                                 onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E';"
                                 class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 opacity-95 group-hover/item:opacity-100">
                            <div class="absolute inset-0 bg-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        </div>
                        <span class="text-[9px] font-bold tracking-tight group-hover/item:text-secondary transition-colors leading-tight max-w-[85px] w-full line-clamp-2">
                            ${p.name}
                        </span>
                    </a>
                `;
            });
            html += `</div>`;
        } else {
            // Trường hợp thực sự trống
            html += `
                <div class="col-span-6 py-20 text-center">
                    <p class="text-[10px] tracking-[0.2em] text-neutral-400 font-bold">Danh mục đang được cập nhật</p>
                </div>
            `;
        }

        menuGrid.innerHTML = html;
        menuGrid.classList.remove('opacity-0', 'translate-y-4');
        menuGrid.classList.add('opacity-100', 'translate-y-0');
    };

    // ==================== FETCH LOGIC ====================
    const fetchCategoryData = async (id, name) => {
        const cacheKey = id || name;
        if (productCache[cacheKey] && subcategoryCache[cacheKey]) {
            renderGroupedProducts(productCache[cacheKey], subcategoryCache[cacheKey], name);
            return;
        }

        if (menuGrid) {
            menuGrid.classList.add('opacity-0', 'translate-y-4');
        }

        try {
            // Gọi song song: sản phẩm (theo name để keyword search) + danh mục con (theo id)
            const [productsRes, subcatsRes] = await Promise.all([
                fetch(`/api/products?keyword=${encodeURIComponent(name)}&size=48`),
                id ? fetch(`/api/categories/${id}/children`) : fetch(`/api/categories/by-name?parentName=${encodeURIComponent(name)}`)
            ]);

            const productsData = await productsRes.json();
            const subcatsData = await subcatsRes.json();

            const products = productsData.content || [];
            const subcategories = subcatsData || [];

            productCache[cacheKey] = products;
            subcategoryCache[cacheKey] = subcategories;

            renderGroupedProducts(products, subcategories, name);
        } catch (error) {
            console.error('Error loading mega menu content:', error);
            if (menuGrid) menuGrid.innerHTML = '<div class="col-span-6 py-12 text-center text-[10px] text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>';
        }
    };

    // ==================== EVENT BINDING ====================
    // Top Nav Triggers
    document.querySelectorAll('.mega-trigger').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (closeTimer) clearTimeout(closeTimer);
            if (openTimer) clearTimeout(openTimer);

            const id = link.getAttribute('data-id');
            const name = link.getAttribute('data-name') || link.textContent.trim();

            openTimer = setTimeout(() => {
                openMenu();
                
                if (name !== 'Categories') {
                    // Đồng bộ sidebar active state & cuộn tới vị trí tương ứng
                    document.querySelectorAll('.mega-menu-item').forEach(btn => {
                        const btnName = btn.getAttribute('data-name');
                        if (btnName === name) {
                            btn.classList.add('active', 'bg-white', 'border-l-4', 'border-secondary');
                            // Tự động cuộn Sidebar tới mục này
                            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } else {
                            btn.classList.remove('active', 'bg-white', 'border-l-4', 'border-secondary');
                        }
                    });
                    
                    fetchCategoryData(id, name);
                }
            }, 0); // instant response
        });

        link.addEventListener('mouseleave', () => {
            if (openTimer) clearTimeout(openTimer);
        });
    });

    // Sidebar items
    document.querySelectorAll('.mega-menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (openTimer) clearTimeout(openTimer);
            
            openTimer = setTimeout(() => {
                document.querySelectorAll('.mega-menu-item').forEach(i => i.classList.remove('active', 'bg-white', 'border-l-4', 'border-secondary'));
                item.classList.add('active', 'bg-white', 'border-l-4', 'border-secondary');
                
                const id = item.getAttribute('data-id');
                const name = item.getAttribute('data-name');
                fetchCategoryData(id, name);
            }, 0); // instant sidebar switching
        });
        
        item.addEventListener('mouseleave', () => {
            if (openTimer) clearTimeout(openTimer);
        });
    });

    // ==================== CLOSE LOGIC ====================
    const navBottomBar = document.getElementById('nav-bottom-bar');
    const topHeader = headerElement ? headerElement.querySelector('div:first-child') : null;

    const openMenu = () => {
        if (closeTimer) clearTimeout(closeTimer);
        if (openTimer) clearTimeout(openTimer);
        if (megaMenu) {
            megaMenu.classList.remove('opacity-0', 'invisible', 'translate-y-2', 'pointer-events-none');
        }
    };

    const closeMenu = () => {
        closeTimer = setTimeout(() => {
            if (megaMenu) {
                megaMenu.classList.add('opacity-0', 'invisible', 'translate-y-2', 'pointer-events-none');
            }
        }, 0); // Instant close
    };

    // Global Header leave -> Close all
    if (headerElement) {
        headerElement.addEventListener('mouseleave', closeMenu);
    }

    // Hover Nav Bar triggers or keep open
    if (navBottomBar) {
        navBottomBar.addEventListener('mouseleave', (e) => {
            // Only close if NOT moving into the Mega Menu
            if (megaMenu && !megaMenu.contains(e.relatedTarget)) {
                closeMenu();
            }
        });
    }

    // Explicitly close when moving UP to Top Header
    if (topHeader) {
        topHeader.addEventListener('mouseenter', closeMenu);
    }

    // Keep menu open when hovering inside the mega menu itself
    if (megaMenu) {
        megaMenu.addEventListener('mouseenter', openMenu);
        megaMenu.addEventListener('mouseleave', (e) => {
            // Only close if NOT moving back up to the Nav Bar
            if (navBottomBar && !navBottomBar.contains(e.relatedTarget)) {
                closeMenu();
            }
        });
    }

    // Initial state
    if (megaMenu) {
        const firstId = megaMenu.getAttribute('data-first-category-id');
        const firstName = megaMenu.getAttribute('data-first-category-name');
        if (firstName) {
            fetchCategoryData(firstId, firstName);
        }
    }
});
