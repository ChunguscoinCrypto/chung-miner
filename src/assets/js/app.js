const { dialog } = require('electron').remote;
const shell = require('electron').shell;
const osu = require('node-os-utils');
const si = require('systeminformation');
const chart = require('chart.js');
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

function initChart() {
    var ctx = document.getElementById('chart').getContext('2d');
    var hashChart = new chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Chungus', 'Chungus', 'Chungus', 'Chungus', 'Chungus', 'Chungus'],
            datasets: [{
                label: 'Price $',
                data: [12, 19, 3, 5, 6, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function startMining() {
    initChart();
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