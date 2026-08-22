const accounts = [
  { username: 'admin', password: 'admin123456' },
  { username: 'thon1', password: 'qlcs2025' },
  { username: 'thon2', password: 'qlcs2025' },
  { username: 'thon3', password: 'qlcs2025' },
  { username: 'thon4', password: 'qlcs2025' },
  { username: 'thonkontranglongloi', password: 'qlcs2025' },
  { username: 'longloi', password: 'qlcs2025' },
  { username: 'thonkontudo1', password: 'qlcs2025' },
  { username: 'tudo1', password: 'qlcs2025' },
  { username: 'thonkontudo2', password: 'qlcs2025' },
  { username: 'tudo2', password: 'qlcs2025' },
];

async function test() {
  console.log('=== KIỂM THỬ ĐĂNG NHẬP THỰC TẾ QUA SSO GATEWAY (PORT 5000) ===');
  for (const acc of accounts) {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acc),
        signal: AbortSignal.timeout(3000),
      });
      const resJson = await res.json();
      if (res.ok && resJson.data) {
        const user = resJson.data.user;
        console.log(`✅ [${acc.username.padEnd(20)}] -> Role: ${user.role} | Village: ${user.village_id || 'Toàn xã'}`);
      } else {
        console.log(`❌ Thất bại: [${acc.username.padEnd(20)}] -> HTTP ${res.status}: ${resJson.error}`);
      }
    } catch (e: any) {
      console.log(`❌ Lỗi: [${acc.username}] -> ${e.message}`);
    }
  }
}

test();
