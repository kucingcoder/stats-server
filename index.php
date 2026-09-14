<?php
// Function to get CPU usage
function getCpuUsage() {
    $stat1 = @file('/proc/stat');
    if (!$stat1) return 0;
    usleep(100000); // 100ms
    $stat2 = @file('/proc/stat');
    
    $info1 = explode(" ", preg_replace("!cpu +!", "", $stat1[0]));
    $info2 = explode(" ", preg_replace("!cpu +!", "", $stat2[0]));
    
    $dif = array();
    $dif['user'] = $info2[0] - $info1[0];
    $dif['nice'] = $info2[1] - $info1[1];
    $dif['sys'] = $info2[2] - $info1[2];
    $dif['idle'] = $info2[3] - $info1[3];
    
    $total = array_sum($dif);
    $cpu = array();
    foreach($dif as $x=>$y) $cpu[$x] = round($y / $total * 100, 1);
    
    return $cpu['user'] + $cpu['sys'];
}

// Function to get CPU Spec
function getCpuSpec() {
    $cpuinfo = @file_get_contents('/proc/cpuinfo');
    if ($cpuinfo) {
        $model = "Unknown CPU";
        $cores = 0;
        if (preg_match('/model name\s+:\s+(.*)/', $cpuinfo, $matches)) {
            $model = trim($matches[1]);
        } elseif (preg_match('/Hardware\s+:\s+(.*)/', $cpuinfo, $matches)) {
            $model = trim($matches[1]); // For ARM
        }
        
        if (preg_match_all('/^processor/m', $cpuinfo, $matches)) {
            $cores = count($matches[0]);
        }
        return "$model ($cores CPU)";
    }
    return "Unknown CPU";
}

// Function to get CPU Temp
function getCpuTemp() {
    $temp = @exec("cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -n 1");
    if ($temp) {
        return round(trim($temp) / 1000, 1) . ' &deg;C';
    }
    return 'N/A';
}

// Function to get RAM
function getRam() {
    $meminfo = @file_get_contents('/proc/meminfo');
    if ($meminfo) {
        preg_match('/MemTotal:\s+(\d+)\s+kB/', $meminfo, $totalMatches);
        preg_match('/MemAvailable:\s+(\d+)\s+kB/', $meminfo, $availableMatches);
        preg_match('/^Cached:\s+(\d+)\s+kB/m', $meminfo, $cachedMatchesGlobal);
        $cachedGlobal = isset($cachedMatchesGlobal[1]) ? $cachedMatchesGlobal[1] : 0;
        
        // Fallback for older kernels without MemAvailable
        if (empty($availableMatches)) {
             preg_match('/MemFree:\s+(\d+)\s+kB/', $meminfo, $freeMatches);
             preg_match('/Buffers:\s+(\d+)\s+kB/', $meminfo, $bufferMatches);
             
             $free = isset($freeMatches[1]) ? $freeMatches[1] : 0;
             $buffers = isset($bufferMatches[1]) ? $bufferMatches[1] : 0;
             $available = $free + $buffers + $cachedGlobal;
        } else {
             $available = $availableMatches[1];
        }
        
        $total = isset($totalMatches[1]) ? $totalMatches[1] : 0;
        
        $used = $total - $available;
        $usagePercent = $total > 0 ? round(($used / $total) * 100, 1) : 0;
        
        return [
            'cached' => round($cachedGlobal / 1024 / 1024, 2) . " GB Cached",
            'total' => round($total / 1024 / 1024, 2) . " GB",
            'used' => round($used / 1024 / 1024, 2) . " GB",
            'free' => round($available / 1024 / 1024, 2) . " GB",
            'percent' => $usagePercent
        ];
    }
    return ['cached' => '0 GB Cached', 'total' => '0 GB', 'used' => '0 GB', 'free' => '0 GB', 'percent' => 0];
}

// Function to get SWAP
function getSwap() {
    $meminfo = @file_get_contents('/proc/meminfo');
    if ($meminfo) {
        preg_match('/SwapTotal:\s+(\d+)\s+kB/', $meminfo, $totalMatches);
        preg_match('/SwapFree:\s+(\d+)\s+kB/', $meminfo, $freeMatches);
        
        $total = isset($totalMatches[1]) ? $totalMatches[1] : 0;
        $free = isset($freeMatches[1]) ? $freeMatches[1] : 0;
        
        $used = $total - $free;
        $usagePercent = $total > 0 ? round(($used / $total) * 100, 1) : 0;
        
        return [
            'total' => round($total / 1024 / 1024, 2) . " GB",
            'used' => round($used / 1024 / 1024, 2) . " GB",
            'free' => round($free / 1024 / 1024, 2) . " GB",
            'percent' => $usagePercent
        ];
    }
    return ['total' => '0 GB', 'used' => '0 GB', 'free' => '0 GB', 'percent' => 0];
}

