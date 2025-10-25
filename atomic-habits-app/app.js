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
            // Se a aba de progresso for clicada, renderiza as estatísticas
            if (target === 'progress') {
                renderProgressStats();
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

    function updateIdentityCounters() {
        identities.forEach(identity => {
            const linkedHabits = habits.filter(h => h.identityId == identity.id);
            const totalCompletions = linkedHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
            identity.contador = totalCompletions;
        });
        saveIdentities();
    }
    function renderIdentities() {
        identitiesList.innerHTML = '';
        identities.forEach(identity => {
            const el = document.createElement('div');
            el.className = 'identity-item';
            el.innerHTML = `
                <div>
                    <span>${identity.texto}</span>
                    <small>Você provou ser essa identidade ${identity.contador || 0} vezes</small>
                </div>
                <div>
                    <button class="edit-btn" data-id="${identity.id}">Editar</button>
                    <button class="delete-btn" data-id="${identity.id}">Deletar</button>
                </div>
            `;
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

    function calculateStreak(habitId) {
        const habitCompletions = completions.filter(c => c.habitId == habitId);
        if (habitCompletions.length === 0) return 0;

        const completionDates = new Set(habitCompletions.map(c => c.date));
        const formatDate = (date) => date.toISOString().split('T')[0];

        let streak = 0;
        let currentDate = new Date();

        if (!completionDates.has(formatDate(currentDate))) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        while (completionDates.has(formatDate(currentDate))) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    function calculateBestStreak(habitId) {
        const habitCompletions = completions.filter(c => c.habitId == habitId);
        if (habitCompletions.length === 0) return 0;

        const completionDates = new Set(habitCompletions.map(c => c.date));
        const formatDate = (date) => date.toISOString().split('T')[0];

        let bestStreak = 0;
        let currentStreak = 0;

        // Ordena as datas para garantir a verificação cronológica
        const sortedDates = [...completionDates].sort();

        if (sortedDates.length === 0) return 0;

        let lastDate = new Date(sortedDates[0]);
        currentStreak = 1;
        bestStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            let currentDate = new Date(sortedDates[i]);
            let expectedLastDate = new Date(currentDate);
            expectedLastDate.setDate(expectedLastDate.getDate() - 1);

            if (formatDate(lastDate) === formatDate(expectedLastDate)) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }

            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
            lastDate = currentDate;
        }

        return bestStreak;
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
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateString = yesterday.toISOString().split('T')[0];

        activeHabits.forEach(habit => {
            habit.currentStreak = calculateStreak(String(habit.id));
            habit.bestStreak = calculateBestStreak(String(habit.id));

            const isCompletedToday = completions.some(c => c.habitId == habit.id && c.date === todayDateString);
            const wasCompletedYesterday = completions.some(c => c.habitId == habit.id && c.date === yesterdayDateString);

            let skippedYesterday = false;
            // Só mostra o alerta se o hábito não foi concluído hoje ainda.
            if (!isCompletedToday && !wasCompletedYesterday) {
                skippedYesterday = true;
            }

            const el = document.createElement('div');
            el.className = 'today-habit-item';
            if (skippedYesterday) {
                el.setAttribute('data-skipped', 'true');
            }

            let alertHTML = '';
            if (skippedYesterday) {
                alertHTML = `<span class="skipped-alert">⚠️ Você pulou ontem! Não perca 2 dias seguidos!</span>`;
            }

            el.innerHTML = `
                <input type="checkbox" data-id="${habit.id}" ${isCompletedToday ? 'checked' : ''}>
                <span>${habit.name}</span>
                <span>(Streak: ${habit.currentStreak})</span>
                ${alertHTML}
            `;
            todayHabitsEl.appendChild(el);
        });
        // Salva os hábitos, pois os streaks podem ter sido atualizados.
        saveHabits();
    }
    todayHabitsEl.addEventListener('change', (e) => {
        if (e.target.type !== 'checkbox') return;
        const habitId = e.target.dataset.id;
        const habit = habits.find(h => h.id == habitId);
        if (!habit) return;

        const today = getTodayDateString();
        const isChecked = e.target.checked;

        if (isChecked) {
            completions.push({ habitId, date: today, timestamp: Date.now() });
            habit.totalCompletions++;
        } else {
            completions = completions.filter(c => !(c.habitId == habitId && c.date === today));
            habit.totalCompletions--;
        }

        saveCompletions();

        habit.currentStreak = calculateStreak(habitId);
        habit.bestStreak = calculateBestStreak(habitId);

        saveHabits();
        updateIdentityCounters();
        renderDashboard();
        renderIdentities(); // Para atualizar o contador na tela de identidades
    });

    // =================================================================
    // --- PROGRESS MANAGEMENT ---
    // =================================================================
    const progressStatsEl = document.getElementById('progressStats');

    function renderProgressStats() {
        progressStatsEl.innerHTML = '';
        if (habits.length === 0) {
            progressStatsEl.innerHTML = '<p>Você ainda não adicionou nenhum hábito.</p>';
            return;
        }

        habits.forEach(habit => {
            const startDate = new Date(habit.createdDate);
            const today = new Date();
            const timeDiff = today.getTime() - startDate.getTime();
            const daysSinceCreation = Math.ceil(timeDiff / (1000 * 3600 * 24));

            const completionRate = (daysSinceCreation > 0)
                ? ((habit.totalCompletions / daysSinceCreation) * 100).toFixed(1)
                : 0;

            const el = document.createElement('div');
            el.className = 'progress-card';
            const habitCompletions = completions.filter(c => c.habitId == habit.id);
            const completionDates = new Set(habitCompletions.map(c => c.date));
            const formatDate = (date) => date.toISOString().split('T')[0];

            let heatmapHTML = '<h4>Últimos 30 dias</h4><div class="heatmap-container">';
            // Itera do dia mais recente (hoje) para o mais antigo.
            for (let i = 0; i < 30; i++) {
                const date = new Date(); // Cria uma nova data a cada iteração
                date.setDate(date.getDate() - i);
                const dateString = formatDate(date);
                const isCompleted = completionDates.has(dateString);
                heatmapHTML += `<div class="heatmap-day" data-date="${dateString}" data-completed="${isCompleted}">${isCompleted ? '✓' : ''}</div>`;
            }
            heatmapHTML += '</div>';

            el.innerHTML = `
                <h3>${habit.name}</h3>
                <p><strong>Streak Atual:</strong> ${habit.currentStreak} dias</p>
                <p><strong>Melhor Streak:</strong> ${habit.bestStreak} dias</p>
                <p><strong>Total de Conclusões:</strong> ${habit.totalCompletions}</p>
                <p><strong>Taxa de Conclusão:</strong> ${completionRate}%</p>
                <p><small>Hábito criado há ${daysSinceCreation} dia(s).</small></p>
                ${heatmapHTML}
            `;
            progressStatsEl.appendChild(el);
        });
    }

    // =================================================================
    // --- DATA MANAGEMENT ---
    // =================================================================
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');

    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('Isso vai sobrescrever todos os dados atuais. Continuar?')) {
                    if (data.identities && data.habits && data.completions) {
                        localStorage.setItem(identitiesStorageKey, JSON.stringify(data.identities));
                        localStorage.setItem(habitsStorageKey, JSON.stringify(data.habits));
                        localStorage.setItem(completionsStorageKey, JSON.stringify(data.completions));
                        location.reload();
                    } else {
                        alert('Arquivo de importação inválido. Faltam dados necessários.');
                    }
                }
            } catch (error) {
                alert('Erro ao ler o arquivo JSON. Verifique o formato do arquivo.');
            }
        };
        reader.readAsText(file);
        // Limpa o valor do input para permitir importar o mesmo arquivo novamente
        fileInput.value = '';
    });

    exportBtn.addEventListener('click', () => {
        const data = {
            identities: loadIdentities(),
            habits: loadHabits(),
            completions: loadCompletions()
        };

        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `atomic-habits-backup-${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // =================================================================
    // --- INITIAL LOAD ---
    // =================================================================
    updateAndRenderIdentities();
    updateAndRenderHabits();
});
