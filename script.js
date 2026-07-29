const habitForm = document.getElementById("habit-form");
const habitInput = document.getElementById("habit-input");
const habitList = document.getElementById("habit-list");
const emptyMessage = document.getElementById("empty-message");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const progressBar = document.querySelector(".progress-bar");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

let habits = loadHabits();
let editingHabitId = null;

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function loadHabits() {
    try {
        const savedHabits = localStorage.getItem("habits");
        const parsedHabits = savedHabits ? JSON.parse(savedHabits) : [];

        return parsedHabits.map((habit) => ({
            id: habit.id,
            name: habit.name,
            completedDates: Array.isArray(habit.completedDates)
                ? habit.completedDates
                : habit.completed
                    ? [getLocalDateString()]
                    : []
        }));
    } catch (error) {
        console.error("Could not load habits:", error);
        return [];
    }
}

function saveHabits() {
    try {
        localStorage.setItem("habits", JSON.stringify(habits));
    } catch (error) {
        console.error("Could not save habits:", error);
    }
}

function isCompletedToday(habit) {
    const today = getLocalDateString();
    return habit.completedDates.includes(today);
}

function calculateStreak(habit) {
    const completedDates = new Set(habit.completedDates);

    if (completedDates.size === 0) {
        return 0;
    }

    const currentDate = new Date();
    const today = getLocalDateString(currentDate);

    if (!completedDates.has(today)) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    let streak = 0;

    while (completedDates.has(getLocalDateString(currentDate))) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

function renderHabits() {
    habitList.innerHTML = "";

    habits.forEach((habit) => {
        const listItem = document.createElement("li");
        listItem.className = "habit-item";

        if (isCompletedToday(habit)) {
            listItem.classList.add("completed");
        }

        const completeButton = createCompleteButton(habit);
        const habitContent = createHabitContent(habit);
        const habitActions = createHabitActions(habit);

        listItem.append(
            completeButton,
            habitContent,
            habitActions
        );

        habitList.appendChild(listItem);
    });

    updateProgress();
    emptyMessage.classList.toggle("hidden", habits.length > 0);
}

function createCompleteButton(habit) {
    const completeButton = document.createElement("button");

    completeButton.className = "complete-button";
    completeButton.type = "button";

    const completedToday = isCompletedToday(habit);

    completeButton.setAttribute(
        "aria-label",
        completedToday
            ? `Mark ${habit.name} incomplete`
            : `Mark ${habit.name} complete`
    );

    completeButton.addEventListener("click", () => {
        toggleHabit(habit.id);
    });

    return completeButton;
}

function createHabitContent(habit) {
    const habitContent = document.createElement("div");
    habitContent.className = "habit-content";

    if (editingHabitId === habit.id) {
        const editInput = document.createElement("input");

        editInput.className = "edit-input";
        editInput.type = "text";
        editInput.value = habit.name;
        editInput.maxLength = 50;
        editInput.setAttribute(
            "aria-label",
            `Edit ${habit.name}`
        );

        editInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                saveEditedHabit(habit.id, editInput.value);
            }

            if (event.key === "Escape") {
                cancelEditing();
            }
        });

        habitContent.appendChild(editInput);

        setTimeout(() => {
            editInput.focus();
            editInput.select();
        }, 0);
    } else {
        const habitName = document.createElement("span");
        habitName.className = "habit-name";
        habitName.textContent = habit.name;

        const streak = document.createElement("span");
        streak.className = "streak";

        const streakCount = calculateStreak(habit);
        streak.textContent = `🔥 ${streakCount} day streak`;

        habitContent.append(habitName, streak);
    }

    return habitContent;
}

function createHabitActions(habit) {
    const habitActions = document.createElement("div");
    habitActions.className = "habit-actions";

    if (editingHabitId === habit.id) {
        const editInput = () =>
            habitActions
                .closest(".habit-item")
                .querySelector(".edit-input");

        const saveButton = document.createElement("button");
        saveButton.className = "save-button";
        saveButton.type = "button";
        saveButton.textContent = "Save";

        saveButton.addEventListener("click", () => {
            const input = editInput();

            if (input) {
                saveEditedHabit(habit.id, input.value);
            }
        });

        const cancelButton = document.createElement("button");
        cancelButton.className = "cancel-button";
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";

        cancelButton.addEventListener("click", cancelEditing);

        habitActions.append(saveButton, cancelButton);
    } else {
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            startEditing(habit.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteHabit(habit.id);
        });

        habitActions.append(editButton, deleteButton);
    }

    return habitActions;
}

function addHabit(name) {
    const newHabit = {
        id: createHabitId(),
        name,
        completedDates: []
    };

    habits.push(newHabit);
    saveHabits();
    renderHabits();
}

function createHabitId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toggleHabit(id) {
    const today = getLocalDateString();

    habits = habits.map((habit) => {
        if (habit.id !== id) {
            return habit;
        }

        const completedDates = new Set(habit.completedDates);

        if (completedDates.has(today)) {
            completedDates.delete(today);
        } else {
            completedDates.add(today);
        }

        return {
            ...habit,
            completedDates: Array.from(completedDates)
        };
    });

    saveHabits();
    renderHabits();
}

function startEditing(id) {
    editingHabitId = id;
    renderHabits();
}

function saveEditedHabit(id, updatedName) {
    const cleanName = updatedName.trim();

    if (!cleanName) {
        return;
    }

    habits = habits.map((habit) =>
        habit.id === id
            ? {
                ...habit,
                name: cleanName
            }
            : habit
    );

    editingHabitId = null;
    saveHabits();
    renderHabits();
}

function cancelEditing() {
    editingHabitId = null;
    renderHabits();
}

function deleteHabit(id) {
    habits = habits.filter((habit) => habit.id !== id);

    if (editingHabitId === id) {
        editingHabitId = null;
    }

    saveHabits();
    renderHabits();
}

function updateProgress() {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(isCompletedToday).length;

    progressText.textContent =
        `${completedHabits} of ${totalHabits} completed`;

    const percentage =
        totalHabits === 0
            ? 0
            : Math.round((completedHabits / totalHabits) * 100);

    progressFill.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    const shouldUseDarkMode =
        savedTheme === "dark" ||
        (!savedTheme && prefersDarkMode);

    document.body.classList.toggle(
        "dark-mode",
        shouldUseDarkMode
    );

    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    localStorage.setItem("theme", theme);
    updateThemeButton();
}

function updateThemeButton() {
    const darkModeEnabled =
        document.body.classList.contains("dark-mode");

    themeIcon.textContent = darkModeEnabled ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        darkModeEnabled
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}

habitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const habitName = habitInput.value.trim();

    if (!habitName) {
        return;
    }

    addHabit(habitName);

    habitInput.value = "";
    habitInput.focus();
});

themeToggle.addEventListener("click", toggleTheme);

loadTheme();
renderHabits();