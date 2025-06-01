// // src/App.tsx
// import { FC, useState } from 'react'; // Added useState
// import './index.css';

// import Header from './components/Header';
// import UserInput from './components/UserInput';
// import UserCard from './components/UserCard';
// import OutputCard from './components/OutputCard'; // This is our revamped OutputCard
// import { useChatStream } from './hooks/useChatStream';

// const App: FC = () => {
//   // Use our home made state of the art innovative custom hook to manage SSE state
//   const {
//     messages,
//     isLoading,
//     isConnecting,
//     error: streamError, // alias error to streamError for clarity
//     startStream,
//   } = useChatStream();

//   // State to store the user's submitted query to display in UserCard
//   const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

//   const handleAnalyze = async (text: string) => {
//     setSubmittedQuery(text); // Store the query for display in UserCard component
//     await startStream(text); // Initiate the SSE stream via the useChatStream hook
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />

//       <main className="flex flex-col flex-grow container mx-auto px-4 py-4 max-w-5xl">
//         {/* Show UserInput form only if no query has been submitted yet */}
//         {submittedQuery === null ? (
//           <div className="flex flex-grow items-center">
//             <UserInput
//               onAnalyze={handleAnalyze}
//               isLoading={
//                 isLoading
//               } /* Pass isLoading to disable button/input during stream */
//             />
//           </div>
//         ) : (
//           <>
//             {/* Display the user's input query once submitted as a collapsable card through UserCard */}
//             <UserCard content={submittedQuery} />

//             {/* OutputCard now renders based on stream state and messages */}
//             {/* Note the stream method from useChatStream is running and updating the messages state, isConnecting and streamError */}
//             <OutputCard
//               messages={messages}
//               isConnecting={isConnecting}
//               streamError={streamError}
//             />
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default App;

// ...existing code...
import WorkflowStreamTester from './components/tester';

function App() {
  return (
    <div className="App">
      <WorkflowStreamTester />
    </div>
  );
}

export default App;
