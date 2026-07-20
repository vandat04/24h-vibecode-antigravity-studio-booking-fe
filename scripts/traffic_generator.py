"""
====================================================================
LEON STUDIO - Smart AI Traffic Generator for Google Analytics 4 (GA4)
====================================================================
Tính năng thông minh:
1. Tập trung cao điểm vào các khung giờ: 12h00 - 13h30 & 19h00 - 20h00
2. Phân bổ địa lý tự nhiên: 
   - ~65% Đà Nẵng
   - ~34% Hà Nội, TP.HCM và các tỉnh thành khác
   - ~1% Nước ngoài (Mỹ, Nhật, Singapore)
3. Thiết bị: 70% Điện thoại di động (iOS/Android), 30% Máy tính
4. Nhắm tới khoảng ~300 lượt xem/ngày với biến thiên ngẫu nhiên tự nhiên
====================================================================
"""

import sys
import time
import random
import urllib.request
import urllib.parse
from datetime import datetime

# Set console encoding to UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

GA_MEASUREMENT_ID = "G-XV55TX2K11"
TARGET_DAILY_HITS = 300

PAGES = [
    "https://leonstudio.com.vn/",
    "https://leonstudio.com.vn/#services",
    "https://leonstudio.com.vn/#concepts",
    "https://leonstudio.com.vn/#brand-story",
    "https://leonstudio.com.vn/#work-process",
    "https://leonstudio.com.vn/#team",
    "https://leonstudio.com.vn/#blog",
]

USER_AGENTS_MOBILE = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; CPH2451) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
]

USER_AGENTS_DESKTOP = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

SUBNETS_DANANG = ["113.160", "14.161", "42.112", "27.68", "116.108"]
SUBNETS_OTHER_VN = ["118.69", "171.244", "123.21", "27.72", "113.190", "14.226"]
SUBNETS_FOREIGN = ["172.56", "133.242", "118.189", "54.210"]

def generate_location_ip():
    rand_val = random.random()
    if rand_val < 0.65:
        subnet = random.choice(SUBNETS_DANANG)
        location = "Đà Nẵng"
    elif rand_val < 0.99:
        subnet = random.choice(SUBNETS_OTHER_VN)
        location = random.choice(["Hà Nội", "TP.HCM", "Quảng Nam", "Thừa Thiên Huế", "Cần Thơ", "Hải Phòng"])
    else:
        subnet = random.choice(SUBNETS_FOREIGN)
        location = random.choice(["United States", "Japan", "Singapore"])
    
    ip = f"{subnet}.{random.randint(1, 254)}.{random.randint(1, 254)}"
    return ip, location

def is_peak_hour(now_dt):
    hour = now_dt.hour
    minute = now_dt.minute
    
    if (hour == 12) or (hour == 13 and minute <= 30):
        return True, "Cao điểm trưa (12h-13h30)"
    
    if hour == 19:
        return True, "Cao điểm tối (19h-20h)"
        
    return False, "Bình thường"

def calculate_delay(now_dt):
    peak, _ = is_peak_hour(now_dt)
    hour = now_dt.hour
    
    if peak:
        return random.uniform(0.5, 1.8)
    elif 8 <= hour <= 22:
        return random.uniform(2.0, 5.0)
    else:
        return random.uniform(10.0, 30.0)

def send_ga4_session(measurement_id, client_id, page_url, client_ip, user_agent):
    url = "https://www.google-analytics.com/g/collect"
    session_id = str(int(time.time()) - random.randint(1, 200))
    
    params = {
        "v": "2",
        "tid": measurement_id,
        "gtm": "45je57f0v9115797305z871142512za200",
        "_p": str(random.randint(10000000, 99999999)),
        "cid": client_id,
        "ul": "vi-vn",
        "sr": random.choice(["390x844", "412x915", "1920x1080", "1440x900"]),
        "uip": client_ip,
        "sid": session_id,
        "sct": "1",
        "seg": "1",
        "en": "page_view",
        "_ee": "1",
        "_et": str(random.randint(3000, 12000)),
        "dl": page_url,
        "dt": "LEON STUDIO | Nâng tầm vẻ đẹp",
    }
    
    req_url = f"{url}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": user_agent,
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
        print(f"[!] Lỗi gửi: {e}")
        return False

def main():
    max_hits = None
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        max_hits = int(sys.argv[1])

    print("====================================================================")
    print("      LEON STUDIO - AI SMART TRAFFIC GENERATOR (GA4)               ")
    print("====================================================================")
    print(f"[*] Mã GA4 Target   : {GA_MEASUREMENT_ID}")
    print(f"[*] Mục tiêu giới hạn: {max_hits if max_hits else 'Chạy liên tục (Vòng lặp)'}")
    print("[*] Khung cao điểm   : 12h00 - 13h30 & 19h00 - 20h00")
    print("[*] Tỷ lệ địa lý    : 65% Đà Nẵng | 34% Tỉnh khác | 1% Nước ngoài")
    print("====================================================================\n")

    hit_count = 0
    client_pool = [f"{random.randint(100000000, 999999999)}.{random.randint(100000000, 999999999)}" for _ in range(100)]

    try:
        while True:
            if max_hits and hit_count >= max_hits:
                print(f"\n[✓] Đã hoàn thành đợt bơm {hit_count}/{max_hits} lượt ngẫu nhiên.")
                break

            now_dt = datetime.now()
            time_str = now_dt.strftime("%H:%M:%S")
            peak, peak_label = is_peak_hour(now_dt)
            
            client_id = random.choice(client_pool)
            page_url = random.choice(PAGES)
            client_ip, location = generate_location_ip()
            
            if random.random() < 0.7:
                user_agent = random.choice(USER_AGENTS_MOBILE)
                device_label = "Mobile"
            else:
                user_agent = random.choice(USER_AGENTS_DESKTOP)
                device_label = "Desktop"

            success = send_ga4_session(GA_MEASUREMENT_ID, client_id, page_url, client_ip, user_agent)
            
            if success:
                hit_count += 1
                mode_tag = f"[{peak_label.upper()}]" if peak else "[THƯỜNG]"
                print(f"[{time_str}] #{hit_count} {mode_tag} Location: {location} ({client_ip}) | Device: {device_label} -> {page_url.replace('https://leonstudio.com.vn', '') or '/'}")

            delay = calculate_delay(now_dt)
            time.sleep(delay)
            
    except KeyboardInterrupt:
        print(f"\n[✓] Đã dừng script. Tổng lượt đã gửi trong phiên: {hit_count}")

if __name__ == "__main__":
    main()
