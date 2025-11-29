<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WichtelWerkstatt - AI-powered Christmas Gift Manager

This contains everything you need to run your app locally or deploy it with Docker.

View your app in AI Studio: https://ai.studio/apps/drive/1IcJfq8cjnbqtQr7EgJcKkluhjqdYmfyd

## Prerequisites

- Node.js 20+
- Google Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))
- Docker (optional, for containerized deployment)

## Setup

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   ```
   http://localhost:3000
   ```

## Build for Production

```bash
npm run build
npm run preview
```

## Docker Deployment

### Local Docker Build

```bash
# Create .env file with your API key
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Build and run
docker-compose up -d
```

The app will be available at `http://localhost:3050`

### Deploy to Server

1. **Clone repository on server:**
   ```bash
   git clone https://github.com/stibe881/Wichtel-Werkstatt.git
   cd Wichtel-Werkstatt
   ```

2. **Create .env file:**
   ```bash
   echo "GEMINI_API_KEY=your-api-key-here" > .env
   ```

3. **Build and start:**
   ```bash
   docker-compose up -d
   ```

### Without docker-compose

```bash
# Build image
docker build --build-arg GEMINI_API_KEY=your-api-key -t wichtel-werkstatt .

# Run container
docker run -d -p 3050:80 wichtel-werkstatt
```

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini AI
- Vite
- Docker + Nginx
