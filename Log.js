const Log = {
    debug: function(message) {
        console.log(`[DEBUG ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}]: ${message}`);
    },
    error: function(message) {
        console.error(`[ERROR ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}]: ${message}`);
    }
};
