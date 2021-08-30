# Idlescape Socket Listener

Intended to be used for user scripts.

### Basic usage

Include the file in your user script and call the `IdlescapeSocketListener.attach()` method. This will create an `EventTarget`
at `window.IdlescapeListener.messages` which your user script can use to watch for SocketIO messages.

Invoke in your user script:

```javascript
// ==UserScript==
// ...
// @require      https://raw.githubusercontent.com/HighOnMikey/idlescape-socketio-listener/main/src/idlescape-listener.js
// ...
// ==/UserScript==

// either
IdlescapeSocketListener.attach();

// or
(function () {
    IdlescapeSocketListener.attach();
})();

// the attach method will work pre- or post-load
```

Then in your code, add an event listener:

```javascript
function yourHandler(message) {
    console.log(message.event, message.data);
}

window.IdlescapeListener.messages.addEventListener("message", yourHandler(message))
// or
window.IdlescapeListener.messages.addEventListener("message", (m) => {
    console.log(m.event, m.data);
})
```