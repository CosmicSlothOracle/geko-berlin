# KOSGE Website

Website for Kollektiv für solidarische Gesundheit e.V. (KOSGE), a collective for solidarity health in Berlin.

## Features

- Fully static website hosted on GitHub Pages
- 4 Event Sections with editable images
- Participant registration for each event
- Persistent data storage using localStorage
- Responsive design
- Multilingual support

## Local Development

1. Clone the repository

```bash
git clone https://github.com/yourusername/kosge.git
cd kosge/frontend
```

2. Start the local development server

```bash
python server.py
```

The website will be available at `http://localhost:8080`

## Deployment

1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Select the `main` branch or `docs` folder

## Data Persistence

- Event images are saved in `localStorage` under the key `events`
- Participant registrations are saved in `localStorage` under the key `event-participants`

## Customization

- Modify event images by clicking the "Bearbeiten" button
- Add/edit event details directly in the HTML
- Customize styles in `frontend/public/css/style.css`

## Browser Compatibility

- Modern browsers with localStorage support
- Responsive design for mobile and desktop

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Admin Access

The default admin credentials are:

- Username: `admin`
- Password: `kosge2023`

**Important:** For security in production, change the login credentials in:

1. `frontend/public/index.html` (search for `ADMIN_USERNAME` and `ADMIN_PASSWORD`)
2. `frontend/public/admin/login.html` (same variables)

## Maintenance

### Adding Languages

1. Create a new HTML file in the `frontend/locales/` directory
2. Update the language selector in `index.html`
3. Add translations to the language configuration

### Image Upload

The admin panel allows uploading images by URL. For best results:

1. Use image hosting services like Cloudinary, Imgur, or Storj
2. Upload your image to the service
3. Copy the direct link to the image
4. Paste it in the admin panel

## Data Storage

Since this is a static website, all data is stored in the browser's localStorage:

- Participant information
- Banner URLs
- Admin authentication

Note that this data is browser-specific and will be lost if the user clears their browser data.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or issues, please contact:

- Email: info@kosge-berlin.de
- Phone: +49 1520 7240947

# Deployment & Local Development

## 🚀 Deployment

### Frontend & Backend (Render)

1. Push your code to [https://github.com/CosmicSlothOracle/Kosg.git](https://github.com/CosmicSlothOracle/Kosg.git).
2. Sign up/log in to [Render](https://render.com).
3. Click "New +" → "Web Service" for each service (backend and frontend).
4. For the **backend**:
   - Set **root directory** to `backend`.
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `python app.py`
   - **Port:** `10000` (or as set in your code)
5. For the **frontend**:
   - Set **root directory** to `frontend`.
   - **Static publish path:** `public`
   - No build command needed for static files.
6. Deploy! Render will auto-deploy on every push to main.

---

- All API calls from the frontend should use the full backend URL as set in `frontend/public/js/config.js`.
- For local dev, update API URLs in frontend to `http://localhost:10000/api/...` or use a proxy.
