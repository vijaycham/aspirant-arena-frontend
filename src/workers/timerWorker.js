let timerId = null;

self.onmessage = (e) => {
    if (e.data === "start") {
        // 🛡️ Safety: Only start if not already running to prevent reset loops
        if (!timerId) {
            timerId = setInterval(() => {
                self.postMessage("tick");
            }, 1000);
        }
    } else if (e.data === "stop") {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }
};
