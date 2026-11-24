const http = require('http');
const path = require('path');
const fs = require('fs');

const globalNpmPath = path.join(process.env.APPDATA, 'npm', 'node_modules');
const WebSocket = require(path.join(globalNpmPath, 'ws'));

const CDP_PORT = 9222;
const SUPPORTED_AGENTS = [
  'gemini.google.com',
  'claude.ai',
  'chatgpt.com',
  'chat.openai.com',
  'grok.com'
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.id && this.callbacks.has(data.id)) {
          const { res, rej } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) rej(data.error);
          else res(data.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callId = this.id++;
      this.callbacks.set(callId, { res: resolve, rej: reject });
      this.ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function dispatch(planPath, extraInstructions = '') {
  const absPlan = path.resolve(planPath);
  if (!fs.existsSync(absPlan)) {
    console.error(`[Dispatcher Error] File plan không tồn tại: ${absPlan}`);
    process.exit(1);
  }

  console.log(`[Dispatcher] Đang tìm kiếm Web Agent trên cổng CDP ${CDP_PORT}...`);
  let tabs;
  try {
    tabs = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
  } catch (err) {
    console.error(`[Dispatcher Error] Không thể kết nối cổng CDP ${CDP_PORT}. Đảm bảo Chrome đã mở với debug!`);
    process.exit(1);
  }

  const agentTab = tabs.find(t => t.type === 'page' && SUPPORTED_AGENTS.some(p => t.url && t.url.includes(p)));
  if (!agentTab) {
    console.error('[Dispatcher Error] Không tìm thấy tab Web Agent (Gemini, Claude, ChatGPT, Grok) nào đang mở!');
    process.exit(1);
  }

  console.log(`[Dispatcher] Đã tìm thấy Web Agent tab: "${agentTab.title}" (${agentTab.url})`);
  const cdp = new CDPClient(agentTab.webSocketDebuggerUrl);
  await cdp.connect();

  const promptText = 
`@AkiMCP Tôi đã chuẩn bị bản kế hoạch chi tiết tại file: ${absPlan}
YÊU CẦU BẮT BUỘC DÀNH CHO BUILDER AGENT:
1. Đọc kỹ file plan trên và TỰ ĐỘNG THỰC THI NGAY bằng công cụ AkiMCP (aki__edit_file, aki__write_file, aki__run_cmd).
2. TUYỆT ĐỐI KHÔNG DỪNG LẠI HỎI Ý KIẾN hay yêu cầu người dùng xác nhận 'Tiếp tục' / 'Proceed'. Phải tự động ghi file trực tiếp trên ổ cứng.
3. Luôn gọi 'aki__akidevrule_context' để nhận mã receipt hợp lệ trước khi thao tác file.
4. QUẢN LÝ VÒNG ĐỜI PLAN: Sau khi hoàn tất triển khai và kiểm tra code xong, hãy tự động di chuyển file plan này vào thư mục archive:
   - Dùng lệnh 'aki__create_directory' tạo thư mục con 'archive' (nếu chưa có).
   - Dùng lệnh 'aki__move_file' di chuyển file plan này vào thư mục 'archive' (ví dụ: chuyển sang '.../docs/plans/archive/${path.basename(absPlan)}').
${extraInstructions ? `\nLưu ý bổ sung: ${extraInstructions}\n` : ''}
Bắt tay vào thi công trực tiếp ngay bây giờ và chỉ phản hồi khi toàn bộ thay đổi và di chuyển plan vào archive đã hoàn tất.`;

  console.log(`[Dispatcher] Đang kích hoạt focus và nhập nội dung...`);

  // Bước 1: Focus vào input element trên trang
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('rich-textarea [contenteditable]') || 
                 document.querySelector('.ql-editor') || 
                 document.querySelector('div[contenteditable="true"]') ||
                 document.querySelector('textarea');
      if (el) {
        el.focus();
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  });

  // Bước 2: Dùng lệnh CDP Input.insertText để browser phát sinh đầy đủ input events
  await cdp.send('Input.insertText', { text: promptText });
  console.log(`[Dispatcher] Đã nhập prompt qua CDP Input.insertText.`);

  // Đợi 800ms để UI render nút send
  await new Promise(r => setTimeout(r, 800));

  // Bước 3: Tìm nút send hoặc ấn Enter
  const clickResult = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      // Tìm nút gửi trên Gemini / Claude / ChatGPT
      const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
      const sendBtn = btns.find(b => {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const cls = (b.className || '').toLowerCase();
        return (aria.includes('gửi') || aria.includes('send') || cls.includes('send-button')) && b.offsetParent !== null;
      });

      if (sendBtn) {
        sendBtn.click();
        return { clickedButton: true, aria: sendBtn.getAttribute('aria-label') };
      }
      return { clickedButton: false };
    })()`,
    returnByValue: true,
    userGesture: true
  });

  if (!clickResult.result.value || !clickResult.result.value.clickedButton) {
    console.log(`[Dispatcher] Không thấy nút Gửi rõ ràng, đang gửi phím Enter qua CDP...`);
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      windowsVirtualKeyCode: 13,
      unmodifiedText: '\r',
      text: '\r'
    });
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      windowsVirtualKeyCode: 13,
      unmodifiedText: '\r',
      text: '\r'
    });
  } else {
    console.log(`[Dispatcher] Đã click nút:`, clickResult.result.value.aria);
  }

  console.log(`[Dispatcher Thành công] Đã kích hoạt gửi plan sang Web Agent!`);
  cdp.close();
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node dispatch_to_agent.js <path-to-plan.md> [extra-instructions]");
  process.exit(0);
}

dispatch(args[0], args[1] || '').catch(err => {
  console.error('[Dispatcher Error]', err);
  process.exit(1);
});
