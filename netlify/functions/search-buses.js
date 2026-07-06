exports.handler = async (event) => {
  const API_KEY = 'dc148c3c07a3236f9b83c0f5a34e8e5dd24ceaa55e1d21f547f0ae6443c08f1a';
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { depTerminalId, arrTerminalId, depPlandTime } = JSON.parse(event.body);

    if (!depTerminalId || !arrTerminalId || !depPlandTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '필수 정보가 누락되었습니다' })
      };
    }

    const url = `https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo?serviceKey=${API_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depPlandTime}&pageNo=1&numOfRows=100&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.body?.items) {
      const buses = data.response.body.items.map(item => ({
        depPlandTime: item.depPlandTime || '',
        arrPlandTime: item.arrPlandTime || '',
        depPlaceName: item.depPlaceName || '',
        arrPlaceName: item.arrPlaceName || '',
        charge: item.charge || '',
        gradeNm: item.gradeNm || ''
      }));
      
      return {
        statusCode: 200,
        body: JSON.stringify({ buses })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ buses: [] })
    };
  } catch (error) {
    console.error('버스 조회 오류:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
