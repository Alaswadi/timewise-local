<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zC3P3zuYRsrxGMKDi8IiDHg2b_gey-5W

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

**Prerequisites:** Docker and Docker Compose

### Production Build

1. Copy the environment file and set your API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. Build and run the production container:
   ```bash
   docker-compose up --build
   ```

3. Access the app at `http://localhost:3000`

### Development with Hot Reloading

1. Run the development container:
   ```bash
   docker-compose --profile dev up --build timewise-dev
   ```

2. Access the development server at `http://localhost:5173`

### Docker Commands

- **Build production image:** `docker build -t timewise .`
- **Run production container:** `docker run -p 3000:80 --env-file .env timewise`
- **Stop containers:** `docker-compose down`
- **View logs:** `docker-compose logs -f`
