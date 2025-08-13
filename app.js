let count = 0;
const countEl = document.getElementById('count');

document.getElementById('increment').addEventListener('click', () => {
    count++;
    updateCount();
});

document.getElementById('decrement').addEventListener('click', () => {
    count--;
    updateCount();
});

document.getElementById('reset').addEventListener('click', () => {
    count = 0;
    updateCount();
});

function updateCount() {
    countEl.textContent = count;
    countEl.style.color = count > 0 ? '#4CAF50' : count < 0 ? '#f44336' : '#333';
}
