const express = require('express');
const path = require('path');
const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');

// Configuração do VNC
const VNC_SERVER = '127.0.0.1'; // IP do servidor VNC
const VNC_PORT = 5900;          // Porta padrão do VNC

// Criar servidor HTTP
const app = express();
const server = http.createServer(app);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket para comunicação VNC
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// Conexão ao WebSocket
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);

    // Conectar ao servidor VNC
    const net = require('net');
    const vncClient = net.connect({ host: VNC_SERVER, port: VNC_PORT }, () => {
        console.log('Conectado ao servidor VNC');
    });

    // Redirecionar tráfego entre WebSocket e servidor VNC
    vncClient.on('data', (data) => {
        connection.sendBytes(data);
    });

    connection.on('message', (message) => {
        if (message.type === 'binary') {
            vncClient.write(message.binaryData);
        }
    });

    // Encerrar conexões quando necessário
    connection.on('close', () => {
        vncClient.end();
    });

    vncClient.on('end', () => {
        connection.close();
    });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
