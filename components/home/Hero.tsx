export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 lg:flex-row">

        {/* Left */}
        <div className="flex-1 text-center lg:text-left">

          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            🇧🇩 বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি
          </div>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-900">
            শেখা হোক আরও <span className="text-blue-600">স্মার্ট।</span>
            <br />
            <span className="text-slate-700">
              Learn Beyond Books.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Class 7–12 শিক্ষার্থীদের জন্য Quiz,
            Progress Tracking এবং Smart Exam Preparation।
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700">
              🚀 শুরু করুন
            </button>

            <button className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-100">
              📖 আরও জানুন
            </button>

          </div>

          <p className="mt-8 text-sm text-slate-500">
            ⭐ ১০,০০০+ শিক্ষার্থী ইতোমধ্যে আমাদের সাথে শিখছে
          </p>

        </div>

        {/* Right */}
        <div className="mt-16 flex flex-1 justify-center lg:mt-0">

          <div className="flex h-[420px] w-[420px] items-center justify-center rounded-3xl border border-blue-100 bg-white shadow-2xl">

            <div className="text-center">

              <div className="text-7xl">📚</div>

              <h2 className="mt-6 text-3xl font-bold text-slate-800">
                QuizMate
              </h2>

              <p className="mt-3 text-slate-500">
                Premium Learning Experience
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}