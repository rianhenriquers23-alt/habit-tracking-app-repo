document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // --- TAB NAVIGATION ---
    // =================================================================
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

    // =================================================================
    // --- ELEMENT SELECTORS ---
    // =================================================================
    // Identities
    const identityInput = document.getElementById('identityInput');
    const addIdentityBtn = document.getElementById('addIdentityBtn');
    const identitiesList = document.getElementById('identitiesList');
    // Habits
    const habitIdentitySelect = document.getElementById('habitIdentity');
    const habitNameInput = document.getElementById('habitName');
    const habitCueInput = document.getElementById('habitCue');
    const habitStackInput = document.getElementById('habitStack');
    const habitTwoMinInput = document.getElementById('habitTwoMin');
    const habitTimeInput = document.getElementById('habitTime');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitsList = document.getElementById('habitsList');

    // =================================================================
    // --- IDENTITY MANAGEMENT ---
    // =================================================================
    const identitiesStorageKey = 'atomicHabits_identities';
    let identities = loadIdentities();

    function loadIdentities() {
        const identitiesJSON = localStorage.getItem(identitiesStorageKey);
        return identitiesJSON ? JSON.parse(identitiesJSON) : [];
    }

    function saveIdentities() {
        localStorage.setItem(identitiesStorageKey, JSON.stringify(identities));
    }

    function updateAndRenderIdentities() {
        saveIdentities();
        renderIdentities();
        populateIdentitiesDropdown();
    }

    function renderIdentities() {
        identitiesList.innerHTML = '';
        identities.forEach(identity => {
            const el = document.createElement('div');
            el.innerHTML = `<span>${identity.texto}</span>
                          <button class="edit-btn" data-id="${identity.id}">Editar</button>
                          <button class="delete-btn" data-id="${identity.id}">Deletar</button>`;
            identitiesList.appendChild(el);
        });
    }

    function populateIdentitiesDropdown() {
        habitIdentitySelect.innerHTML = '<option value="">Selecione uma identidade</option>';
        identities.forEach(identity => {
            const option = document.createElement('option');
            option.value = identity.id;
            option.textContent = identity.texto;
            habitIdentitySelect.appendChild(option);
        });
    }

    addIdentityBtn.addEventListener('click', () => {
        const text = identityInput.value.trim();
        if (text === '') return;
        identities.push({ id: Date.now(), texto: text, datacriacao: new Date().toISOString(), contador: 0 });
        identityInput.value = '';
        updateAndRenderIdentities();
    });

    identitiesList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza?')) {
                identities = identities.filter(i => i.id != id);
                updateAndRenderIdentities();
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const identity = identities.find(i => i.id == id);
            const newText = prompt('Novo texto:', identity.texto);
            if (newText && newText.trim()) {
                identity.texto = newText.trim();
                updateAndRenderIdentities();
            }
        }
    });

    // =================================================================
    // --- HABIT MANAGEMENT ---
    // =================================================================
    const habitsStorageKey = 'atomicHabits_habits';
    let habits = loadHabits();

    function loadHabits() {
        const habitsJSON = localStorage.getItem(habitsStorageKey);
        return habitsJSON ? JSON.parse(habitsJSON) : [];
    }

    function saveHabits() {
        localStorage.setItem(habitsStorageKey, JSON.stringify(habits));
    }

    function updateAndRenderHabits() {
        saveHabits();
        renderHabits();
    }

    function renderHabits() {
        habitsList.innerHTML = '';
        habits.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.textContent = habit.name;
            habitsList.appendChild(habitElement);
        });
    }

    function clearHabitForm() {
        habitIdentitySelect.value = '';
        habitNameInput.value = '';
        habitCueInput.value = '';
        habitStackInput.value = '';
        habitTwoMinInput.value = '';
        habitTimeInput.value = '';
    }

    addHabitBtn.addEventListener('click', () => {
        const identityId = habitIdentitySelect.value;
        const name = habitNameInput.value.trim();

        if (!name || !identityId) {
            alert('Por favor, selecione uma identidade e insira um nome para o hábito.');
            return;
        }

        const newHabit = {
            id: Date.now(),
            identityId: identityId,
            name: name,
            cue: habitCueInput.value.trim(),
            stack: habitStackInput.value.trim(),
            twoMin: habitTwoMinInput.value.trim(),
            time: habitTimeInput.value,
            createdDate: new Date().toISOString(),
            active: true,
            currentStreak: 0,
            bestStreak: 0,
            totalCompletions: 0
        };

        habits.push(newHabit);
        clearHabitForm();
        updateAndRenderHabits();
    });

    // =================================================================
    // --- INITIAL LOAD ---
    // =================================================================
    updateAndRenderIdentities();
    renderHabits();
});
