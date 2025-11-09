from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from jinja2 import Environment, FileSystemLoader
from modules.port import get_available_port
#from modules.updater import updaterMethods
from modules.logo import showLogo
from appHandler import appHandler
import os
import re # <-- Added for script injection

# Run app handler and show logo
appHandler.startHandling()
showLogo()

# Global flag to control Eruda injection
eruda_enabled = False # <-- Added for Eruda state

app = Flask(__name__)
CORS(app)
portList = [1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034]
port = get_available_port(portList)
jsonData = {}
BASE_DIR = None
template_env = None # This is no longer used by home(), but kept for setup

# --- This function has been completely replaced ---
@app.route('/', methods=['GET', 'POST'])
def home():
    # Get global variables
    global eruda_enabled, BASE_DIR, jsonData
    
    if request.method == 'GET':
        file_name = jsonData.get('fileName')
        
        # Check if BASE_DIR (the path) is set
        if file_name and BASE_DIR:
            try:
                # Create the full path to the file
                full_path = os.path.join(BASE_DIR, file_name)
                
                # Manually read the file content
                with open(full_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()

                # Eruda script to be injected
                eruda_script = """
                <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
                <script>eruda.init();</script>
                """

                # If the flag is set, inject the script
                if eruda_enabled:
                    # Try to inject before </head> (case-insensitive)
                    (html_content, count) = re.subn(
                        r'</head>', 
                        eruda_script + r'</head>', 
                        html_content, 
                        count=1, 
                        flags=re.IGNORECASE
                    )
                    
                    # If </head> was not found, inject before </body>
                    if count == 0:
                         html_content, _ = re.subn(
                             r'</body>', 
                             eruda_script + r'</body>', 
                             html_content, 
                             count=1, 
                             flags=re.IGNORECASE
                         )

                # Return the modified (or original) HTML content
                return html_content

            except PermissionError as p:
                print('\033[1;31;43m#\033[0m'*50)
                print('\033[1;31;43mNo Storage Permission plese allow storage access Permission\033[0m')
                print('\033[1;31;43m#\033[0m'*50)
                return ' please grant us all file acces permission or use f-groide version of acode app', 500
            except Exception as e:
                print(f'Error while getting that Html file: {e}')
                return f'Error while getting that Html file: {e}', 500
        else:
            return 'File path not configured. Send a PATCH request to /setup first.', 400
    else:
        # This POST method seems unused, but keeping it as per original file
        return jsonify({"message": 'Hello, World!'}), 200

# --- This function has been modified ---
@app.route('/setup', methods=['PATCH'])
def setup():
    # Added 'eruda_enabled' to globals
    global BASE_DIR, jsonData, template_env, eruda_enabled
    
    data = request.get_json()
    file_name = data.get('fileName')
    path = data.get('path')

    if not file_name or not path:
        return jsonify({'error': 'fileName and path are required'}), 400

    template_folder = path
    BASE_DIR = path
    if not os.path.isdir(template_folder):
        return jsonify({'error': 'Invalid template path'}), 400

    jsonData['fileName'] = file_name
    # We still set up Jinja2 env, though home() doesn't use it directly
    template_env = Environment(loader=FileSystemLoader(template_folder), auto_reload=True)

    # --- Added this section to check for Eruda flag ---
    if 'eruda' in data and data['eruda'] == True:
        eruda_enabled = True
    else:
        eruda_enabled = False
    # --- End of added section ---

    return jsonify({'message': 'Base and template path set successfully'}), 201

# --- This function is unchanged ---
# This route is crucial for serving CSS, JS, Images, etc.
@app.route('/<path:filepath>')
def catch_all(filepath):
    global BASE_DIR
    DIR = BASE_DIR
    if not DIR:
        return 'BASE_DIR not set.', 400

    # Logic to handle relative paths like './script.js' or '../style.css'
    if filepath.startswith('.'):
        slashIndex = filepath.find("/")
        if slashIndex != -1:
            totalDots = filepath[:slashIndex].count('.')
            newPath = filepath[slashIndex:]
            DIR = (DIR.split('/'))[:-totalDots]
            DIR = '/'.join(DIR)
            filepath = newPath

    # Absolute path of the requested file
    file_path = os.path.join(DIR, filepath)

    if os.path.isfile(file_path):
        return send_file(file_path)
    else:
        return f'File not found: {filepath}', 404

# --- This function is unchanged ---
@app.route('/check', methods=["GET"])
def send_alive_signal_too_the_client():
  if request.method == "GET":
    print("Successfully Port Identified by the client connection process started")
    return jsonify({"message":"Ready For 'PATCH' request","key":"AcodeLiveServer","port": f"{port}"}), 200

# --- This block is unchanged ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
