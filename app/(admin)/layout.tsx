import React from "react";

export const metadata = {
  title: "Admin Panel - QuizMate",
  description: "QuizMate Administration & Management Hub",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {children}
    </div>
  );
}
