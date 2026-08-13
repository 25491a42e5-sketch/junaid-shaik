let currentNumber = "";
let previousNumber = "";
let operator = null;
let shouldResetDisplay = false;
let stream = null;

/* =========================
   DOM ELEMENTS
========================= */

const display = document.getElementById("display");
const previousDisplay = document.getElementById("previous");
const historyList = document.getElementById("historyList");

const scientificBox = document.getElementById("scientificBox");

const cameraPreview = document.getElementById("cameraPreview");
const captureCanvas = document.getElementById("captureCanvas");
const cameraStatus = document.getElementById("cameraStatus");

const ocrInput = document.getElementById("ocrInput");
const ocrText = document.getElementById("ocrText");

const dateTimeEl = document.getElementById("dateTime");


/* =========================
   START APPLICATION
========================= */

window.addEventListener("load", function () {

    setTimeout(function () {

        const splash = document.getElementById("splash");
        const mainApp = document.getElementById("mainApp");

        if (splash) {
            splash.classList.add("hidden");
        }

        if (mainApp) {
            mainApp.classList.remove("hidden");
        }

    }, 1200);

    updateDateTime();
    setInterval(updateDateTime, 1000);

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );
});


/* =========================
   DATE AND TIME
========================= */

function updateDateTime() {

    if (!dateTimeEl) return;

    const now = new Date();

    dateTimeEl.textContent =
        now.toLocaleString();
}


/* =========================
   THEME
========================= */

function toggleTheme() {

    const current =
        document.documentElement.getAttribute("data-theme") || "dark";

    const next =
        current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute(
        "data-theme",
        next
    );

    localStorage.setItem("theme", next);
}


/* =========================
   TAB SWITCHING
========================= */

function showTab(tab) {

    const calcTab = document.getElementById("calcTab");
    const cameraTab = document.getElementById("cameraTab");

    const calculatorBtn = document.getElementById("calculatorBtn");
    const cameraBtn = document.getElementById("cameraBtn");

    if (!calcTab || !cameraTab) return;

    if (tab === "calc") {

        calcTab.classList.remove("hidden");
        cameraTab.classList.add("hidden");

        if (calculatorBtn) {
            calculatorBtn.classList.add("active");
        }

        if (cameraBtn) {
            cameraBtn.classList.remove("active");
        }

    } else {

        calcTab.classList.add("hidden");
        cameraTab.classList.remove("hidden");

        if (calculatorBtn) {
            calculatorBtn.classList.remove("active");
        }

        if (cameraBtn) {
            cameraBtn.classList.add("active");
        }
    }
}


/* =========================
   SCIENTIFIC MODE
========================= */

function toggleScientific() {

    if (scientificBox) {
        scientificBox.classList.toggle("show");
    }
}


/* =========================
   NUMBER INPUT
========================= */

function appendNumber(number) {

    if (shouldResetDisplay) {

        currentNumber = "";
        shouldResetDisplay = false;
    }

    if (currentNumber === "0") {

        currentNumber = number;

    } else {

        currentNumber += number;
    }

    updateDisplay();
    autoPreview();
}


/* =========================
   DECIMAL
========================= */

function appendDecimal() {

    if (shouldResetDisplay) {

        currentNumber = "";
        shouldResetDisplay = false;
    }

    if (!currentNumber.includes(".")) {

        if (currentNumber === "") {

            currentNumber = "0.";

        } else {

            currentNumber += ".";
        }
    }

    updateDisplay();
    autoPreview();
}


/* =========================
   OPERATOR
========================= */

function chooseOperator(selectedOperator) {

    if (
        currentNumber === "" &&
        previousNumber === ""
    ) {
        return;
    }

    if (
        operator !== null &&
        currentNumber !== ""
    ) {

        calculate();
    }

    operator = selectedOperator;

    previousNumber = currentNumber;

    currentNumber = "";

    previousDisplay.textContent =
        previousNumber +
        " " +
        getOperatorSymbol(operator);
}


/* =========================
   PREVIEW
========================= */

