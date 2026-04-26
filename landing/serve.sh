#!/bin/bash
cd "$(dirname "$0")"
exec python3 -c "
import os, http.server, socketserver
PORT = 8080
with socketserver.TCPServer(('', PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
"
