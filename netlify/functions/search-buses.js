exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { departure, arrival } = JSON.parse(event.body);
        const API_KEY = process.env.NAVER_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API 키가 설정되지 않았습니다' })
            };
        }

        const url = `https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo?serviceKey=${API_KEY}&startStn=${departure}&endStn=${arrival}&_type=json`;

        const response = await fetch(url);
        const text = await response.text();

        // 디버깅: 응답 내용 확인
        console.log('API Response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `응답 파싱 실패: ${text.substring(0, 200)}` })
            };
        }

        if (data.response && data.response.body && data.response.body.items && Array.isArray(data.response.body.items)) {
            const buses = data.response.body.items.map(item => ({
                routeName: item.routeName || '노선 정보',
                departureTime: item.departureTime || '-',
                departureTerminal: item.departureTerminal || '-',
                fare: item.fare || '-',
                travelTime: item.travelTime || '-'
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ buses: buses })
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({ buses: [], rawResponse: data })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
