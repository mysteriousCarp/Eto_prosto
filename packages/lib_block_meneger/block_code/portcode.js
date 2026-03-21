async function base_port(config = { host: 'localhost', ports: [80, 443, 8080] }) {
    const { host, ports } = config;
    const net = require('net');

    const checkPort = (port) => {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = 2000;

            socket.setTimeout(timeout);

            socket.on('connect', () => {
                socket.destroy();
                resolve({ port, open: true });
            });

            socket.on('error', () => resolve({ port, open: false }));
            socket.on('timeout', () => {
                socket.destroy();
                resolve({ port, open: false });
            });

            socket.connect(port, host);
        });
    };

    try {
        const results = await Promise.all(ports.map(checkPort));
        const openPorts = results.filter(r => r.open).map(r => r.port);

        if (openPorts.length > 0) {
            return { result: 1, text: `Открытые порты на ${host}: ${openPorts.join(', ')}` };
        }
        return { result: 0, text: `Нет открытых портов среди проверенных: ${ports.join(', ')}` };
    } catch (error) {
        return { result: 0, text: `Критическая ошибка сканирования: ${error.message}` };
    }
}