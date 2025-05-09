// src/components/chat/InitialLoading.tsx
import { FC } from 'react';
import { Loader2 } from 'lucide-react'; // Using Loader2 for a spinning animation

const InitialLoading: FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
};

export default InitialLoading;
