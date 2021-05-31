const { dialog } = require('electron').remote;
const shell = require('electron').shell;
const osu = require('node-os-utils');
const si = require('systeminformation');
const path = require('path');
const os = require('os');

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
    address = document.getElementById('chung-address').value;
    if (address.length == 0) {
        showAddrError();
        return;
    }

    getHome().style.display = "none";
    getMine().style.display = "flex";

    getMine().querySelector("#mine-top-info").innerHTML = `Mining to ${address}`;

    updateCPU();
    startMining();
    getPoolStats();
    setInterval(updateCPU, 8000);
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
            console.log(data);
            pool = data.pools.chung.poolStats;
            
        })
        .catch(console.error);
}

function startMining() {
}

function stopMining() {

}

function settings() {

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