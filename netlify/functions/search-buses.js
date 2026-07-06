exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { depTerminalId, arrTerminalId, depPlanTime, apiKey } = JSON.parse(event.body);

        if (!depTerminalId || !arrTerminalId || !depPlanTime || !apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: '필수 정보가 누락되었습니다' })
            };
        }

        const url = `https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo?serviceKey=${apiKey}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlanTime=${depPlanTime}&pageNo=1&numOfRows=100&_type=json`;

        const response = await fetch(url);
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `응답 파싱 실패: ${text.substring(0, 100)}` })
            };
        }

        if (data.response && data.response.body && data.response.body.items && Array.isArray(data.response.body.items)) {
            const buses = data.response.body.items.map(item => ({
                depPlandTime: item.depPlandTime || '-',
                arrPlandTime: item.arrPlandTime || '-',
                depPlaceName: item.depPlaceName || '-',
                arrPlaceName: item.arrPlaceName || '-',
                charge: item.charge || '-',
                gradeNm: item.gradeNm || '-'
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
