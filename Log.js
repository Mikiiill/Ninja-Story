const Log = {
    debug: function(message) {
        let debugMessage = `<span class='debug-log'>[DEBUG]: ${message}</span>`;
        game.output.push(debugMessage);
        document.getElementById("output").innerHTML = game.output.join("<br>");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    },
    error: function(message) {
        let errorMessage = `<span class='error-log'>[ERROR]: ${message}</span>`;
        game.output.push(errorMessage);
        document.getElementById("output").innerHTML = game.output.join("<br>");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }
};
