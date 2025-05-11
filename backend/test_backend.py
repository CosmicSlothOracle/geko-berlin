import app  # Import the main application file
import unittest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


class TestBackendApp(unittest.TestCase):
    def setUp(self):
        # Setup test client if using Flask
        self.app = app.app.test_client()

    def test_app_exists(self):
        """Basic test to ensure the app is created"""
        self.assertIsNotNone(app.app)

    def test_config_loaded(self):
        """Test that configuration is loaded"""
        self.assertTrue(hasattr(app, 'config'),
                        "App should have a config attribute")


if __name__ == '__main__':
    unittest.main()
