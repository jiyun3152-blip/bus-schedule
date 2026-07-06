export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchKeyword, apiKey } = req.body;

    if (!searchKeyword) {
      return res.status(400).json({ error: '검색어가 필요합니다' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    const url = new URL('https://apis.data.go.kr/1613000/ExpBusInfo/getExpBusTerminalList');
    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('searchKeyword', searchKeyword);
    url.searchParams.append('pageNo', '1');
    url.searchParams.append('numOfRows', '50');
    url.searchParams.append('_type', 'json');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.response?.body?.items) {
      const terminals = data.response.body.items.map(item => ({
        terminalId: item.terminalId || '',
        terminalName: item.terminalName || '',
        cityCode: item.cityCode || ''
      }));
      
      return res.status(200).json({ terminals });
    }

    return res.status(200).json({ terminals: [] });
  } catch (error) {
    console.error('터미널 조회 오류:', error.message);
    return res.status(500).json({ error: '서버 오류: ' + error.message });
  }
}
