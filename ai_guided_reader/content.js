let guidedReadState = null;

// Find the main content area, skipping nav/header/footer/sidebar
function findContentRoot() {
    // Try semantic elements — pick the one with the most text
    const semantic = [...document.querySelectorAll('article, [role="main"], main')];
    if (semantic.length) {
        return semantic.sort((a, b) => b.textContent.length - a.textContent.length)[0];
    }

    // Fall back to the largest div/section that looks like prose
    let best = null;
    let bestLen = 0;
    for (const el of document.querySelectorAll('div, section')) {
        const tag = (el.getAttribute('role') || el.tagName).toLowerCase();
        if (['nav', 'navigation', 'banner', 'complementary', 'contentinfo'].includes(tag)) continue;
        const id = (el.id + ' ' + el.className).toLowerCase();
        if (/nav|menu|header|footer|sidebar|cookie|banner|advert|comment/.test(id)) continue;

        const text = el.textContent.trim();
        const hasProse = el.querySelectorAll('p').length >= 2 || text.length > 500;
        if (hasProse && text.length > bestLen) {
            bestLen = text.length;
            best = el;
        }
    }
    return best || document.body;
}

// Collect text-heavy elements within the content area
function collectBlocks() {
    const root = findContentRoot();
    const blocks = [];
    const seen = new Set();

    for (const el of root.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, pre')) {
        const text = el.textContent.trim();
        if (text.length < 20) continue;
        if (el.offsetHeight === 0) continue;

        // Skip elements inside nav/footer/aside nested within content root
        const parent = el.closest(
            'nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]'
        );
        if (parent && root.contains(parent)) continue;

        // Skip if a parent block already covers this text
        let dominated = false;
        for (const s of seen) {
            if (s.contains(el)) { dominated = true; break; }
        }
        if (dominated) continue;
        seen.add(el);

        blocks.push(el);
    }
    return blocks;
}

function injectStyles() {
    if (document.getElementById('wf-gr-style')) return;
    const style = document.createElement('style');
    style.id = 'wf-gr-style';
    style.textContent = `
        .wf-gr-highlight {
            outline: 3px solid #6366f1 !important;
            outline-offset: 4px;
            border-radius: 4px;
            background: rgba(99, 102, 241, 0.08) !important;
            transition: outline-color 0.3s, background 0.3s;
        }`;
    document.head.appendChild(style);
}

function clearHighlights() {
    document.querySelectorAll('.wf-gr-highlight')
        .forEach(el => el.classList.remove('wf-gr-highlight'));
}

function startGuidedRead(speed) {
    if (guidedReadState) stopGuidedRead();

    const blocks = collectBlocks();
    if (!blocks.length) return { active: false, error: 'No readable content found' };

    injectStyles();

    const charsPerSec = (speed || 1500) / 60;
    const MIN_PAUSE = 1.0;
    let index = 0;
    const startTime = Date.now();
    let totalChars = 0;
    let totalWords = 0;
    let headingsRead = 0;

    function step() {
        if (!guidedReadState || index >= blocks.length) {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const stats = {
                totalBlocks: blocks.length,
                totalChars,
                totalWords,
                headingsRead,
                elapsedSec: elapsed,
                avgWordsPerMin: elapsed > 0 ? Math.round(totalWords / (elapsed / 60)) : 0,
                pageTitle: document.title,
            };
            stopGuidedRead();
            // Notify the side panel that reading is complete
            browser.runtime.sendMessage({ type: 'GUIDED_READ_DONE', stats });
            return;
        }

        clearHighlights();

        const el = blocks[index];
        el.classList.add('wf-gr-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const text = el.textContent.trim();
        totalChars += text.length;
        totalWords += text.split(/\s+/).length;
        if (/^H[1-4]$/.test(el.tagName)) headingsRead++;

        const pause = Math.max(MIN_PAUSE, text.length / charsPerSec);

        index++;
        guidedReadState.timer = setTimeout(step, pause * 1000);
    }

    guidedReadState = { blocks, timer: null };
    step();

    return { active: true, totalBlocks: blocks.length, charsPerMin: speed || 1500 };
}

function stopGuidedRead() {
    if (guidedReadState) {
        clearTimeout(guidedReadState.timer);
        guidedReadState = null;
    }
    clearHighlights();
    const style = document.getElementById('wf-gr-style');
    if (style) style.remove();
    return { active: false };
}

// Listen for tool execution requests from the background script
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOOL_EXEC' && message.tool === 'guidedRead') {
        const { action, speed } = message.input || {};
        if (action === 'start') return startGuidedRead(speed);
        if (action === 'stop') return stopGuidedRead();
        return { error: 'Unknown action. Use "start" or "stop".' };
    }
});