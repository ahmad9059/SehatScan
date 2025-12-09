"use client";

export default function FeaturesGrid() {
  const features = [
    {
      title: "Dynamic dashboard",
      description:
        "Get real-time insights with our interactive dashboard that displays all your health metrics in one place.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      image: "chart",
      link: "Learn more →",
    },
    {
      title: "Smart notifications",
      description:
        "Receive intelligent alerts about your health metrics and get notified when action is needed.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      items: [
        { label: "Email notifications", enabled: true },
        { label: "Push notifications", enabled: true },
        { label: "SMS alerts", enabled: false },
      ],
      link: "Customize →",
    },
    {
      title: "Task management",
      description:
        "Organize your health journey with task lists, reminders, and progress tracking.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      tasks: [
        { label: "Upload blood test", completed: true },
        { label: "Schedule checkup", completed: false },
      ],
      link: "View all →",
    },
  ];

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to manage your health data effectively
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-xl hover:bg-gray-800 transition-all duration-300 group border border-gray-700/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#037BFC] rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              </div>

              {/* Content Area */}
              <div className="mb-6 min-h-[200px]">
                {feature.image === "chart" && (
                  <div className="bg-linear-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 h-full flex items-end border border-gray-700/30">
                    <div className="w-full flex items-end justify-between space-x-2 h-32">
                      <div className="w-full bg-gray-600 rounded-t-lg h-16"></div>
                      <div className="w-full bg-gray-500 rounded-t-lg h-24"></div>
                      <div className="w-full bg-[#037BFC] rounded-t-lg h-32"></div>
                      <div className="w-full bg-gray-500 rounded-t-lg h-20"></div>
                      <div className="w-full bg-gray-600 rounded-t-lg h-12"></div>
                    </div>
                  </div>
                )}

                {feature.items && (
                  <div className="space-y-3">
                    {feature.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-700/30"
                      >
                        <span className="text-sm text-gray-300">
                          {item.label}
                        </span>
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            item.enabled ? "bg-[#037BFC]" : "bg-gray-300"
                          } relative`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              item.enabled ? "right-1" : "left-1"
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {feature.tasks && (
                  <div className="space-y-3">
                    {feature.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl border border-gray-700/30"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.completed
                              ? "bg-[#037BFC] border-[#037BFC]"
                              : "border-gray-500"
                          }`}
                        >
                          {task.completed && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            task.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-300"
                          }`}
                        >
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link */}
              <a
                href="#"
                className="text-[#037BFC] font-medium text-sm hover:underline inline-flex items-center space-x-1"
              >
                <span>{feature.link}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
