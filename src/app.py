"""Main Flask web application for Secure Apportionment System"""

from flask import Flask, render_template, request, jsonify
from src.apportionment import allocate_seats
from src.validators import validate_csv_data, validate_seats_allocation
from src.logging_setup import logger

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    """Handle CSV upload and process data"""
    try:
        # Get uploaded file
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400
        
        # Get total seats from form
        total_seats = request.form.get('seats', type=int)
        if not total_seats:
            return jsonify({'error': 'Total seats not specified'}), 400
        
        logger.info(f"Processing file: {file.filename} with {total_seats} seats")
        
        # Parse CSV (basic implementation)
        vote_data = {}
        lines = file.read().decode('utf-8').split('\n')
        for line in lines[1:]:  # Skip header
            if line.strip():
                parts = line.split(',')
                if len(parts) >= 2:
                    party = parts[0].strip()
                    votes = int(parts[1].strip())
                    vote_data[party] = votes
        
        # Validate
        is_valid, msg = validate_csv_data(vote_data)
        if not is_valid:
            logger.warning(f"Validation failed: {msg}")
            return jsonify({'error': msg}), 400
        
        # Allocate seats
        results = allocate_seats(vote_data, total_seats)
        logger.info(f"Allocation successful: {results}")
        
        return jsonify({
            'success': True,
            'results': results,
            'votes': vote_data
        })
    
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/info')
def info():
    """Get system information"""
    return jsonify({
        'name': 'Secure Parliamentary Apportionment System',
        'version': '1.0.0',
        'method': 'Huntington-Hill',
        'encryption': 'AES-256-CBC'
    })

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    app.run(debug=True, host='127.0.0.1', port=5000)