// Function to get Disk Type
function getDiskType() {
    $path = __DIR__;
    $df = @exec("df -P " . escapeshellarg($path) . " | tail -1 | awk '{print $1}'");
    if (!$df) return 'Storage';
    
    $lsblk = @exec("lsblk -no pkname,name,rota " . escapeshellarg($df));
    if (!$lsblk) return 'Storage';
    
    $parts = preg_split('/\s+/', trim($lsblk));
    $rota = array_pop($parts);
    $name = array_pop($parts);
    $pkname = array_pop($parts);
    
    $disk = $pkname ?: $name; 
    
    if (strpos($disk, 'nvme') === 0) {
        return 'NVMe SSD';
    } elseif (strpos($disk, 'mmcblk') === 0) {
        $typePath = "/sys/block/$disk/device/type";
        if (file_exists($typePath)) {
            $mmcType = trim(file_get_contents($typePath));
            if ($mmcType === 'MMC') return 'eMMC';
            if ($mmcType === 'SD') return 'Micro SD';
        }
        return 'SD/eMMC';
    } elseif (strpos($disk, 'sd') === 0) {
        return $rota == '1' ? 'HDD' : 'SATA SSD';
    } elseif (strpos($disk, 'vd') === 0) {
        return 'Virtual Disk';
    }
    
    return $rota == '1' ? 'HDD' : 'SSD';
}

// Function to get Disk
function getDisk() {
    $path = __DIR__;
    $total = @disk_total_space($path);
    $free = @disk_free_space($path);
    
    $temp = 'N/A';
    $nvmeTemp = @exec("cat /sys/class/nvme/nvme0/device/hwmon/hwmon*/temp1_input 2>/dev/null | head -n 1");
    if ($nvmeTemp) {
        $temp = round(trim($nvmeTemp) / 1000, 1) . ' &deg;C';
    } else {
        $hddTemp = @exec("hddtemp -n /dev/sda 2>/dev/null");
        if ($hddTemp) {
            $temp = trim($hddTemp) . ' &deg;C';
        }
    }

    if ($total !== false && $free !== false) {
        $used = $total - $free;
        $percent = $total > 0 ? round(($used / $total) * 100, 2) : 0;
        return [
            'type' => getDiskType(),
            'total' => round($total / 1024 / 1024 / 1024, 2) . " GB",
            'used' => round($used / 1024 / 1024 / 1024, 2) . " GB",
            'free' => round($free / 1024 / 1024 / 1024, 2) . " GB",
            'percent' => $percent,
            'temp' => $temp
        ];
    }
    return ['type' => 'Storage', 'total' => '0 GB', 'used' => '0 GB', 'free' => '0 GB', 'percent' => 0, 'temp' => $temp];
}

// Function to get IP
function getIp() {
    $ip = exec("ip -4 -o addr show | awk '$2 != \"lo\" && $2 != \"lo:\" && !/(docker|podman|veth|br-)/ {print $4}' | cut -d/ -f1 | head -n 1 2>/dev/null");
    if (!$ip) {
        $ip = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '127.0.0.1';
    }
    return $ip;
}

// Function to get Uptime
function getUptime() {
    $uptime = @file_get_contents('/proc/uptime');
    if ($uptime) {
        $uptime = explode(' ', $uptime)[0];
        $days = floor($uptime / 86400);
        $hours = floor(($uptime % 86400) / 3600);
        return $days . "d " . $hours . "h";
    }
    return 'N/A';
}

// Function to get Network Stats
function getNetworkStats() {
    $netdev = @file('/proc/net/dev');
    $rx = 0;
    $tx = 0;
    if ($netdev) {
        foreach ($netdev as $line) {
            if (strpos($line, ':') === false) continue;
            $parts = explode(':', $line);
            $interface = trim($parts[0]);
            if ($interface === 'lo') continue;
            
            $stats = preg_split('/\s+/', trim($parts[1]));
            $rx += (float) $stats[0];
            $tx += (float) $stats[8];
        }
    }
    
    $formatBytes = function($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    };
    
    return [
        'rx' => $formatBytes($rx),
        'tx' => $formatBytes($tx)
    ];
}

if (isset($_GET['api']) && $_GET['api'] == 'true') {
    header('Content-Type: application/json');
    echo json_encode([
        'ip' => getIp(),
        'uptime' => getUptime(),
        'cpu' => [
            'spec' => getCpuSpec(),
            'percent' => getCpuUsage(),
            'temp' => getCpuTemp()
        ],
        'ram' => getRam(),
        'swap' => getSwap(),
        'disk' => getDisk(),
        'network' => getNetworkStats()
    ]);
    exit;
}

$hostname = gethostname();
if (!$hostname) {
    $hostname = 'ServerStatus';
} else {
    $hostname = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $hostname)));
}