function autoPreview() {

    if (
        operator === null ||
        previousNumber === "" ||
        currentNumber === ""
    ) {
        return;
    }

    const first = parseFloat(previousNumber);
    const second = parseFloat(currentNumber);

    let result;

    switch (operator) {

        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":

            if (second === 0) {

                previousDisplay.textContent =
                    "Cannot divide by zero";

                return;
            }

            result = first / second;
            break;

        default:
            return;
    }

    result = Number(result.toFixed(10));

    previousDisplay.textContent =
        previousNumber +
        " " +
        getOperatorSymbol(operator) +
        " " +
        currentNumber +
        " =";

    display.textContent =
        result.toString();
}


/* =========================
   CALCULATE
========================= */

function calculate() {

    if (
        operator === null ||
        currentNumber === ""
    ) {
        return;
    }

    const first = parseFloat(previousNumber);
    const second = parseFloat(currentNumber);

    let result;

    switch (operator) {

        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":

            if (second === 0) {

                display.textContent =
                    "Cannot divide by zero";

                resetState();

                return;
            }

            result = first / second;
            break;

        default:
            return;
    }

    result = Number(result.toFixed(10));

    addHistory(
        `${first} ${getOperatorSymbol(operator)} ${second} = ${result}`
    );

    currentNumber = result.toString();

    previousNumber = "";
    operator = null;

    shouldResetDisplay = true;

    previousDisplay.textContent = "";

    updateDisplay();
}


/* =========================
   SCIENTIFIC FUNCTIONS
========================= */

function scientificFunction(type) {

    let value =
        currentNumber !== ""
            ? parseFloat(currentNumber)
            : parseFloat(display.textContent);

    if (Number.isNaN(value)) {

        showError("Please enter a valid number.");
        return;
    }

    let result;

    switch (type) {

        case "sqrt":

            if (value < 0) {

                showError(
                    "Cannot calculate square root of a negative number."
                );

                return;
            }

            result = Math.sqrt(value);
            break;


        case "square":

            result = value * value;
            break;


        case "power":

            result = Math.pow(value, 2);
            break;


        case "inverse":

            if (value === 0) {

                showError(
                    "Cannot divide by zero."
                );

                return;
            }

            result = 1 / value;
            break;


        case "sin":

            result = Math.sin(toRadians(value));
            break;


        case "cos":

            result = Math.cos(toRadians(value));
            break;


        case "tan":

            result = Math.tan(toRadians(value));
            break;


        case "log":

            if (value <= 0) {

                showError(
                    "Log is only defined for positive numbers."
                );

                return;
            }

            result = Math.log10(value);
            break;


        case "ln":

            if (value <= 0) {

                showError(
                    "ln is only defined for positive numbers."
                );

                return;
            }

            result = Math.log(value);
            break;


        case "pi":

            result = Math.PI;
            break;


        case "e":

            result = Math.E;
            break;


        case "factorial":

            if (
                value < 0 ||
                !Number.isInteger(value) ||
                value > 170
            ) {

                showError(
                    "Factorial requires a whole number from 0 to 170."
                );

                return;
            }

            result = factorial(value);
            break;


        case "abs":

            result = Math.abs(value);
            break;


        case "rand":

            result = Math.random();
            break;


        default:

            return;
    }

    if (!Number.isFinite(result)) {

        showError("Invalid result.");
        return;
    }

    result = Number(result.toFixed(10));

    currentNumber = result.toString();

    shouldResetDisplay = true;

    updateDisplay();

    addHistory(
        `${type}(${value}) = ${result}`
    );
}


/* =========================
   FACTORIAL
========================= */

function factorial(number) {

    let result = 1;

    for (let i = 2; i <= number; i++) {

        result *= i;
    }

    return result;
}


/* =========================
   DEGREE TO RADIAN
========================= */

function toRadians(degrees) {

    return degrees * Math.PI / 180;
}


/* =========================
   PERCENTAGE
========================= */

function percentage() {

    if (currentNumber === "") {
        return;
    }

    currentNumber =
        (
            parseFloat(currentNumber) / 100
        ).toString();

    updateDisplay();
    autoPreview();
}


/* =========================
   DELETE
========================= */

function deleteNumber() {

    if (shouldResetDisplay) {
        return;
    }

    currentNumber =
        currentNumber.slice(0, -1);

    if (currentNumber === "") {

        currentNumber = "0";
    }

    updateDisplay();
    autoPreview();
}


