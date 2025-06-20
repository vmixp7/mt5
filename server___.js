module.exports = async ()=>{

  console.log('go!');

  const fetch = require('node-fetch');
  const fetchCookie = require('fetch-cookie');
  const { CookieJar } = require('tough-cookie');
  const crypto = require('crypto');
  const https = require('https');

  // === 配置參數 ===
  const SERVER = 'webapi.anshinfx.com';
  const LOGIN = '2003';
  const PASSWORD = 'V!Ma5qIb123'; // ← 請替換成你實際密碼

  // === 準備 cookie + agent
  const jar = new CookieJar();
  const fetchWithCookie = fetchCookie(fetch, jar);
  const agent = new https.Agent({ rejectUnauthorized: false }); // 忽略自簽憑證

  // === 登入流程
  async function loginMT5() {
    try {
      // 1️啟動登入流程
      const url1 = `https://${SERVER}/auth_start?version=500&agent=NodeClient&login=${LOGIN}&type=manager`;
      const res1 = await fetchWithCookie(url1, { agent });
      const data1 = await res1.json();
      console.log('auth_start 回應:', data1);

      if (!data1.srv_rand) throw new Error('未取得 srv_rand');

      // 2️正確的 srv_rand_answer 計算
      const pwd1 = crypto.createHash('md5').update(Buffer.from(PASSWORD, 'utf16le')).digest(); // Buffer
      const pwd2 = crypto.createHash('md5').update(Buffer.concat([pwd1, Buffer.from('WebAPI')])).digest(); // Buffer
      const srvRandBuffer = Buffer.from(data1.srv_rand, 'hex');
      const srv_rand_answer = crypto.createHash('md5').update(Buffer.concat([pwd2, srvRandBuffer])).digest('hex');
      const cli_rand = crypto.randomBytes(16).toString('hex');



      console.log('傳送認證資料:', { srv_rand_answer, cli_rand });

      // 3️回傳答案認證
      const url2 = `https://${SERVER}/auth_answer?srv_rand_answer=${srv_rand_answer}&cli_rand=${cli_rand}`;
      const res2 = await fetchWithCookie(url2, { agent });
      const rawText = await res2.text();
      console.log('rawText', rawText);

      let data2;
      try {
        data2 = JSON.parse(rawText);
      } catch (e) {
        console.error('auth_answer 回應不是合法 JSON：', rawText);
        throw new Error('無法解析 JSON:' + e.message);
      }

      // 登入檢查
      if (data2.retcode && data2.retcode.includes('Done')) {
        console.log('登入成功');
      } else {
        throw new Error('登入失敗: ' + (data2.retcode || '未知錯誤'));
      }
    } catch (err) {
      console.error('登入錯誤:', err.message);
    }
  }

  await loginMT5();
}