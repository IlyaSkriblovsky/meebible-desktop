# MeeBible

MeeBible is a simple, modern, and cross-platform desktop Bible application built with Tauri and React. It is a desktop implementation of the [MeeBible](https://github.com/IlyaSkriblovsky/meebible) project.

![App Screenshot](app-icon.png)
*(Note: This is the app icon. A proper screenshot of the application will be added later.)*

## Features

*   **Cross-Platform:** Works on Windows, macOS, and Linux.
*   **Multiple Translations:** Easily switch between different Bible translations.
*   **Simple Navigation:** Navigate by book and chapter.
*   **Light & Dark Mode:** Adapts to your system's theme.
*   **Modern UI:** Clean and intuitive user interface built with Material-UI.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed. You also need to set up your environment for Tauri development. Follow the official guide for your operating system: [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/IlyaSkriblovsky/meebible-desktop.git
    cd meebible-desktop
    ```

2.  **Install dependencies:**
    ```bash
    yarn
    ```

3.  **Run the app in development mode:**
    ```bash
    yarn tauri:dev
    ```
    This will open the application in a new window. The app supports hot-reloading for the frontend, so changes you make to the React code will be reflected automatically.

## Tech Stack

*   **[Tauri](https://tauri.app/):** The core framework for building the desktop application with a Rust backend.
*   **[React](https://reactjs.org/):** The frontend library for building the user interface.
*   **[Vite](https://vitejs.dev/):** The frontend tooling for development and bundling.
*   **[TypeScript](https://www.typescriptlang.org/):** For type-safe JavaScript.
*   **[Material-UI](https://mui.com/):** For UI components.
*   **[Rust](https://www.rust-lang.org/):** The language for the backend.

## Building for Production

To create a production build of the application, run the following command:

```bash
yarn tauri build
```

This will bundle the application into an executable file for your specific platform, located in `src-tauri/target/release/bundle/`.