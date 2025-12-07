'use client';

export default function WelcomeHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, [Name]!
      </h1>
      <div className="w-32 h-1 bg-blue-500 mt-2 rounded-full"></div>
    </div>
  );
}
