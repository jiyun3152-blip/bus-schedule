exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { depTerminalId, arrTerminalId, depPlandTime, apiKey } = JSON.parse(event.body);

    if (!depTerminalId || !arrTerminalId || !depPlandTime || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '필수 정보가 누락되었습니다' })
      };
    }

    const url = new URL('https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo');
    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('depTerminalId', depTerminalId);
    url.searchParams.append('arrTerminalId', arrTerminalId);
    url.searchParams.append('depPlandTime', depPlandTime);
    url.searchParams.append('pageNo', '1');
    url.searchParams.append('numOfRows', '100');
    url.searchParams.append('_type', 'json');

    console.log('요청 URL:', url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    console.log('응답 상태:', response.status);
    console.log('응답 텍스트:', text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API 응답이 JSON이 아닙니다', response: text.substring(0, 200) })
      };
    }

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
      body: JSON.stringify({ error: '서버 오류: ' + error.message })
    };
  }
};
