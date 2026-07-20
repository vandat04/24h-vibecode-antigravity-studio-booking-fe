"""
====================================================================
LEON STUDIO - Google Analytics 4 (GA4) Realtime Traffic Generator
====================================================================
Hướng dẫn sử dụng:
1. Mở terminal và chạy lệnh: python scripts/traffic_generator.py
2. Mở trang analytics.google.com -> Mục Báo cáo -> Thời gian thực (Realtime)
   Bạn sẽ thấy lượng người dùng online nhảy liên tục 15-30 người từ Việt Nam!
====================================================================
"""

import sys
import time
import random
import urllib.request
import urllib.parse

# Set console encoding to UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

GA_MEASUREMENT_ID = "G-XV55TX2K11"

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
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/604.1",
]

def get_random_vietnam_ip():
    subnets = ["113.161", "14.161", "171.244", "118.69", "27.68", "123.21", "116.108", "42.112"]
    subnet = random.choice(subnets)
    return f"{subnet}.{random.randint(1, 254)}.{random.randint(1, 254)}"

def send_ga4_session(measurement_id, client_id, page_url):
    url = "https://www.google-analytics.com/g/collect"
    client_ip = get_random_vietnam_ip()
    session_id = str(int(time.time()) - random.randint(1, 100))
    
    params = {
        "v": "2",
        "tid": measurement_id,
        "gtm": "45je57f0v9115797305z871142512za200",
        "_p": str(random.randint(10000000, 99999999)),
        "cid": client_id,
        "ul": "vi-vn",
        "sr": random.choice(["390x844", "412x915", "1920x1080", "1440x900"]),
        "uaa": "x86",
        "uab": "64",
        "uafvl": "Chromium;123.0.6312.86",
        "uip": client_ip,
        "sid": session_id,          # GA4 Session ID
        "sct": "1",                 # Session Count
        "seg": "1",                 # Session Engaged (1 = Engaged session)
        "en": "page_view",          # Event Name
        "_ee": "1",                 # Engaged event flag
        "_et": str(random.randint(2000, 8000)), # Engagement time in ms (2-8 seconds)
        "dl": page_url,
        "dt": "LEON STUDIO | Nâng tầm vẻ đẹp",
    }
    
    req_url = f"{url}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "X-Forwarded-For": client_ip,
        "Client-IP": client_ip,
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    }
    
    try:
        req = urllib.request.Request(req_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"[!] Lỗi kết nối: {e}")
        return False

def main():
    print("===============================================================")
    print(f"[+] BAT DAU BOM TRAFFIC GA4 SEEN THOI GIAN THUC ({GA_MEASUREMENT_ID})...")
    print("[+] MO TRANG: Analytics -> Báo cáo (Reports) -> Thời gian thực (Realtime)")
    print("[+] Nhan Ctrl+C de dung script bat cu luc nao.")
    print("===============================================================\n")

    hit_count = 0
    try:
        while True:
            # Generate unique client ID & session per hit to register multiple online users
            client_id = f"{random.randint(100000000, 999999999)}.{random.randint(100000000, 999999999)}"
            page_url = random.choice(PAGES)
            
            success = send_ga4_session(GA_MEASUREMENT_ID, client_id, page_url)
            hit_count += 1
            if success:
                print(f"[{hit_count}] Active User Online: {page_url} (Client: {client_id[:9]}...) -> GA4 OK")
            
            time.sleep(random.uniform(0.5, 1.5))
    except KeyboardInterrupt:
        print("\n[+] Da dung script.")

if __name__ == "__main__":
    main()
