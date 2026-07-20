"""
====================================================================
LEON STUDIO - Google Analytics 4 (GA4) Realtime Traffic Generator
====================================================================
Hướng dẫn sử dụng:
1. Mở file này và thay 'G-XXXXXXXXXX' bằng Mã đo lường GA4 thực tế của bạn.
2. Mở terminal và chạy lệnh: python scripts/traffic_generator.py
3. Mở trang analytics.google.com -> Mục Báo cáo -> Thời gian thực (Realtime)
   Bạn sẽ thấy lượng người dùng online nhảy liên tục 15-30 người!
====================================================================
"""

import time
import random
import urllib.request
import urllib.parse

# THAY MÃ GA4 CỦA BẠN VÀO ĐÂY (Ví dụ: G-ABC123XYZ)
GA_MEASUREMENT_ID = "G-XXXXXXXXXX"

PAGES = [
    "https://leonstudio.com.vn/",
    "https://leonstudio.com.vn/#services",
    "https://leonstudio.com.vn/#concepts",
    "https://leonstudio.com.vn/#brand-story",
    "https://leonstudio.com.vn/#work-process",
    "https://leonstudio.com.vn/#team",
    "https://leonstudio.com.vn/#blog",
]

USER_AGENTS = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/604.1",
]

def send_ga4_hit(measurement_id, client_id, page_url):
    url = "https://www.google-analytics.com/g/collect"
    params = {
        "v": "2",
        "tid": measurement_id,
        "cid": client_id,
        "en": "page_view",
        "dl": page_url,
        "dt": "LEON STUDIO | Nâng tầm vẻ đẹp",
        "ul": "vi-vn",
        "sr": random.choice(["390x844", "412x915", "1920x1080", "1440x900"]),
        "_p": str(random.randint(1000000, 9999999)),
    }
    
    req_url = f"{url}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": random.choice(USER_AGENTS)
    }
    
    try:
        req = urllib.request.Request(req_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            return response.status == 200 or response.status == 204
    except Exception as e:
        print(f"[!] Lỗi khi gửi hit: {e}")
        return False

def main():
    if GA_MEASUREMENT_ID == "G-XXXXXXXXXX":
        print("[⚠️ WARNING] Bạn chưa nhập Mã GA4 thực tế vào biến GA_MEASUREMENT_ID trong script!")
        print("Vui lòng mở file scripts/traffic_generator.py và sửa 'G-XXXXXXXXXX' thành mã thật của bạn.")
        return

    print("===============================================================")
    print(f"🚀 BẮT ĐẦU BƠM TRAFFIC CHO GA4 ({GA_MEASUREMENT_ID})...")
    print("Mở trang https://analytics.google.com -> Realtime để xem kết quả!")
    print("Nhấn Ctrl+C để dừng script bất cứ lúc nào.")
    print("===============================================================\n")

    client_pool = [f"{random.randint(100000000, 999999999)}.{random.randint(100000000, 999999999)}" for _ in range(35)]

    hit_count = 0
    try:
        while True:
            client_id = random.choice(client_pool)
            page_url = random.choice(PAGES)
            
            success = send_ga4_hit(GA_MEASUREMENT_ID, client_id, page_url)
            hit_count += 1
            if success:
                print(f"[{hit_count}] Sent pageview hit: {page_url} (Client: {client_id[:8]}...) -> OK")
            
            # Delay ngẫu nhiên từ 1 đến 3 giây giữa các hit
            time.sleep(random.uniform(1.0, 3.0))
    except KeyboardInterrupt:
        print("\n[✓] Đã dừng bơm traffic.")

if __name__ == "__main__":
    main()
