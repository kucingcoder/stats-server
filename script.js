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
    if(document.getElementById('net-rx') && data.network) document.getElementById('net-rx').innerText = data.network.rx + ' In';
    if(document.getElementById('net-tx') && data.network) document.getElementById('net-tx').innerText = data.network.tx + ' Out';

    // Update CPU
    if(document.getElementById('cpu-spec')) document.getElementById('cpu-spec').innerText = data.cpu.spec;
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
    if(document.getElementById('ram-cached')) document.getElementById('ram-cached').innerText = data.ram.cached || '';
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
        if(document.getElementById('swap-swappiness')) document.getElementById('swap-swappiness').innerText = data.swap.swappiness;
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
    if(document.getElementById('disk-type')) document.getElementById('disk-type').innerText = data.disk.type || 'Storage';
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

    // Update Top Processes
    if (data.top_processes && document.getElementById('top-processes-list')) {
        const topList = document.getElementById('top-processes-list');
        topList.innerHTML = '';
        data.top_processes.forEach(proc => {
            topList.innerHTML += `
                <div class="list-item">
                    <span class="item-name">${proc.name}</span>
                    <span class="item-value" style="color: var(--cpu-color);">${proc.cpu}% <span style="font-size:0.75rem;color:var(--text-muted);">CPU</span></span>
                </div>
            `;
        });
    }

    // Update Services
    if (data.services && document.getElementById('services-list')) {
        const srvList = document.getElementById('services-list');
        srvList.innerHTML = '';
        
        // Podman
        if (data.services.podman) {
            data.services.podman.forEach(srv => {
                const color = srv.status === 'Running' ? 'var(--ram-color)' : 'var(--text-muted)';
                srvList.innerHTML += `
                    <div class="list-item">
                        <span class="item-name">${srv.name} <span style="font-size:0.75rem;color:var(--text-muted);">podman</span></span>
                        <span class="item-value" style="color: ${color};">${srv.status}</span>
                    </div>
                `;
            });
        }
        
        // Apache
        if (data.services.apache) {
            data.services.apache.forEach(srv => {
                const color = srv.status === 'Running' ? 'var(--ram-color)' : 'var(--text-muted)';
                srvList.innerHTML += `
                    <div class="list-item">
                        <span class="item-name">${srv.name} <span style="font-size:0.75rem;color:var(--text-muted);">apache</span></span>
                        <span class="item-value" style="color: ${color};">${srv.status}</span>
                    </div>
                `;
            });
        }
    }
}

// Initial fetch
fetchStats();

// Poll every X seconds
setInterval(fetchStats, REFRESH_RATE);
