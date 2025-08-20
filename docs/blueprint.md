# **App Name**: TaskWise Voice

## Core Features:

- API Token Config: Configuration card for API token storage in local storage.
- Voice Input Card: Main interaction card with a microphone button for voice recording.
- Dynamic Status Updates: Dynamic status messages to provide user feedback.
- Voice Command Processing: Processes voice commands using LangChain and OpenAI to structure requests for task management. It acts as a tool orchestrating actions based on voice input.
- API Call Orchestration: Skeleton functions for API calls (createActivity, findProject, etc.) using Axios.
- Transcription Display: Display the transcribed voice command in a read-only text area.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to convey a sense of professionalism and innovation.
- Background color: Light gray (#F2F0F7), a desaturated hue from the primary, to ensure content legibility and reduce eye strain.
- Accent color: Teal (#00A3AD), a contrasting but analogous color to highlight interactive elements.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text.
- Use Material Design icons for a consistent and recognizable UI.
- Cards are the main layout component to organize the configuration and interaction areas.
- Subtle animation on the microphone button to indicate recording status (color change and pulsating).