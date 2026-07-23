interface PerformanceBadgeProps {
  percentage: number;
}

export default function PerformanceBadge({
  percentage,
}: PerformanceBadgeProps) {
  let text = "Needs Practice";
  let color = "bg-red-100 text-red-600";

  if (percentage >= 90) {
    text = "Outstanding";
    color = "bg-green-100 text-green-700";
  } else if (percentage >= 75) {
    text = "Excellent";
    color = "bg-blue-100 text-blue-700";
  } else if (percentage >= 60) {
    text = "Good";
    color = "bg-yellow-100 text-yellow-700";
  }

  return (
    <div className="flex justify-center">
      <span
        className={`rounded-full px-6 py-3 text-lg font-bold ${color}`}
      >
        {text}
      </span>
    </div>
  );
}