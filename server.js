const zmq = require('zeromq');
const socket = new zmq.Reply();

(async () => {
    socket.bind('tcp://127.0.0.1:3000');
    console.log('Готов к игре...');

    let min = 0;
    let max = 0;
    let lastAnswer = 0;

    while (true) {
        const [message] = await socket.receive();
        const data = JSON.parse(message);

        if (data.range) {
            [min, max] = data.range.split('-').map(Number);
            console.log(`Получен диапазон: ${min}-${max}`);
            lastAnswer = Math.floor((min + max) / 2);
            await socket.send(JSON.stringify({ answer: lastAnswer }));
        } else if (data.hint) {
            console.log(`Подсказка клиента: ${data.hint}`);

            if (data.hint === 'more') {
                min = lastAnswer + 1;
            } else if (data.hint === 'less') {
                max = lastAnswer - 1;
            }

            if (min > max) {
                console.error("Ошибка: диапазон некорректен.");
                break;
            }

            lastAnswer = Math.floor((min + max) / 2);
            await socket.send(JSON.stringify({ answer: lastAnswer }));
        }
    }

    socket.close();
})();
