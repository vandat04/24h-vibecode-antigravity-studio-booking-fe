"""
====================================================================
LEON STUDIO - Manual AI Traffic Generator for GA4
====================================================================
Quy tắc vận hành thủ công:
1. Mỗi lần bật script sẽ tự động randomize:
   - Tổng số lượt truy cập: Từ 150 đến 250 lượt (ngẫu nhiên)
   - Thời hạn thời gian chạy: Từ 2 tiếng đến 2.5 tiếng (120 phút đến 150 phút)
2. Tự động dừng khi đạt 1 trong 2 điều kiện:
   - Đạt đủ số lượt truy cập mục tiêu (150 - 250 lượt)
   - Hoặc thời gian chạy chạm mốc tối đa (2h - 2.5h)
3. Phân bổ địa lý & thiết bị:
   - ~70% Đà Nẵng
   - ~29% Tỉnh thành Việt Nam khác
   - ~1% Nước ngoài
   - 70% Điện thoại di động, 30% Máy tính
====================================================================
"""

import sys
import time
import random
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

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
    if rand_val < 0.70:
        # 70% Đà Nẵng
        subnet = random.choice(SUBNETS_DANANG)
        location = "Đà Nẵng"
    elif rand_val < 0.99:
        # 29% Các tỉnh thành VN khác
        subnet = random.choice(SUBNETS_OTHER_VN)
        location = random.choice(["Hà Nội", "TP.HCM", "Quảng Nam", "Thừa Thiên Huế", "Cần Thơ", "Hải Phòng"])
    else:
        # 1% Nước ngoài
        subnet = random.choice(SUBNETS_FOREIGN)
        location = random.choice(["United States", "Japan", "Singapore"])
    
    ip = f"{subnet}.{random.randint(1, 254)}.{random.randint(1, 254)}"
    return ip, location

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

def format_seconds(sec):
    m, s = divmod(int(sec), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m:02d}m {s:02d}s"
    return f"{m:02d}m {s:02d}s"

def main():
    # Randomize session targets
    target_hits = random.randint(150, 250)
    target_duration_minutes = random.uniform(120.0, 150.0) # 2 tiếng đến 2.5 tiếng
    target_duration_sec = target_duration_minutes * 60.0

    start_time = time.time()
    end_time_dt = datetime.now() + timedelta(seconds=target_duration_sec)

    print("====================================================================")
    print("      LEON STUDIO - THỦ CÔNG TRAFFIC GENERATOR (GA4)               ")
    print("====================================================================")
    print(f"[*] Mã GA4 Target        : {GA_MEASUREMENT_ID}")
    print(f"[*] Mục tiêu phiên ngẫu nhiên: {target_hits} lượt truy cập")
    print(f"[*] Thời hạn chạy ngẫu nhiên : {target_duration_minutes:.1f} phút (đến {end_time_dt.strftime('%H:%M:%S')})")
    print(f"[*] Phân bổ địa lý           : 70% Đà Nẵng | 29% VN khác | 1% Nước ngoài")
    print(f"[*] Điều kiện dừng           : Đạt đủ {target_hits} lượt HOẶC hết {target_duration_minutes:.1f} phút")
    print("====================================================================\n")

    hit_count = 0
    client_pool = [f"{random.randint(100000000, 999999999)}.{random.randint(100000000, 999999999)}" for _ in range(120)]

    # Calculate base average delay
    avg_delay = target_duration_sec / target_hits

    try:
        while True:
            elapsed_sec = time.time() - start_time
            
            # ĐIỀU KIỆN DỪNG 1: Vượt quá thời gian ngẫu nhiên (2h - 2.5h)
            if elapsed_sec >= target_duration_sec:
                print(f"\n[✓] HOÀN THÀNH: Đã hết thời hạn thời gian {format_seconds(elapsed_sec)} (Tối đa {target_duration_minutes:.1f} phút). Dừng script!")
                break

            # ĐIỀU KIỆN DỪNG 2: Đạt đủ số lượt ngẫu nhiên (150 - 250 lượt)
            if hit_count >= target_hits:
                print(f"\n[✓] HOÀN THÀNH: Đã đạt đủ mục tiêu {hit_count}/{target_hits} lượt truy cập. Dừng script!")
                break

            now_dt = datetime.now()
            time_str = now_dt.strftime("%H:%M:%S")
            
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
                rem_sec = max(0, target_duration_sec - elapsed_sec)
                print(f"[{time_str}] #{hit_count}/{target_hits} | Elapsed: {format_seconds(elapsed_sec)} (Còn: {format_seconds(rem_sec)}) | {location} ({client_ip}) | {device_label} -> {page_url.replace('https://leonstudio.com.vn', '') or '/'}")

            # Dynamic randomized interval jitter around avg_delay
            delay = random.uniform(avg_delay * 0.4, avg_delay * 1.6)
            time.sleep(delay)
            
    except KeyboardInterrupt:
        elapsed_sec = time.time() - start_time
        print(f"\n[✓] Đã ngắt thủ công (Ctrl+C). Tổng số lượt đã gửi: {hit_count}/{target_hits} (Thời gian đã chạy: {format_seconds(elapsed_sec)})")

if __name__ == "__main__":
    main()
