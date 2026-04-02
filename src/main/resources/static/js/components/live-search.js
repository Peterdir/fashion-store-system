/**
 * Live Search Module — H&Y Fashion Store
 * Tìm kiếm sản phẩm trực tiếp khi gõ (debounce 300ms)
 */
(function () {
    'use strict';

    const DEBOUNCE_MS = 300;
    const MIN_CHARS = 1;
    const MAX_RESULTS = 8;

    let debounceTimer = null;
    let currentQuery = '';

    const input = document.getElementById('header-search-input');
    const dropdown = document.getElementById('search-dropdown');
    const resultsContainer = document.getElementById('search-results');
    const searchForm = document.getElementById('search-form');

    if (!input || !dropdown || !resultsContainer) return;

    // === FORMAT ===
    function formatVND(amount) {
        if (!amount && amount !== 0) return '';
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
    }

    // === SHOW / HIDE ===
    function showDropdown() {
        dropdown.classList.remove('hidden');
    }

    function hideDropdown() {
        dropdown.classList.add('hidden');
    }

    // === RENDER RESULTS ===
    function renderResults(products, query) {
        if (!products || products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="px-5 py-6 text-center">
                    <p class="text-[11px] text-neutral-400 font-medium">Không tìm thấy sản phẩm nào cho "<span class="font-bold text-neutral-600">${escapeHtml(query)}</span>"</p>
                </div>`;
            showDropdown();
            return;
        }

        let html = '';

        products.forEach(p => {
            const imgSrc = p.primaryImageUrl
                ? p.primaryImageUrl
                : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3C/svg%3E`;

            html += `
                <a href="/product-detail/${p.productId}" class="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors group cursor-pointer border-b border-neutral-50 last:border-b-0">
                    <div class="w-12 h-12 flex-shrink-0 bg-neutral-50 overflow-hidden border border-neutral-100">
                        <img src="${imgSrc}" alt="${escapeHtml(p.name)}" 
                             onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E';"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <div class="flex-grow min-w-0">
                        <p class="text-[11px] font-bold text-neutral-800 truncate group-hover:text-secondary transition-colors">${highlightMatch(p.name, query)}</p>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[10px] font-bold text-secondary">${formatVND(p.minPrice || p.price)}</span>
                            ${p.category ? `<span class="text-[9px] text-neutral-400 font-medium">${escapeHtml(p.category)}</span>` : ''}
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-300 group-hover:text-secondary transition-colors flex-shrink-0"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>`;
        });

        // "Xem tất cả" footer
        html += `
            <a href="/category?keyword=${encodeURIComponent(query)}" class="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors group cursor-pointer">
                <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500 group-hover:text-secondary transition-colors">Xem tất cả kết quả cho "${escapeHtml(query)}"</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-secondary"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>`;

        resultsContainer.innerHTML = html;
        showDropdown();
    }

    // === RENDER LOADING ===
    function renderLoading() {
        resultsContainer.innerHTML = `
            <div class="px-5 py-5 flex items-center justify-center gap-3">
                <div class="w-4 h-4 border-2 border-neutral-200 border-t-secondary rounded-full animate-spin"></div>
                <span class="text-[10px] text-neutral-400 font-medium">Đang tìm kiếm...</span>
            </div>`;
        showDropdown();
    }

    // === FETCH ===
    async function fetchResults(query) {
        try {
            const res = await fetch(`/api/products?keyword=${encodeURIComponent(query)}&size=${MAX_RESULTS}`);
            if (!res.ok) throw new Error('Search API Error');
            const data = await res.json();
            return data.content || [];
        } catch (err) {
            console.error('Live search error:', err);
            return [];
        }
    }

    // === UTILITIES ===
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function highlightMatch(text, query) {
        if (!text || !query) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const queryEscaped = escapeHtml(query);
        const regex = new RegExp(`(${queryEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escaped.replace(regex, '<span class="text-secondary font-black">$1</span>');
    }

    // === EVENT: INPUT ===
    input.addEventListener('input', () => {
        const query = input.value.trim();

        if (debounceTimer) clearTimeout(debounceTimer);

        if (query.length < MIN_CHARS) {
            hideDropdown();
            currentQuery = '';
            return;
        }

        currentQuery = query;
        renderLoading();

        debounceTimer = setTimeout(async () => {
            // Guard: nếu query đã thay đổi trong lúc chờ, bỏ qua
            if (query !== currentQuery) return;

            const products = await fetchResults(query);

            // Guard: nếu query đã thay đổi sau khi fetch xong, bỏ qua
            if (query !== currentQuery) return;

            renderResults(products, query);
        }, DEBOUNCE_MS);
    });

    // === EVENT: FOCUS (show lại nếu có kết quả) ===
    input.addEventListener('focus', () => {
        if (input.value.trim().length >= MIN_CHARS && resultsContainer.innerHTML.trim()) {
            showDropdown();
        }
    });

    // === EVENT: CLICK OUTSIDE (hide) ===
    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('search-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            hideDropdown();
        }
    });

    // === EVENT: KEYBOARD NAVIGATION ===
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideDropdown();
            input.blur();
        }
    });

})();
