from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

# Change to the directory containing your files
os.chdir(os.path.dirname(os.path.abspath(__file__)))

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    print(f"Open your browser and go to http://localhost:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
