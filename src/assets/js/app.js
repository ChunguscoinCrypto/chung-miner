const { dialog } = require('electron').remote;
const { exec } = require('child_process');
const shell = require('electron').shell;
const osu = require('node-os-utils');
const si = require('systeminformation');
const path = require('path');
const os = require('os');
var an = require('ansi_up');
var ansi_up = new an.default;

window.addEventListener("load", () => {
    // Show home screen, but hide mining screen when page is loaded
    getHome().style.display = "flex";
    getMine().style.display = "none";
}, false);

function getHome() {
    return document.getElementById('home-screen');
}

function getMine() {
    return document.getElementById('mine-screen');
}

function showMiner() {
    window.addr = document.getElementById('chung-address').value;
    if (address.length == 0) {
        showAddrError();
        return;
    }

    getHome().style.display = "none";
    getMine().style.display = "flex";

    getMine().querySelector("#mine-top-info").innerHTML = `Mining to ${addr}`;

    updateCPU();
    getPoolStats();
    startMining();
    setInterval(updateCPU, 8000);
    setInterval(getPoolStats, 20000);
}

function updateCPU() {
    osu.cpu.usage()
        .then(e => {
            getMine().querySelector("#mine-top-usage").innerHTML = `Usage: ${Math.round(e)} <small>%</small>`;
        });

    si.cpuCurrentSpeed()
        .then(e => {
            getMine().querySelector("#mine-top-speed").innerHTML = `Speed: ${Math.round(e.avg)} <small>GHz</small>`;
        });

    si.cpuTemperature()
        .then(e => {
            getMine().querySelector("#mine-top-cpu").innerHTML = `CPU: ${Math.round(e.main)} <small>°C</small>`;
        });
}

function getPoolStats() {
    fetch("https://pool.chunguscoin.net/api/stats")
        .then(response => response.json())
        .then(data => {
            pool = data.pools.chung.poolStats;
            getMine().querySelector("#mine-pool-blocks").innerHTML = `Blocks: ${pool.networkBlocks}`;
            getMine().querySelector("#mine-pool-paid").innerHTML = `Paid: ${pool.totalPaid}`;
            getMine().querySelector("#mine-pool-hash").innerHTML = `Hash: ${pool.networkSols} <small>sol/s</small>`;
        })
        .catch(console.error);
}

function startMining() {
    function cleanOutput(e) {
        return e.replace(/ *\[[^\]]*]/g, "").trim();
    }

    var path;
    switch (os.platform()) {
        case "linux":
            path = `./src/assets/bin/linux/chungusminer -l pool.chunguscoin.net:3022 -u ${window.addr}.chungminer -p x`
            break;
        case "darwin":
            path = `./src/assets/bin/mac/chungusminer -l pool.chunguscoin.net:3022 -u ${window.addr}.chungminer -p x`
            break;
        case "win32":
            path = `./src/assets/bin/win/chungusminer.exe -l pool.chunguscoin.net:3022 -u ${window.addr}.chungminer -p x`
            break;
        default:
            break;
    }

    const child = exec(path);
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    });

    child.stderr.on('data', (e) => {
        var data = cleanOutput(e);
        if (data.includes("/s")) { // (Sol/s)
            var hash = data.replace(": ", "").replace(/\d+((.|,)\d+)?/, "").replace("H/s,", "").replace("Sol/s", "").replace("[0m", "").trim(); // extract hasrate
            getMine().querySelector("#hashrate").innerHTML = `<span uk-icon="icon: cog; ratio: 2" class="rotate"></span>` + ` ${hash} sol/s `;
        }
        console.log(`stderr: ${data}`);
        getMine().querySelector("#status").innerHTML = ansi_up.ansi_to_html(data);
    });
    child.on('close', (code) => {
        getMine().querySelector("#status").innerHTML = `<font color="red">Miner exited with code ${code}</font>`;
    });
}

function stopMining() {
    var cmd;
    switch (os.platform()) {
        case "linux":
            cmd = "killall chungusminer"
            break;
        case "darwin":
            cmd = "killall chungusminer"
            break;
        case "win32":
            cmd = "taskkill.exe /F /IM chungusminer.exe"
            break;
        default:
            break;
    }

    const child = exec(cmd);
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    });

    child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
    });
    child.on('close', (code) => alert(`KILLER exited with code ${code}`));
}

function settings() {
    shell.openExternal("https://pool.chunguscoin.net/");
}

function showAddrError() {
    function getWallet() { shell.openExternal("http://wallet.chunguscoin.net") };
    dialog.showMessageBox({
        type: 'info',
        buttons: ["OK", "Get Wallet"],
        defaultId: 0,
        icon: 'info',
        title: 'Chung Miner',
        message: 'No Chunguscoin address was entered.',
        cancelId: 0,
        noLink: true,
        normalizeAccessKeys: false,
    }).then(box => {
        if (box.response == 1)
            getWallet()
    }).catch(err => {
        alert(err)
    });
}