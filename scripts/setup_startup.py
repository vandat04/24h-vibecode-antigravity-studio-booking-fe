import os
import subprocess

startup_dir = os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup")
vbs_path = r"d:\3.MarketStudio\studio_fe\scripts\run_background.vbs"
shortcut_path = os.path.join(startup_dir, "LeonStudioTraffic.lnk")

ps_script = f"""
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut('{shortcut_path}')
$sc.TargetPath = '{vbs_path}'
$sc.Save()
"""

try:
    subprocess.run(["powershell", "-Command", ps_script], check=True)
    print("SUCCESS: Windows Startup Shortcut created at:", shortcut_path)
except Exception as e:
    print("ERROR:", e)
