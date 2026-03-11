import { createFileRoute } from '@tanstack/react-router';

export const Home = () => (
  <div className="space-y-8 py-12">
    go to <a href="/analysis" className="text-blue-500 underline">/analysis</a> to start analyzing your codebase.
    go to <a href="/login" className="text-blue-500 underline">/login</a> to login.
  </div>
);

export const Route = createFileRoute('/')({ component: Home });
