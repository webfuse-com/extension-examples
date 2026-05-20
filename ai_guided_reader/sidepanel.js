const SYSTEM_PROMPT = `You are "Reader" — a cheerful reading assistant inside a browser session.
You help users read web pages by highlighting text blocks one at a time and auto-scrolling through them.
Keep responses short — 1-2 sentences. Be friendly and a little nerdy about reading.`;

const history = [];
const pendingRequests = {};
let isReading = false;

// --- UI helpers ---
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addAction(text) {
    const div = document.createElement('div');
    div.className = 'msg action';
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setActive(on) {
    if (!on && isReading) return; // don't override "reading..." state
    statusEl.textContent = on ? 'working...' : 'ready';
    statusEl.className = `status ${on ? 'active' : ''}`;
    inputEl.disabled = on;
    sendBtn.disabled = on;
}

function setReading(on) {
    isReading = on;
    statusEl.textContent = on ? 'reading...' : 'ready';
    statusEl.className = `status ${on ? 'reading' : ''}`;
    sendBtn.style.display = on ? 'none' : '';
    stopBtn.style.display = on ? '' : 'none';
    if (!on) {
        inputEl.disabled = false;
        sendBtn.disabled = false;
    }
}

// --- Messaging ---

// Send a request to the background and wait for a matching response.
// Note: runtime.sendMessage now supports async responses natively (returns a Promise).
// This example uses a manual requestId pattern with a custom timeout for extra control.
function sendRequest(payload, timeoutMs) {
    return new Promise((resolve) => {
        const requestId = Date.now().toString() + Math.random().toString(36).slice(2);
        pendingRequests[requestId] = resolve;
        browser.runtime.sendMessage({ ...payload, requestId });
        setTimeout(() => {
            if (pendingRequests[requestId]) {
                delete pendingRequests[requestId];
                resolve({ error: 'Request timed out' });
            }
        }, timeoutMs);
    });
}

function callAgent(messages) {
    return sendRequest({ type: 'CHAT_REQUEST', messages }, 60000);
}

function execToolOnPage(toolName, input) {
    return sendRequest({ type: 'TOOL_EXEC', tool: toolName, input }, 10000);
}

// Listen for responses and events
browser.runtime.onMessage.addListener((message) => {
    if (message.requestId && pendingRequests[message.requestId]) {
        const resolve = pendingRequests[message.requestId];
        delete pendingRequests[message.requestId];
        resolve(message.result);
        return;
    }

    // Content script signals that guided reading finished
    if (message.type === 'GUIDED_READ_DONE') {
        setReading(false);
        const s = message.stats;
        const mins = Math.floor(s.elapsedSec / 60);
        const secs = s.elapsedSec % 60;
        const time = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        const lines = [
            `Done! Read ${s.totalBlocks} blocks in ${time}.`,
            `${s.totalWords} words · ${s.totalChars} chars · ${s.avgWordsPerMin} wpm`,
        ];
        if (s.headingsRead > 0) lines[0] += ` (${s.headingsRead} headings)`;
        addMessage('assistant', lines.join('\n'));
    }
});

// --- Intent detection ---

// Detect reading intent locally — small models are unreliable with tool-use decisions
function detectIntent(text) {
    const lower = text.toLowerCase();

    if (/\b(stop|end|pause|quit|cancel)\b/.test(lower)) {
        return { action: 'stop' };
    }

    if (/\b(start|begin|read|go|scan)\b/.test(lower)) {
        let speed = 1500;

        // Explicit number: "read at 2000", "speed 800"
        const numMatch = lower.match(/\b(\d{3,})\b/);
        if (numMatch) speed = parseInt(numMatch[1], 10);

        // Words: "very slow" < "slow" < default < "fast" < "very fast"
        if (/very\s*(slow|careful)/.test(lower)) speed = 500;
        else if (/\b(slow|careful|casual)\b/.test(lower)) speed = 800;
        else if (/very\s*fast|skim/.test(lower)) speed = 3500;
        else if (/\b(fast|quick|rapid)\b/.test(lower)) speed = 2500;

        return { action: 'start', speed };
    }

    return null;
}

// --- Chat handler ---

async function sendMessage(text) {
    setActive(true);
    history.push({ role: 'user', content: text });
    addMessage('user', text);

    const intent = detectIntent(text);

    // Start reading
    if (intent?.action === 'start' && !isReading) {
        addAction(`Starting guided read (${intent.speed} chars/min)...`);
        const result = await execToolOnPage('guidedRead', intent);
        if (result.active) {
            setReading(true);
            const msg = `Reading through ${result.totalBlocks} blocks. I'll highlight each one as we go!`;
            history.push({ role: 'assistant', content: msg });
            addMessage('assistant', msg);
        } else {
            const msg = result.error || 'Could not start reading on this page.';
            history.push({ role: 'assistant', content: msg });
            addMessage('assistant', msg);
        }
        setActive(false);
        return;
    }

    // Stop reading
    if (intent?.action === 'stop' && isReading) {
        addAction('Stopping guided read...');
        await execToolOnPage('guidedRead', { action: 'stop' });
        setReading(false);
        setActive(false);
        return;
    }

    // Everything else — chat with LLM (no tools, just conversation)
    const response = await callAgent(
        [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
    );

    if (response.error) {
        addMessage('assistant', `Error: ${response.error}`);
        setActive(false);
        return;
    }

    const reply = response.text
        || "I'm Reader! I can help you read through any page — just say \"start reading\"."
        + " I'll highlight the important parts one by one and scroll through them for you.";
    history.push({ role: 'assistant', content: reply });
    addMessage('assistant', reply);

    setActive(false);
}

// --- Input handling ---

stopBtn.addEventListener('click', async () => {
    addAction('Stopping guided read...');
    await execToolOnPage('guidedRead', { action: 'stop' });
    setReading(false);
});

sendBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sendMessage(text);
});

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});