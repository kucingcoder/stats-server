<?php
function getDiskType() {
    $path = __DIR__;
    $df = @exec("df -P " . escapeshellarg($path) . " | tail -1 | awk '{print $1}'");
    if (!$df) return 'Unknown df';
    
    $lsblk = @exec("lsblk -no pkname,name,rota " . escapeshellarg($df));
    if (!$lsblk) return 'Unknown lsblk';
    
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

echo getDiskType() . "\n";
?>
