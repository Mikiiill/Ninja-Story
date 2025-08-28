function queueOutput(text) {
    var log = document.getElementById("battle-log");
    if (log) log.innerHTML += "<p>" + text + "</p>";
}
