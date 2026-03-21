async function base_idor(config = { uri: '', targetId: '1' }) {
    const { uri, targetId } = config;
    const url = uri.includes('{id}') ? uri.replace('{id}', targetId) : `${uri}${targetId}`;

    try {
        const response = await fetch(url, { method: 'GET' });

        if (response.ok) {
            const data = await response.text();
            return { result: 1, text: `Доступ получен. Статус: ${response.status}. Данные: ${data.substring(0, 100)}...` };
        }
        return { result: 0, text: `Отказано. Статус: ${response.status}` };
    } catch (error) {
        return { result: 0, text: `Ошибка соединения: ${error.message}` };
    }
}