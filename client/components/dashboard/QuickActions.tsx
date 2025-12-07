'use client';

export default function StatsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-80">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">You have...</h3>

      <div className="space-y-1.5 text-sm text-gray-700">
        <p>
          studied <span className="font-semibold">5 topics</span> this week!
        </p>
        <p>
          spent most time on <span className="font-semibold">Data Mining</span> this week.
        </p>
        <p>
          <span className="font-semibold">5 notes</span> to be finished
        </p>
      </div>

      <p className="mt-4 text-sm text-blue-600 font-medium">Keep up the good work 💪</p>
    </div>
  );
}
