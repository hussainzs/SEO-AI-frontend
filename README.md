# SEO AI Frontend

Frontend of AI SEO agent for News Media Organizations

## Project Setup

This project uses [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS v4](https://tailwindcss.com/). It also includes configurations for [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js) or [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

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

### Linting and Formatting

*   To run ESLint to check for code style issues:

    ```bash
    npm run lint
    ```

    Or with yarn:

    ```bash
    yarn lint
    ```

*   Prettier is configured to run automatically on save if you have the Prettier extension installed in your code editor. You can also run it manually if needed.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for previewing.
