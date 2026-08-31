import os
import subprocess
import platform
import psutil
import webbrowser
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="AI Voice Assistant")
app.mount("/static", StaticFiles(directory=str(BASE_DIR)), name="static")


class CommandRequest(BaseModel):
    command: str


@app.get("/", response_class=HTMLResponse)
async def root():
    with open(BASE_DIR / "index.html", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.post("/api/command")
async def handle_command(req: CommandRequest):
    cmd = req.command.lower().strip()

    # Remove wake word artifacts
    for w in ['hey', 'okay', 'ok', 'ali', 'alexa', 'siri', 'google']:
        if cmd.startswith(w + ' '):
            cmd = cmd[len(w):].strip()

    # ===== GREETINGS =====
    if any(w in cmd for w in ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon']):
        if len(cmd.split()) <= 3:
            return {"speak": True, "reply": "Hello! How can I help you?"}

    if any(w in cmd for w in ['how are you', 'how are you doing']):
        return {"speak": True, "reply": "I'm doing great! How can I help you?"}

    if any(w in cmd for w in ['thank', 'thanks']):
        return {"speak": True, "reply": "You're welcome!"}

    if any(w in cmd for w in ['bye', 'goodbye', 'see you later']):
        return {"speak": True, "reply": "Goodbye! Have a great day!"}

    if any(w in cmd for w in ['who are you', 'your name', 'what are you']):
        return {"speak": True, "reply": "I'm your AI Voice Assistant. I can help you control your computer with voice commands. Just say Hey, then tell me what to do!"}

    # ===== TIME =====
    if any(w in cmd for w in ['what time', 'current time', 'time is it', 'tell me the time', 'tell me time']):
        now = datetime.now().strftime("%I:%M %p")
        return {"speak": True, "reply": f"The current time is {now}."}

    # ===== DATE =====
    if any(w in cmd for w in ['what date', 'today date', 'what day', 'date today', 'what is today']):
        today = datetime.now().strftime("%A, %B %d, %Y")
        return {"speak": True, "reply": f"Today is {today}."}

    # ===== HELP =====
    if any(w in cmd for w in ['help', 'what can you do', 'features', 'capabilities', 'options', 'commands']):
        return {"speak": True, "reply": "I can help you with: Opening apps like Notepad, Calculator, Chrome. Searching Google. Taking screenshots. Showing system info. Reading files. Locking your computer. And more. Just say Hey, then your command!"}

    # ===== OPEN APPS =====
    open_apps = {
        'notepad': 'notepad.exe',
        'calculator': 'calc.exe',
        'calc': 'calc.exe',
        'paint': 'mspaint.exe',
        'wordpad': 'write.exe',
        'command prompt': 'cmd.exe',
        'cmd': 'cmd.exe',
        'terminal': 'cmd.exe',
        'task manager': 'taskmgr.exe',
        'file explorer': 'explorer.exe',
        'explorer': 'explorer.exe',
        'control panel': 'control.exe',
        'snipping tool': 'snippingtool.exe',
        'settings': 'ms-settings:',
        'chrome': 'chrome',
        'google chrome': 'chrome',
        'firefox': 'firefox',
        'edge': 'msedge',
        'vs code': 'code',
        'visual studio': 'code',
        'word': 'winword',
        'excel': 'excel',
        'powerpoint': 'powerpnt',
    }

    for name, exe in open_apps.items():
        if f'open {name}' in cmd or f'launch {name}' in cmd or f'start {name}' in cmd or f'run {name}' in cmd:
            try:
                if name == 'settings' or name == 'control panel':
                    os.system(f'start "" "{exe}"')
                else:
                    subprocess.Popen(exe, shell=True)
                return {"speak": True, "reply": f"Opening {name} for you."}
            except:
                return {"speak": True, "reply": f"Sorry, I couldn't open {name}."}

    # ===== OPEN WEBSITES =====
    websites = {
        'google': 'https://google.com',
        'youtube': 'https://youtube.com',
        'github': 'https://github.com',
        'gmail': 'https://mail.google.com',
        'google mail': 'https://mail.google.com',
        'facebook': 'https://facebook.com',
        'twitter': 'https://twitter.com',
        'instagram': 'https://instagram.com',
        'linkedin': 'https://linkedin.com',
        'reddit': 'https://reddit.com',
        'wikipedia': 'https://wikipedia.org',
        'amazon': 'https://amazon.com',
        'netflix': 'https://netflix.com',
        'chatgpt': 'https://chat.openai.com',
        'openai': 'https://chat.openai.com',
        'maps': 'https://maps.google.com',
        'google maps': 'https://maps.google.com',
        'weather': 'https://weather.com',
        'news': 'https://news.google.com',
    }

    for name, url in websites.items():
        if f'open {name}' in cmd or f'go to {name}' in cmd or f'visit {name}' in cmd:
            webbrowser.open(url)
            return {"speak": True, "reply": f"Opening {name} in your browser."}

    # ===== SEARCH =====
    if any(cmd.startswith(p) for p in ['search ', 'google ', 'look up ', 'find ', 'search for ']):
        query = cmd
        for p in ['search for ', 'search ', 'google ', 'look up ', 'find ']:
            if query.startswith(p):
                query = query[len(p):].strip()
                break
        if query:
            webbrowser.open(f"https://www.google.com/search?q={query}")
            return {"speak": True, "reply": f"Searching Google for {query}."}

    # ===== SYSTEM INFO =====
    if any(w in cmd for w in ['system info', 'systeminfo', 'about my computer', 'computer info', 'pc info', 'my computer']):
        uname = platform.uname()
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        cpu = psutil.cpu_percent(interval=0.5)
        info = (
            f"System: {uname.system} {uname.release}\n"
            f"Computer: {uname.node}\n"
            f"Processor: {uname.machine}\n"
            f"CPU Usage: {cpu}%\n"
            f"Memory: {mem.percent}% used of {round(mem.total/1024**3, 1)} GB\n"
            f"Disk: {disk.percent}% used of {round(disk.total/1024**3, 1)} GB"
        )
        return {"speak": True, "reply": f"Your system is {uname.system}. CPU is at {cpu} percent. Memory is {mem.percent} percent used.", "output": info}

    # ===== BATTERY =====
    if any(w in cmd for w in ['battery', 'power', 'charge']):
        if hasattr(psutil, "sensors_battery"):
            bat = psutil.sensors_battery()
            if bat:
                status = "charging" if bat.power_plugged else "not charging"
                return {"speak": True, "reply": f"Battery is at {bat.percent}% and {status}."}
        return {"speak": True, "reply": "Battery info not available."}

    # ===== SCREENSHOT =====
    if any(w in cmd for w in ['screenshot', 'take a screenshot', 'capture', 'screen capture']):
        path = BASE_DIR / f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        try:
            from PIL import ImageGrab
            img = ImageGrab.grab()
            img.save(str(path))
            return {"speak": True, "reply": f"Screenshot saved!"}
        except:
            try:
                import ctypes
                user32 = ctypes.windll.user32
                w, h = user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
                subprocess.run(f'powershell -command "Add-Type -AssemblyName System.Windows.Forms; $bmp = New-Object System.Drawing.Bitmap({w}, {h}); $gfx = [System.Drawing.Graphics]::FromImage($bmp); $gfx.CopyFromScreen(0, 0, 0, 0, $bmp.Size); $bmp.Save(\'{path}\')"', shell=True)
                return {"speak": True, "reply": "Screenshot saved!"}
            except:
                return {"speak": True, "reply": "Could not take screenshot."}

    # ===== LOCK PC =====
    if any(w in cmd for w in ['lock', 'lock my computer', 'lock screen', 'lock pc', 'lock my pc']):
        os.system("rundll32.exe user32.dll,LockWorkStation")
        return {"speak": True, "reply": "Locking your computer."}

    # ===== SHUTDOWN =====
    if any(w in cmd for w in ['shutdown', 'shut down', 'turn off']):
        if 'cancel' in cmd or 'stop' in cmd or 'abort' in cmd:
            os.system('shutdown /a')
            return {"speak": True, "reply": "Shutdown cancelled."}
        os.system('shutdown /s /t 60')
        return {"speak": True, "reply": "Computer will shut down in 60 seconds. Say shutdown cancel to stop it."}

    # ===== RESTART =====
    if any(w in cmd for w in ['restart', 'reboot']):
        os.system('shutdown /r /t 60')
        return {"speak": True, "reply": "Computer will restart in 60 seconds."}

    # ===== LIST FILES =====
    if any(w in cmd for w in ['list files', 'my files', 'show files', 'list documents', 'my documents', 'show my files']):
        target = Path.home() / "Documents"
        if 'desktop' in cmd:
            target = Path.home() / "Desktop"
        elif 'downloads' in cmd:
            target = Path.home() / "Downloads"
        elif 'pictures' in cmd:
            target = Path.home() / "Pictures"
        elif 'music' in cmd:
            target = Path.home() / "Music"
        elif 'videos' in cmd:
            target = Path.home() / "Videos"

        try:
            items = list(target.iterdir())
            output = "\n".join([f"{'[DIR]' if f.is_dir() else '[FILE]'} {f.name}" for f in items[:20]])
            count = len(items)
            return {"speak": True, "reply": f"You have {count} items in {target.name}. Showing first 20.", "output": output}
        except Exception as e:
            return {"speak": True, "reply": f"Could not list files."}

    # ===== READ FILE =====
    if any(w in cmd for w in ['read file', 'open file', 'show file', 'read']):
        for prefix in ['read file ', 'open file ', 'show file ', 'read ']:
            if prefix in cmd:
                path_str = cmd.split(prefix, 1)[-1].strip()
                path = Path(path_str)
                if path.exists() and path.is_file():
                    try:
                        content = path.read_text(encoding='utf-8', errors='ignore')
                        if len(content) > 2000:
                            content = content[:2000] + "\n... (truncated)"
                        return {"speak": True, "reply": f"Reading {path.name}.", "output": content}
                    except:
                        return {"speak": True, "reply": "Could not read that file."}
                break
        return {"speak": True, "reply": "File not found."}

    # ===== PROCESSES =====
    if any(w in cmd for w in ['running', 'processes', 'what is running', 'task list', 'show processes', 'what apps']):
        procs = []
        for p in psutil.process_iter(['name', 'memory_percent']):
            try:
                info = p.info
                procs.append(f"{info['name']} - RAM: {round(info['memory_percent'] or 0, 1)}%")
            except:
                pass
        procs.sort(key=lambda x: float(x.split('RAM: ')[1].replace('%', '')), reverse=True)
        output = '\n'.join(procs[:15])
        return {"speak": True, "reply": "Here are the top 15 processes.", "output": output}

    # ===== NETWORK =====
    if any(w in cmd for w in ['ip address', 'my ip', 'network', 'ipconfig', 'show ip']):
        result = subprocess.run('ipconfig', capture_output=True, text=True, shell=True)
        return {"speak": True, "reply": "Here's your network information.", "output": result.stdout[:2000]}

    # ===== VOLUME =====
    if 'volume' in cmd or 'mute' in cmd or 'unmute' in cmd:
        if 'up' in cmd or 'increase' in cmd or 'louder' in cmd:
            os.system('powershell -command "$obj = New-Object -ComObject WScript.Shell; for($i=0;$i -lt 5;$i++){$obj.SendKeys([char]175)}"')
            return {"speak": True, "reply": "Volume increased."}
        elif 'down' in cmd or 'decrease' in cmd or 'quieter' in cmd:
            os.system('powershell -command "$obj = New-Object -ComObject WScript.Shell; for($i=0;$i -lt 5;$i++){$obj.SendKeys([char]174)}"')
            return {"speak": True, "reply": "Volume decreased."}
        elif 'mute' in cmd:
            os.system('powershell -command "$obj = New-Object -ComObject WScript.Shell; $obj.SendKeys([char]173)"')
            return {"speak": True, "reply": "Volume muted."}

    # ===== UNKNOWN =====
    return {"speak": True, "reply": "I didn't understand that. Try saying help to see what I can do."}


if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 50)
    print("  AI Voice Assistant Ready!")
    print("  Open: http://127.0.0.1:8000")
    print("  Say 'Hey' then your command")
    print("=" * 50 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
