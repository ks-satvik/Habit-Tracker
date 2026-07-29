const habitForm = document.getElementById("habit-form");
const habitInput = document.getElementById("habit-input");
const habitList = document.getElementById("habit-list");
const emptyMessage = document.getElementById("empty-message");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

let habits = loadHabits();

function loadHabits() {
    try {
        const savedHabits = localStorage.getItem("habits");
        return savedHabits ? JSON.parse(savedHabits) : [];
    } catch (error) {
        console.error("Could not load habits:", error);
        return [];
    }
}

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function renderHabits() {
    habitList.innerHTML = "";

    habits.forEach((habit) => {
        const listItem = document.createElement("li");
        listItem.className = "habit-item";

        if (habit.completed) {
            listItem.classList.add("completed");
        }

        const completeButton = document.createElement("button");
        completeButton.className = "complete-button";
        completeButton.type = "button";
        completeButton.setAttribute(
            "aria-label",
            habit.completed ? "Mark habit incomplete" : "Mark habit complete"
        );

        completeButton.addEventListener("click", () => {
            toggleHabit(habit.id);
        });

        const habitName = document.createElement("span");
        habitName.className = "habit-name";
        habitName.textContent = habit.name;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteHabit(habit.id);
        });

        listItem.append(completeButton, habitName, deleteButton);
        habitList.appendChild(listItem);
    });

    updateProgress();
    emptyMessage.classList.toggle("hidden", habits.length > 0);
}

function addHabit(name) {
    const newHabit = {
        id: crypto.randomUUID(),
        name,
        completed: false
    };

    habits.push(newHabit);
    saveHabits();
    renderHabits();
}

function toggleHabit(id) {
    habits = habits.map((habit) =>
        habit.id === id
            ? { ...habit, completed: !habit.completed }
            : habit
    );

    saveHabits();
    renderHabits();
}

function deleteHabit(id) {
    habits = habits.filter((habit) => habit.id !== id);

    saveHabits();
    renderHabits();
}

function updateProgress() {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(
        (habit) => habit.completed
    ).length;

    progressText.textContent =
        `${completedHabits} of ${totalHabits} completed`;

    const percentage =
        totalHabits === 0
            ? 0
            : (completedHabits / totalHabits) * 100;

    progressFill.style.width = `${percentage}%`;
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

renderHabits();