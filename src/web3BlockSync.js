var Web3 = require("web3");
const jsonAbi = require('./resources/contractAbi.json');

const mainnet = 'wss://mainnet.infura.io/ws';
var provider, web3 = createNewProvider();
const interval = 5000;
var preBlockNumber = 0;
var myContract;

function createNewProvider(){
    provider = new Web3.providers.WebsocketProvider(mainnet);
    web3 = new Web3(provider);

    provider.on('connect', function () {
        console.log('Mainnet WebSocket Connected');
    });
    provider.on('error', e => console.log('WebSocket Error', e));

    web3.setProvider(provider);

    myContract = new web3.eth.Contract(jsonAbi, '0x4C9d5672Ae33522240532206Ab45508116daF263');

    return provider, web3;
}

provider.on('end', e => {
    console.log('WebSocket closed');
    console.log('Attempting to reconnect...');

    provider, web3 = createNewProvider();
    provider.on('end', e => {
            provider, web3 = createNewProvider();
            main();
        });
    main();
});

function main(){
    poll(funcbk, interval);
}

async function poll(fn, time){
    await fn();
    setInterval(fn, time);
}

var funcbk = async function getLatestBlockAndSync(){
    console.log('waiting for ' + interval + ' ms...');
    await web3.eth.isSyncing().then('infura is currently doing sync?' + console.log);
    web3.eth.getBlock('latest', async function(error, block) {
        if(error){
            provider, web3 = createNewProvider();
        }
        else {
            console.log('block#=' + block.number);

            await processEvents(preBlockNumber);

            preBlockNumber = block.number;
        }
    });
};

/**
 * @param startBlockHeight
 */
async function processEvents(startBlockHeight) {

    console.log('start block number: ' + startBlockHeight);

    let options = {
        fromBlock: startBlockHeight
    };
    await myContract.events.allEvents(options, function(error, event){
        console.log(event)
    });
}

main();

/*

*/