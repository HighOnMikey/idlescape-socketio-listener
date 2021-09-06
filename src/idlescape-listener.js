class IdlescapeMessages extends EventTarget {
    constructor() {
        super();
    }
}

class IdlescapeMessageEvent extends Event {
    constructor(event, data) {
        super("message");
        this.event = event;
        this.data = data;
    }
}

class IdlescapeSendEvent extends Event {
    constructor(event, data) {
        super("send");
        this.event = event;
        this.data = data;
    }
}

class IdlescapeDisconnectedEvent extends Event {
    constructor() {
        super("disconnected");
    }
}

class IdlescapeConnectedEvent extends Event {
    constructor() {
        super("connected");
    }
}

class IdlescapeSocketListener {
    constructor() {
        this.attached = false;
        this.messages = new IdlescapeMessages();
        this.debugEnabled = false;
    }

    static attach() {
        if (typeof window.IdlescapeListener === "undefined") {
            window.IdlescapeListener = new IdlescapeSocketListener();
            window.IdlescapeListener.interceptXHR();
            window.IdlescapeListener.interceptWebSocket();
        } else if (!(window.IdlescapeListener instanceof IdlescapeSocketListener)) {
            console.error("window.IdlescapeListener is already defined but is not the correct type");
        }
    }

    toggleDebug(value) {
        if (typeof value === "boolean") {
            this.debugEnabled = value;
        } else {
            this.debugEnabled = !this.debugEnabled;
        }
        console.info(`IdlescapeListener: debug enabled: ${this.debugEnabled}`);
    }

    debug(message, ...args) {
        if (!this.debugEnabled) {
            return;
        }

        console.debug(message);
        args.forEach((a) => {
            console.debug(a);
        });
    }

    interceptXHR() {
        let self = this;

        XMLHttpRequest.prototype._open_default =
            typeof XMLHttpRequest.prototype._open === "undefined" ? XMLHttpRequest.prototype.open : XMLHttpRequest.prototype._open;

        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            // Only care about socket.io fallback XHR messages
            if (url.match("socket.io")) {
                this.addEventListener("load", function () {
                    let messages = this.responseText.split("");
                    messages.forEach((m) => {
                        self.messageEventHandler(m);
                    });
                });
            }
            return XMLHttpRequest.prototype._open_default.apply(this, arguments);
        };
        console.info("IdlescapeListener: intercepting socket.io XHR fallback messages");
    }

    interceptWebSocket() {
        let self = this;

        let sendOverride = function (data) {
            self.messageEventHandler(data, "send");
            this._send_default(data);
        };

        let sendIntercept = function (data) {
            this._send_default(data);

            if (!self.attached) {
                this.addEventListener("message", (e) => self.messageEventHandler(e));
                this.addEventListener("close", (e) => self.closeEventHandler(e));
                self.attached = true;
                self.messages.dispatchEvent(new IdlescapeConnectedEvent());
                console.info("IdlescapeListener: intercepting socket.io WebSocket messages");
            }

            this.send = sendOverride;
        };

        if (typeof WebSocket.prototype._send == "undefined") {
            WebSocket.prototype._send_default = WebSocket.prototype.send;
            WebSocket.prototype.send = sendIntercept;
            WebSocket.prototype._send = sendOverride;
        } else {
            WebSocket.prototype._send_default = WebSocket.prototype._send;
            WebSocket.prototype._send = sendIntercept;
        }
    }

    messageEventHandler(event, eventType) {
        let message = this.extractMessage(event, eventType);
        if (message === false) {
            return;
        }

        let messageEvent;
        switch (eventType) {
            case "send":
                messageEvent = new IdlescapeSendEvent(message.event, message.data);
                break;
            case "message":
            default:
                messageEvent = new IdlescapeMessageEvent(message.event, message.data);
                break;
        }

        this.messages.dispatchEvent(messageEvent);
    }

    closeEventHandler() {
        console.info("IdlescapeListener: WebSocket closed, intercepting new connection");
        this.attached = false;
        this.messages.dispatchEvent(new IdlescapeDisconnectedEvent());
        this.interceptWebSocket();
    }

    extractMessage(event) {
        let data;
        if (typeof event === "object" && "data" in event) {
            data = event.data;
        } else {
            data = event;
        }

        if (typeof data !== "string" && !(data instanceof String)) {
            this.debug("IdlescapeListener: event data is not a string", data);
            return false;
        }

        let message = (data.match(/^[0-9]+(\[.+)$/) || [])[1];
        if (message == null) {
            this.debug("IdlescapeListener: event data does not match message regex", event);
            return false;
        }

        let parsedMessage = JSON.parse(message);
        if (!Array.isArray(parsedMessage) || parsedMessage.length === 0) {
            this.debug("IdlescapeListener: parsed message not an array or is empty", message, event);
            return false;
        }

        return { event: parsedMessage[0], data: parsedMessage[1] };
    }
}
