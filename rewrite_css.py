css_code = """
:root {
    --bg-color: #0b0f16;
    --card-bg: rgba(22, 28, 45, 0.85);
    --card-border: rgba(255, 255, 255, 0.05);
    
    --primary-color: #0ea5e9;
    --cpu-color: #fb7185; 
    --cpu-bg: #4c1d95;
    --ram-color: #10b981; 
    --ram-bg: #047857;
    --storage-color: #fbbf24;
    --storage-bg: #b45309;
    
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    
    --font-stack: 'Outfit', system-ui, -apple-system, sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-stack);
    background-color: var(--bg-color);
    color: var(--text-main);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px 10px;
}

.dashboard {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
}

.grid-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}

.card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(800px circle at 50% -100%, rgba(255,255,255,0.03), transparent);
    pointer-events: none;
}

/* Home Card Specifics */
.card-home {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 24px 20px;
    background: linear-gradient(145deg, rgba(30, 40, 60, 0.9), rgba(15, 20, 30, 0.9));
}

.card-home-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.host-title {
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    background-color: #06b6d4;
    border-radius: 50%;
    box-shadow: 0 0 10px #06b6d4;
}

.badge-ip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(6, 182, 212, 0.1);
    color: #22d3ee;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    width: fit-content;
    border: 1px solid rgba(34, 211, 238, 0.2);
}

.uptime {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 600;
    margin-top: 4px;
}

.uptime svg {
    color: #f43f5e;
}

.robot-icon {
    width: 60px;
    height: 60px;
    background: #1e293b;
    border-radius: 16px;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
}

.robot-glow {
    position: absolute;
    top: -10px;
    width: 10px;
    height: 10px;
    background: #f43f5e;
    border-radius: 50%;
    box-shadow: 0 0 15px #f43f5e;
}

.robot-glow::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 10px;
    background: #475569;
    bottom: -10px;
    left: 4px;
}

.robot-eyes {
    display: flex;
    gap: 12px;
    margin-bottom: 4px;
}

.eye {
    width: 8px;
    height: 8px;
    background: #06b6d4;
    border-radius: 50%;
    box-shadow: 0 0 12px #22d3ee, 0 0 4px #22d3ee;
}

.robot-mouth {
    width: 20px;
    height: 4px;
    background: #f59e0b;
    border-radius: 2px;
    margin: 0 auto;
    opacity: 0.8;
}

/* Common Card Specifics */
.card-stats {
    padding-bottom: 24px;
}

.card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
}

.icon-box svg {
    width: 24px;
    height: 24px;
    color: white;
}

.fill-cpu { 
    background: var(--cpu-color);
    box-shadow: 0 8px 20px rgba(251, 113, 133, 0.3);
}
.fill-ram { 
    background: var(--ram-color);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}
.fill-storage { 
    background: var(--storage-color);
    box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
}

.card-titles {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.sub-title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.cpu-color { color: var(--cpu-color); }
.ram-color { color: var(--ram-color); }
.storage-color { color: var(--storage-color); }

.card-titles h2 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 2px;
}

.spec-text {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.card-temp {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fb7185;
}

.card-free {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
}

.badge-outline-ram {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
}

.badge-outline-storage {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

/* Bottom Stats Area */
.card-bottom {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 10px;
}

.bottom-stats {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.main-stat {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.percentage {
    font-size: 1.8rem;
    font-weight: 800;
}

.status-badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 10px;
    letter-spacing: 0.5px;
}

.badge-cpu {
    background: rgba(76, 29, 149, 0.3);
    color: #c084fc;
    border: 1px solid rgba(192, 132, 252, 0.2);
}

.badge-ram {
    background: rgba(4, 120, 87, 0.3);
    color: #34d399;
    border: 1px solid rgba(52, 211, 153, 0.2);
}

.badge-storage {
    background: rgba(180, 83, 9, 0.3);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.2);
}

.stat-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
}

.mini-chart {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 24px;
}

.mini-chart .bar {
    width: 6px;
    background: #c084fc;
    border-radius: 3px;
}
.mini-chart .h-2 { height: 40%; }
.mini-chart .h-4 { height: 80%; }
.mini-chart .h-3 { height: 60%; }
.mini-chart .h-5 { height: 100%; }

/* Progress Bar */
.progress-container {
    width: 100%;
    margin-top: 5px;
}

.progress-bar-bg {
    width: 100%;
    height: 6px;
    background: #0f172a;
    border-radius: 3px;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
}

.progress-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-dot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
    transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.dot-cpu { background: #fb7185; }
.dot-storage { background: #fbbf24; }

.icon-sm {
    width: 16px;
    height: 16px;
}

.icon-xs {
    width: 14px;
    height: 14px;
}

@media (min-width: 768px) {
    .dashboard {
        max-width: 800px;
    }
    
    .grid-container {
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .card {
        flex: 1 1 350px;
    }
    
    .card-home {
        flex-basis: 100%;
    }
}
"""

with open("style.css", "w") as f:
    f.write(css_code)
