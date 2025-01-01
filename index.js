const express = require('express');
const path = require('path');
const http = require('http');
const net = require('net');
const { Server } = require('socket.io');

// Configuração do VNC
const VNC_SERVER = '127.0.0.1'; // IP do servidor VNC
const VNC_PORT = 5900;          // Porta padrão do VNC

// Criar servidor HTTP
const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gerenciar conexões WebSocket com socket.io
io.on('connection', (socket) => {
    console.log('Cliente conectado via WebSocket');

    // Conectar ao servidor VNC
    const vncClient = net.connect({ host: VNC_SERVER, port: VNC_PORT }, () => {
        console.log('Conectado ao servidor VNC');
    });

    // Redirecionar dados do VNC para o cliente WebSocket
    vncClient.on('data', (data) => {
        socket.emit('vnc-data', data);
    });

    // Receber dados do cliente WebSocket e enviá-los ao servidor VNC
    socket.on('client-data', (data) => {
        vncClient.write(data);
    });

    // Encerrar conexões quando necessário
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
        vncClient.end();
    });

    vncClient.on('end', () => {
        console.log('Conexão com o servidor VNC encerrada');
        socket.disconnect(true);
    });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
