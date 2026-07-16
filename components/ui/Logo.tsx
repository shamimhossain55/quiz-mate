type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({ size = "md" }: LogoProps) {
  const iconSize = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md"
        style={{
          width: iconSize[size],
          height: iconSize[size],
        }}
      >
        Q
      </div>

      <h1 className={`font-extrabold tracking-tight ${textSize[size]}`}>
        <span className="text-slate-900">Quiz</span>
        <span className="text-blue-600">Mate</span>
      </h1>
    </div>
  );
}