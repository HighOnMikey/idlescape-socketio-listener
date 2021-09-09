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

Then in your code add an event listener:

```javascript
// event handler callback
function yourHandler(message) {
    console.log(message.event, message.data);
}

// messages received from the server
window.IdlescapeListener.messages.addEventListener("message", yourHandler(message));
// messages sent from the client
window.IdlescapeListener.messages.addEventListener("send", yourHandler(message));

// or you can create the callback in the addEventListener method
window.IdlescapeListener.messages.addEventListener("message", (m) => {
    console.log(m.event, m.data);
})

// etc
```

You are also able to listen for WebSocket disconnected and connected events, allowing you to reload or reattach components
in your extension. Example:

```javascript
window.IdlescapeListener.messages.addEventListener("connected", () => {
    yourObject.recreateObservers();
});

window.IdlescapeListener.messages.addEventListener("disconnected", () => {
    yourObject.cleanup();
})
```

### Debugging

While developing a script/extension, it may be helpful to see debug messages:

```javascript
let enableInvalidMessageDebug = true;
let enableValidMessageDebug = true;
window.IdlescapeListener.setDebug(enableInvalidMessageDebug, enableValidMessageDebug);
```

Invalid messages are messages that did not fully pass the `extractMessage()` checks. Valid messages are all valid messages
sent/received to/from the game server.

### Event Index

| Event | Description |
|---|---|
| `message` | WebSocket message received from the game server |
| `send` | WebSocket message sent to the game server |
| `connected` | Listener was reattached to a new WebSocket connection |
| `disconnected` | The WebSocket connection was closed and the listener has been detached |

### Credits

