from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        print("\n📩 CALLBACK RECEIVED:")
        print(body.decode())

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

if __name__ == "__main__":
    print("Mock GUVI listening on port 9000")
    HTTPServer(("0.0.0.0", 9000), Handler).serve_forever()
