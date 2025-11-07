# Gulp Bot Web

A simple, clean web page showcasing the Gulp AI Chat Bot widget.

## Features

-   🎨 Clean, minimal design with gradient background
-   💬 Embedded Gulp Chat Widget
-   📱 Fully responsive
-   🌙 Dark mode support (widget auto-detects system preference)
-   💾 Chat history persistence (localStorage)
-   📝 Markdown rendering in messages

## Setup

1. Configure the widget in `index.html`:

```html
<script
    src="http://localhost:3000/widget.js"
    data-token="YOUR_WIDGET_TOKEN_HERE"
    data-api-url="http://localhost:8000"
    async
></script>
```

2. Update the widget token and API URL to match your configuration.

## Development

Start the development server:

```bash
npm run dev
```

The page will be available at `http://localhost:5173` (or the port Vite assigns).

## Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview

Preview the production build:

```bash
npm run preview
```

## Widget Configuration

### Option 1: HTML Attributes

```html
<script
    src="/widget.js"
    data-token="YOUR_WIDGET_TOKEN"
    data-api-url="http://localhost:8000"
    async
></script>
```

### Option 2: JavaScript Configuration

```html
<script>
    window.gulpWidgetConfig = {
        token: "YOUR_WIDGET_TOKEN",
        apiUrl: "http://localhost:8000",
    };
</script>
<script src="/widget.js" async></script>
```

## Files Structure

```
simple-html-web/
├── index.html          # Main HTML file
├── src/
│   ├── main.js        # Simple page content
│   └── style.css      # Minimal styles
├── public/
│   └── widget.js      # Gulp Chat Widget
└── package.json       # Dependencies
```

## Customization

### Change the Hero Text

Edit `src/main.js`:

```javascript
document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="hero">
      <h1>Your Custom Title</h1>
      <p class="subtitle">Your custom subtitle text</p>
    </div>
  </div>
`;
```

### Change the Background

Edit `src/style.css`:

```css
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## Requirements

-   Node.js 18+
-   npm or yarn
-   Gulp backend server running on port 8000 (or your configured port)
