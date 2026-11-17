"""Local dev server for the Instellars Insurance demo site (no caching, so edits show on refresh).

Usage:  python serve.py [port]      then open http://localhost:8765
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    print(f"Serving Instellars Insurance on http://localhost:{PORT}")
    http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
