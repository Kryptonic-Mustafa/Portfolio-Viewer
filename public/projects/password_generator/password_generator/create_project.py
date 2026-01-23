import os

# Define the folder name
project_name = "password_generator"

# --- 1. HTML CONTENT ---
html_code = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Password Generator</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

    <div class="container">
        <h2>Password Generator</h2>
        
        <div class="result-container">
            <span id="result"></span>
            <button class="btn" id="clipboard">
                <i class="far fa-clipboard"></i>
            </button>
        </div>

        <div class="settings">
            <div class="setting">
                <label>Password Length</label>
                <input type="number" id="length" min="4" max="20" value="12">
            </div>
            <div class="setting">
                <label>Include Uppercase Letters</label>
                <input type="checkbox" id="uppercase" checked>
            </div>
            <div class="setting">
                <label>Include Lowercase Letters</label>
                <input type="checkbox" id="lowercase" checked>
            </div>
            <div class="setting">
                <label>Include Numbers</label>
                <input type="checkbox" id="numbers" checked>
            </div>
            <div class="setting">
                <label>Include Symbols</label>
                <input type="checkbox" id="symbols" checked>
            </div>
        </div>

        <button class="btn btn-large" id="generate">
            Generate Password
        </button>
    </div>

    <script src="script.js"></script>
</body>
</html>
"""

# --- 2. CSS CONTENT ---
css_code = """@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

* {
    box-sizing: border-box;
}

body {
    background-color: #3b3b98;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
}

.container {
    background-color: #23235b;
    box-shadow: 0px 2px 10px rgba(255, 255, 255, 0.2);
    padding: 20px;
    width: 350px;
    max-width: 100%;
}

h2 {
    margin: 10px 0 20px;
    text-align: center;
}

.result-container {
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    font-size: 18px;
    letter-spacing: 1px;
    padding: 12px 10px;
    height: 50px;
    width: 100%;
}

.result-container #result {
    word-wrap: break-word;
    max-width: calc(100% - 40px);
}

.result-container .btn {
    font-size: 20px;
    position: absolute;
    top: 5px;
    right: 5px;
    height: 40px;
    width: 40px;
}

.btn {
    border: none;
    background-color: #3b3b98;
    color: #fff;
    font-size: 16px;
    padding: 8px 12px;
    cursor: pointer;
}

.btn-large {
    display: block;
    width: 100%;
    margin-top: 20px;
}

.setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
}
"""

# --- 3. JAVASCRIPT CONTENT ---
js_code = """const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateEl = document.getElementById('generate');
const clipboardEl = document.getElementById('clipboard');

const randomFunc = {
    lower: getRandomLower,
    upper: getRandomUpper,
    number: getRandomNumber,
    symbol: getRandomSymbol
};

clipboardEl.addEventListener('click', () => {
    const password = resultEl.innerText;
    if (!password) { return; }
    
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
});

generateEl.addEventListener('click', () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    resultEl.innerText = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
});

function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
    const typesCount = lower + upper + number + symbol;
    const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);
    
    if (typesCount === 0) {
        return '';
    }

    for (let i = 0; i < length; i += typesCount) {
        typesArr.forEach(type => {
            const funcName = Object.keys(type)[0];
            generatedPassword += randomFunc[funcName]();
        });
    }

    const finalPassword = generatedPassword.slice(0, length);
    return finalPassword;
}

function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
    const symbols = '!@#$%^&*(){}[]=<>/,.';
    return symbols[Math.floor(Math.random() * symbols.length)];
}
"""

# --- MAIN SCRIPT LOGIC ---
def create_project():
    # 1. Create Directory
    if not os.path.exists(project_name):
        os.makedirs(project_name)
        print(f"✅ Created folder: {project_name}")
    else:
        print(f"⚠️ Folder '{project_name}' already exists. Updating files...")

    # 2. Write HTML File
    with open(os.path.join(project_name, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_code)
        print(f"📄 Created: {project_name}/index.html")

    # 3. Write CSS File
    with open(os.path.join(project_name, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_code)
        print(f"🎨 Created: {project_name}/style.css")

    # 4. Write JS File
    with open(os.path.join(project_name, "script.js"), "w", encoding="utf-8") as f:
        f.write(js_code)
        print(f"⚡ Created: {project_name}/script.js")

    print("\n🚀 Project created successfully! You can now upload the 'password_generator' folder.")

if __name__ == "__main__":
    create_project()