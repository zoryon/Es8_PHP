const RESULT_IMAGES = {
    black: "./assets/images/nero.gif",
    white: "./assets/images/bianco.gif"
};

function main() {
    const guessSlots = document.querySelectorAll(".guess-slot");
    const colorOptions = [
        "./assets/images/rosso.gif",
        "./assets/images/giallo.gif",
        "./assets/images/verde.gif",
        "./assets/images/blu.gif",
    ];

    function clearMenus() {
        document.querySelectorAll(".color-menu").forEach(menu => menu.remove());
    }

    function createColorMenu(slot) {
        clearMenus();
        
        const menu = document.createElement("div");
        menu.className = "color-menu absolute flex flex-col bg-white border-2 border-gray-300 z-50";
        
        const slotRect = slot.getBoundingClientRect();
        menu.style.top = `${slotRect.bottom + window.scrollY}px`;
        menu.style.left = `${slotRect.left + window.scrollX}px`;

        colorOptions.forEach(colorPath => {
            const colorOption = document.createElement("img");
            colorOption.src = colorPath;
            colorOption.className = `w-[${slotRect.right - slotRect.left - 4}px] h-[110px] cursor-pointer hover:border-2 hover:border-blue-500`;
            colorOption.addEventListener("click", () => {
                // Remove color from other slots
                Array.from(guessSlots).slice(0, -1).forEach(otherSlot => {
                    if (otherSlot !== slot) {
                        const img = otherSlot.querySelector("img");
                        if (img && img.src === colorPath) img.remove();
                    }
                });
                
                slot.innerHTML = "";
                const selectedColor = document.createElement("img");
                selectedColor.src = colorPath;
                slot.appendChild(selectedColor);
                clearMenus();
            });
            menu.appendChild(colorOption);
        });

        document.body.appendChild(menu);
    }

    // add click handlers to guess slots (excluding last one)
    guessSlots.forEach((slot, index) => {
        if (index === guessSlots.length - 1) return; // skip last slot
        
        slot.addEventListener("click", (e) => {
            createColorMenu(slot);
        });
    });

    // close menu when clicking outside
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.closest(".guess-slot") && !target.closest(".color-menu")) {
            clearMenus();
        }
    });

    // last slot should submit data
    const submitButton = document.querySelector(".guess-slot:last-child");
    submitButton.addEventListener("click", () => {
        const slots = Array.from(guessSlots).slice(0, -1);
        const allFilled = slots.every(slot => slot.querySelector("img") !== null);
        
        if (!allFilled) {
            alert("Please fill all slots before submitting!");
            return;
        }

        const guesses = slots.map(slot => {
            const img = slot.querySelector("img");
            return img ? img.src.split("/").pop().split(".")[0] : null;
        });

        fetch("./assets/php/game-logic.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: guesses }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.finished) {
                alert(data.message);
                window.location.reload();
            } else {
                updateAttemptsHistory(data.history);
            }
        })
    });

    function updateAttemptsHistory(history) {
        const historyDiv = document.getElementById("attempts-history");
        historyDiv.innerHTML = `<div class="text-xl font-bold mb-2">Attempt History</div>`;
        
        const table = document.createElement("table");
        table.className = "w-full border-collapse";
        
        history.forEach(entry => {
            const row = document.createElement("tr");
            row.className = "border-b";
            
            // Attempt Number
            const attemptCell = document.createElement("td");
            attemptCell.textContent = entry.attempt;
            attemptCell.className = "p-2 text-center";
            row.appendChild(attemptCell);

            // Guessed Colors
            entry.guess.forEach(color => {
                const colorCell = document.createElement("td");
                colorCell.className = "p-2 text-center";
                const img = document.createElement("img");
                img.src = `./assets/images/${color}.gif`;
                img.className = "w-8 h-8 mx-auto";
                colorCell.appendChild(img);
                row.appendChild(colorCell);
            });

            // feedback
            const feedbackCell = document.createElement("td");
            feedbackCell.className = "p-2 text-center";
            
            // black images
            for (let i = 0; i < entry.black; i++) {
                const result = document.createElement("img");
                result.src = RESULT_IMAGES.black;
                result.className = "w-4 h-4 inline-block mx-0.5";
                feedbackCell.appendChild(result);
            }
            
            // white images
            for (let i = 0; i < entry.white; i++) {
                const result = document.createElement("img");
                result.src = RESULT_IMAGES.white;
                result.className = "w-4 h-4 inline-block mx-0.5";
                feedbackCell.appendChild(result);
            }
            
            row.appendChild(feedbackCell);
            table.appendChild(row);
        });

        historyDiv.appendChild(table);
    }
}

document.addEventListener("DOMContentLoaded", main);