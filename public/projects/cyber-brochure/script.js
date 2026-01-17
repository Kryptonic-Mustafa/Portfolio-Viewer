function explore() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

const buttons = document.querySelectorAll('.buy-btn');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Simple visual feedback
        const originalText = btn.innerText;
        btn.innerText = "PROCESSING...";
        btn.style.background = "#00ff88";
        btn.style.color = "#000";
        
        setTimeout(() => {
            alert("Item added to cart! (Demo)");
            btn.innerText = "ACQUIRED";
        }, 500);
    });
});

console.log("Cyber Brochure Loaded Successfully");