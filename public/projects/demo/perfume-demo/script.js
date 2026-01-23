function addToCart() {
    const btn = document.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "ADDING...";
    btn.style.backgroundColor = "#bfa480"; // Gold color
    
    setTimeout(() => {
        alert("Success: 'Midnight Syntax' added to your cart.");
        btn.innerText = "IN BAG";
    }, 800);
}