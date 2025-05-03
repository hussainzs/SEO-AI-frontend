import './index.css'; // Importing global CSS styles

function App() {
  // The main App component renders a centered column layout with a heading, paragraph, and a button.
  return (
    // The parent div uses flexbox in column direction, centers items horizontally, and applies bold, large text.
    <div className="flex flex-col items-center justify-center text-3xl font-bold min-h-screen">
      <h1 className="border-2 p-2.5">Hello, Tailwind CSS!</h1>
      <p className="text-primary">Welcome to my Tailwind CSS application!</p>
      {/* 
        Using group hover pattern to ensure text color changes properly on hover
        Adding text-white directly after hover:bg-verified to increase specificity
      */}
      <button className="group self-center w-auto p-2 rounded border-2 border-verified transition-colors duration-200 text-verified hover:bg-verified">
        <span className="group-hover:text-white">Click Me</span>
      </button>
    </div>
  );
}

export default App;
