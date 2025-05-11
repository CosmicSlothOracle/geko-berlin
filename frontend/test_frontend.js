// Basic frontend test using Jest
const fs = require('fs');
const path = require('path');

describe('Frontend Configuration', () => {
    let config;

    beforeAll(() => {
        // Load the config file
        const configPath = path.resolve(__dirname, 'public/js/config.js');
        const configContent = fs.readFileSync(configPath, 'utf8');

        // Create a mock window object
        global.window = {
            location: {
                hostname: 'example.com'
            }
        };

        // Evaluate the config script
        eval(configContent);
        config = global.window.APP_CONFIG;
    });

    test('Config should have API_BASE_URL', () => {
        expect(config).toBeDefined();
        expect(config.API_BASE_URL).toBeDefined();
        expect(typeof config.API_BASE_URL).toBe('string');
    });

    test('Config should have correct retry settings', () => {
        expect(config.MAX_RETRIES).toBe(3);
        expect(config.RETRY_DELAY).toBe(1000);
    });

    test('Debug mode should be off in production', () => {
        expect(config.DEBUG).toBe(false);
    });
});