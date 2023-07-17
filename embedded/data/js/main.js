let state = {
    isRelayOn: false,
};

window.addEventListener('load', () => {
    loadState();
    loadConfig();
    initSaveForm();
});

function initSaveForm() {
    document.querySelector('form').addEventListener('submit', handleSaveConfig);
}

function getRestartButton() {
    return document.getElementById('restart');
}

function getRelayButton() {
    return document.getElementById('relay');
}

function getSaveButton() {
    return document.getElementById('save');
}

function getTemperatureThresholdElement() {
    return document.getElementById('temperature-threshold');
}

function handleSaveConfig(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const formValue = Object.fromEntries(data.entries());
    const config = {
        temperatureThreshold: formValue['temperature-threshold'],
    };
    saveConfig(config);
}

function getRelayButtonText() {
    return state.isRelayOn ? 'Turn off relay' : 'Turn on relay';
}


function loadConfig() {
    fetch('/api/config', { method: 'GET' })
        .then(response => response.json())
        .then(res => {
            getTemperatureThresholdElement().value = res.temperatureThreshold;
        })
}

function saveConfig(config) {
    const saveButton = getSaveButton();
    saveButton.ariaBusy = 'true';
    fetch('/api/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    }).then(response => response.json())
        .finally(() => {
            saveButton.ariaBusy = 'false';
        });
}

function loadState() {
    const relayButton = getRelayButton();
    relayButton.ariaBusy = true;
    fetch('/api/state', { method: 'GET' })
        .then(response => response.json())
        .then(res => {
            state = res;
            relayButton.textContent = getRelayButtonText();
        })
        .finally(() => {
            relayButton.ariaBusy = false;
        });
}

function switchRelay() {
    const relayButton = getRelayButton();
    relayButton.ariaBusy = true;
    let url = state.isRelayOn ? '/api/relay/off' : '/api/relay/on';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(() => {
            state.isRelayOn = !state.isRelayOn;
            relayButton.textContent = getRelayButtonText();
        })
        .finally(() => relayButton.ariaBusy = false);
}

function restart() {
    const isConfirmed = window.confirm("Are you sure?");
    if (isConfirmed) {
        const restartButton = getRestartButton();
        restartButton.ariaBusy = true;
        fetch('/api/restart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .finally(() => restartButton.ariaBusy = false);
    }
}