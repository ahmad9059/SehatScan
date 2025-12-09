export default function TestimonialSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center animate-fade-in-up">
          {/* Quote Icon */}
          <div className="mb-8">
            <svg
              className="w-16 h-16 mx-auto text-[#037BFC] opacity-30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Testimonial Text */}
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed mb-10 max-w-4xl mx-auto">
            &quot;SehatScan is helping our company to decrease operational
            expenses, improve efficiency, while innovating the{" "}
            <span className="text-[#037BFC]">
              compliance, resource allocation
            </span>{" "}
            and effectiveness of our contract management.&quot;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-linear-to-br from-[#037BFC] to-[#3d9dfd] rounded-full shadow-lg"></div>
            <div className="text-left">
              <p className="font-bold text-white text-lg">Dr. Sarah Johnson</p>
              <p className="text-sm text-gray-400">
                Chief Medical Officer, HealthTech Solutions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
