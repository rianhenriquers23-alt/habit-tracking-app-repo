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

    // --- Element Selectors ---
    const identityInput = document.getElementById('identityInput');
    const addIdentityBtn = document.getElementById('addIdentityBtn');
    const identitiesList = document.getElementById('identitiesList');
    const habitIdentitySelect = document.getElementById('habitIdentity');

    // --- Data Management ---
    const storageKey = 'atomicHabits_identities';

    const loadIdentities = () => {
        const identitiesJSON = localStorage.getItem(storageKey);
        return identitiesJSON ? JSON.parse(identitiesJSON) : [];
    };

    const saveIdentities = (identities) => {
        localStorage.setItem(storageKey, JSON.stringify(identities));
    };

    let identities = loadIdentities();

    // --- Combined Update and Render Function ---
    const updateAndRenderIdentities = () => {
        saveIdentities(identities);
        renderIdentities();
        populateIdentitiesDropdown();
    };

    // --- Rendering Functions ---
    const renderIdentities = () => {
        identitiesList.innerHTML = '';
        identities.forEach(identity => {
            const identityElement = document.createElement('div');
            const textSpan = document.createElement('span');
            textSpan.textContent = identity.texto;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit-btn';
            editBtn.dataset.id = identity.id;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Deletar';
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.id = identity.id;

            identityElement.appendChild(textSpan);
            identityElement.appendChild(editBtn);
            identityElement.appendChild(deleteBtn);

            identitiesList.appendChild(identityElement);
        });
    };

    const populateIdentitiesDropdown = () => {
        habitIdentitySelect.innerHTML = '<option value="">Selecione uma identidade</option>';
        identities.forEach(identity => {
            const option = document.createElement('option');
            option.value = identity.id;
            option.textContent = identity.texto;
            habitIdentitySelect.appendChild(option);
        });
    };

    // --- Event Listeners ---
    addIdentityBtn.addEventListener('click', () => {
        const text = identityInput.value.trim();
        if (text === '') return;

        const newIdentity = {
            id: Date.now(),
            texto: text,
            datacriacao: new Date().toISOString(),
            contador: 0
        };

        identities.push(newIdentity);
        identityInput.value = '';
        updateAndRenderIdentities();
    });

    identitiesList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('delete-btn')) {
            const confirmed = confirm('Tem certeza que deseja deletar esta identidade?');
            if (confirmed) {
                identities = identities.filter(identity => identity.id != id);
                updateAndRenderIdentities();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            const identityToEdit = identities.find(identity => identity.id == id);
            const newText = prompt('Digite o novo texto para a identidade:', identityToEdit.texto);
            if (newText && newText.trim() !== '') {
                identityToEdit.texto = newText.trim();
                updateAndRenderIdentities();
            }
        }
    });

    // --- Initial Load ---
    updateAndRenderIdentities();
});
