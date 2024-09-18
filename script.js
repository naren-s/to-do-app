// Make tasks array global
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.querySelector('.toast-body');

    // Show toast with custom animation and reduced timer
    function showToast(message) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastEl);

        toast.show();

        // Add class to trigger bounce-in-right animation
        toastEl.classList.add('show');

        // Hide after 3 seconds with bounce-out-left animation
        setTimeout(() => {
            toastEl.classList.remove('show');
            toastEl.classList.add('hide');
            setTimeout(() => {
                toastEl.classList.remove('hide');
                toast.hide();
            }, 500); // Duration of bounce-out-left animation
        }, 3000); // Timer for toast visibility
    }

    // Save Tasks to LocalStorage
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Delete Task
    window.deleteTask = function (index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        showToast("Task deleted successfully");
    };

    // Edit Task
    window.editTask = function (index) {
        const task = tasks[index];
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDate").value = task.date;
        document.getElementById("taskTime").value = task.time;
        document.getElementById("taskStatus").value = task.status;
        tasks.splice(index, 1); // Remove task from list for editing
        saveTasks();
        renderTasks();
    };

    // Update Task Status
    function updateTaskStatus(index, status) {
        tasks[index].status = status;
        saveTasks();
        renderTasks();
        showToast(`Task status changed to ${status}`);
    }

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const card = document.createElement("div");
            card.className = `card task-card shadow-sm ${task.status}`;
            const timeLeft = task.status === "in-progress" ? getTimeLeft(task) : "";

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">Due: ${formatDate(task.date, task.time)}</p>
                    <p class="card-text">Status: ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</p>
                    ${task.status === "in-progress" ? `<p class="text-danger">Time Left: <span id="time-${index}">${timeLeft}</span></p>` : ""}
                    <div class="mb-2">
                        <select class="form-select" id="status-${index}">
                            <option value="scheduled" ${task.status === "scheduled" ? "selected" : ""}>Scheduled</option>
                            <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In-Progress</option>
                            <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-danger btn-sm" onclick="deleteTask(${index})">Delete</button>
                    <button class="btn btn-warning btn-sm" onclick="editTask(${index})">Edit</button>
                </div>
                ${task.status === "in-progress" ? `<div class="progress-color" id="progress-${index}" style="width: 100%;"></div>` : ""}
            `;
            taskList.appendChild(card);

            // Update task status on change
            const statusSelect = document.getElementById(`status-${index}`);
            statusSelect.addEventListener("change", () => updateTaskStatus(index, statusSelect.value));

            // Handle progress color and countdown for in-progress tasks
            if (task.status === "in-progress") {
                updateTaskCountdown(index);
            }
        });
    }

    // Update the countdown for a specific task
    function updateTaskCountdown(index) {
        const task = tasks[index];
        const timeElement = document.getElementById(`time-${index}`);
        const progressBar = document.getElementById(`progress-${index}`);
        
        const intervalId = setInterval(() => {
            const timeLeftInSeconds = getTimeLeftInSeconds(task);
            if (timeLeftInSeconds <= 0) {
                clearInterval(intervalId);
                updateTaskStatus(index, "completed");
                return;
            }
            
            const timeLeft = getTimeLeft(task);
            timeElement.textContent = timeLeft;
            progressBar.style.width = (100 - (timeLeftInSeconds / getTotalTime(task) * 100)) + "%";
        }, 1000);
    }

    // Helper functions for time
    function getTimeLeft(task) {
        const now = new Date();
        const target = new Date(`${task.date}T${task.time}`);
        const diff = target - now;

        if (diff <= 0) {
            return '0h 0m 0s';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    function getTotalTime(task) {
        const now = new Date();
        const target = new Date(`${task.date}T${task.time}`);
        return Math.max((target - now) / 1000, 0); // Ensure it doesn't return negative values
    }

    function getTimeLeftInSeconds(task) {
        const target = new Date(`${task.date}T${task.time}`);
        return Math.max((target - new Date()) / 1000, 0); // Ensure it doesn't return negative values
    }

    function formatDate(date, time) {
        const [year, month, day] = date.split("-");
        const [hour, minute] = time.split(":");
        const dateObj = new Date(year, month - 1, day, hour, minute);
        return dateObj.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    }

    // Add new task
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value;
        const date = document.getElementById("taskDate").value;
        const time = document.getElementById("taskTime").value;
        const status = document.getElementById("taskStatus").value;

        const newTask = { title, date, time, status };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        showToast("Task added successfully!");

        taskForm.reset();
    });

    renderTasks();
});
