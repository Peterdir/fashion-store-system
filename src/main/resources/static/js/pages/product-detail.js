let currentSelectedColor = null;
let currentSelectedSize = null;

/**
 * INITIALIZATION
 */
function initVariants() {
    // Read from global window object injected by Thymeleaf
    const productVariants = window.productVariants || [];
    const productImages = window.productImages || [];
    const mainProductImage = window.mainProductImage || '/images/placeholder.png';

    if (!productVariants || productVariants.length === 0) return;

    // 1. Get unique colors
    const colors = [...new Set(productVariants.map(v => v.color))];
    const colorContainer = document.getElementById('color-selector-container');
    
    if (colorContainer) {
        colorContainer.innerHTML = colors.map((color, idx) => {
            // Find a representative image for this color
            const colorSpecificImage = productImages.find(img => img.color === color);
            const thumbnailUrl = colorSpecificImage ? colorSpecificImage.url : mainProductImage;
            
            return `
                <div class="color-option relative w-12 h-16 border-2 transition-all cursor-pointer ${idx === 0 ? 'border-primary' : 'border-outline/10'} hover:border-primary" 
                     data-color="${color}" onclick="selectColor('${color}', this)">
                    <img src="${thumbnailUrl}" class="w-full h-full object-cover">
                </div>
            `;
        }).join('');

        // 2. Default selection: First color
        if (colors.length > 0) {
            selectColor(colors[0], colorContainer.querySelector('.color-option'));
        }
    }
}

/**
 * COLOR SELECTION LOGIC
 */
function selectColor(color, element) {
    const productVariants = window.productVariants || [];
    currentSelectedColor = color;
    
    const colorNameEl = document.getElementById('selected-color-name');
    if (colorNameEl) colorNameEl.innerText = color;

    // 1. Update UI for color options
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('border-primary');
        opt.classList.add('border-outline/10');
    });
    if (element) {
        element.classList.remove('border-outline/10');
        element.classList.add('border-primary');
    }

    // 2. Filter & Render Thumbnails for this color
    renderGalleryForColor(color);

    // 3. Filter sizes for this color
    renderSizesForColor(color);
    
    // 4. Re-validate current selected size or pick first available for this color
    const availableSizes = productVariants.filter(v => v.color === color && v.stockQuantity > 0);
    if (availableSizes.length > 0) {
        const stillAvailable = availableSizes.find(v => v.size === currentSelectedSize);
        if (!stillAvailable) {
            const firstSizeEl = document.querySelector('.size-btn:not([disabled])');
            if (firstSizeEl) firstSizeEl.click();
        } else {
            updateFinalVariant();
        }
    }
}

/**
 * GALLERY (IMAGES) LOGIC
 */
function renderGalleryForColor(color) {
    const productImages = window.productImages || [];
    
    // Filter images that match the color OR have no color assigned (general images)
    const filteredImages = productImages.filter(img => !img.color || img.color === color);
    
    const desktopContainer = document.getElementById('product-thumbnails-container');
    const mobileContainer = document.getElementById('mobile-thumbnails-container');

    const galleryHtml = filteredImages.map((img, idx) => `
        <div class="thumbnail-item cursor-pointer border-2 transition-all hover:border-primary overflow-hidden aspect-[3/4] ${idx === 0 ? 'border-primary' : 'border-transparent'}"
             data-large-src="${img.url}"
             onclick="changeMainImage(this)">
            <img src="${img.url}" class="w-full h-full object-cover">
        </div>
    `).join('');

    const mobileHtml = filteredImages.map(img => `
        <div class="w-16 h-20 flex-shrink-0 border-2 border-white/50 overflow-hidden shadow-lg"
             data-large-src="${img.url}"
             onclick="changeMainImage(this)">
            <img src="${img.url}" class="w-full h-full object-cover">
        </div>
    `).join('');

    if (desktopContainer) desktopContainer.innerHTML = galleryHtml;
    if (mobileContainer) mobileContainer.innerHTML = mobileHtml;

    // Update main image to the first one available for this color
    if (filteredImages.length > 0) {
        const mainImg = document.getElementById('main-product-image');
        if (mainImg) mainImg.src = filteredImages[0].url;
    }
}

/**
 * SIZE SELECTION LOGIC
 */
function renderSizesForColor(color) {
    const productVariants = window.productVariants || [];
    const sizeContainer = document.getElementById('size-selector-container');
    if (!sizeContainer) return;

    const variantsForColor = productVariants.filter(v => v.color === color);
    // Order sizes or just use Set order
    const allSizes = [...new Set(productVariants.map(v => v.size))];

    sizeContainer.innerHTML = allSizes.map(size => {
        const variant = variantsForColor.find(v => v.size === size);
        const isAvailable = variant && variant.stockQuantity > 0;
        
        return `
            <button class="size-btn h-12 px-6 border transition-all text-xs font-bold no-radius uppercase font-sans ${currentSelectedSize === size ? 'border-primary bg-neutral-50' : 'border-outline/20 hover:border-primary'} ${!isAvailable ? 'opacity-30 cursor-not-allowed bg-neutral-100' : ''}"
                    ${!isAvailable ? 'disabled' : ''} 
                    onclick="selectSize('${size}', this)">
                ${size}
            </button>
        `;
    }).join('');
}

