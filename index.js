const WebSocket = require('ws');
const net = require('net');

// Configuração do servidor WebSocket
const wss = new WebSocket.Server({ server });

// Quando um cliente se conecta
wss.on('connection', function connection(ws) {
    console.log('Cliente conectado via WebSocket');

    // Conectar ao servidor VNC
    const vncClient = net.connect({ host: VNC_SERVER, port: VNC_PORT }, () => {
        console.log('Conectado ao servidor VNC');
    });

    // Redirecionar tráfego entre WebSocket e servidor VNC
    vncClient.on('data', (data) => {
        ws.send(data);
    });

    ws.on('message', (message) => {
        vncClient.write(message);
    });

    // Fechar conexões quando necessário
    ws.on('close', () => {
        vncClient.end();
    });

    vncClient.on('end', () => {
        ws.close();
    });
});
