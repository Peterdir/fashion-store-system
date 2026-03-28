document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('nav-container');
    const leftBtn = document.getElementById('nav-scroll-left');
    const rightBtn = document.getElementById('nav-scroll-right');
    const megaMenu = document.getElementById('mega-menu');
    const menuGrid = document.getElementById('mega-menu-products-grid');
    const menuTitle = document.getElementById('mega-menu-title');
    const productCache = {};
    const subcategoryCache = {};

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
                <span class="text-neutral-400 font-medium tracking-widest uppercase">MUA SẮM THEO DANH MỤC</span>
                <span class="text-primary font-black uppercase tracking-tighter">${parentName}</span>
            </div>
        `;

        let html = '';

        if (subcategories && subcategories.length > 0) {
            subcategories.forEach(parentCat => {
                // Section Header for Parent Category (e.g., ÁO)
                html += `
                    <div class="col-span-6 flex items-end justify-between border-b border-outline/10 pb-2 mt-8 mb-4 group/header">
                        <div class="flex items-center gap-3">
                            <h3 class="text-[12px] font-black tracking-[0.2em] uppercase text-primary">
                                ${parentCat.name}
                            </h3>
                        </div>
                        <a href="/category?keyword=${encodeURIComponent(parentCat.name)}" 
                           class="text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1 group-hover/header:translate-x-1 transition-transform">
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
                        <span class="text-[9px] font-bold uppercase tracking-widest text-neutral-500 group-hover/item:text-secondary transition-colors">
                            Xem tất cả
                        </span>
                    </a>
                `;

                if (parentCat.children && parentCat.children.length > 0) {
                    parentCat.children.forEach(sub => {
                        html += `
                            <a href="/category?keyword=${encodeURIComponent(sub.name)}" class="group/item cursor-pointer text-center flex flex-col items-center">
                                <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/5 group-hover/item:border-secondary transition-all duration-500 relative shadow-sm group-hover/item:shadow-md">
                                    <img src="${sub.imageUrl || '/images/placeholder.png'}" 
                                         alt="${sub.name}"
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
                                <img src="${parentCat.imageUrl || '/images/placeholder.png'}" 
                                     alt="${parentCat.name}"
                                     class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 opacity-95 group-hover/item:opacity-100">
                                <div class="absolute inset-0 bg-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                            </div>
                            <span class="text-[9px] font-bold uppercase tracking-tight group-hover/item:text-secondary transition-colors leading-tight max-w-[85px] w-full">
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
                    <h3 class="text-[12px] font-black tracking-[0.2em] uppercase text-primary">SẢN PHẨM NỔI BẬT</h3>
                </div>
                <div class="col-span-6 grid grid-cols-6 gap-x-4 gap-y-8 w-full items-start">
            `;
            
            products.slice(0, 12).forEach(p => {
                html += `
                    <a href="/product-detail/${p.productId}" class="group/item cursor-pointer text-center flex flex-col items-center">
                        <div class="w-20 h-20 bg-surface-low overflow-hidden rounded-full mb-3 border border-outline/5 group-hover/item:border-secondary transition-all duration-500 relative shadow-sm group-hover/item:shadow-md">
                            <img src="${p.primaryImageUrl || '/images/placeholder.png'}" 
                                 alt="${p.name}"
                                 class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 opacity-95 group-hover/item:opacity-100">
                            <div class="absolute inset-0 bg-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        </div>
                        <span class="text-[9px] font-bold uppercase tracking-tight group-hover/item:text-secondary transition-colors leading-tight max-w-[85px] w-full line-clamp-2">
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
                    <p class="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Danh mục đang được cập nhật</p>
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
            if (menuGrid) menuGrid.innerHTML = '<div class="col-span-6 py-12 text-center text-[10px] uppercase text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>';
        }
    };

    // ==================== EVENT BINDING ====================
    // Top Nav Triggers
    document.querySelectorAll('.mega-trigger').forEach(link => {
        link.addEventListener('mouseenter', () => {
            const id = link.getAttribute('data-id');
            const name = link.getAttribute('data-name') || link.textContent.trim();
            
            if (megaMenu) megaMenu.classList.remove('opacity-0', 'invisible', 'translate-y-2', 'pointer-events-none');
            
            if (name !== 'Categories') {
                // Đồng bộ sidebar active state
                document.querySelectorAll('.mega-menu-item').forEach(btn => {
                    const btnName = btn.getAttribute('data-name');
                    if (btnName === name) {
                        btn.classList.add('active', 'bg-white', 'border-l-4', 'border-secondary');
                    } else {
                        btn.classList.remove('active', 'bg-white', 'border-l-4', 'border-secondary');
                    }
                });
                
                fetchCategoryData(id, name);
            }
        });
    });

    // Sidebar items
    document.querySelectorAll('.mega-menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            document.querySelectorAll('.mega-menu-item').forEach(i => i.classList.remove('active', 'bg-white', 'border-l-4', 'border-secondary'));
            item.classList.add('active', 'bg-white', 'border-l-4', 'border-secondary');
            
            const id = item.getAttribute('data-id');
            const name = item.getAttribute('data-name');
            fetchCategoryData(id, name);
        });
    });

    // Close logic
    document.addEventListener('mousemove', (e) => {
        const header = document.querySelector('header');
        if (header && megaMenu && !header.contains(e.target) && !megaMenu.contains(e.target)) {
            megaMenu.classList.add('opacity-0', 'invisible', 'translate-y-2', 'pointer-events-none');
        }
    });

    // Initial state
    if (megaMenu) {
        const firstId = megaMenu.getAttribute('data-first-category-id');
        const firstName = megaMenu.getAttribute('data-first-category-name');
        if (firstName) {
            fetchCategoryData(firstId, firstName);
        }
    }
});
