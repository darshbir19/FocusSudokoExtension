document.addEventListener('DOMContentLoaded', () => {
    const blocklistElement = document.getElementById('blocklist');
    const newDomainInput = document.getElementById('newDomain');
    const addButton = document.getElementById('addDomain');

    // Load and display the blocklist
    function loadBlocklist() {
        chrome.storage.sync.get(['blocklist'], (result) => {
            const blocklist = result.blocklist || [];
            blocklistElement.innerHTML = '';
            
            blocklist.forEach(domain => {
                const item = document.createElement('div');
                item.className = 'blocklist-item';
                item.innerHTML = `
                    <span>${domain}</span>
                    <button class="remove-btn" data-domain="${domain}">×</button>
                `;
                blocklistElement.appendChild(item);
            });

            // Add remove event listeners
            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const domain = e.target.dataset.domain;
                    removeDomain(domain);
                });
            });
        });
    }

    // Add a new domain to the blocklist
    function addDomain(domain) {
        if (!domain) return;
        
        // Remove protocol and www if present
        domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
        
        chrome.storage.sync.get(['blocklist'], (result) => {
            const blocklist = result.blocklist || [];
            if (!blocklist.includes(domain)) {
                blocklist.push(domain);
                chrome.storage.sync.set({ blocklist }, () => {
                    loadBlocklist();
                    newDomainInput.value = '';
                });
            }
        });
    }

    // Remove a domain from the blocklist
    function removeDomain(domain) {
        chrome.storage.sync.get(['blocklist'], (result) => {
            const blocklist = result.blocklist || [];
            const index = blocklist.indexOf(domain);
            if (index > -1) {
                blocklist.splice(index, 1);
                chrome.storage.sync.set({ blocklist }, loadBlocklist);
            }
        });
    }

    // Event listeners
    addButton.addEventListener('click', () => {
        addDomain(newDomainInput.value.trim());
    });

    newDomainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addDomain(newDomainInput.value.trim());
        }
    });

    // Initial load
    loadBlocklist();
}); 