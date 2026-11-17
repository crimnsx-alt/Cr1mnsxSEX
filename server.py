import http.server
import socketserver
import subprocess
import urllib.parse
import json
import os
import sys

PORT = 8090
WORKSPACE = '/Users/cr1mnsx/ps5ux'
CONFIG_FILE = os.path.join(WORKSPACE, 'donate_config.json')

def get_lan_ip():
    for iface in ('en0', 'en1', 'wlan0', 'eth0'):
        try:
            proc = subprocess.run(['ipconfig', 'getifaddr', iface], capture_output=True, text=True, timeout=2)
            ip = proc.stdout.strip()
            if ip and not ip.startswith('127.'):
                return ip
        except Exception:
            pass
    return '127.0.0.1'

def get_donate_config():
    default_config = {
        "service": "donationalerts",
        "target_url": "https://www.donationalerts.com/r/cr1mnsx",
        "nickname": "cr1mnsx",
        "title": "DonationAlerts — Поддержка проекта",
        "description": "Анонимная поддержка автора через DonationAlerts (Сбербанк, SberPay, СБП, карты)",
        "currency": "RUB",
        "preset_amounts": [100, 300, 500, 1000]
    }
    cfg = dict(default_config)
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                cfg.update(json.load(f))
        except Exception:
            pass
    lan_ip = get_lan_ip()
    cfg['lan_ip'] = lan_ip
    cfg['server_port'] = PORT
    cfg['dynamic_url'] = f"http://{lan_ip}:{PORT}/donate"
    return cfg

class PS5ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORKSPACE, **kwargs)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        clean_path = self.path.split('?')[0]
        local_file = os.path.join(WORKSPACE, clean_path.lstrip('/'))

        # 1. Dynamic Donate / Tips Endpoint (Eternal QR destination)
        if clean_path in ('/donate', '/tips'):
            config = get_donate_config()
            target = config.get('target_url', 'https://tips.sberbank.ru')
            if '?json=1' in self.path or 'application/json' in self.headers.get('Accept', ''):
                data = json.dumps(config, ensure_ascii=False).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
                return

            # Direct redirect to user's SberЧаевые page
            self.send_response(302)
            self.send_header('Location', target)
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            return

        if clean_path == '/api/donate-config':
            config = get_donate_config()
            data = json.dumps(config, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
            return

        # 2. Local workspace files have priority
        if clean_path != '/' and os.path.exists(local_file) and not os.path.isdir(local_file):
            return super().do_GET()

        # 3. Proxy routes
        if self.path.startswith('/wasmarcade/'):
            subpath = self.path[len('/wasmarcade/'):]
            return self.proxy_via_curl('https://wasmarcade.com/' + subpath)

        if self.path.startswith('/nfsu2/'):
            subpath = self.path[len('/nfsu2/'):]
            return self.proxy_via_curl('https://nfsu2.xyz/' + subpath)

        # 4. Static assets requested by wasmarcade
        if any(clean_path.startswith(p) for p in ('/covers/', '/og/', '/favicon.', '/icon.')):
            return self.proxy_via_curl('https://wasmarcade.com' + self.path)

        return super().do_GET()

    def do_POST(self):
        clean_path = self.path.split('?')[0]
        if clean_path == '/api/donate-config':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                new_data = json.loads(body.decode('utf-8'))
                config = get_donate_config()
                if 'target_url' in new_data and new_data['target_url']:
                    config['target_url'] = new_data['target_url'].strip()
                if 'nickname' in new_data:
                    config['nickname'] = new_data['nickname'].strip()
                with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                    json.dump(config, f, ensure_ascii=False, indent=2)

                resp = json.dumps({"ok": True, "config": config}, ensure_ascii=False).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        self.send_response(404)
        self.end_headers()

    def proxy_via_curl(self, target_url):
        try:
            cmd = [
                'curl', '-s', '-i',
                '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                target_url
            ]
            proc = subprocess.run(cmd, capture_output=True, timeout=20)
            raw = proc.stdout

            header_end = raw.find(b'\r\n\r\n')
            if header_end == -1:
                header_end = raw.find(b'\n\n')
                sep_len = 2
            else:
                sep_len = 4

            if header_end != -1:
                header_data = raw[:header_end].decode('iso-8859-1', errors='replace')
                body_data = raw[header_end + sep_len:]
            else:
                header_data = "HTTP/1.1 200 OK\r\nContent-Type: text/html"
                body_data = raw

            lines = header_data.splitlines()
            status_line = lines[0] if lines else "HTTP/1.1 200 OK"
            status_parts = status_line.split(' ', 2)
            try:
                status_code = int(status_parts[1])
            except Exception:
                status_code = 200

            self.send_response(status_code)

            content_type = 'text/html; charset=utf-8'
            for line in lines[1:]:
                if ':' in line:
                    k, v = line.split(':', 1)
                    lk = k.strip().lower()
                    if lk in ('x-frame-options', 'content-security-policy', 'frame-ancestors', 'content-length', 'content-encoding', 'transfer-encoding'):
                        continue
                    if lk == 'content-type':
                        content_type = v.strip()
                    self.send_header(k.strip(), v.strip())

            self.send_header('Content-Length', str(len(body_data)))
            self.send_header('X-Frame-Options', 'ALLOWALL')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
            self.send_header('Cross-Origin-Embedder-Policy', 'credentialless')
            self.end_headers()
            self.wfile.write(body_data)

        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(f"Proxy error loading {target_url}: {e}".encode('utf-8'))

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    lan_ip = get_lan_ip()
    with socketserver.TCPServer(('0.0.0.0', PORT), PS5ProxyHandler) as httpd:
        print(f"PS5 Server + Game Proxy running on:")
        print(f"  Local:   http://127.0.0.1:{PORT}")
        print(f"  Network: http://{lan_ip}:{PORT}")
        print(f"  Donate:  http://{lan_ip}:{PORT}/donate")
        httpd.serve_forever()
