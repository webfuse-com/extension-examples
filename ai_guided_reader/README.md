# AI guided reader

This Extension demonstrates an AI-powered reading assistant with a chat interface in a side panel. The user can ask it to guide them through a page — it highlights content blocks one at a time, auto-scrolls to each, and shows reading statistics when finished. It uses a background script to call an external LLM API for conversational responses, a content script that implements the guided reading tool, and two-way messaging between all three components.

#### Key Points

- **Environment Variables**: The LLM API endpoint is stored in the manifest [`env`](/extension-structure#env) section and accessed via `browser.webfuseSession.env.AGENT_API_URL`. This makes the extension shareable — each user provides their own endpoint in the Space's extension settings.

- **`host_permissions` Must Match the API Domain**: The background script runs from the extensions origin, so the API domain must be declared in [`host_permissions`](/extension-structure#host_permissions) to update the CSP `connect-src` directive. Without it, the request is blocked.

- **Generic LLM Contract**: The background script sends `{ messages }` to the API and expects `{ text }` back. This keeps the extension API-agnostic — adapt the `callLLM()` function's request body and response parsing to match your LLM provider. Most LLM providers (OpenAI, Anthropic, etc.) use a different request/response format, so you will typically need a lightweight backend adapter — a small HTTP server that accepts the extension's generic format, translates it to your provider's API, and normalizes the response. This also keeps API keys on the server side rather than exposing them in the extension environment variables.

- **Two-Way Messaging via Background**: [`runtime.sendMessage()`](/extension-messaging#sending-extension-messages) supports [async responses](/extension-messaging#async-message-handling) natively — the handler can return a value or Promise and the sender's `await` receives it. This example uses a manual `requestId` pattern with a custom timeout for extra control over long-running LLM requests, but simpler extensions can use `await browser.runtime.sendMessage(...)` directly. The background forwards tool requests to the content script via [`tabs.sendMessage()`](/extension-messaging#sending-extension-messages) (which also supports async return values), then relays the result back to the side panel.

- **Content Script as Custom Tool Provider**: The content script runs inside the [Webfuse sandbox](/extension-structure#content-scripts-run-inside-the-webfuse-sandbox) and provides the `guidedRead` tool — a custom page interaction that goes beyond what the built-in [Automation API](/automation-api/) offers. This is the key value of content scripts in AI agent extensions: they can implement domain-specific tools that interact with the DOM in ways the standard API does not cover.

- **Local Intent Detection**: Reading commands (`start`, `stop`, speed modifiers) are detected locally via keyword matching, keeping the tool reliable regardless of LLM model quality. Only conversational messages are sent to the LLM. The side panel also listens for a `GUIDED_READ_DONE` event from the content script to display reading statistics when the tool finishes.
