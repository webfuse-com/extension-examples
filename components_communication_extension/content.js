document.addEventListener('DOMContentLoaded', () => {
	const chatMessageToContentPrefix = '/content ';
	const customPanel = document.createElement('div');
	customPanel.style.backgound = 'white';
	customPanel.style.border = '1px solid #555';
	document.body.prepend(customPanel);

	const messageContainer = document.createElement('section');
	customPanel.appendChild(messageContainer);

	const pingContentHandler = (messageData, sender) => {
		if (messageData.event_type === 'ping_content') {
			console.log('[components-comm] content received ping from', sender?.name || 'unknown');
			const messageEl = document.createElement('div');
			messageEl.style.width = 'auto';
			messageEl.style.margin = 'auto';
			messageEl.style.padding = '4px 8px';
			messageEl.style.backgrounfColor = 'transparent';
			messageEl.style.borderRadius = 'none';
			messageEl.style.boxShadow = 'none';
			messageEl.style.color = '#aaa';
			messageEl.style.fontStyle = 'italic';
			messageEl.style.fontSize = '.8em';
			messageEl.innerText = `Ping sent to constent script from ${sender?.name || 'unknown'} on ${messageData.time}`;
			messageContainer.appendChild(messageEl);
		}
	};

	const chatMessageHandler = messageData => {
		// handle onbly `chat_message` events
		if (
			messageData.event_type === 'chat_message' &&
			messageData.message &&
			messageData.message.startsWith(chatMessageToContentPrefix)
		) {
			const chatText = messageData.message.slice(chatMessageToContentPrefix.length - 1).trim();
			console.log('[components-comm] content received chat:', chatText);
			const messageEl = document.createElement('section');
			const messagePrefixEl = document.createElement('u');
			const messageTextEl = document.createElement('span');
			messageEl.classList.add('message-item');
			messagePrefixEl.innerText = 'Message from chat:'
			messageTextEl.innerText = ` ${chatText}`;
			messageEl.appendChild(messagePrefixEl);
			messageEl.appendChild(messageTextEl);
			messageContainer.appendChild(messageEl);
		}
	};

	browser.webfuseSession.on.addListener(chatMessageHandler);
	browser.runtime.onMessage.addListener(pingContentHandler);

	const pingPopupButton = document.createElement('button');
	pingPopupButton.innerText = 'Ping popup';
	pingPopupButton.addEventListener('click', () => {
		browser.runtime.sendMessage({event_type: 'ping_popup', time: String(new Date())});
	});
	customPanel.appendChild(pingPopupButton);

	const forecastButton = document.createElement('button');
	forecastButton.innerText = "What's the weather today?";
	forecastButton.addEventListener('click', async () => {
		const response = await browser.runtime.sendMessage({event_type: 'forecast'});
		if (response && response.forecast) {
			const messageEl = document.createElement('section');
			messageEl.style.color = 'purple';
			messageEl.style.fontSize = '.8em';
			messageEl.style.fontStyle = 'italic';
			messageEl.innerText = `🌈 Weather forecast: ${response.forecast}`;
			messageContainer.appendChild(messageEl);
		}
	});
	customPanel.appendChild(forecastButton);

	const pingChatButton = document.createElement('button');
	pingChatButton.innerText = 'Ping chat from content script';
	pingChatButton.addEventListener('click', () => {
		browser.webfuseSession.apiRequest({
    		cmd: 'send_chat_message',
    		message: 'Ping from extension content script',
    	});
    	// Alternative way to trigger JS API method
    	// browser.webfuseSession.sendChatMessage('Ping from extension content script');
	});
	customPanel.appendChild(pingChatButton);
});
