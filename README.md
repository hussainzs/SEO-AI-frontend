# SEO AI Frontend

Frontend of AI SEO agent for News Media Organizations

## Project Setup

This project uses [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS v4](https://tailwindcss.com/). It also includes configurations for [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Cloning the Repository

1.  Open your terminal or command prompt.
2.  Navigate to the directory where you want to clone the project.
3.  Run the following command:

    ```bash
    git clone <repository-url>
    ```

    Replace `<repository-url>` with the actual URL of this repository.

4.  Change into the newly created project directory:

    ```bash
    cd SEO-AI-frontend
    ```

### Installation

1.  Install the project dependencies using npm:

    ```bash
    npm install
    ```

    Alternatively, if you prefer using yarn:

    ```bash
    yarn install
    ```

### Running the Development Server

1.  Start the Vite development server:

    ```bash
    npm run dev
    ```

    Or with yarn:

    ```bash
    yarn dev
    ```

2.  Open your web browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

### Building for Production

1.  To create a production build, run:

    ```bash
    npm run build
    ```

    Or with yarn:

    ```bash
    yarn build
    ```

    The optimized production files will be located in the `dist` directory.

## Project Structure Overview

- **public/**  
  Contains static assets such as logos (`logo.png`, `logo.svg`, `logo_transparent.png`) that are served directly.

- **src/**  
  Main application source code.

  - **assets/**  
    Reserved for static assets (currently empty).

  - **components/**  
    React components for the UI:

    - `Header.tsx`: Top navigation/header bar.
    - `UserInput.tsx`: Text area and submit button for user queries.
    - `UserCard.tsx`: Collapsible card displaying the user's submitted query; can be expanded to show the full text.
    - `OutputCard.tsx`: Renders the entire AI output, including all steps and the final result, by mapping over AI response messages.
    - **chat/**: Specialized UI components for displaying different types of AI responses:
      - `AnswerCard.tsx`: Shows the AI's answer.
      - `ToolCallCard.tsx`: Shows when the AI invokes a tool, including tool name and arguments.
      - `ToolProcessingCard.tsx`: Indicates when a tool is being processed or has completed.
      - `ErrorCard.tsx`: Displays error messages from the AI or workflow.
      - `InitialLoading.tsx`: Loading spinner shown while waiting for the first AI response.

  - **hooks/**  
    Custom React hooks:

    - `useChatStream.ts`: Manages the Server-Sent Events (SSE) connection to the backend, handles streaming AI responses, and manages related state.

  - **types/**  
    TypeScript type definitions:

    - `chatEventTypes.ts`: Defines the structure of messages exchanged with the AI backend.

  - `App.tsx`: Main application component; orchestrates user input, displays the user's query, and renders AI output.
  - `main.tsx`: Entry point for React; renders the React app.
  - `index.css`: Tailwind CSS and custom styles following tailwind v4 styles.
  - `vite-env.d.ts`: Vite-specific TypeScript declarations.

- **Configuration Files**
  - `package.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`: Project configuration for build, linting, formatting, and dependencies.
