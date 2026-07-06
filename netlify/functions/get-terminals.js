exports.handler = async (event) => {
  const API_KEY = 'dc148c3c07a3236f9b83c0f5a34e8e5dd24ceaa55e1d21f547f0ae6443c08f1a';
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { searchKeyword } = JSON.parse(event.body);

    if (!searchKeyword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '검색어가 필요합니다' })
      };
    }

    const url = `https://apis.data.go.kr/1613000/ExpBusInfo/getExpBusTerminalList?serviceKey=${API_KEY}&terminalNm=${encodeURIComponent(searchKeyword)}&numOfRows=50&pageNo=1&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.body?.items) {
      const terminals = data.response.body.items.map(item => ({
        terminalId: item.terminalId || '',
        terminalNm: item.terminalNm || ''
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
    console.error('터미널 조회 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
