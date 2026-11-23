import asyncio
import requests
from pathlib import Path
from typing import Dict, Any
from .base_node import BaseNode

class TelegramNode(BaseNode):
    node_type = "telegramNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        image_path_str = inputs.get("image_path")
        bot_token = self.config.get("botToken")
        chat_id = self.config.get("chatId")
        caption = self.config.get("caption", "🎨 Ảnh tạo tự động từ Studio Flow AI!")

        if not bot_token or not chat_id:
            print(f"[TelegramNode:{self.node_id}] Chưa cấu hình botToken hoặc chatId -> Bỏ qua bước gửi.")
            return {"status": "skipped", "reason": "Thiếu botToken hoặc chatId"}

        if not image_path_str or not Path(image_path_str).exists():
            return {"status": "failed", "reason": "Không tìm thấy file ảnh để gửi"}

        url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"

        def _send():
            with open(image_path_str, 'rb') as f:
                resp = requests.post(
                    url,
                    data={"chat_id": str(chat_id), "caption": caption},
                    files={"photo": f},
                    timeout=30
                )
                return resp.json()

        loop = asyncio.get_event_loop()
        try:
            res_json = await loop.run_in_executor(None, _send)
            if res_json.get("ok"):
                print(f"[TelegramNode:{self.node_id}] Đã gửi thành công tới Chat ID {chat_id}!")
                return {"status": "success", "telegram_response": res_json}
            else:
                print(f"[TelegramNode:{self.node_id}] Lỗi Telegram API: {res_json}")
                return {"status": "failed", "telegram_error": res_json}
        except Exception as e:
            print(f"[TelegramNode:{self.node_id}] Ngoại lệ khi gửi Telegram: {e}")
            return {"status": "failed", "error": str(e)}
