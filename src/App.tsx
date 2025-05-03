import './index.css'; // Importing global CSS styles

function App() {
  // The main App component renders a centered column layout with a heading, paragraph, and a button.
  return (
    // The parent div uses flexbox in column direction, centers items horizontally, and applies bold, large text.
    <div className="flex flex-col items-center justify-center text-3xl font-bold min-h-screen">
      <h1 className="border-2 p-2.5">Hello, Tailwind CSS!</h1>
    </div>
  );
}

export default App;