/* =========================
   CLEAR
========================= */

function clearCalculator() {

    resetState();

    display.textContent = "0";

    previousDisplay.textContent = "";
}


/* =========================
   RESET STATE
========================= */

function resetState() {

    currentNumber = "";
    previousNumber = "";
    operator = null;
    shouldResetDisplay = false;
}


/* =========================
   DISPLAY
========================= */

function updateDisplay() {

    if (!display) return;

    display.textContent =
        currentNumber === ""
            ? "0"
            : currentNumber;
}


/* =========================
   OPERATOR SYMBOL
========================= */

function getOperatorSymbol(op) {

    switch (op) {

        case "*":
            return "×";

        case "/":
            return "÷";

        case "-":
            return "−";

        case "+":
            return "+";

        default:
            return op;
    }
}


/* =========================
   HISTORY
========================= */

function addHistory(text) {

    if (!historyList) return;

    const empty =
        document.querySelector(".empty");

    if (empty) {
        empty.remove();
    }

    const item =
        document.createElement("li");

    item.textContent = text;

    historyList.prepend(item);

    while (historyList.children.length > 10) {

        historyList.lastChild.remove();
    }
}


/* =========================
   ERROR
========================= */

function showError(message) {

    alert(message);
}


/* =========================
   CAMERA
========================= */

async function startCamera() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            cameraStatus.textContent =
                "Camera is not supported by this browser.";

            return;
        }

        stopCamera();

        cameraStatus.textContent =
            "Requesting camera permission...";

        stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },

                audio: false
            });

        cameraPreview.srcObject = stream;

        cameraStatus.textContent =
            "Camera started successfully.";

    } catch (error) {

        console.error(error);

        cameraStatus.textContent =
            "Camera permission was denied or unavailable.";

        alert(
            "Camera could not be opened.\n\n" +
            "Please allow camera permission in your browser."
        );
    }
}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {

    if (stream) {

        stream
            .getTracks()
            .forEach(track => track.stop());

        stream = null;
    }

    if (cameraPreview) {

        cameraPreview.srcObject = null;
    }

    if (cameraStatus) {

        cameraStatus.textContent =
            "Camera is off.";
    }
}


/* =========================
   CAPTURE IMAGE
========================= */

function captureFrame() {

    if (
        !cameraPreview ||
        !cameraPreview.videoWidth ||
        !cameraPreview.videoHeight
    ) {

        alert(
            "Start the camera first."
        );

        return;
    }

    captureCanvas.width =
        cameraPreview.videoWidth;

    captureCanvas.height =
        cameraPreview.videoHeight;

    const context =
        captureCanvas.getContext("2d");

    context.drawImage(
        cameraPreview,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    ocrText.value =
        "Image captured successfully.\n" +
        "Enter the mathematical expression in the box above.";
}


/* =========================
   IMAGE UPLOAD
========================= */

const imageUpload =
    document.getElementById("imageUpload");

if (imageUpload) {

    imageUpload.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            ocrText.value =
                `Image selected: ${file.name}\n\n` +
                "This version does not include automatic OCR. " +
                "Enter the mathematical expression manually.";
        }
    );
}


/* =========================
   USE EXPRESSION
========================= */

function sendExpressionToCalculator() {

    const expression =
        ocrInput.value.trim();

    if (!expression) {

        alert(
            "Please enter a mathematical expression."
        );

        return;
    }

    display.textContent =
        expression;

    currentNumber =
        expression;

    showTab("calc");
}


/* =========================
   EVALUATE EXPRESSION
========================= */

function evaluateExpression() {

    const expression =
        ocrInput.value.trim();

    if (!expression) {

        alert(
            "Please enter an expression."
        );

        return;
    }

    try {

        const result =
            safeCalculate(expression);

        if (!Number.isFinite(result)) {

            throw new Error("Invalid result");
        }

        const finalResult =
            Number(result.toFixed(10));

        display.textContent =
            finalResult.toString();

        currentNumber =
            finalResult.toString();

        shouldResetDisplay = true;

        addHistory(
            `${expression} = ${finalResult}`
        );

    } catch (error) {

        console.error(error);

        alert(
            "Invalid expression.\n\n" +
            "Example: 12+8*3"
        );
    }
}


