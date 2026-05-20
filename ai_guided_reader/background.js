const API_URL = browser.webfuseSession.env.AGENT_API_URL;

// Call the LLM API.
// Sends { messages } and expects a JSON response with: { text: string }
// Adapt the request body and response parsing to match your LLM provider.
async function callLLM(messages) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

// Route messages between side panel and content script
browser.runtime.onMessage.addListener((message, sender) => {
    switch (message.type) {
        case 'CHAT_REQUEST': {
            const { requestId, messages } = message;
            callLLM(messages)
                .then(result => {
                    browser.runtime.sendMessage({ type: 'CHAT_RESPONSE', requestId, result });
                })
                .catch(err => {
                    browser.runtime.sendMessage({
                        type: 'CHAT_RESPONSE',
                        requestId,
                        result: { error: err.message },
                    });
                });
            break;
        }

        case 'TOOL_EXEC': {
            // Forward to content script via tabs.sendMessage (supports async return),
            // then relay the result back to the side panel via runtime.sendMessage
            const { requestId } = message;
            browser.webfuseSession.getTabs().then(tabs => {
                const activeTab = tabs.find(t => t.active);
                if (activeTab) {
                    return browser.tabs.sendMessage(activeTab.id, message);
                }
                return { error: 'No active tab' };
            }).then(result => {
                browser.runtime.sendMessage({ type: 'TOOL_RESULT', requestId, result });
            }).catch(err => {
                browser.runtime.sendMessage({ type: 'TOOL_RESULT', requestId, result: { error: err.message } });
            });
            break;
        }
    }
});

// Auto-open the side panel
browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
browser.sidePanel.open();