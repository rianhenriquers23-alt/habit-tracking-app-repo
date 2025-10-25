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
    const currentDateEl = document.getElementById('currentDate');
    const todayHabitsEl = document.getElementById('todayHabits');
    const identityInput = document.getElementById('identityInput');
    const addIdentityBtn = document.getElementById('addIdentityBtn');
    const identitiesList = document.getElementById('identitiesList');
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
        const data = localStorage.getItem(identitiesStorageKey);
        return data ? JSON.parse(data) : [];
    }
    function saveIdentities() {
        localStorage.setItem(identitiesStorageKey, JSON.stringify(identities));
    }
    function updateAndRenderIdentities() {
        saveIdentities();
        renderIdentities();
        populateIdentitiesDropdown();
        renderDashboard(); // This was the missing link
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
        const data = localStorage.getItem(habitsStorageKey);
        return data ? JSON.parse(data) : [];
    }
    function saveHabits() {
        localStorage.setItem(habitsStorageKey, JSON.stringify(habits));
    }
    function updateAndRenderHabits() {
        saveHabits();
        renderHabits();
        renderDashboard();
    }
    function renderHabits() {
        habitsList.innerHTML = '';
        habits.forEach(habit => {
            const el = document.createElement('div');
            el.className = 'habit-card';
            const linkedIdentity = identities.find(i => i.id == habit.identityId);
            el.innerHTML = `<h4>${habit.name}</h4>
                <p><strong>Identidade:</strong> ${linkedIdentity ? linkedIdentity.texto : 'N/A'}</p>
                <p><strong>Gatilho:</strong> ${habit.cue || 'N/A'}</p>
                <p><strong>Empilhamento:</strong> ${habit.stack || 'N/A'}</p>
                <p><strong>Versão 2 min:</strong> ${habit.twoMin || 'N/A'}</p>
                <p><strong>Horário:</strong> ${habit.time || 'N/A'}</p>
                <p><strong>Streak Atual:</strong> ${habit.currentStreak}</p>
                <button class="edit-habit-btn" data-id="${habit.id}">Editar</button>
                <button class="delete-habit-btn" data-id="${habit.id}">Deletar</button>`;
            habitsList.appendChild(el);
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
        if (!name || !identityId) return alert('Selecione uma identidade e insira um nome.');
        habits.push({
            id: Date.now(), identityId, name,
            cue: habitCueInput.value.trim(),
            stack: habitStackInput.value.trim(),
            twoMin: habitTwoMinInput.value.trim(),
            time: habitTimeInput.value,
            createdDate: new Date().toISOString(),
            active: true, currentStreak: 0, bestStreak: 0, totalCompletions: 0
        });
        clearHabitForm();
        updateAndRenderHabits();
    });
    habitsList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;
        if (e.target.classList.contains('delete-habit-btn')) {
            if (confirm('Tem certeza?')) {
                habits = habits.filter(h => h.id != id);
                updateAndRenderHabits();
            }
        }
        if (e.target.classList.contains('edit-habit-btn')) {
            alert('Função de editar será implementada');
        }
    });

    // =================================================================
    // --- COMPLETION MANAGEMENT ---
    // =================================================================
    const completionsStorageKey = 'atomicHabits_completions';
    let completions = loadCompletions();

    function getTodayDateString() {
        return new Date().toISOString().split('T')[0];
    }
    function loadCompletions() {
        const data = localStorage.getItem(completionsStorageKey);
        return data ? JSON.parse(data) : [];
    }
    function saveCompletions() {
        localStorage.setItem(completionsStorageKey, JSON.stringify(completions));
    }

    // =================================================================
    // --- DASHBOARD MANAGEMENT ---
    // =================================================================
    function renderDashboard() {
        const today = new Date();
        currentDateEl.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(today);

        const activeHabits = habits.filter(h => h.active);
        todayHabitsEl.innerHTML = '';
        if (activeHabits.length === 0) {
            todayHabitsEl.textContent = 'Nenhum hábito ativo para hoje.';
            return;
        }
        const todayDateString = getTodayDateString();
        activeHabits.forEach(habit => {
            const isCompleted = completions.some(c => c.habitId == habit.id && c.date === todayDateString);
            const el = document.createElement('div');
            el.className = 'today-habit-item';
            el.innerHTML = `<input type="checkbox" data-id="${habit.id}" ${isCompleted ? 'checked' : ''}>
                          <span>${habit.name}</span>
                          <span>(Streak: ${habit.currentStreak})</span>`;
            todayHabitsEl.appendChild(el);
        });
    }
    todayHabitsEl.addEventListener('change', (e) => {
        if (e.target.type !== 'checkbox') return;
        const habitId = e.target.dataset.id;
        const today = getTodayDateString();
        if (e.target.checked) {
            completions.push({ habitId, date: today, timestamp: Date.now() });
        } else {
            completions = completions.filter(c => !(c.habitId == habitId && c.date === today));
        }
        saveCompletions();
    });

    // =================================================================
    // --- INITIAL LOAD ---
    // =================================================================
    updateAndRenderIdentities();
    updateAndRenderHabits();
});
