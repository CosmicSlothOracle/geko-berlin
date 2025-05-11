from flask import Flask, jsonify, request, send_from_directory, make_response, redirect
from flask_cors import CORS
import bcrypt
import os
import json
from werkzeug.utils import secure_filename
from cms import ContentManager
import logging
from config import (
    UPLOAD_FOLDER, PARTICIPANTS_FILE, ADMIN_USER,
    CORS_ORIGINS, MAX_CONTENT_LENGTH, init
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS more explicitly
CORS(app, resources={
    r"/api/*": {
        "origins": CORS_ORIGINS,
        "methods": ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize CMS
content_manager = ContentManager(
    os.path.join(os.path.dirname(__file__), 'content'))

# Get the absolute path of the current directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
PARTICIPANTS_FILE = os.path.join(BASE_DIR, 'participants.json')
EVENTS_FILE = os.path.join(BASE_DIR, 'events.json')

logger.info(f'Base directory: {BASE_DIR}')
logger.info(f'Upload folder: {UPLOAD_FOLDER}')

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    logger.info(f'Creating upload directory: {UPLOAD_FOLDER}')
    os.makedirs(UPLOAD_FOLDER)
    logger.info('Upload directory created successfully')

# Create empty participants file if it doesn't exist
if not os.path.exists(PARTICIPANTS_FILE):
    with open(PARTICIPANTS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

# Add debug logging for participants file
logger.info(f'Participants file path: {PARTICIPANTS_FILE}')
if os.path.exists(PARTICIPANTS_FILE):
    logger.info('Participants file exists')
    with open(PARTICIPANTS_FILE, 'r', encoding='utf-8') as f:
        try:
            participants = json.load(f)
            logger.info(f'Number of participants: {len(participants)}')
        except json.JSONDecodeError as e:
            logger.error(f'Error reading participants file: {e}')
else:
    logger.warning('Participants file does not exist')

# Create empty events file if it doesn't exist
if not os.path.exists(EVENTS_FILE):
    with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

# Add debug logging for events file
logger.info(f'Events file path: {EVENTS_FILE}')
if os.path.exists(EVENTS_FILE):
    logger.info('Events file exists')
    with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
        try:
            events = json.load(f)
            logger.info(f'Number of events: {len(events)}')
        except json.JSONDecodeError as e:
            logger.error(f'Error reading events file: {e}')
else:
    logger.warning('Events file does not exist')

# Dummy-User (später DB)
DUMMY_USER = {
    'username': 'admin',
    # Passwort: 'kosge2024!' (bcrypt-hash)
    'password_hash': b'$2b$12$ZCgWXzUdmVX.PnIfj4oeJOkX69Tu1rVZ51zGYe3kSloANnwMaTlBW'
}

ALLOWED_EXTENSIONS = {'png'}


def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get(
        'Origin')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS, PUT'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.after_request
def after_request(response):
    return add_cors_headers(response)


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin",
                             request.headers.get('Origin'))
        response.headers.add("Access-Control-Allow-Methods",
                             "GET, POST, DELETE, OPTIONS, PUT")
        response.headers.add("Access-Control-Allow-Headers",
                             "Content-Type, Authorization")
        return response


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_participants():
    if not os.path.exists(PARTICIPANTS_FILE):
        return []
    with open(PARTICIPANTS_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except Exception:
            return []


def save_participants(participants):
    with open(PARTICIPANTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(participants, f, ensure_ascii=False, indent=2)


def load_events():
    if not os.path.exists(EVENTS_FILE):
        return []
    with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except Exception:
            return []


def save_events(events):
    with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=2)


@app.route('/api/health', methods=['GET'])
def health():
    try:
        # Check if we can read participants file
        participants = load_participants()
        # Check if uploads directory exists
        uploads_exist = os.path.exists(UPLOAD_FOLDER)

        return jsonify({
            'status': 'healthy',
            'participants_count': len(participants),
            'uploads_directory': uploads_exist,
            'base_dir': BASE_DIR,
            'python_version': os.environ.get('PYTHON_VERSION', '3.11.11'),
            'environment': os.environ.get('FLASK_ENV', 'production')
        }), 200
    except Exception as e:
        logger.error(f'Health check failed: {str(e)}')
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == DUMMY_USER['username'] and bcrypt.checkpw(password.encode(), DUMMY_USER['password_hash']):
        # Dummy-Token (später JWT)
        return jsonify({'token': 'dummy-token', 'user': username}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/banners', methods=['POST'])
def upload_banner():
    if 'file' not in request.files:
        logger.error('No file part in request')
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        logger.error('No selected file')
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        logger.info(f'Saving file to: {save_path}')
        try:
            file.save(save_path)
            logger.info(f'File saved successfully: {save_path}')
            # Verify file exists after saving
            if os.path.exists(save_path):
                logger.info(f'File exists at: {save_path}')
                logger.info(f'File size: {os.path.getsize(save_path)} bytes')
            else:
                logger.error(f'File not found after saving: {save_path}')
            url = f'/api/uploads/{filename}'
            return jsonify({'url': url, 'filename': filename}), 201
        except Exception as e:
            logger.error(f'Error saving file: {str(e)}')
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500
    logger.error('Invalid file type')
    return jsonify({'error': 'Invalid file type. Only PNG allowed.'}), 400


@app.route('/api/banners', methods=['GET'])
def list_banners():
    files = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    urls = [f'/api/uploads/{f}' for f in files]
    return jsonify({'banners': urls}), 200


@app.route('/api/banners/<filename>', methods=['DELETE'])
def delete_banner(filename):
    filename = secure_filename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type.'}), 400
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'success': True, 'filename': filename}), 200
    else:
        return jsonify({'error': 'File not found.'}), 404


@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    logger.info(f'Attempting to serve file: {filename}')
    logger.info(f'Upload folder: {UPLOAD_FOLDER}')
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    logger.info(f'Full file path: {file_path}')

    if not os.path.exists(file_path):
        logger.error(f'File not found: {file_path}')
        return jsonify({'error': 'File not found'}), 404

    try:
        logger.info(f'File exists, size: {os.path.getsize(file_path)} bytes')
        response = send_from_directory(UPLOAD_FOLDER, filename)

        # Use the add_cors_headers function
        response = add_cors_headers(response)

        # Set content type for PNG files
        if filename.lower().endswith('.png'):
            response.headers['Content-Type'] = 'image/png'

        return response
    except Exception as e:
        logger.error(f'Error serving file {filename}: {str(e)}')
        return jsonify({'error': f'Error serving file: {str(e)}'}), 500


@app.route('/api/participants', methods=['POST'])
def add_participant():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    banner = data.get('banner')
    if not name:
        return jsonify({'error': 'Name ist erforderlich.'}), 400
    participant = {
        'name': name,
        'email': email,
        'message': message,
        'banner': banner
    }
    participants = load_participants()
    participants.append(participant)
    save_participants(participants)
    return jsonify({'success': True, 'participant': participant}), 201


@app.route('/api/participants', methods=['GET'])
def get_participants():
    try:
        participants = load_participants()
        response = jsonify({'participants': participants})
        # Use the after_request handler to add CORS headers
        return response, 200
    except Exception as e:
        logger.error(f'Error getting participants: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/participants', methods=['OPTIONS'])
def participants_options():
    return create_options_response()


# Reusable function for OPTIONS response
def create_options_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin",
                         request.headers.get('Origin'))
    response.headers.add("Access-Control-Allow-Methods",
                         "GET, POST, DELETE, OPTIONS, PUT")
    response.headers.add("Access-Control-Allow-Headers",
                         "Content-Type, Authorization")
    return response


# CMS Routes
@app.route('/api/cms/content/<section>', methods=['GET'])
def get_content(section):
    language = request.args.get('language')
    content = content_manager.get_content(section, language)
    if content:
        return jsonify(content), 200
    return jsonify({'error': 'Content not found'}), 404


@app.route('/api/cms/content/<section>', methods=['POST'])
def create_content(section):
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    metadata = data.get('metadata', {})

    if not all([title, content]):
        return jsonify({'error': 'Title and content are required'}), 400

    success = content_manager.create_content(section, title, content, metadata)
    if success:
        return jsonify({'success': True, 'section': section}), 201
    return jsonify({'error': 'Failed to create content'}), 500


@app.route('/api/cms/content/<section>', methods=['PUT'])
def update_content(section):
    data = request.get_json()
    content = data.get('content')
    metadata = data.get('metadata', {})
    language = data.get('language')

    if not content:
        return jsonify({'error': 'Content is required'}), 400

    success = content_manager.update_content(
        section, content, metadata, language)
    if success:
        return jsonify({'success': True, 'section': section}), 200
    return jsonify({'error': 'Failed to update content'}), 404


@app.route('/api/cms/content/<section>/translate/<target_language>', methods=['POST'])
def translate_content(section, target_language):
    success = content_manager.translate_content(section, target_language)
    if success:
        return jsonify({'success': True, 'section': section, 'language': target_language}), 200
    return jsonify({'error': 'Translation failed'}), 400


@app.route('/api/cms/sections', methods=['GET'])
def list_sections():
    language = request.args.get('language')
    sections = content_manager.list_sections(language)
    return jsonify({'sections': sections}), 200


@app.route('/api/cms/content/<section>', methods=['DELETE'])
def delete_content(section):
    language = request.args.get('language')
    success = content_manager.delete_content(section, language)
    if success:
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Content not found'}), 404


@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        events = load_events()
        return jsonify({'events': events}), 200
    except Exception as e:
        logger.error(f'Error getting events: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/events', methods=['POST'])
def add_event():
    try:
        data = request.get_json()
        events = load_events()
        # Generate new unique ID
        new_id = str(int(max([int(e.get('id', 0)) for e in events] + [0])) + 1)
        data['id'] = new_id
        events.append(data)
        save_events(events)
        return jsonify({'success': True, 'event': data}), 201
    except Exception as e:
        logger.error(f'Error adding event: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        data = request.get_json()
        events = load_events()
        updated = False
        for i, event in enumerate(events):
            if str(event.get('id')) == str(event_id):
                events[i].update(data)
                updated = True
                break
        if not updated:
            return jsonify({'error': 'Event not found'}), 404
        save_events(events)
        return jsonify({'success': True, 'event': events[i]}), 200
    except Exception as e:
        logger.error(f'Error updating event: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        events = load_events()
        new_events = [e for e in events if str(e.get('id')) != str(event_id)]
        if len(new_events) == len(events):
            return jsonify({'error': 'Event not found'}), 404
        save_events(new_events)
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f'Error deleting event: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/health/events', methods=['GET'])
def health_events():
    try:
        events = load_events()
        if not isinstance(events, list):
            raise ValueError('Events data is not a list')
        return jsonify({
            'status': 'ok',
            'event_count': len(events)
        }), 200
    except Exception as e:
        logger.error(f'Events health check failed: {str(e)}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@app.route('/api/health/participants', methods=['GET'])
def health_participants():
    try:
        participants = load_participants()
        if not isinstance(participants, list):
            raise ValueError('Participants data is not a list')
        return jsonify({
            'status': 'ok',
            'participant_count': len(participants)
        }), 200
    except Exception as e:
        logger.error(f'Participants health check failed: {str(e)}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@app.route('/api/health/banners', methods=['GET'])
def health_banners():
    try:
        if not os.path.exists(UPLOAD_FOLDER):
            raise FileNotFoundError('Upload folder does not exist')
        files = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
        return jsonify({
            'status': 'ok',
            'banner_count': len(files)
        }), 200
    except Exception as e:
        logger.error(f'Banners health check failed: {str(e)}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


# Add a root route that redirects to frontend or shows API status
@app.route('/')
def index():
    # Check if this is a browser request (has Accept header with text/html)
    if 'text/html' in request.headers.get('Accept', ''):
        # Redirect to frontend
        return redirect('https://kosge-frontend.onrender.com')
    # Otherwise return API status as JSON
    return jsonify({
        'status': 'online',
        'message': 'KOSGE API Server',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'login': '/api/login',
            'banners': '/api/banners',
            'participants': '/api/participants',
            'cms': '/api/cms/content/<section>',
            'events': '/api/events'
        }
    }), 200


# Add a route for favicon.ico to prevent 404 errors
@app.route('/favicon.ico')
def favicon():
    return '', 204  # Return no content status


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
