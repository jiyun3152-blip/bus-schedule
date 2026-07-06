exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { apiKey } = JSON.parse(event.body);

        if (!apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'API 키가 필요합니다' })
            };
        }

        const url = `https://apis.data.go.kr/1613000/ExpBusInfo/getExpBusTerminalList?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&_type=json`;

        const response = await fetch(url);
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: '응답 파싱 실패' })
            };
        }

        if (data.response && data.response.body && data.response.body.items && Array.isArray(data.response.body.items)) {
            const terminals = data.response.body.items.map(item => ({
                terminalId: item.terminalId || '',
                terminalName: item.terminalName || ''
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ terminals: terminals })
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({ terminals: [] })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
