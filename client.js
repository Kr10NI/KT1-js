const zmq = require('zeromq');
const [min, max] = process.argv.slice(2).map(Number);
const socket = new zmq.Request();

if (!min || !max || min >= max) {
    console.error("Укажите корректный диапазон, например: node game-client 1 100");
    process.exit(1);
}

const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
console.log(`Загаданное число: ${randomNumber}`);

(async () => {
    socket.connect('tcp://127.0.0.1:3000');
    console.log('Клиент подключился к серверу.');

    await socket.send(JSON.stringify({ range: `${min}-${max}` }));

    while (true) {
        const [message] = await socket.receive();
        const { answer } = JSON.parse(message);

        console.log(`Сервер ответил: ${answer}`);
        
        if (answer < randomNumber) {
            await socket.send(JSON.stringify({ hint: 'more' }));
        } else if (answer > randomNumber) {
            await socket.send(JSON.stringify({ hint: 'less' }));
        } else {
            console.log("Сервер угадал число");
            break;
        }
    }

    socket.close();
})();
