document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Navigation Logic ---
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            const content = document.getElementById(target);
            if (content) {
                content.classList.add('active');
            }
        });
    });

    // --- Identity Management Logic ---
    const identityInput = document.getElementById('identityInput');
    const addIdentityBtn = document.getElementById('addIdentityBtn');
    const identitiesList = document.getElementById('identitiesList');
    const storageKey = 'atomicHabits_identities';

    const loadIdentities = () => {
        const identitiesJSON = localStorage.getItem(storageKey);
        return identitiesJSON ? JSON.parse(identitiesJSON) : [];
    };

    const saveIdentities = (identities) => {
        localStorage.setItem(storageKey, JSON.stringify(identities));
    };

    let identities = loadIdentities();

    const renderIdentities = () => {
        identitiesList.innerHTML = ''; // Clear the list before rendering
        identities.forEach(identity => {
            const identityElement = document.createElement('div');
            identityElement.textContent = identity.texto;
            identitiesList.appendChild(identityElement);
        });
    };

    addIdentityBtn.addEventListener('click', () => {
        const text = identityInput.value.trim();
        if (text === '') {
            return;
        }

        const newIdentity = {
            id: Date.now(),
            texto: text,
            datacriacao: new Date().toISOString(),
            contador: 0
        };

        identities.push(newIdentity);
        saveIdentities(identities);
        identityInput.value = '';
        renderIdentities();
    });

    // Initial render of identities on page load
    renderIdentities();
});
