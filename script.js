const REFRESH_RATE = 2000; // 2 seconds

async function fetchStats() {
    try {
        const response = await fetch('index.php?api=true');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

function formatPercent(p) {
    return Math.floor(p * 100) / 100;
}

function getStatusBadge(type, percent) {
    if (type === 'cpu') {
        if (percent < 30) return { text: 'CHILLED', class: 'status-chilled' };
        if (percent < 70) return { text: 'NORMAL', class: 'status-normal' };
        return { text: 'HOT', class: 'status-hot' };
    } else if (type === 'ram') {
        if (percent < 60) return { text: 'OPTIMAL', class: 'status-optimal' };
        if (percent < 85) return { text: 'HEAVY', class: 'status-heavy' };
        return { text: 'CRITICAL', class: 'status-critical' };
    } else if (type === 'disk') {
        if (percent < 50) return { text: 'ULTRA ROOMY', class: 'status-roomy' };
        if (percent < 80) return { text: 'OKAY', class: 'status-normal' };
        return { text: 'FULL', class: 'status-critical' };
    }
    return { text: 'OK', class: 'status-normal' };
}

function updateUI(data) {
    // Update Home
    if(document.getElementById('ip-display')) document.getElementById('ip-display').innerText = data.ip;
    if(document.getElementById('uptime-display')) document.getElementById('uptime-display').innerText = data.uptime;

    // Update CPU
    if(document.getElementById('cpu-model')) document.getElementById('cpu-model').innerText = data.cpu.spec.model;
    if(document.getElementById('cpu-spec')) document.getElementById('cpu-spec').innerText = `${data.cpu.spec.cores} CPU`;
    if(document.getElementById('cpu-temp')) document.getElementById('cpu-temp').innerHTML = data.cpu.temp;
    const cpuPercent = Math.min(Math.max(data.cpu.percent, 0), 100);
    if(document.getElementById('cpu-bar')) document.getElementById('cpu-bar').style.width = `${cpuPercent}%`;
    if(document.getElementById('cpu-dot')) document.getElementById('cpu-dot').style.left = `calc(${cpuPercent}% - 4px)`;
    if(document.getElementById('cpu-percent')) document.getElementById('cpu-percent').innerText = `${formatPercent(cpuPercent)}%`;
    
    let cpuBadge = getStatusBadge('cpu', cpuPercent);
    let cpuStatusEl = document.getElementById('cpu-status');
    if (cpuStatusEl) {
        cpuStatusEl.innerText = cpuBadge.text;
        cpuStatusEl.className = `status-badge badge-cpu ${cpuBadge.class}`;
    }

    // Update RAM
    if(document.getElementById('ram-used')) document.getElementById('ram-used').innerText = data.ram.used;
    if(document.getElementById('ram-total')) document.getElementById('ram-total').innerText = data.ram.total;
    if(document.getElementById('ram-free')) document.getElementById('ram-free').innerText = `${data.ram.free} free`;
    const ramPercent = Math.min(Math.max(data.ram.percent, 0), 100);
    if(document.getElementById('ram-bar')) document.getElementById('ram-bar').style.width = `${ramPercent}%`;
    if(document.getElementById('ram-percent')) document.getElementById('ram-percent').innerText = `${formatPercent(ramPercent)}%`;
    
    let ramBadge = getStatusBadge('ram', ramPercent);
    let ramStatusEl = document.getElementById('ram-status');
    if (ramStatusEl) {
        ramStatusEl.innerText = ramBadge.text;
        ramStatusEl.className = `status-badge badge-ram ${ramBadge.class}`;
    }

    // Update SWAP
    if (data.swap) {
        if(document.getElementById('swap-used')) document.getElementById('swap-used').innerText = data.swap.used;
        if(document.getElementById('swap-total')) document.getElementById('swap-total').innerText = data.swap.total;
        if(document.getElementById('swap-free')) document.getElementById('swap-free').innerText = `${data.swap.free} free`;
        const swapPercent = Math.min(Math.max(data.swap.percent, 0), 100);
        if(document.getElementById('swap-bar')) document.getElementById('swap-bar').style.width = `${swapPercent}%`;
        if(document.getElementById('swap-percent')) document.getElementById('swap-percent').innerText = `${formatPercent(swapPercent)}%`;
        
        let swapBadge = getStatusBadge('ram', swapPercent); // Re-use RAM thresholds for SWAP
        let swapStatusEl = document.getElementById('swap-status');
        if (swapStatusEl) {
            swapStatusEl.innerText = swapBadge.text;
            swapStatusEl.className = `status-badge badge-swap ${swapBadge.class}`;
        }
    }

    // Update Storage
    if(document.getElementById('disk-used')) document.getElementById('disk-used').innerText = data.disk.used;
    if(document.getElementById('disk-total')) document.getElementById('disk-total').innerText = data.disk.total;
    if(document.getElementById('disk-free')) document.getElementById('disk-free').innerText = `${data.disk.free} free`;
    const diskPercent = Math.min(Math.max(data.disk.percent, 0), 100);
    if(document.getElementById('disk-bar')) document.getElementById('disk-bar').style.width = `${diskPercent}%`;
    if(document.getElementById('disk-dot')) document.getElementById('disk-dot').style.left = `calc(${diskPercent}% - 4px)`;
    if(document.getElementById('disk-percent')) document.getElementById('disk-percent').innerText = `${formatPercent(diskPercent)}%`;
    
    let diskBadge = getStatusBadge('disk', diskPercent);
    let diskStatusEl = document.getElementById('disk-status');
    if (diskStatusEl) {
        diskStatusEl.innerText = diskBadge.text;
        diskStatusEl.className = `status-badge badge-storage ${diskBadge.class}`;
    }
}

// Initial fetch
fetchStats();

// Poll every X seconds
setInterval(fetchStats, REFRESH_RATE);