$os_name = php_uname('s');
if (file_exists('/etc/os-release')) {
    $lines = file('/etc/os-release');
    foreach ($lines as $line) {
        if (strpos($line, 'PRETTY_NAME=') === 0) {
            $os_name = trim(explode('=', $line, 2)[1], "\"' \n\r");
            break;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($hostname) ?></title>
    <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxyZWN0IHg9IjIiIHk9IjE0IiB3aWR0aD0iMjAiIGhlaWdodD0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGxpbmUgeDE9IjYiIHkxPSI2IiB4Mj0iNi4wMSIgeTI9IjYiPjwvbGluZT48bGluZSB4MT0iNiIgeTE9IjE4IiB4Mj0iNi4wMSIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=<?= time() ?>">
</head>
<body>
    <!-- Background Decorators -->
    <div class="bg-pattern"></div>
    <div class="bg-grid"></div>

    <div class="dashboard">
        <main class="grid-container">
            
            <!-- Home Card -->
            <div class="card card-home">
                <div class="card-home-left">
                    <h1 class="host-title"><?= htmlspecialchars($hostname) ?> - <?= htmlspecialchars($os_name) ?> <span class="dot"></span></h1>
                    <div class="home-indicators">
                        <div class="badge-ip">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span id="ip-display">Loading...</span>
                        </div>
                        <div class="uptime">
                            <svg class="icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span id="uptime-display">N/A</span>
                        </div>
                        <div class="uptime" style="color: #10b981;">
                            <svg class="icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span id="net-rx">0 B</span>
                        </div>
                        <div class="uptime" style="color: #f43f5e;">
                            <svg class="icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span id="net-tx">0 B</span>
                        </div>
                    </div>
                </div>
                <div class="card-home-right">
                    <div class="robot-icon">
                        <div class="robot-glow"></div>
                        <div class="robot-body">
                            <div class="robot-antenna"></div>
                            <div class="robot-eyes">
                                <div class="eye"></div>
                                <div class="eye"></div>
                            </div>
                            <div class="robot-mouth"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CPU Card -->
            <div class="card card-stats">
                <div class="card-top">
                    <div class="icon-box fill-cpu">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                        </svg>
                    </div>
                    <div class="card-titles">
                        <span class="sub-title cpu-color">PROCESSOR</span>
                        <h2 id="cpu-spec">Loading...</h2>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="bottom-stats">
                        <div class="main-stat">
                            <span class="percentage" id="cpu-percent">0%</span>
                            <span class="status-badge badge-cpu" id="cpu-status">CHILLED</span>
                        </div>
                        <div class="card-temp">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                            </svg>
                            <span id="cpu-temp">N/A</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill fill-cpu" id="cpu-bar" style="width: 0%"></div>
                            <div class="progress-dot dot-cpu" id="cpu-dot" style="left: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RAM Card -->
            <div class="card card-stats">
                <div class="card-top">
                    <div class="icon-box fill-ram">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                        </svg>
                    </div>
                    <div class="card-titles">
                        <span class="sub-title ram-color">RANDOM ACCESS</span>
                        <h2>Memory (RAM)</h2>
                        <span class="spec-text"><span id="ram-used">0 GB</span> / <span id="ram-total">0 GB</span></span>
                    </div>
                    <div class="card-free badge-outline-ram">
                        <span id="ram-free">0 GB free</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="bottom-stats">
                        <div class="main-stat">
                            <span class="percentage" id="ram-percent">0%</span>
                            <span class="status-badge badge-ram" id="ram-status">OPTIMAL</span>
                        </div>
                        <div class="card-temp" style="color: var(--ram-color); font-size: 0.9rem; padding: 4px 8px;">
                            <span id="ram-cached">Loading...</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill fill-ram" id="ram-bar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SWAP Card -->
            <div class="card card-stats">
                <div class="card-top">
                    <div class="icon-box fill-swap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                    <div class="card-titles">
                        <span class="sub-title swap-color">PAGING SPACE</span>
                        <h2>SWAP Memory</h2>
                        <span class="spec-text"><span id="swap-used">0 GB</span> / <span id="swap-total">0 GB</span></span>
                    </div>
                    <div class="card-free badge-outline-swap">
                        <span id="swap-free">0 GB free</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="bottom-stats">
                        <div class="main-stat">
                            <span class="percentage" id="swap-percent">0%</span>
                            <span class="status-badge badge-swap" id="swap-status">OPTIMAL</span>
                        </div>
                        <div class="mini-chart swap-chart">
                            <div class="bar h-2"></div>
                            <div class="bar h-4"></div>
                            <div class="bar h-3"></div>
                            <div class="bar h-5"></div>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill fill-swap" id="swap-bar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Storage Card -->
            <div class="card card-stats">
                <div class="card-top">
                    <div class="icon-box fill-storage">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                    </div>
                    <div class="card-titles">
                        <span class="sub-title storage-color">NON-VOLATILE</span>
                        <h2>Storage</h2>
                        <span class="spec-text"><span id="disk-used">0 GB</span> / <span id="disk-total">0 GB</span></span>
                    </div>
                    <div class="card-free badge-outline-storage">
                        <span id="disk-free">0 GB free</span>
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="bottom-stats">
                        <div class="main-stat">
                            <span class="percentage" id="disk-percent">0%</span>
                            <span class="status-badge badge-storage" id="disk-status">ULTRA ROOMY</span>
                        </div>
                        <div class="card-temp" style="color: var(--storage-color);">
                            <span id="disk-type">Loading...</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill fill-storage" id="disk-bar" style="width: 0%"></div>
                            <div class="progress-dot dot-storage" id="disk-dot" style="left: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    </div>

    <script src="script.js?v=<?= time() ?>"></script>
</body>
</html>
