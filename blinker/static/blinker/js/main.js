const DOT_DURATION = 120;   // slightly shorter
const DASH_DURATION = 400;  // slightly longer
const INTRA_CHAR_PAUSE = 100;
const INTER_CHAR_PAUSE = 300;
const WORD_PAUSE = 700;
const FREQ = 800;

const MORSE_CODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..', ' ': ' ',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----'
};

// === DOM elements ===
let currentStyle = Math.floor(Math.random() * 7) + 1;
const blinkerImage = document.getElementById('blinker-image');
const textDisplay = document.getElementById('text-display');
const waveformCanvas = document.getElementById('waveform');
const ctx = waveformCanvas.getContext('2d');

// === Blink frames ===
async function blinkFrames(symbol) {
    const sequence = ['half_closed', 'closed', 'half_open', 'open'];
    const styleKey = `style${currentStyle}`;
    const framesForStyle = stylesData[styleKey];

    if (!framesForStyle) return;

    const frameFolder = symbol === '.' ? sequence : sequence; // same sequence for dot/dash
    for (let type of frameFolder) {
        const frames = framesForStyle[type];
        if (!frames || frames.length === 0) continue;

        for (let framePath of frames) {
            blinkerImage.src = framePath;
            await new Promise(r => setTimeout(r, (symbol === '.' ? DOT_DURATION : DASH_DURATION) / frames.length));
        }
    }
}

// === Beep playback ===
function playBeep(symbol) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(FREQ, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    const duration = symbol === '.' ? DOT_DURATION : DASH_DURATION;
    oscillator.stop(audioCtx.currentTime + duration / 1000);

    return new Promise(resolve => setTimeout(resolve, duration));
}

// === Cycle to next style ===
function nextStyle() {
    currentStyle = currentStyle % Object.keys(stylesData).length + 1;
}

// === Play Morse ===
async function playMorse(message) {
    const words = message.toUpperCase().split(' ');
    textDisplay.innerText = message.toUpperCase(); // show all words immediately

    for (let word of words) {
        for (let char of word) {
            const code = MORSE_CODE[char];
            if (!code) continue;
            for (let symbol of code) {
                await blinkFrames(symbol);
                await playBeep(symbol);
                await new Promise(r => setTimeout(r, INTRA_CHAR_PAUSE));
            }
            await new Promise(r => setTimeout(r, INTER_CHAR_PAUSE));
        }
        await new Promise(r => setTimeout(r, WORD_PAUSE));
        nextStyle();
    }

    // Optionally add a “Done” marker without overwriting text
    // textDisplay.innerText += " ✅";
}

const statusBox = document.getElementById('status-box');

function setStatus(text) {
    statusBox.innerText = text;
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

function startRecognition() {
    setStatus("Listening...");
    recognition.start();
}

recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    textDisplay.innerText = text.toUpperCase();
    
    // Hide status during Morse playback
    setStatus("");

    // Stop recognition while playing Morse
    recognition.stop();

    playMorse(text).then(() => {
        // After Morse finishes, show the “Just start talking...” message
        setStatus("Just start talking...");

        // Resume listening
        startRecognition();
    });
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setStatus("Just start talking...");
    // Restart listening after error
    startRecognition();
};

// Initially show message and start recognition
setStatus("Just start talking...");
startRecognition();



// === Manual text input ===
document.getElementById('send-text').addEventListener('click', () => {
    const text = document.getElementById('text-input').value;
    if (text) playMorse(text);
});

// === Waveform visualization ===
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        const sliceWidth = waveformCanvas.width / bufferLength;
        let x = 0;
        for(let i = 0; i < bufferLength; i++){
            const v = dataArray[i]/128.0;
            const y = v * waveformCanvas.height/2;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(waveformCanvas.width, waveformCanvas.height/2);
        ctx.stroke();
    }
    draw();
});
