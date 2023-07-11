let state = {
    isRelayOn: false,
};

document.addEventListener('DOMContentLoaded', () => {
    loadState();
});


function getRestartButton() {
    return document.getElementById('restart');
}

function getRelayButton() {
    return document.getElementById('relay');
}

function getRelayButtonText() {
    return state.isRelayOn ? 'Turn off relay' : 'Turn on relay';
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