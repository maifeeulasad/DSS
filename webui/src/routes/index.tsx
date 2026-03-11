// Static home page route
// Route: / (handled in src/index.tsx)

export default function Home() {
  return (
    <div className="space-y-8 py-12">
      go to <a href="/analysis" className="text-blue-500 underline">/analysis</a> to start analyzing your codebase.
      go to <a href="/login" className="text-blue-500 underline">/login</a> to login.
    </div>
  )
}