/* =========================
   SAFE CALCULATOR
========================= */

function safeCalculate(expression) {

    let exp =
        expression
            .replace(/\s+/g, "")
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-");

    if (!/^[0-9+\-*/().%]+$/.test(exp)) {

        throw new Error("Invalid characters");
    }

    if (!/[0-9)]$/.test(exp)) {

        throw new Error("Invalid expression");
    }

    /*
       The expression is restricted
       to calculator characters only.
    */

    const result =
        Function(
            `"use strict"; return (${exp})`
        )();

    if (typeof result !== "number") {

        throw new Error("Invalid result");
    }

    return result;
}


/* =========================
   NUMBER BUTTONS
========================= */

document
    .querySelectorAll("[data-number]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                appendNumber(
                    this.dataset.number
                );
            }
        );
    });


/* =========================
   OPERATOR BUTTONS
========================= */

document
    .querySelectorAll("[data-operator]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                chooseOperator(
                    this.dataset.operator
                );
            }
        );
    });


/* =========================
   SCIENTIFIC BUTTONS
========================= */

document
    .querySelectorAll("[data-scientific]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                scientificFunction(
                    this.dataset.scientific
                );
            }
        );
    });


/* =========================
   NORMAL BUTTON EVENTS
========================= */

const decimalBtn =
    document.getElementById("decimalBtn");

if (decimalBtn) {
    decimalBtn.addEventListener(
        "click",
        appendDecimal
    );
}


const equalsBtn =
    document.getElementById("equalsBtn");

if (equalsBtn) {
    equalsBtn.addEventListener(
        "click",
        calculate
    );
}


const clearBtn =
    document.getElementById("clearBtn");

if (clearBtn) {
    clearBtn.addEventListener(
        "click",
        clearCalculator
    );
}


const deleteBtn =
    document.getElementById("deleteBtn");

if (deleteBtn) {
    deleteBtn.addEventListener(
        "click",
        deleteNumber
    );
}


const percentBtn =
    document.getElementById("percentBtn");

if (percentBtn) {
    percentBtn.addEventListener(
        "click",
        percentage
    );
}


/* =========================
   NAVIGATION EVENTS
========================= */

const calculatorBtn =
    document.getElementById("calculatorBtn");

if (calculatorBtn) {

    calculatorBtn.addEventListener(
        "click",
        function () {

            showTab("calc");
        }
    );
}


const cameraBtn =
    document.getElementById("cameraBtn");

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        function () {

            showTab("camera");
        }
    );
}


const scientificBtn =
    document.getElementById("scientificBtn");

if (scientificBtn) {

    scientificBtn.addEventListener(
        "click",
        toggleScientific
    );
}


const themeBtn =
    document.getElementById("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        toggleTheme
    );
}


/* =========================
   CAMERA EVENTS
========================= */

const startCameraBtn =
    document.getElementById("startCameraBtn");

if (startCameraBtn) {

    startCameraBtn.addEventListener(
        "click",
        startCamera
    );
}


const stopCameraBtn =
    document.getElementById("stopCameraBtn");

if (stopCameraBtn) {

    stopCameraBtn.addEventListener(
        "click",
        stopCamera
    );
}


const captureBtn =
    document.getElementById("captureBtn");

if (captureBtn) {

    captureBtn.addEventListener(
        "click",
        captureFrame
    );
}


const useExpressionBtn =
    document.getElementById("useExpressionBtn");

if (useExpressionBtn) {

    useExpressionBtn.addEventListener(
        "click",
        sendExpressionToCalculator
    );
}


const evaluateBtn =
    document.getElementById("evaluateBtn");

if (evaluateBtn) {

    evaluateBtn.addEventListener(
        "click",
        evaluateExpression
    );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;

        if (/^[0-9]$/.test(key)) {

            appendNumber(key);

        } else if (key === ".") {

            appendDecimal();

        } else if (
            ["+", "-", "*", "/"].includes(key)
        ) {

            chooseOperator(key);

        } else if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

        } else if (key === "Backspace") {

            deleteNumber();

        } else if (key === "Escape") {

            clearCalculator();

        } else if (key === "%") {

            percentage();
        }
    }
);