function main() {
    const guessSlots = document.querySelectorAll(".guess-slot");
    const colorOptions = [
        './assets/images/rosso.gif',
        './assets/images/giallo.gif',
        './assets/images/verde.gif',
        './assets/images/blu.gif',
    ];

    // remove existing color menus
    function clearMenus() {
        document.querySelectorAll('.color-menu').forEach(menu => menu.remove());
    }

    // create vertical menu
    function createColorMenu(slot) {
        clearMenus();
        
        const menu = document.createElement('div');
        menu.className = 'color-menu absolute flex flex-col bg-white border-2 border-gray-300 z-50';
        
        // position menu below the clicked slot
        const slotRect = slot.getBoundingClientRect();
        menu.style.top = `${slotRect.bottom + window.scrollY}px`;
        menu.style.left = `${slotRect.left + window.scrollX}px`;

        // add color options to menu
        colorOptions.forEach(colorPath => {
            const colorOption = document.createElement('img');
            colorOption.src = colorPath;
            colorOption.className = `w-[${slotRect.right - slotRect.left - 4}px] h-[110px] cursor-pointer hover:border-2 hover:border-blue-500`;
            colorOption.addEventListener('click', () => {
                slot.innerHTML = ''; // clear previous content
                const selectedColor = document.createElement('img');
                selectedColor.src = colorPath;
                selectedColor.className = '';
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
        
        slot.addEventListener('click', (e) => {
            createColorMenu(slot);
        });
    });

    // close menu when clicking outside
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.closest('.guess-slot') && !target.closest('.color-menu')) {
            clearMenus();
        }
    });
}

document.addEventListener('DOMContentLoaded', main);