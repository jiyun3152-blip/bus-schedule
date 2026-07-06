export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { depTerminalId, arrTerminalId, depPlandTime, apiKey } = req.body;

    if (!depTerminalId || !arrTerminalId || !depPlandTime || !apiKey) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다' });
    }

    const url = new URL('https://apis.data.go.kr/1613000/ExpBusInfo/searchExpBusInfo');
    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('depTerminalId', depTerminalId);
    url.searchParams.append('arrTerminalId', arrTerminalId);
    url.searchParams.append('depPlandTime', depPlandTime);
    url.searchParams.append('pageNo', '1');
    url.searchParams.append('numOfRows', '100');
    url.searchParams.append('_type', 'json');

    const response = await fetch(url.toString());
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
      
      return res.status(200).json({ buses });
    }

    return res.status(200).json({ buses: [] });
  } catch (error) {
    console.error('버스 조회 오류:', error.message);
    return res.status(500).json({ error: '서버 오류: ' + error.message });
  }
}
