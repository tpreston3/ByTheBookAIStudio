# ByTheBook AI Studio App

## Project Overview
**ByTheBook** is an AI-driven labor compliance platform for film & TV productions. This project is a client-side React application built with Vite, utilizing the Google GenAI SDK for AI capabilities.

**Key Technologies:**
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **AI SDK:** `@google/genai`
- **UI Components:** `lucide-react` (icons)

## Setup & Configuration

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
    *Note: The `vite.config.ts` explicitly maps `process.env.GEMINI_API_KEY` to the client-side build.*

## Development Commands

Run the following commands using `npm run <command>`:

-   **`dev`**: Starts the development server.
    *   Runs on: `http://localhost:3000` (Host: 0.0.0.0)
-   **`build`**: Builds the application for production.
-   **`preview`**: Locally preview the production build.

## Project Structure

-   **`index.tsx`**: Entry point for the React application.
-   **`index.html`**: Main HTML template.
-   **`vite.config.ts`**: Configuration for Vite, including environment variable handling and path aliases (mapping `@` to root).
-   **`metadata.json`**: Contains project metadata like name and description.

## AI Studio Integration
This app is designed to run locally but is associated with an AI Studio project.
View app in AI Studio: [https://ai.studio/apps/drive/1rtaJ2_DTfLvsjUmJo_FtwFJ4QP4xioAl](https://ai.studio/apps/drive/1rtaJ2_DTfLvsjUmJo_FtwFJ4QP4xioAl)
