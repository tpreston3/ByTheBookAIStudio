# Technology Stack: ByTheBook AI Studio App

## Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (via CDN)
- **Icons:** Lucide React

## AI & Engine
- **SDK:** Google GenAI SDK (`@google/genai`)
- **Model Target:** Gemini Pro (configured as `gemini-3-pro-preview` in code)

## Document Processing
- **PDF Analysis:** PDF.js
- **Word Document Analysis:** Mammoth.js

## Infrastructure & Configuration
- **Environment:** Node.js (Development)
- **Persistence:** Browser LocalStorage (for project setup and persistence)
- **Deployment:** Integrated with AI Studio

## Testing
- **Unit/Integration:** Vitest
- **Library:** React Testing Library