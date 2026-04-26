#!/bin/bash
cd "$(dirname "$0")"
exec python3 -c "
import os, http.server, socketserver
PORT = 8080
with socketserver.TCPServer(('127.0.0.1', PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
"
