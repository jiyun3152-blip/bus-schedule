exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    try {
        const { departure, arrival } = JSON.parse(event.body);
        const API_KEY = process.env.NAVER_API_KEY;

        const url = new URL('https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo');
        url.searchParams.append('serviceKey', API_KEY);
        url.searchParams.append('startStn', departure);
        url.searchParams.append('endStn', arrival);
        url.searchParams.append('_type', 'json');

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.response && data.response.body && data.response.body.items) {
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
                body: JSON.stringify({ buses: [] })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
