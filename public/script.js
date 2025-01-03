// Selectors
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const taskTitle = document.getElementById("taskTitle");
const stopwatchDisplay = document.getElementById("stopwatch");
const emojiPickerButton = document.getElementById("emojiPicker");
const emojiDropdown = document.getElementById("emojiPickerDropdown");
const logContainer = document.getElementById("timeLog");

let timerInterval = null;
let startTime = null;
let selectedEmoji = null;

// Emoji list
const emojiList = ["😀", "🎉", "✅", "🔥", "🌟", "💻", "📚", "📝", "⚡", "🕒"];

// Format time
function formatTime(ms) {
    const milliseconds = String(ms % 1000).padStart(3, "0");
    const seconds = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
    const minutes = String(Math.floor(ms / (60 * 1000)) % 60).padStart(2, "0");
    const hours = String(Math.floor(ms / (60 * 60 * 1000))).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Add log
function addLog(message) {
    const logItem = document.createElement("p");
    logItem.textContent = message;
    logContainer.prepend(logItem);

    if (logContainer.children.length > 5) {
        logContainer.lastChild.remove();
    }
}

// Populate emoji dropdown
emojiList.forEach((emoji) => {
    const button = document.createElement("button");
    button.textContent = emoji;
    button.addEventListener("click", () => {
        selectedEmoji = emoji;
        emojiPickerButton.textContent = emoji;
        emojiDropdown.classList.add("hidden");
    });
    emojiDropdown.appendChild(button);
});

// Toggle emoji dropdown
emojiPickerButton.addEventListener("click", () => {
    emojiDropdown.classList.toggle("hidden");
});

// Start timer
startBtn.addEventListener("click", () => {
    if (taskTitle.value.trim() === "") {
        alert("Please enter a task title.");
        return;
    }

    startTime = Date.now();
    stopwatchDisplay.textContent = "00:00:00.000";

    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        stopwatchDisplay.textContent = formatTime(elapsedTime);
    }, 10);

    addLog(`Started task: "${taskTitle.value}"`);
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

// Stop timer
stopBtn.addEventListener("click", async () => {
    clearInterval(timerInterval);

    const task = taskTitle.value.trim();
    const stopTime = Date.now();

    addLog(`Stopped task: "${task}"`);
    await saveTaskToBackend(task, startTime, stopTime);

    taskTitle.value = "";
    stopwatchDisplay.textContent = "00:00:00.000";
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

// Save to backend
async function saveTaskToBackend(task, startTime, stopTime) {
    const backendUrl = "https://notion-time-ovm1k44cb-mijnap1s-projects.vercel.app/"; // Replace with your actual backend URL

    try {
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task, startTime, stopTime }),
        });

        if (response.ok) {
            console.log("Task saved successfully.");
        } else {
            const errorDetails = await response.json();
            console.error("Failed to save task:", errorDetails);
        }
    } catch (error) {
        console.error("Error saving task:", error);
    }
}
