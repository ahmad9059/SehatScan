import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Discover the full scale of{" "}
            <span className="text-[#037BFC]">SehatScan</span> capabilities
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Start analyzing your health data today with our AI-powered platform.
            Get instant insights and take control of your wellness journey with
            cutting-edge technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan/report"
              className="px-10 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 text-center font-bold shadow-xl text-lg"
            >
              Get Started
            </Link>
            <Link
              href="#demo"
              className="px-10 py-4 bg-[#C8FF00] text-gray-900 rounded-xl hover:bg-[#b8ef00] transition-all transform hover:scale-105 text-center font-bold shadow-xl text-lg"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
