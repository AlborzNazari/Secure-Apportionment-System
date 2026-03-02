"""Configuration management for the system"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration"""
    
    # Encryption settings
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', 'your-secret-key-change-this')
    ALGORITHM = "AES-256-CBC"
    
    # Application settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {'csv'}
    
    # Security
    LOG_SENSITIVE_DATA = False  # Never log passwords/keys
    
    @staticmethod
    def get_encryption_key():
        """Get encryption key, warn if using default"""
        if Config.ENCRYPTION_KEY == 'your-secret-key-change-this':
            print("⚠️  WARNING: Using default encryption key! Set ENCRYPTION_KEY env var")
        return Config.ENCRYPTION_KEY

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True

# Load appropriate config
ENV = os.getenv('FLASK_ENV', 'development')
if ENV == 'production':
    config = ProductionConfig()
elif ENV == 'testing':
    config = TestingConfig()
else:
    config = DevelopmentConfig()
