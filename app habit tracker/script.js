// script.js (VERSÃO COM AJUSTES DE ESTILO E BOTÃO DE REMOVER)

document.addEventListener("DOMContentLoaded", () => {
  // --- SELEÇÃO DE ELEMENTOS DO DOM (sem alteração) ---
  const toastContainer = document.getElementById("toast-container");
  const currentMonthTitle = document.getElementById("current-month-title");
  const activeHabitsCountEl = document.getElementById("active-habits-count");
  const scheduledHabitsCountEl = document.getElementById(
    "scheduled-habits-count"
  );
  const progressRing = document.getElementById("progress-ring-circle");
  const progressText = document.getElementById("progress-text");
  const addHabitBtn = document.getElementById("add-habit-btn");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const gridHeader = document.getElementById("grid-header");
  const gridBody = document.getElementById("grid-body");
  const addHabitModal = document.getElementById("add-habit-modal");
  const warningModal = document.getElementById("warning-modal");
  const confirmModal = document.getElementById("confirm-modal");
  const addHabitForm = document.getElementById("add-habit-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const waitRecommendedBtn = document.getElementById("wait-recommended-btn");
  const addAnywayBtn = document.getElementById("add-anyway-btn");
  const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
  const modalTitle = document.getElementById("modal-title");
  const habitIdInput = document.getElementById("habit-id");
  const habitNameInput = document.getElementById("habit-name");
  const habitGoalInput = document.getElementById("habit-goal");
  const habitTypeInput = document.getElementById("habit-type");
  const habitStartDateInput = document.getElementById("habit-start-date");
  const formSubmitBtn = addHabitForm.querySelector('button[type="submit"]');
  const prevMonthBtn = document.getElementById("prev-month-btn");
  const nextMonthBtn = document.getElementById("next-month-btn");
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFileInput = document.getElementById("import-file-input");
  const cravingsListEl = document.getElementById("cravings-list");
  const weeklySavingsChartEl = document.getElementById("weekly-savings-chart");
  const monthlySavingsChartEl = document.getElementById(
    "monthly-savings-chart"
  );
  const yearlySavingsChartEl = document.getElementById("yearly-savings-chart");

  // --- ESTADO DA APLICAÇÃO (sem alteração) ---
  let habits = [];
  let cravingsData = [];
  const FOCUS_PERIOD_DAYS = 21;
  let todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  let displayDate = new Date();
  displayDate.setDate(1);
  const CRAVINGS_CONFIG = {
    hamburguer: {
      name: "Hambúrguer",
      price: 22,
      color: "var(--color-hamburguer)",
    },
    nutella: { name: "Nutella", price: 15, color: "var(--color-nutella)" },
    "coca-cola": {
      name: "Coca-Cola",
      price: 6,
      color: "var(--color-coca-cola)",
    },
  };

  // --- FUNÇÕES HELPER DE DATA (sem alteração) ---
  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function parseLocalDateString(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  function isValidDateString(dateString) {
    if (typeof dateString !== "string") return !1;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return !1;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // --- LÓGICA DE DADOS (sem alteração) ---
  function loadData() {
    const appData = localStorage.getItem("habitTrackerData");
    if (!appData) {
      habits = [];
      cravingsData = [];
      return;
    }
    try {
      const parsedData = JSON.parse(appData);
      if (Array.isArray(parsedData.habits)) {
        habits = parsedData.habits
          .map(validateAndSanitizeHabit)
          .filter((h) => h !== null);
      } else {
        habits = [];
      }
      if (Array.isArray(parsedData.cravingsData)) {
        cravingsData = parsedData.cravingsData;
      } else {
        cravingsData = [];
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      habits = [];
      cravingsData = [];
    }
  }
  function validateAndSanitizeHabit(habit) {
    if (
      typeof habit !== "object" ||
      habit === null ||
      !habit.id ||
      !habit.name
    ) {
      return null;
    }
    const sanitizedStartDate = isValidDateString(habit.startDate)
      ? habit.startDate
      : getLocalDateString(new Date());
    return {
      id: String(habit.id),
      name: String(habit.name),
      goal: habit.goal ? String(habit.goal) : "",
      type: habit.type === "good" || habit.type === "bad" ? habit.type : "good",
      startDate: sanitizedStartDate,
      completions:
        typeof habit.completions === "object" && habit.completions !== null
          ? habit.completions
          : {},
    };
  }
  function saveData() {
    try {
      const appData = { habits, cravingsData };
      localStorage.setItem("habitTrackerData", JSON.stringify(appData));
    } catch (error) {
      console.error("Erro ao salvar dados na LocalStorage:", error);
      showToast(
        "Falha ao salvar. Armazenamento pode estar cheio.",
        "error",
        5000
      );
    }
  }

  // --- FUNÇÃO DE NOTIFICAÇÃO "TOAST" (sem alteração) ---
  function showToast(message, type = "success", duration = 3e3) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("animationend", () => toast.remove());
    }, duration);
  }

  // =======================================================================
  // ==                FUNÇÕES DA NOVA FEATURE (ATUALIZADAS)            ==
  // =======================================================================
  function renderCravingsPanel() {
    cravingsListEl.innerHTML = "";
    for (const [id, config] of Object.entries(CRAVINGS_CONFIG)) {
      const li = document.createElement("li");
      li.className = "craving-item";
      li.innerHTML = `
        <button class="remove-craving-win-btn craving-win-btn" data-id="${id}" title="Remover última vitória">-</button>
        <div class="craving-info">
          ${config.name} <span>R$${config.price.toFixed(2)}</span>
        </div>
        <button class="add-craving-win-btn craving-win-btn" data-id="${id}" title="Marcar que resisti!">+</button>
      `;
      cravingsListEl.appendChild(li);
    }
  }

  function renderSavingsCharts() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyWins = cravingsData.filter(
      (win) => new Date(win.date) >= startOfWeek
    );
    updateChart(weeklySavingsChartEl, weeklyWins, "Semana");
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyWins = cravingsData.filter(
      (win) => new Date(win.date) >= startOfMonth
    );
    updateChart(monthlySavingsChartEl, monthlyWins, "Mês");
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const yearlyWins = cravingsData.filter(
      (win) => new Date(win.date) >= startOfYear
    );
    updateChart(yearlySavingsChartEl, yearlyWins, "Ano");
  }

  function updateChart(chartEl, wins, period) {
    const savings = {};
    let maxSaving = 0;
    for (const id in CRAVINGS_CONFIG) savings[id] = 0;
    wins.forEach((win) => {
      if (CRAVINGS_CONFIG[win.item])
        savings[win.item] += CRAVINGS_CONFIG[win.item].price;
    });
    for (const id in savings)
      if (savings[id] > maxSaving) maxSaving = savings[id];
    maxSaving = maxSaving > 20 ? maxSaving : 20;
    chartEl.innerHTML = "";
    for (const [id, config] of Object.entries(CRAVINGS_CONFIG)) {
      const value = savings[id];
      const barHeight = (value / maxSaving) * 100;
      const group = document.createElement("div");
      group.className = "chart-bar-group";
      group.innerHTML = `<div class="bar-value">R$${value.toFixed(
        2
      )}</div><div class="chart-bar" style="height: ${barHeight}%; background-color: ${
        config.color
      };"></div><div class="bar-label">${config.name}</div>`;
      chartEl.appendChild(group);
    }
  }

  function handleCravingsPanelClick(e) {
    const addButton = e.target.closest(".add-craving-win-btn");
    const removeButton = e.target.closest(".remove-craving-win-btn");

    if (addButton) {
      const itemId = addButton.dataset.id;
      if (CRAVINGS_CONFIG[itemId]) {
        cravingsData.push({ item: itemId, date: new Date().toISOString() });
        saveData();
        renderSavingsCharts();
        showToast(
          `+ R$${CRAVINGS_CONFIG[itemId].price.toFixed(2)} economizados!`
        );
      }
    }

    if (removeButton) {
      const itemId = removeButton.dataset.id;
      // Encontra o índice da última ocorrência desse item no array
      const lastIndex = cravingsData.map((d) => d.item).lastIndexOf(itemId);

      if (lastIndex > -1) {
        const removedItem = cravingsData.splice(lastIndex, 1)[0];
        saveData();
        renderSavingsCharts();
        showToast(
          `- R$${CRAVINGS_CONFIG[removedItem.item].price.toFixed(2)} removido.`,
          "error"
        );
      } else {
        showToast("Nenhuma vitória para remover.", "error");
      }
    }
  }

  // --- RESTANTE DO SCRIPT.JS (LÓGICA DE HÁBITOS, HANDLERS, INIT) ---
  // Esta parte não foi alterada, então pode ser mantida como na versão anterior.
  // Colei aqui novamente por completude.

  function calculateAllHabitMetrics(habit, displayDate, todayDate) {
    const completions = habit.completions;
    const habitStartDate = parseLocalDateString(habit.startDate);
    if (habit.type === "good") {
      const sortedDates = Object.keys(completions).sort();
      let currentStreak = 0,
        bestStreak = 0,
        tempStreak = 0;
      if (sortedDates.length > 0) {
        for (let i = 0; i < sortedDates.length; i++) {
          tempStreak++;
          if (i + 1 < sortedDates.length) {
            const currentDate = parseLocalDateString(sortedDates[i]);
            const nextDate = parseLocalDateString(sortedDates[i + 1]);
            const diffDays = (nextDate - currentDate) / 864e5;
            if (diffDays > 1) {
              bestStreak = Math.max(bestStreak, tempStreak);
              tempStreak = 0;
            }
          }
        }
        bestStreak = Math.max(bestStreak, tempStreak);
        let checkDate = new Date(todayDate);
        if (completions[getLocalDateString(checkDate)]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          while (completions[getLocalDateString(checkDate)]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
          if (completions[getLocalDateString(checkDate)]) {
            let streakEndedYesterday = 0;
            while (completions[getLocalDateString(checkDate)]) {
              streakEndedYesterday++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
            bestStreak = Math.max(bestStreak, streakEndedYesterday);
          }
        }
      }
      bestStreak = Math.max(bestStreak, currentStreak);
      const month = displayDate.getMonth(),
        year = displayDate.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let activeDaysInMonth = 0,
        completedDaysInMonth = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date >= habitStartDate && date <= todayDate) {
          activeDaysInMonth++;
          if (completions[getLocalDateString(date)]) completedDaysInMonth++;
        }
      }
      const monthlySuccessRate =
        activeDaysInMonth > 0
          ? Math.round((completedDaysInMonth / activeDaysInMonth) * 100)
          : 0;
      return { currentStreak, bestStreak, monthlySuccessRate };
    } else {
      let currentStreak = 0,
        bestStreak = 0,
        tempStreak = 0;
      let checkDate = new Date(todayDate);
      while (
        checkDate >= habitStartDate &&
        !completions[getLocalDateString(checkDate)]
      ) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      for (
        let d = new Date(habitStartDate);
        d <= todayDate;
        d.setDate(d.getDate() + 1)
      ) {
        if (!completions[getLocalDateString(d)]) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      const month = displayDate.getMonth(),
        year = displayDate.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let activeDaysInMonth = 0,
        failedDaysInMonth = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date >= habitStartDate && date <= todayDate) {
          activeDaysInMonth++;
          if (completions[getLocalDateString(date)]) failedDaysInMonth++;
        }
      }
      const cleanDaysInMonth = activeDaysInMonth - failedDaysInMonth;
      const monthlySuccessRate =
        activeDaysInMonth > 0
          ? Math.round((cleanDaysInMonth / activeDaysInMonth) * 100)
          : 100;
      return { currentStreak, bestStreak, monthlySuccessRate };
    }
  }
  function render() {
    renderGrid();
    updateStats();
    renderCravingsPanel();
    renderSavingsCharts();
  }
  function renderGrid() {
    const currentYear = displayDate.getFullYear(),
      currentMonth = displayDate.getMonth();
    gridHeader.innerHTML = "";
    gridBody.innerHTML = "";
    if (habits.length === 0) {
      gridBody.innerHTML = `<div class="grid-empty-message">Clique em "+" para adicionar seu primeiro hábito.</div>`;
      return;
    }
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const gridTemplateColumns = `320px repeat(${daysInMonth}, 45px)`;
    gridHeader.style.gridTemplateColumns = gridTemplateColumns;
    let headerHTML = '<div class="habit-header">Hábito</div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .toUpperCase()
        .slice(0, 3);
      headerHTML += `<div class="header-cell"><div class="day-number">${day}</div><div class="day-of-week">${dayOfWeek}</div></div>`;
    }
    gridHeader.innerHTML = headerHTML;
    const gridBodyFragment = document.createDocumentFragment();
    habits.forEach((habit, index) => {
      const row = document.createElement("div");
      row.className = "grid-row";
      row.style.gridTemplateColumns = gridTemplateColumns;
      row.dataset.id = habit.id;
      const nameCell = document.createElement("div");
      nameCell.className = "habit-name-cell";
      nameCell.title = "Clique duplo para editar";
      const metrics = calculateAllHabitMetrics(habit, displayDate, todayDate);
      const isGoodHabit = habit.type === "good";
      const seqTitle = isGoodHabit
        ? "Sequência atual de dias concluídos"
        : "Sequência atual de dias limpos";
      const recTitle = isGoodHabit
        ? "Recorde de dias concluídos em sequência"
        : "Recorde de dias limpos em sequência";
      const successTitle = isGoodHabit
        ? "Taxa de sucesso no mês atual"
        : "Taxa de dias limpos no mês atual";
      nameCell.innerHTML = `<div class="habit-info"><div class="name">${
        habit.name
      }</div><div class="goal">${
        habit.goal || "&nbsp;"
      }</div><div class="habit-metrics"><span title="${seqTitle}">Seq: ${
        metrics.currentStreak
      }</span><span title="${recTitle}">Rec: ${
        metrics.bestStreak
      }</span><span title="${successTitle}">% Mês: ${
        metrics.monthlySuccessRate
      }</span></div></div><button class="delete-habit-btn" aria-label="Remover hábito ${
        habit.name
      }"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
      row.appendChild(nameCell);
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        const dateStr = getLocalDateString(date);
        const startDate = parseLocalDateString(habit.startDate);
        const daySquare = document.createElement("button");
        const classes = ["day-square"];
        let isDisabled = true;
        if (date.getTime() === todayDate.getTime()) classes.push("today");
        if (date >= startDate && date <= todayDate) {
          classes.push("active");
          isDisabled = false;
        } else if (date > todayDate) {
          classes.push("future");
        }
        if (habit.completions[dateStr]) {
          classes.push(habit.type === "good" ? "completed" : "failed");
        }
        daySquare.className = classes.join(" ");
        daySquare.dataset.date = dateStr;
        const ariaLabel =
          habit.type === "good"
            ? `Marcar hábito '${habit.name}' no dia ${day}`
            : `Marcar recaída do hábito '${habit.name}' no dia ${day}`;
        daySquare.setAttribute("aria-label", ariaLabel);
        daySquare.disabled = isDisabled;
        row.appendChild(daySquare);
      }
      gridBodyFragment.appendChild(row);
      setTimeout(() => {
        row.classList.add("visible");
      }, index * 50);
    });
    gridBody.appendChild(gridBodyFragment);
    scrollToToday();
  }
  function updateStats() {
    const year = displayDate.getFullYear(),
      month = displayDate.getMonth();
    currentMonthTitle.textContent = new Date(year, month)
      .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());
    const activeHabits = habits.filter(
      (h) => parseLocalDateString(h.startDate) <= todayDate
    );
    const scheduledHabits = habits.length - activeHabits.length;
    activeHabitsCountEl.textContent = `✓ ${activeHabits.length} ativos`;
    scheduledHabitsCountEl.textContent = `◷ ${scheduledHabits} agendados`;
    let totalPossibleCompletions = 0,
      totalActualCompletions = 0;
    habits
      .filter((h) => h.type === "good")
      .forEach((habit) => {
        const startDate = parseLocalDateString(habit.startDate);
        for (
          let d = new Date(startDate);
          d <= todayDate;
          d.setDate(d.getDate() + 1)
        ) {
          totalPossibleCompletions++;
          if (habit.completions[getLocalDateString(d)])
            totalActualCompletions++;
        }
      });
    const percentage =
      totalPossibleCompletions > 0
        ? (totalActualCompletions / totalPossibleCompletions) * 100
        : 0;
    progressText.textContent = `${Math.round(percentage)}%`;
    if (progressRing && progressRing.r) {
      const radius = progressRing.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
      progressRing.style.strokeDashoffset =
        circumference - (percentage / 100) * circumference;
    }
  }
  function scrollToToday() {
    if (
      !(
        displayDate.getFullYear() === todayDate.getFullYear() &&
        displayDate.getMonth() === todayDate.getMonth()
      )
    )
      return;
    const gridContainer = document.getElementById("habit-grid");
    const todayCell = gridContainer.querySelector(".day-square.today");
    if (gridContainer && todayCell) {
      const containerWidth = gridContainer.clientWidth;
      const cellLeft = todayCell.offsetLeft;
      const cellWidth = todayCell.offsetWidth;
      const scrollTarget = cellLeft - containerWidth / 2 + cellWidth / 2;
      setTimeout(() => {
        gridContainer.scrollTo({ left: scrollTarget, behavior: "smooth" });
      }, 100);
    }
  }
  function openModal(habitToEdit = null) {
    addHabitForm.reset();
    if (habitToEdit) {
      modalTitle.textContent = "Editar Hábito";
      formSubmitBtn.textContent = "Salvar Alterações";
      habitIdInput.value = habitToEdit.id;
      habitNameInput.value = habitToEdit.name;
      habitGoalInput.value = habitToEdit.goal;
      habitTypeInput.value = habitToEdit.type;
      habitStartDateInput.value = habitToEdit.startDate;
    } else {
      modalTitle.textContent = "Adicionar Novo Hábito";
      formSubmitBtn.textContent = "Adicionar";
      habitIdInput.value = "";
      habitStartDateInput.value = getLocalDateString(todayDate);
    }
    addHabitModal.classList.add("visible");
    habitNameInput.focus();
  }
  function closeModal(modal) {
    modal.classList.remove("visible");
  }
  function showWarningModal() {
    const activeHabits = habits.filter(
      (h) => parseLocalDateString(h.startDate) <= todayDate
    );
    if (activeHabits.length === 0) {
      openModal();
      return;
    }
    const mostRecentHabit = activeHabits.sort(
      (a, b) =>
        parseLocalDateString(b.startDate) - parseLocalDateString(a.startDate)
    )[0];
    const daysSinceStart = Math.floor(
      (todayDate - parseLocalDateString(mostRecentHabit.startDate)) / 864e5
    );
    if (daysSinceStart < FOCUS_PERIOD_DAYS) {
      const daysRemaining = FOCUS_PERIOD_DAYS - daysSinceStart;
      document.getElementById(
        "warning-text"
      ).textContent = `O último hábito ("${mostRecentHabit.name}") tem ${daysSinceStart} dias. Recomendado aguardar mais ${daysRemaining} dias.`;
      warningModal.classList.add("visible");
    } else {
      openModal();
    }
  }
  function showConfirmModal(title, text, onConfirm) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-text").textContent = text;
    confirmModal.classList.add("visible");
    const okBtn = document.getElementById("confirm-ok-btn");
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    newOkBtn.addEventListener("click", () => {
      onConfirm();
      closeModal(confirmModal);
    });
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    const habitData = {
      name: habitNameInput.value.trim(),
      goal: habitGoalInput.value.trim(),
      type: habitTypeInput.value,
      startDate: habitStartDateInput.value,
    };
    const id = habitIdInput.value;
    const isEditing = !!id;
    if (isEditing) {
      const existingHabit = habits.find((h) => h.id === id);
      if (existingHabit) Object.assign(existingHabit, habitData);
    } else {
      habits.push({ id: `habit-${Date.now()}`, completions: {}, ...habitData });
    }
    saveData();
    render();
    closeModal(addHabitModal);
    showToast(
      isEditing ? "Hábito atualizado com sucesso!" : "Novo hábito adicionado!"
    );
  }
  function handleGridClick(e) {
    const square = e.target.closest(".day-square:not(:disabled)");
    if (!square) return;
    const habitRow = square.closest(".grid-row");
    const habitId = habitRow.dataset.id;
    const habit = habits.find((h) => h.id === habitId);
    const dateStr = square.dataset.date;
    if (habit) {
      if (habit.completions[dateStr]) {
        delete habit.completions[dateStr];
        square.classList.remove("completed", "failed");
      } else {
        habit.completions[dateStr] = true;
        square.classList.add(habit.type === "good" ? "completed" : "failed");
      }
      saveData();
      const metrics = calculateAllHabitMetrics(habit, displayDate, todayDate);
      const metricsEl = habitRow.querySelector(".habit-metrics");
      if (metricsEl) {
        const isGoodHabit = habit.type === "good";
        const seqTitle = isGoodHabit
          ? "Sequência atual de dias concluídos"
          : "Sequência atual de dias limpos";
        const recTitle = isGoodHabit
          ? "Recorde de dias concluídos em sequência"
          : "Recorde de dias limpos em sequência";
        const successTitle = isGoodHabit
          ? "Taxa de sucesso no mês atual"
          : "Taxa de dias limpos no mês atual";
        metricsEl.innerHTML = `<span title="${seqTitle}">Seq: ${metrics.currentStreak}</span><span title="${recTitle}">Rec: ${metrics.bestStreak}</span><span title="${successTitle}">% Mês: ${metrics.monthlySuccessRate}</span>`;
      }
      updateStats();
    }
  }
  function handleMonthChange(offset) {
    displayDate.setMonth(displayDate.getMonth() + offset);
    render();
  }
  function handleExportData() {
    if (habits.length === 0 && cravingsData.length === 0) {
      showToast("Não há dados para exportar.", "error");
      return;
    }
    const dataStr = JSON.stringify({ habits, cravingsData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const date = getLocalDateString(new Date()).replace(/-/g, "");
    link.download = `habittracker_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Backup dos dados iniciado.");
  }
  function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);
        const sanitizedHabits = Array.isArray(importedData.habits)
          ? importedData.habits
              .map(validateAndSanitizeHabit)
              .filter((h) => h !== null)
          : [];
        const sanitizedCravings = Array.isArray(importedData.cravingsData)
          ? importedData.cravingsData
          : [];
        showConfirmModal(
          "Importar Dados",
          `Arquivo contém ${sanitizedHabits.length} hábitos e ${sanitizedCravings.length} registros de economia. Isto substituirá todos os dados atuais. Continuar?`,
          () => {
            habits = sanitizedHabits;
            cravingsData = sanitizedCravings;
            saveData();
            render();
            showToast("Dados importados com sucesso!");
          }
        );
      } catch (error) {
        showToast("Erro ao ler o arquivo. Formato inválido.", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }
  function handleDeleteHabitClick(e) {
    const deleteBtn = e.target.closest(".delete-habit-btn");
    if (!deleteBtn) return;
    const habitId = deleteBtn.closest(".grid-row").dataset.id;
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      showConfirmModal(
        "Remover Hábito",
        `Tem certeza que deseja remover o hábito "${habit.name}"? Esta ação não pode ser desfeita.`,
        () => {
          habits = habits.filter((h) => h.id !== habitId);
          saveData();
          render();
          showToast("Hábito removido com sucesso.");
        }
      );
    }
  }
  function handleHabitDoubleClick(e) {
    const infoCell = e.target.closest(".habit-info");
    if (!infoCell) return;
    const habitId = infoCell.closest(".grid-row").dataset.id;
    const habit = habits.find((h) => h.id === habitId);
    if (habit) openModal(habit);
  }
  function init() {
    loadData();
    addHabitBtn.addEventListener("click", showWarningModal);
    clearAllBtn.addEventListener("click", () =>
      showConfirmModal(
        "Limpar Todos os Dados",
        "Tem certeza que deseja apagar TODOS os seus dados? Esta ação não pode ser desfeita.",
        () => {
          habits = [];
          cravingsData = [];
          saveData();
          render();
          showToast("Todos os dados foram removidos.");
        }
      )
    );
    addHabitForm.addEventListener("submit", handleFormSubmit);
    cancelBtn.addEventListener("click", () => closeModal(addHabitModal));
    waitRecommendedBtn.addEventListener("click", () =>
      closeModal(warningModal)
    );
    addAnywayBtn.addEventListener("click", () => {
      closeModal(warningModal);
      openModal();
    });
    confirmCancelBtn.addEventListener("click", () => closeModal(confirmModal));
    gridBody.addEventListener("click", (e) => {
      if (e.target.closest(".delete-habit-btn")) {
        handleDeleteHabitClick(e);
      } else {
        handleGridClick(e);
      }
    });
    gridBody.addEventListener("dblclick", handleHabitDoubleClick);
    prevMonthBtn.addEventListener("click", () => handleMonthChange(-1));
    nextMonthBtn.addEventListener("click", () => handleMonthChange(1));
    exportBtn.addEventListener("click", handleExportData);
    importBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", handleImportData);
    cravingsListEl.addEventListener("click", handleCravingsPanelClick);
    window.addEventListener("click", (e) => {
      [addHabitModal, warningModal, confirmModal].forEach((modal) => {
        if (e.target === modal) closeModal(modal);
      });
    });
    render();
    scheduleNextDailyRefresh();
  }
  function refreshToday() {
    todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    render();
    scheduleNextDailyRefresh();
  }
  function scheduleNextDailyRefresh() {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const msUntilMidnight = tomorrow - now;
    setTimeout(refreshToday, msUntilMidnight + 1000);
  }

  init();
});
