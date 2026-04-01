const AdminPOS = (function() {

    // ===== STATE =====
    let products = [];
    let currentPage = 0;
    const pageSize = 12;
    let totalPages = 1;

    let cart = []; // Array of { variantId, productId, productName, color, size, price, quantity, maxStock, image }

    let currentProductDetail = null;
    let selectedColor = null;
    let selectedSize = null;
    let selectedVariantId = null;
    let selectedMaxStock = 0;
    let selectedPrice = 0;

    let searchTimeout = null;

    // ===== DOM REF =====
    const $ = (id) => document.getElementById(id);
    const grid = $('products-grid');
    const emptyState = $('products-empty');
    const loadingState = $('product-loading');
    const searchInput = $('pos-search');

    // Cart DOM
    const cartContainer = $('cart-items');
    const cartEmpty = $('cart-empty');
    const cartCount = $('cart-count');
    const cartTotal = $('checkout-total');
    const btnCheckout = $('btn-checkout');

    // Variant Modal DOM
    const variantModal = $('variant-modal');
    const variantLoading = $('variant-loading');
    
    // ===== INIT =====
    function init() {
        loadProducts();

        // Search debounce
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 0;
                loadProducts();
            }, 300);
        });

        // Pagination
        $('btn-prev-page').addEventListener('click', () => {
            if (currentPage > 0) { currentPage--; loadProducts(); }
        });
        $('btn-next-page').addEventListener('click', () => {
             if (currentPage < totalPages - 1) { currentPage++; loadProducts(); }
        });

        // Modal Qty Buttons
        $('btn-qty-minus').addEventListener('click', () => {
            let qty = parseInt($('variant-qty').value) || 1;
            if (qty > 1) { 
                $('variant-qty').value = qty - 1; 
                checkVariantAddability(); 
            }
        });
        $('btn-qty-plus').addEventListener('click', () => {
            let qty = parseInt($('variant-qty').value) || 1;
            // Nếu đã chọn variant thì giới hạn theo stock, nếu chưa thì cho tăng thoải mái (sẽ check lại khi chọn size)
            if (selectedVariantId) {
                if (qty < selectedMaxStock) {
                    $('variant-qty').value = qty + 1;
                } else {
                    showToast(`Chỉ còn ${selectedMaxStock} sản phẩm trong kho`, 'error');
                }
            } else {
                $('variant-qty').value = qty + 1;
            }
            checkVariantAddability();
        });
        $('variant-qty').addEventListener('input', () => {
            let qty = parseInt($('variant-qty').value) || 1;
            if (selectedVariantId && qty > selectedMaxStock) {
                $('variant-qty').value = selectedMaxStock;
                showToast(`Đã điều chỉnh về tối đa ${selectedMaxStock} sản phẩm`, 'warning');
            }
            if (qty < 1) $('variant-qty').value = 1;
            checkVariantAddability();
        });

        // Add to Cart
        $('btn-add-to-cart').addEventListener('click', addToCart);

        // Checkout function
        btnCheckout.addEventListener('click', processCheckout);
    }

    // ===== FETCH PRODUCTS =====
    async function loadProducts() {
        try {
            loadingState.classList.remove('hidden');
            const keyword = searchInput.value.trim();
            const url = `/api/admin/products?status=ACTIVE&page=${currentPage}&size=${pageSize}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
            
            const res = await fetch(url);
            if (res.status === 401) return window.location.href = '/admin/login';
            
            const data = await res.json();
            products = data.content || [];
            totalPages = data.totalPages || 1;
            
            $('product-page-info').textContent = `Trang ${currentPage + 1} / ${totalPages || 1}`;
            $('btn-prev-page').disabled = currentPage === 0;
            $('btn-next-page').disabled = currentPage >= totalPages - 1;

            renderProducts();
        } catch (error) {
            showToast('Lỗi tải sản phẩm!', 'error');
        } finally {
            loadingState.classList.add('hidden');
        }
    }

    function renderProducts() {
        grid.innerHTML = '';
        if (products.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            products.forEach(p => {
                const imgUrl = p.primaryImageUrl ? (p.primaryImageUrl.startsWith('/images/') ? p.primaryImageUrl : `/images/${p.primaryImageUrl}`) : '/images/placeholder.jpg';
                const div = document.createElement('div');
                div.className = 'bg-white border border-neutral-100 p-3 rounded group cursor-pointer hover:border-primary transition-colors flex flex-col relative';
                div.innerHTML = `
                    <div class="h-24 w-full bg-neutral-100 rounded mb-2 overflow-hidden flex-shrink-0">
                         <img src="${imgUrl}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <p class="text-[10px] font-bold text-neutral-800 line-clamp-2 leading-tight mb-1 flex-1">${p.name}</p>
                    <p class="text-[11px] font-black text-primary truncate">${formatCurrency(p.minPrice || p.price || 0)}</p>
                    <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none rounded"></div>
                `;
                div.addEventListener('click', () => openVariantModal(p.productId));
                grid.appendChild(div);
            });
        }
    }

    // ===== VARIANT MODAL =====
    async function openVariantModal(productId) {
        variantModal.classList.remove('hidden');
        variantModal.querySelector('.absolute.right-0').classList.remove('translate-x-full');
        variantLoading.classList.remove('hidden');

        // Reset state
        currentProductDetail = null;
        selectedColor = null;
        selectedSize = null;
        selectedVariantId = null;
        selectedMaxStock = 0;
        selectedPrice = 0;
        
        $('variant-colors').innerHTML = '';
        $('variant-sizes').innerHTML = '<p class="text-[10px] text-neutral-400 italic">Vui lòng chọn màu trước</p>';
        $('variant-stock-info').textContent = 'Tồn kho: --';
        $('variant-qty').value = 1;
        $('btn-add-to-cart').disabled = true;

        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            currentProductDetail = data;

            // Render Product Header
            $('variant-modal-name').textContent = data.name;
            const mainImg = data.mainImage || '';
            let firstImg = mainImg ? (mainImg.startsWith('/images/') ? mainImg : `/images/${mainImg}`) : '/images/placeholder.jpg';
            $('variant-modal-img').src = firstImg;
            $('variant-modal-price').textContent = formatCurrency(data.minPrice || data.price || 0);

            renderColorOptions();
        } catch (error) {
            showToast('Lỗi tải chi tiết Sản phẩm', 'error');
            closeVariantModal();
        } finally {
            variantLoading.classList.add('hidden');
        }
    }

    function closeVariantModal() {
        variantModal.classList.add('hidden');
    }

    function renderColorOptions() {
        if (!currentProductDetail || !currentProductDetail.variants) return;
        
        // Extract unique colors
        const colors = [...new Set(currentProductDetail.variants.map(v => v.color))];
        const container = $('variant-colors');
        container.innerHTML = '';

        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = `px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-neutral-200 text-neutral-500 rounded transition-colors`;
            btn.textContent = color;
            btn.addEventListener('click', () => selectColor(color, btn));
            container.appendChild(btn);
        });
    }

    function selectColor(color, btnEl) {
        selectedColor = color;
        selectedSize = null; // reset size
        
        // Highlight active btn
        const btns = $('variant-colors').querySelectorAll('button');
        btns.forEach(b => {
             b.classList.remove('bg-primary', 'text-white', 'border-primary');
             b.classList.add('text-neutral-500', 'border-neutral-200');
        });
        btnEl.classList.remove('text-neutral-500', 'border-neutral-200');
        btnEl.classList.add('bg-primary', 'text-white', 'border-primary');

        renderSizeOptions();
        checkVariantAddability();
    }

    function renderSizeOptions() {
        if (!currentProductDetail || !selectedColor) return;

        const variantsByColor = currentProductDetail.variants.filter(v => v.color === selectedColor);
        const container = $('variant-sizes');
        container.innerHTML = '';
        $('variant-stock-info').textContent = 'Tồn kho: --';

        variantsByColor.forEach(v => {
            const disabled = v.stockQuantity <= 0;
            const btn = document.createElement('button');
            btn.className = `px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-neutral-200 ${disabled ? 'opacity-20 cursor-not-allowed bg-neutral-100' : 'text-neutral-500 hover:border-primary'} rounded transition-colors`;
            btn.textContent = v.size;
            if (!disabled) {
                btn.addEventListener('click', () => selectSize(v, btn));
            }
            container.appendChild(btn);
        });
    }

    function selectSize(variantObj, btnEl) {
        selectedSize = variantObj.size;
        selectedVariantId = variantObj.variantId;
        selectedMaxStock = variantObj.stockQuantity;
        selectedPrice = variantObj.price;

        // Highlight
        const btns = $('variant-sizes').querySelectorAll('button');
        btns.forEach(b => {
             if(!b.classList.contains('cursor-not-allowed')) {
                 b.classList.remove('bg-primary', 'text-white', 'border-primary');
                 b.classList.add('text-neutral-500', 'border-neutral-200');
             }
        });
        btnEl.classList.remove('text-neutral-500', 'border-neutral-200');
        btnEl.classList.add('bg-primary', 'text-white', 'border-primary');

        // Update UI
        $('variant-stock-info').textContent = `Tồn kho: ${selectedMaxStock}`;
        $('variant-modal-price').textContent = formatCurrency(selectedPrice);
        
        // Get image corresponding to color if exist
        const imgObj = currentProductDetail.images?.find(i => i.color === selectedColor);
        if (imgObj && imgObj.url) {
            const url = imgObj.url;
            $('variant-modal-img').src = url.startsWith('/images/') ? url : `/images/${url}`;
        }
        
        // Reset qty - keep current if valid, else 1
        let currentQty = parseInt($('variant-qty').value) || 1;
        if (currentQty > selectedMaxStock) {
            $('variant-qty').value = selectedMaxStock;
            showToast(`Sản phẩm này chỉ còn ${selectedMaxStock} trong kho`, 'warning');
        }

        checkVariantAddability();
    }

    function checkVariantAddability() {
        const qty = parseInt($('variant-qty').value) || 0;
        const valid = selectedVariantId !== null && qty > 0 && qty <= selectedMaxStock;
        $('btn-add-to-cart').disabled = !valid;
    }

    // ===== CART LOGIC =====
    function addToCart() {
        if (!selectedVariantId) return;
        const qty = parseInt($('variant-qty').value) || 1;

        // check if already in cart
        const existing = cart.find(i => i.variantId === selectedVariantId);
        if (existing) {
            if (existing.quantity + qty > selectedMaxStock) {
                showToast(`Không đủ tồn kho (Tối đa ${selectedMaxStock})`, 'error');
                return;
            }
            existing.quantity += qty;
        } else {
            cart.push({
                variantId: selectedVariantId,
                productId: currentProductDetail.productId,
                productName: currentProductDetail.name,
                color: selectedColor,
                size: selectedSize,
                price: selectedPrice,
                maxStock: selectedMaxStock,
                quantity: qty,
                image: $('variant-modal-img').src
            });
        }

        showToast('Đã thêm vào giỏ hàng', 'success');
        closeVariantModal();
        renderCart();
    }

    function renderCart() {
        cartContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartEmpty.classList.remove('hidden');
            cartCount.textContent = '0';
            cartTotal.textContent = '0 đ';
            btnCheckout.disabled = true;
            cartContainer.appendChild(cartEmpty);
            return;
        }
        
        cartEmpty.classList.add('hidden');
        btnCheckout.disabled = false;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            count += item.quantity;

            const div = document.createElement('div');
            div.className = 'bg-white p-3 rounded mb-2 border border-neutral-100 flex gap-3 relative shadow-xs';
            div.innerHTML = `
                <img src="${item.image}" class="w-12 h-12 object-cover rounded bg-neutral-100">
                <div class="flex-1">
                    <p class="text-[10px] font-bold text-neutral-800 line-clamp-1">${item.productName}</p>
                    <p class="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">${item.color} | ${item.size}</p>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-[11px] font-black text-primary">${formatCurrency(item.price)}</p>
                        <!-- Qty Adjust -->
                        <div class="flex items-center gap-1.5 border border-neutral-200 rounded px-1.5 py-0.5">
                            <span class="material-symbols-outlined text-[12px] text-neutral-400 cursor-pointer hover:text-primary" onclick="AdminPOS.updateQty(${index}, -1)">remove</span>
                            <span class="text-[10px] font-bold w-4 text-center">${item.quantity}</span>
                            <span class="material-symbols-outlined text-[12px] text-neutral-400 cursor-pointer hover:text-primary" onclick="AdminPOS.updateQty(${index}, 1)">add</span>
                        </div>
                    </div>
                </div>
                <!-- Remove Btn -->
                <button onclick="AdminPOS.removeItem(${index})" class="absolute top-2 right-2 text-neutral-300 hover:text-red-500">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
            `;
            cartContainer.appendChild(div);
        });

        cartCount.textContent = count;
        cartTotal.textContent = formatCurrency(total);
    }

    function updateQty(index, dir) {
        let item = cart[index];
        if (!item) return;
        let newQty = item.quantity + dir;
        
        if (newQty < 1) return; // Use remove instead
        if (newQty > item.maxStock) {
            showToast('Vượt quá tồn kho!', 'error');
            return;
        }
        
        item.quantity = newQty;
        renderCart();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        renderCart();
    }

    // ===== CHECKOUT =====
    async function processCheckout() {
        if (cart.length === 0) return;

        const phone = $('checkout-phone').value.trim();
        const paymentMethod = $('checkout-payment').value;

        if (phone && !/^0\d{9}$/.test(phone)) {
            showToast('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)', 'error');
            return;
        }

        const payload = {
            items: cart.map(item => ({
                productVariantId: item.variantId,
                quantity: item.quantity
            })),
            paymentMethod: paymentMethod,
            customerPhone: phone || null
        };

        try {
            btnCheckout.disabled = true;
            btnCheckout.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Đang xử lý...';

            const res = await fetch('/api/admin/offline-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                // Phân tích lỗi validation từ Spring (thường nằm trong errData.errors hoặc errData.message)
                let errorMsg = 'Lỗi xử lý đơn hàng';
                if (errData.errors && Array.isArray(errData.errors)) {
                    errorMsg = errData.errors.join(', ');
                } else if (errData.message) {
                    errorMsg = errData.message;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            showToast(`Thành công! Mã đơn: ${data.orderId}`, 'success');
            
            // Wait 1.5s then clear cart & refresh stock
            setTimeout(() => {
                cart = [];
                $('checkout-phone').value = '';
                $('checkout-payment').value = 'COD';
                renderCart();
                loadProducts(); // refresh products stock
            }, 1500);

        } catch (error) {
            showToast(error.message, 'error');
            console.error('Checkout Error:', error);
        } finally {
            if (cart.length > 0) { // If success, btn disables, else revert
                btnCheckout.disabled = false;
            }
            btnCheckout.innerHTML = '<span class="material-symbols-outlined text-[16px]">point_of_sale</span> Thanh toán ngay';
        }
    }

    // ===== UTILS =====
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-primary' : 'bg-red-500';
        toast.className = `flex items-center gap-2 ${bgColor} text-white px-4 py-3 rounded-lg shadow-xl translate-y-10 opacity-0 transition-all duration-300`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-sm">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span class="text-[11px] font-black uppercase tracking-widest">${message}</span>
        `;
        const container = $('admin-toast');
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        });
        
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // Expose needed methods to global scope for onclick handlers
    return {
        closeVariantModal,
        updateQty,
        removeItem
    };

})();
