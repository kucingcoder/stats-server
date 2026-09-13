const REFRESH_RATE = 2000; // 2 seconds

async function fetchStats() {
    try {
        const response = await fetch('index.php?api=true');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching stats:', error);
        // Could add visual error state here
    }
}

function formatPercent(p) {
    return Math.floor(p * 100) / 100;
}

function updateUI(data) {
    // Update IP
    document.getElementById('ip-display').innerText = data.ip;

    // Update CPU
    document.getElementById('cpu-spec').innerHTML = data.cpu.spec;
    document.getElementById('cpu-temp').innerHTML = data.cpu.temp;
    const cpuPercent = Math.min(Math.max(data.cpu.percent, 0), 100);
    document.getElementById('cpu-bar').style.width = `${cpuPercent}%`;
    document.getElementById('cpu-percent').innerText = `${formatPercent(cpuPercent)}%`;
    updateColor('cpu-bar', cpuPercent);

    // Update RAM
    document.getElementById('ram-used').innerText = data.ram.used;
    document.getElementById('ram-total').innerText = data.ram.total;
    const ramPercent = Math.min(Math.max(data.ram.percent, 0), 100);
    document.getElementById('ram-bar').style.width = `${ramPercent}%`;
    document.getElementById('ram-percent').innerText = `${formatPercent(ramPercent)}%`;
    updateColor('ram-bar', ramPercent);

    // Update Storage
    document.getElementById('disk-used').innerText = data.disk.used;
    document.getElementById('disk-total').innerText = data.disk.total;
    const diskPercent = Math.min(Math.max(data.disk.percent, 0), 100);
    document.getElementById('disk-bar').style.width = `${diskPercent}%`;
    document.getElementById('disk-percent').innerText = `${formatPercent(diskPercent)}%`;
    updateColor('disk-bar', diskPercent);
}

function updateColor(elementId, percent) {
    const el = document.getElementById(elementId);
    
    // Change color dynamically based on usage
    if (percent > 90) {
        el.style.backgroundColor = '#ef4444'; // Red
    } else if (percent > 75) {
        el.style.backgroundColor = '#f97316'; // Orange
    } else {
        // Reset to default CSS variable based on type
        if (elementId.includes('cpu')) el.style.backgroundColor = 'var(--cpu-color)';
        else if (elementId.includes('ram')) el.style.backgroundColor = 'var(--ram-color)';
        else if (elementId.includes('disk')) el.style.backgroundColor = 'var(--storage-color)';
    }
}

// Initial fetch
fetchStats();

// Poll every X seconds
setInterval(fetchStats, REFRESH_RATE);