function selectSize(size, element) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('border-primary', 'bg-neutral-50'));
    if (element) {
        element.classList.add('border-primary', 'bg-neutral-50');
    }
    updateFinalVariant();
}

/**
 * FINAL VARIANT (PRICE/STOCK) LOGIC
 */
function updateFinalVariant() {
    const productVariants = window.productVariants || [];
    const variant = productVariants.find(v => v.color === currentSelectedColor && v.size === currentSelectedSize);
    
    if (variant) {
        // Update Price
        const priceElements = document.querySelectorAll('.text-primary.font-bold, .text-3xl.font-bold.text-primary, .text-2xl.font-bold.text-primary');
        priceElements.forEach(el => el.innerText = new Intl.NumberFormat('vi-VN').format(variant.price) + ' ₫');

        // Update Stock
        const stockDisplay = document.getElementById('stock-display');
        if (stockDisplay) stockDisplay.innerText = `${variant.stockQuantity} items available`;
        
        // Update SKU dynamically
        const skuDisplay = document.getElementById('variant-sku-display');
        if (skuDisplay) {
            // Note: if you have a productId in context, use it. For now using variantId.
            skuDisplay.innerText = `HY-V${variant.variantId}`;
        }

        const variantInput = document.getElementById('selected-variant-id');
        if (variantInput) variantInput.value = variant.variantId;
        
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) addToCartBtn.disabled = variant.stockQuantity <= 0;
    }
}

/**
 * LIGHTBOX LOGIC
 */
function openLightbox() {
    const mainImg = document.getElementById('main-product-image');
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!mainImg || !lightbox || !lightboxImg) return;

    lightboxImg.src = mainImg.src;
    
    // Show modal
    lightbox.classList.remove('hidden');
    // Force reflow for animation
    void lightbox.offsetWidth;
    
    lightbox.classList.add('opacity-100');
    lightboxImg.classList.add('scale-100');
    lightboxImg.classList.remove('scale-95');
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.remove('opacity-100');
    lightboxImg.classList.remove('scale-100');
    lightboxImg.classList.add('scale-95');
    
    setTimeout(() => {
        lightbox.classList.add('hidden');
        // Unlock scroll
        document.body.style.overflow = '';
    }, 400);
}

/**
 * UI HELPERS
 */
function changeMainImage(el) {
    const largeUrl = el.getAttribute('data-large-src');
    const mainImg = document.getElementById('main-product-image');
    
    if (!mainImg) return;

    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('border-primary');
        item.classList.add('border-transparent');
    });
    el.classList.add('border-primary');

    mainImg.style.opacity = '0.3';
    setTimeout(() => {
        mainImg.src = largeUrl;
        mainImg.style.opacity = '1';
    }, 150);
}

document.addEventListener('DOMContentLoaded', () => {
    initVariants();

    // Init image preview & lightbox
    const mainImg = document.getElementById('main-product-image');
    if (mainImg) {
        mainImg.classList.add('cursor-zoom-in');
        mainImg.addEventListener('click', openLightbox);
    }

    // Keyboard support - Escape to close lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // 1. Wishlist Logic
    const wishlistBtn = document.getElementById('add-to-wishlist-btn');
    if (wishlistBtn && typeof WishlistUtils !== 'undefined') {
        const productId = wishlistBtn.getAttribute('data-id');
        const icon = wishlistBtn.querySelector('.wishlist-icon');
        
        // Check initial state
        WishlistUtils.checkWishlistStatus(productId).then(isWishlisted => {
            if (isWishlisted && icon) {
                icon.setAttribute('fill', 'currentColor');
                icon.classList.add('text-secondary');
                icon.classList.remove('text-neutral-900');
            }
        });

        wishlistBtn.addEventListener('click', async () => {
            const result = await WishlistUtils.toggleWishlist(productId);
            if (result && icon) {
                if (result.wishlisted) {
                    icon.setAttribute('fill', 'currentColor');
                    icon.classList.add('text-secondary');
                    icon.classList.remove('text-neutral-900');
                } else {
                    icon.setAttribute('fill', 'none');
                    icon.classList.remove('text-secondary');
                    icon.classList.add('text-neutral-900');
                }
            }
        });
    }

    // 2. Add to Cart Logic
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productVariants = window.productVariants || [];
            const variantIdInput = document.getElementById('selected-variant-id');
            const variantId = variantIdInput ? variantIdInput.value : null;

            if (!variantId || variantId === '') {
                if (window.Toast) Toast.warning('Vui lòng chọn màu sắc và kích cỡ!');
                else alert('Vui lòng chọn màu sắc và kích cỡ!');
                return;
            }

            const variant = productVariants.find(v => v.variantId == variantId);
            if (!variant) return;

            const h1Element = document.querySelector('h1');
            const name = h1Element ? h1Element.innerText.trim() : 'Sản phẩm';
            
            const mainImg = document.getElementById('main-product-image');
            
            if (typeof CartUtils !== 'undefined') {
                CartUtils.addToCart({
                    id: variant.variantId,
                    productId: variant.productId,
                    name: name,
                    price: variant.price,
                    size: variant.size,
                    color: variant.color,
                    image: mainImg ? mainImg.src : '',
                    quantity: 1
                });
            } else {
                console.error("CartUtils is not loaded!");
            }
        });
    }
});
