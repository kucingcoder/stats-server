# Stats Server Dashboard

A lightweight, beautiful, and real-time server monitoring dashboard. This project is built specifically for **Homelab Enthusiasts** and anyone who wants to monitor their server or mini PC's status directly from a web browser with a modern interface.

<img width="1920" height="1523" alt="fullpage_snapshot_stats_mashanif_web_id_2026-09-21-03-05-43 1" src="https://github.com/user-attachments/assets/b937cb8e-9778-4b7f-bd27-773b0eb4c0d3" />


## 📌 Features
- **CPU / Processor**: Current CPU usage, specifications, and temperature.
- **Memory (RAM & Swap)**: Real-time memory usage and availability.
- **Storage**: Disk space monitoring for your main drive.
- **Network**: Inbound (Rx) and Outbound (Tx) network traffic.
- **Active Web Servers**: Automatically detects and lists active websites running on your server, showing the total count like `(x Sites)` (Supports Apache and Nginx).
- **Support System**: Manually register and display static links or services via a simple JSON file, showing the total registered apps like `System (x App)`.

---

## 🚀 Deployment (Installation)

This application doesn't require a database or complex configurations. It is plug-and-play and beginner-friendly!

**System Requirements:**
- **Linux** Operating System (e.g., Ubuntu, Debian, Proxmox LXC, etc.). *Will not work fully on Windows as it relies on Linux system files.*
- Web Server (Apache or Nginx).
- PHP (Version 7.4 or newer).

### Option 1: Using Apache
1. Ensure your server has Apache and PHP installed. If not (for Ubuntu/Debian), run:
   ```bash
   sudo apt update
   sudo apt install apache2 php libapache2-mod-php
   ```
2. Clone this repository to your web server's public directory (usually `/var/www/html`):
   ```bash
   cd /var/www/html
   # Remove default apache index file if it exists
   sudo rm index.html 
   
   # Clone the repository
   sudo git clone https://github.com/kucingcoder/stats-server.git .
   ```

### Option 2: Using Nginx
1. Ensure your server has Nginx and PHP-FPM installed:
   ```bash
   sudo apt update
   sudo apt install nginx php-fpm
   ```
2. Make sure your Nginx server block is configured to process `.php` files via `php-fpm`.
3. Clone the repository to your web root (e.g., `/var/www/html`):
   ```bash
   cd /var/www/html
   sudo rm index.nginx-debian.html
   sudo git clone https://github.com/kucingcoder/stats-server.git .
   ```

**Accessing the Dashboard:**
Once deployed, simply open your web browser and navigate to your server's IP address (e.g., `http://192.168.1.100`). Your dashboard is ready to use!

---

## 📝 Custom Services Configuration (Support System)

You can manually add custom services or panels to the **Support System** card on the dashboard.
To do this, simply edit or create a file named `registered-services.json` in the root directory. 

The format is a simple JSON array:
```json
[
    {
        "name": "Panel",
        "domain": "panel.domain.tld"
    },
    {
        "name": "Webmail",
        "domain": "mail.domain.tld"
    }
]
```
*The list will automatically be sorted alphabetically by the service name.*

---

## 🛠️ Development

For those who want to tweak the code or customize the design, this project is built using Vanilla PHP, JS, and CSS without any complex frameworks.

- **`index.php`**: The heart of the application. It serves as both the frontend (HTML) and the backend API. When accessed with `index.php?api=true`, it reads Linux system metrics (like from `/proc`) and returns JSON data.
- **`style.css`**: Contains all styling, layouts, colors, and animations (glassmorphism effects, floating robot, etc.).
- **`script.js`**: JavaScript logic that polls `index.php?api=true` every 2 seconds to update the numbers on the screen dynamically without refreshing the page.

## 🔒 Security & Password Protection

By default, this dashboard is protected with a built-in login system. 
- **Default Password:** `admin`
- **To change the password or disable it:** Open `config.php` and change the value of `$APP_PASSWORD`. 
  - Change it to your own secure password: `$APP_PASSWORD = 'mysecretpassword';`
  - Or, set it to an empty string to disable the login screen completely: `$APP_PASSWORD = '';`

*Note: Even with this password protection, it is still recommended to use this dashboard over a secure connection (HTTPS or VPN) to prevent the password from being intercepted on public networks.*

**Customization Tips:**
- To change the dominant colors, open `style.css` and look for the `:root { ... }` block at the very top.
- To change the refresh interval, open `script.js` and modify the `const REFRESH_RATE = 2000;` (in milliseconds).

---
