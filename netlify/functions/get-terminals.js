exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { searchKeyword, apiKey } = JSON.parse(event.body);

    if (!searchKeyword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '검색어가 필요합니다' })
      };
    }

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API 키가 설정되지 않았습니다' })
      };
    }

    const url = new URL('https://apis.data.go.kr/1613000/ExpBusInfo/getExpBusTerminalList');
    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('searchKeyword', searchKeyword);
    url.searchParams.append('pageNo', '1');
    url.searchParams.append('numOfRows', '50');
    url.searchParams.append('_type', 'json');

    console.log('요청 URL:', url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    console.log('응답 상태:', response.status);
    console.log('응답 텍스트:', text);

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
      const terminals = data.response.body.items.map(item => ({
        terminalId: item.terminalId || '',
        terminalName: item.terminalName || '',
        cityCode: item.cityCode || ''
      }));
      
      return {
        statusCode: 200,
        body: JSON.stringify({ terminals })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ terminals: [] })
    };
  } catch (error) {
    console.error('터미널 조회 오류:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '서버 오류: ' + error.message })
    };
  }
};
