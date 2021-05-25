const { dialog } = require('electron').remote;
const shell = require('electron').shell;
const path = require('path');


window.addEventListener("load", () => {
    // Show home screen, but hide mining screen when page is loaded
    getHome().style.display = "block";
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
    getMine().style.display = "block";

    getMine().innerHTML += `\n Welcome Chung User, ${address}!`;
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
        if(box.response == 1) 
            getWallet()
    }).catch(err => {
        alert(err)
    });    
}
