document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const OWNER_PHONE_NUMBER = "919904863345"; // Placeholder: Standard format with country code
    
    // --- State ---
    let selectedServices = new Set();
    const serviceCache = new Map(); // Store service details for easy access

    // --- Elements ---
    const totalPriceEl = document.getElementById('total-price');
    const selectedListEl = document.getElementById('selected-list');
    const bookBtn = document.getElementById('book-btn');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // --- Initialization ---
    
    // Pre-populate cache and check local storage if we implement it
    checkboxes.forEach(checkbox => {
        serviceCache.set(checkbox.id, {
            name: checkbox.dataset.name,
            price: parseInt(checkbox.dataset.price)
        });

        // Add change listener for accessibility/keyboard usage
        checkbox.addEventListener('change', (e) => {
            updateServiceState(e.target.id, e.target.checked);
        });
    });

    // Load from LocalStorage (Optional Feature)
    loadSelection();


    // --- Core Logic ---

    window.toggleService = function(id) {
        // Find the checkbox associated with the card
        const checkbox = document.getElementById(id);
        if (!checkbox) return;

        // Toggle checked state
        checkbox.checked = !checkbox.checked;
        
        // Update application state
        updateServiceState(id, checkbox.checked);
    };

    function updateServiceState(id, isSelected) {
        // Toggle visual class on the card
        const card = document.getElementById(id).closest('.service-card');
        if (isSelected) {
            selectedServices.add(id);
            card.classList.add('selected');
        } else {
            selectedServices.delete(id);
            card.classList.remove('selected');
        }

        // Update Summary UI
        updateSummary();
        
        // Save to LocalStorage
        saveSelection();
    }

    function updateSummary() {
        let total = 0;
        selectedListEl.innerHTML = ''; // Clear current list

        if (selectedServices.size === 0) {
            selectedListEl.innerHTML = '<li class="empty-state">No services selected</li>';
            bookBtn.disabled = true;
            totalPriceEl.innerText = '₹0';
            return;
        }

        selectedServices.forEach(id => {
            const service = serviceCache.get(id);
            if (service) {
                total += service.price;
                
                // Create list item
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${service.name}</span>
                    <span>${service.price === 0 ? 'Free' : '₹' + service.price}</span>
                `;
                selectedListEl.appendChild(li);
            }
        });

        // Update Total
        totalPriceEl.innerText = `₹${total}`;
        
        // Enable Button
        bookBtn.disabled = false;
    }

    // --- WhatsApp Integration ---

    bookBtn.addEventListener('click', () => {
        if (selectedServices.size === 0) return;

        let total = 0;
        let message = `Hello Karan,\n\nI would like to book the following filmmaking services:\n\n`;

        selectedServices.forEach(id => {
            const service = serviceCache.get(id);
            message += `• ${service.name} – ${service.price === 0 ? 'Free' : '₹' + service.price}\n`;
            total += service.price;
        });

        message += `\nTotal Estimated Cost: ₹${total}\n\nPlease let me know available dates and next steps.\nThank you.`;

        // Encode URI
        const encodedMessage = encodeURIComponent(message);
        
        // Construct URL
        // If it's a mobile device (naive check), we might prefer 'api.whatsapp.com' or just 'wa.me' works universally usually
        const whatsappURL = `https://wa.me/${OWNER_PHONE_NUMBER}?text=${encodedMessage}`;

        // Redirect
        window.open(whatsappURL, '_blank');
    });

    // --- Local Storage Functions ---

    function saveSelection() {
        localStorage.setItem('dhyani_cart', JSON.stringify(Array.from(selectedServices)));
    }

    function loadSelection() {
        const saved = localStorage.getItem('dhyani_cart');
        if (saved) {
            try {
                const savedIds = JSON.parse(saved);
                savedIds.forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) {
                        checkbox.checked = true;
                        updateServiceState(id, true);
                    }
                });
            } catch (e) {
                console.error("Failed to load cart", e);
                localStorage.removeItem('dhyani_cart');
            }
        }
    }
});
