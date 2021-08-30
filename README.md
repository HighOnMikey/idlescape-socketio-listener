# Idlescape Socket Listener

Intended to be used for user scripts.

### Basic usage

Include the file in your user script and call the `attach()` method.

```javascript
// ==UserScript==
// ...
// @require      https://raw.githubusercontent.com/HighOnMikey/idlescape-socketio-listener/main/src/idlescape-listener.js
// ...
// ==/UserScript==

IdlescapeListener.attach();

// or

(function() {
    IdlescapeListener.attach();
})();
```