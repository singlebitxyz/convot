/**
 * Convot Chat Widget
 *
 * A modern, embeddable chat widget that connects to the Convot API.
 * Features: Chat history, session management, markdown rendering, dark mode support.
 *
 * Usage:
 * <script src="widget.js" data-token="YOUR_TOKEN" data-api-url="http://localhost:8000" async></script>
 */

(function () {
  "use strict";

  // ============================================================================
  // Configuration & State
  // ============================================================================
  let config = {
    token: null,
    apiUrl: "http://localhost:8000",
    isOpen: false,
    isLoading: false,
    sessionId: null,
    messages: [],
  };

  // Generate or retrieve session ID
  function getSessionId() {
    const storageKey = "convot_widget_session";
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId =
        "widget_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  }

  // Load chat history from localStorage
  function loadChatHistory() {
    const storageKey = `convot_widget_messages_${config.sessionId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        config.messages = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      console.warn("Failed to load chat history:", e);
    }
    return false;
  }

  // Save chat history to localStorage
  function saveChatHistory() {
    const storageKey = `convot_widget_messages_${config.sessionId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(config.messages));
    } catch (e) {
      console.warn("Failed to save chat history:", e);
    }
  }

  // ============================================================================
  // Theme & Dark Mode Detection
  // ============================================================================
  function detectDarkMode() {
    // Check if document has dark class
    if (document.documentElement.classList.contains("dark")) {
      return true;
    }
    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    // Check localStorage
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      return true;
    }
    return false;
  }

  function getThemeColors(isDark) {
    if (isDark) {
      return {
        background: "oklch(0.10 0.005 270)", // #16171B - black background
        foreground: "oklch(0.985 0.001 106.423)", // white text
        card: "oklch(0.15 0.005 270)", // slightly lighter black for cards
        cardForeground: "oklch(0.985 0.001 106.423)",
        primary: "oklch(0.87 0.15 90)", // #F7CE45 - yellow
        primaryForeground: "oklch(0.10 0.005 270)", // #16171B - black on yellow
        muted: "oklch(0.20 0.005 270)", // --muted (dark)
        mutedForeground: "oklch(0.709 0.01 56.259)",
        border: "oklch(1 0 0 / 10%)", // --border (dark)
        input: "oklch(1 0 0 / 15%)",
        radius: "0.625rem",
      };
    } else {
      return {
        background: "oklch(1 0 0)", // white background
        foreground: "oklch(0.10 0.005 270)", // #16171B - black text
        card: "oklch(1 0 0)", // white card
        cardForeground: "oklch(0.10 0.005 270)",
        primary: "oklch(0.87 0.15 90)", // #F7CE45 - yellow
        primaryForeground: "oklch(0.10 0.005 270)", // #16171B - black on yellow
        muted: "oklch(0.97 0.001 106.424)", // --muted (light)
        mutedForeground: "oklch(0.553 0.013 58.071)",
        border: "oklch(0.923 0.003 48.717)", // --border (light)
        input: "oklch(0.923 0.003 48.717)",
        radius: "0.625rem",
      };
    }
  }

  // ============================================================================
  // Markdown Renderer (Lightweight)
  // ============================================================================
  function renderMarkdown(text) {
    if (!text) return "";

    let html = text;

    // Escape HTML first
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, function (match, code) {
      return "<pre><code>" + code.trim() + "</code></pre>";
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Links [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    // Lists (unordered)
    html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, function (match) {
      return "<ul>" + match + "</ul>";
    });

    // Lists (ordered)
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Paragraphs (text between double line breaks)
    html = html
      .split("<br><br>")
      .map((para) => {
        para = para.trim();
        if (para && !para.match(/^<(ul|ol|pre|h[1-6])/)) {
          return "<p>" + para + "</p>";
        }
        return para;
      })
      .join("");

    return html;
  }

  // ============================================================================
  // Initialize Configuration
  // ============================================================================
  function initConfig() {
    const script =
      document.currentScript ||
      document.querySelector('script[src*="widget.js"]');
    if (script) {
      config.token = script.getAttribute("data-token");
      config.apiUrl = script.getAttribute("data-api-url") || config.apiUrl;
    }

    // Fallback: try to get from window.convotWidgetConfig
    if (window.convotWidgetConfig) {
      config.token = window.convotWidgetConfig.token || config.token;
      config.apiUrl = window.convotWidgetConfig.apiUrl || config.apiUrl;
    }

    if (!config.token) {
      console.error(
        "Convot Widget: Token is required. Set data-token attribute on script tag."
      );
      return false;
    }

    // Initialize session
    config.sessionId = getSessionId();
    loadChatHistory();

    return true;
  }

  // ============================================================================
  // Create Widget HTML
  // ============================================================================
  function createWidgetHTML() {
    const isDark = detectDarkMode();
    const colors = getThemeColors(isDark);

    // Inject CSS with theme variables
    const styleId = "convot-widget-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
                #convot-widget-container * {
                    box-sizing: border-box;
                }
                
                #convot-widget-container {
                    --convot-bg: ${colors.background};
                    --convot-fg: ${colors.foreground};
                    --convot-card: ${colors.card};
                    --convot-card-fg: ${colors.cardForeground};
                    --convot-primary: ${colors.primary};
                    --convot-primary-fg: ${colors.primaryForeground};
                    --convot-muted: ${colors.muted};
                    --convot-muted-fg: ${colors.mutedForeground};
                    --convot-border: ${colors.border};
                    --convot-input: ${colors.input};
                    --convot-radius: ${colors.radius};
                }
                
                #convot-widget-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                
                #convot-widget-window {
                    display: none;
                    width: 400px;
                    max-width: calc(100vw - 40px);
                    height: 600px;
                    max-height: calc(100vh - 100px);
                    background: var(--convot-card);
                    color: var(--convot-card-fg);
                    border-radius: var(--convot-radius);
                    border: 1px solid var(--convot-border);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                #convot-widget-header {
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--convot-card);
                }
                
                #convot-widget-header .convot-header-label {
                    background: var(--convot-primary);
                    color: var(--convot-primary-fg);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                }
                
                #convot-widget-close {
                    background: var(--convot-muted);
                    border: 1px solid var(--convot-border);
                    color: var(--convot-fg);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, border-color 0.2s;
                }
                
                #convot-widget-close:hover {
                    background: var(--convot-primary);
                    border-color: var(--convot-primary);
                    color: var(--convot-primary-fg);
                }
                
                #convot-widget-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: var(--convot-bg);
                    scroll-behavior: smooth;
                }
                
                #convot-widget-messages::-webkit-scrollbar {
                    width: 6px;
                }
                
                #convot-widget-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                #convot-widget-messages::-webkit-scrollbar-thumb {
                    background: var(--convot-border);
                    border-radius: 3px;
                }
                
                #convot-widget-messages::-webkit-scrollbar-thumb:hover {
                    background: var(--convot-muted-fg);
                }
                
                .convot-message {
                    margin-bottom: 16px;
                    display: flex;
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .convot-message-user {
                    justify-content: flex-end;
                }
                
                .convot-message-assistant {
                    justify-content: flex-start;
                }
                
                .convot-message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: var(--convot-radius);
                    word-wrap: break-word;
                    font-size: 14px;
                    line-height: 1.6;
                    position: relative;
                }
                
                .convot-message-user .convot-message-bubble {
                    background: var(--convot-primary);
                    color: var(--convot-primary-fg);
                    border-bottom-right-radius: 4px;
                }
                
                .convot-message-assistant .convot-message-bubble {
                    background: var(--convot-muted);
                    color: var(--convot-muted-fg);
                    border: 1px solid var(--convot-border);
                    border-bottom-left-radius: 4px;
                }
                
                .convot-message-bubble p {
                    margin: 0 0 8px 0;
                }
                
                .convot-message-bubble p:last-child {
                    margin-bottom: 0;
                }
                
                .convot-message-bubble code {
                    background: var(--convot-card);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9em;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                }
                
                .convot-message-bubble pre {
                    background: var(--convot-card);
                    padding: 12px;
                    border-radius: var(--convot-radius);
                    overflow-x: auto;
                    margin: 8px 0;
                    border: 1px solid var(--convot-border);
                }
                
                .convot-message-bubble pre code {
                    background: transparent;
                    padding: 0;
                }
                
                .convot-message-bubble ul, .convot-message-bubble ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .convot-message-bubble li {
                    margin: 4px 0;
                }
                
                .convot-message-bubble a {
                    color: var(--convot-primary);
                    text-decoration: underline;
                }
                
                .convot-message-bubble strong {
                    font-weight: 600;
                }
                
                .convot-message-bubble em {
                    font-style: italic;
                }
                
                .convot-empty-state {
                    text-align: center;
                    color: var(--convot-muted-fg);
                    font-size: 14px;
                    padding: 40px 20px;
                }
                
                #convot-widget-input-area {
                    border-top: 1px solid var(--convot-border);
                    padding: 16px 16px 12px 16px;
                    background: var(--convot-card);
                }
                
                #convot-widget-input-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                }
                
                #convot-widget-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid var(--convot-input);
                    border-radius: var(--convot-radius);
                    font-size: 14px;
                    background: var(--convot-bg);
                    color: var(--convot-fg);
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }
                
                #convot-widget-input:focus {
                    border-color: var(--convot-primary);
                    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
                }
                
                #convot-widget-input::placeholder {
                    color: var(--convot-muted-fg);
                }
                
                #convot-widget-send {
                    padding: 12px 20px;
                    background: var(--convot-primary);
                    color: var(--convot-primary-fg);
                    border: none;
                    border-radius: var(--convot-radius);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: opacity 0.2s, transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 80px;
                }
                
                #convot-widget-send:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                
                #convot-widget-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                #convot-widget-loading {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--convot-muted);
                    border: 1px solid var(--convot-border);
                    border-radius: var(--convot-radius);
                    color: var(--convot-muted-fg);
                    font-size: 14px;
                }
                
                .convot-loading-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .convot-loading-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--convot-primary);
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                
                .convot-loading-dot:nth-child(1) {
                    animation-delay: -0.32s;
                }
                
                .convot-loading-dot:nth-child(2) {
                    animation-delay: -0.16s;
                }
                
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }
                
                #convot-widget-button {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: var(--convot-primary);
                    color: var(--convot-primary-fg);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }
                
                #convot-widget-button svg {
                    display: block;
                }
                
                #convot-widget-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                #convot-widget-button:active {
                    transform: scale(0.95);
                }
                
                #convot-widget-branding {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--convot-border);
                    font-size: 11px;
                    color: var(--convot-muted-fg);
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                #convot-widget-branding:hover {
                    opacity: 1;
                }
                
                #convot-widget-branding a {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                #convot-widget-branding a:hover {
                    color: var(--convot-primary);
                }
                
                #convot-widget-branding svg {
                    display: block;
                }
            `;
      document.head.appendChild(style);
    }

    return `
            <div id="convot-widget-container">
                <div id="convot-widget-window">
                    <div id="convot-widget-header">
                        <span class="convot-header-label">Assistant</span>
                        <button id="convot-widget-close" aria-label="Close chat">×</button>
                    </div>
                    <div id="convot-widget-messages"></div>
                    <div id="convot-widget-input-area">
                        <div id="convot-widget-input-wrapper">
                            <input 
                                type="text" 
                                id="convot-widget-input" 
                                placeholder="Type your message..."
                                aria-label="Message input"
                            />
                            <button id="convot-widget-send" aria-label="Send message">Send</button>
                        </div>
                        <div id="convot-widget-branding">
                            <a href="https://convot.com" target="_blank" rel="noopener noreferrer" aria-label="Powered by convot.">
                                <span>Powered by</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 24" style="height: 16px; width: auto;">
                                    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="currentColor">convot</text>
                                    <text x="42" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#F7CE45">.</text>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <button id="convot-widget-button" aria-label="Open chat">
                    <svg width="100%" height="100%" viewBox="0 0 592 592" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="296" cy="296" r="296" fill="currentColor"/>
                        <path d="M234.836 502.603C252.149 505.516 273.313 507.824 298.329 509.52C329.813 511.294 351.098 516.171 362.184 524.153C373.713 532.578 379.479 543.886 379.479 558.076C379.479 566.5 377.939 574.264 374.865 581.371C349.756 588.295 323.311 592 296 592C259.199 592 223.967 585.281 191.462 573.008C190.869 569.934 190.57 566.731 190.57 563.397C190.57 550.538 194.118 538.786 201.213 528.143C207.093 519.325 218.301 510.813 234.836 502.603Z" fill="#F7CE45"/>
                        <path d="M296 0C459.476 0 592 132.524 592 296C592 409.369 528.264 507.848 434.672 557.569C434.681 557.073 434.688 556.578 434.688 556.082C434.688 537.457 430.475 521.714 422.049 508.854C414.067 495.994 400.986 486.016 382.805 478.921C364.624 471.383 340.677 466.505 310.966 464.288C288.794 462.514 270.613 460.518 256.423 458.3C242.676 456.083 231.59 453.866 223.164 451.649C214.739 448.988 208.087 446.328 203.209 443.667C201.963 442.919 200.736 442.17 199.525 441.423L226.657 407.778C244.079 414.851 264.421 418.39 287.685 418.39C315.622 418.39 339.347 413.292 358.858 403.093C378.37 392.45 393.225 378.259 403.424 360.521C413.623 342.783 418.723 323.05 418.723 301.322C418.723 279.593 413.623 260.081 403.424 242.787C400.509 237.716 397.212 232.936 393.536 228.445L461.295 222.831V192.233H340.611C325.074 186.916 307.433 184.251 287.685 184.251C259.748 184.251 236.024 189.574 216.513 200.216C197.001 210.859 182.146 225.049 171.947 242.787C161.747 260.081 156.648 279.593 156.648 301.322C156.648 323.05 161.748 342.783 171.947 360.521C178.112 371.244 185.982 380.667 195.551 388.797L139.352 444.997V460.296C145.561 466.061 152.435 471.604 159.973 476.926C166.415 481.22 174.012 485.224 182.764 488.941C175.475 493.643 169.207 498.507 163.963 503.532C153.764 513.288 146.449 523.266 142.014 533.465C140.318 537.799 138.985 542.095 138.009 546.349C55.0749 493.901 0 401.384 0 296C0 132.524 132.524 0 296 0Z" fill="#F7CE45"/>
                        <path d="M287.685 226.823C311.188 226.823 329.812 233.03 343.559 245.447C357.749 257.863 364.846 276.489 364.846 301.322C364.846 325.711 357.749 344.335 343.559 357.195C329.812 369.612 311.188 375.82 287.685 375.82C264.183 375.82 245.336 369.612 231.146 357.195C216.956 344.335 209.861 325.711 209.861 301.322C209.861 276.489 216.956 257.863 231.146 245.447C245.336 233.03 264.183 226.823 287.685 226.823Z" fill="#F7CE45"/>
                    </svg>
                </button>
            </div>
        `;
  }

  // ============================================================================
  // Message Management
  // ============================================================================
  function addMessage(
    text,
    isUser = false,
    timestamp = null,
    skipSave = false
  ) {
    const messagesContainer = document.getElementById("convot-widget-messages");
    if (!messagesContainer) return;

    // Remove empty state if present
    const emptyState = messagesContainer.querySelector(".convot-empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `convot-message ${
      isUser ? "convot-message-user" : "convot-message-assistant"
    }`;

    const bubble = document.createElement("div");
    bubble.className = "convot-message-bubble";

    if (isUser) {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = renderMarkdown(text);
    }

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save to history (skip when rendering from history)
    if (!skipSave) {
      config.messages.push({
        text: text,
        isUser: isUser,
        timestamp: timestamp || new Date().toISOString(),
      });
      saveChatHistory();
    }
  }

  function renderMessages() {
    const messagesContainer = document.getElementById("convot-widget-messages");
    if (!messagesContainer) return;

    messagesContainer.innerHTML = "";

    if (config.messages.length === 0) {
      messagesContainer.innerHTML =
        '<div class="convot-empty-state">Ask me anything! 👋</div>';
      return;
    }

    config.messages.forEach((msg) => {
      addMessage(msg.text, msg.isUser, msg.timestamp, true); // skipSave = true
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showLoading() {
    const messagesContainer = document.getElementById("convot-widget-messages");
    if (!messagesContainer) return;

    const loadingDiv = document.createElement("div");
    loadingDiv.id = "convot-widget-loading";
    loadingDiv.innerHTML = `
            <div class="convot-loading-dots">
                <div class="convot-loading-dot"></div>
                <div class="convot-loading-dot"></div>
                <div class="convot-loading-dot"></div>
            </div>
            <span>Thinking...</span>
        `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideLoading() {
    const loadingDiv = document.getElementById("convot-widget-loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  // ============================================================================
  // API Communication
  // ============================================================================
  async function sendQuery(queryText) {
    if (config.isLoading || !queryText.trim()) {
      return;
    }

    config.isLoading = true;
    showLoading();

    try {
      // Get last 5 messages from chat history
      // Exclude the last message if it's the current user message (since it's already in query_text)
      let messagesToSend = config.messages.slice(-5);
      if (
        messagesToSend.length > 0 &&
        messagesToSend[messagesToSend.length - 1].isUser &&
        messagesToSend[messagesToSend.length - 1].text === queryText
      ) {
        // Remove the last message (current user query) since it's redundant
        messagesToSend = messagesToSend.slice(0, -1);
      }

      const chatHistory = messagesToSend.map((msg) => ({
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp,
      }));

      const response = await fetch(`${config.apiUrl}/api/v1/widget/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          query_text: queryText,
          session_id: config.sessionId,
          page_url: window.location.href,
          chat_history: chatHistory.length > 0 ? chatHistory : null,
        }),
      });

      hideLoading();

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success" && data.data && data.data.answer) {
        addMessage(data.data.answer, false);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      hideLoading();
      console.error("Convot Widget Error:", error);
      addMessage("Sorry, I encountered an error. Please try again.", false);
    } finally {
      config.isLoading = false;
    }
  }

  // ============================================================================
  // Initialize Widget
  // ============================================================================
  function initWidget() {
    if (!initConfig()) {
      return;
    }

    // Inject widget HTML
    const widgetHTML = createWidgetHTML();
    document.body.insertAdjacentHTML("beforeend", widgetHTML);

    // Get elements
    const button = document.getElementById("convot-widget-button");
    const window = document.getElementById("convot-widget-window");
    const closeBtn = document.getElementById("convot-widget-close");
    const input = document.getElementById("convot-widget-input");
    const sendBtn = document.getElementById("convot-widget-send");

    // Render existing messages
    renderMessages();

    // Toggle window
    function toggleWindow() {
      config.isOpen = !config.isOpen;
      window.style.display = config.isOpen ? "flex" : "none";
      button.style.display = config.isOpen ? "none" : "flex";
      if (config.isOpen) {
        input.focus();
      }
    }

    // Event listeners
    button.addEventListener("click", toggleWindow);
    closeBtn.addEventListener("click", toggleWindow);

    sendBtn.addEventListener("click", () => {
      const query = input.value.trim();
      if (query) {
        addMessage(query, true);
        input.value = "";
        sendQuery(query);
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
