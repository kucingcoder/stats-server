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
    if (percent === 0) return { text: 'FREE', class: '' };
    if (percent < 30) return { text: 'LIGHT', class: '' };
    if (percent < 70) return { text: 'GOOD', class: '' };
    if (percent < 90) return { text: 'WARN', class: '' };
    return { text: 'MAX', class: '' };
}

function getRootDomain(hostname) {
    if (hostname === 'Not Detected' || hostname === 'Default Site') return hostname;
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    
    // Daftar TLD 2 bagian yang umum di Indonesia
    const twoPartTlds = ['co.id', 'web.id', 'or.id', 'ac.id', 'sch.id', 'biz.id', 'desa.id', 'go.id', 'mil.id', 'my.id', 'co.uk', 'org.uk', 'net.id'];
    const lastTwo = parts.slice(-2).join('.');
    
    if (twoPartTlds.includes(lastTwo) && parts.length >= 3) {
        return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
}

function updateUI(data) {
    // Update Home
    if(document.getElementById('ip-display')) document.getElementById('ip-display').innerText = data.ip;
    if(document.getElementById('uptime-display')) document.getElementById('uptime-display').innerText = data.uptime;
    if(document.getElementById('net-rx') && data.network) document.getElementById('net-rx').innerText = data.network.rx + ' In';
    if(document.getElementById('net-tx') && data.network) document.getElementById('net-tx').innerText = data.network.tx + ' Out';

    // Update CPU
    if(document.getElementById('cpu-spec')) document.getElementById('cpu-spec').innerText = data.cpu.spec;
    if(document.getElementById('cpu-temp')) {
        document.getElementById('cpu-temp').innerHTML = data.cpu.temp;
        
        const tempContainer = document.getElementById('cpu-temp-container');
        if (tempContainer && data.cpu.temp !== 'N/A') {
            const tempValue = parseFloat(data.cpu.temp);
            if (!isNaN(tempValue)) {
                if (tempValue < 50) {
                    tempContainer.style.color = '#3b82f6'; // Blue
                } else if (tempValue < 60) {
                    tempContainer.style.color = '#eab308'; // Yellow
                } else if (tempValue < 70) {
                    tempContainer.style.color = '#f97316'; // Orange
                } else {
                    tempContainer.style.color = '#ef4444'; // Red
                }
            }
        }
    }
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


    // Update Websites
    if (data.services && document.getElementById('services-list')) {
        const srvList = document.getElementById('services-list');
        srvList.innerHTML = '';
        
        if (data.services.websites && data.services.websites.length > 0) {
            let webServerName = 'Websites';
            const firstType = data.services.websites[0].type;
            if (firstType === 'apache') {
                webServerName = 'Apache';
            } else if (firstType === 'nginx') {
                webServerName = 'Nginx';
            }
            
            const titleEl = document.getElementById('webserver-title');
            if (titleEl) {
                titleEl.innerText = `${webServerName} (${data.services.websites.length} Sites)`;
            }

            // Urutkan berdasarkan root domain (domain utama) lalu subdomain
            data.services.websites.sort((a, b) => {
                const rootA = getRootDomain(a.name);
                const rootB = getRootDomain(b.name);
                if (rootA === rootB) {
                    return a.name.localeCompare(b.name);
                }
                return rootA.localeCompare(rootB);
            });

            data.services.websites.forEach(srv => {
                const color = srv.status === 'Running' ? 'var(--ram-color)' : 'var(--text-muted)';
                let nameHtml = srv.name;
                let rootDomain = srv.name;
                
                if (srv.name !== 'Not Detected' && srv.name !== 'Default Site') {
                    nameHtml = `<a href="https://${srv.name}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.textDecoration='underline'; this.style.color='#38bdf8';" onmouseout="this.style.textDecoration='none'; this.style.color='inherit';">${srv.name}</a>`;
                    rootDomain = getRootDomain(srv.name);
                }

                // Ganti kata 'Running' dengan root domain-nya
                const displayStatus = (srv.status === 'Running') ? rootDomain : srv.status;

                srvList.innerHTML += `
                    <div class="list-item">
                        <span class="item-name">${nameHtml}</span>
                        <span class="item-value" style="color: ${color};">${displayStatus}</span>
                    </div>
                `;
            });
        }
    }
    // Update Registered Services (Support System)
    if (data.registered_services && document.getElementById('support-services-list')) {
        const supportList = document.getElementById('support-services-list');
        supportList.innerHTML = '';
        
        const supportTitleEl = document.getElementById('support-system-title');
        if (supportTitleEl) {
            supportTitleEl.innerText = `System (${data.registered_services.length} App)`;
        }

        if (data.registered_services.length > 0) {
            data.registered_services.forEach(srv => {
                let leftHtml = srv.domain || 'N/A';
                if (srv.domain) {
                    leftHtml = `<a href="https://${srv.domain}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.textDecoration='underline'; this.style.color='#38bdf8';" onmouseout="this.style.textDecoration='none'; this.style.color='inherit';">${srv.domain}</a>`;
                }
                const rightHtml = srv.name || '';
                
                supportList.innerHTML += `
                    <div class="list-item">
                        <span class="item-name">${leftHtml}</span>
                        <span class="item-value" style="color: var(--primary-color);">${rightHtml}</span>
                    </div>
                `;
            });
        } else {
             supportList.innerHTML = '<div class="list-item"><span class="item-name" style="color: var(--text-muted);">No services registered</span></div>';
        }
    }
}

// Initial fetch
fetchStats();

// Poll every X seconds
setInterval(fetchStats, REFRESH_RATE);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
    });
}
