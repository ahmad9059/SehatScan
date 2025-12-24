"use client";

import { useState } from "react";

export default function FeaturesGrid() {
  const [activeChart, setActiveChart] = useState(2);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [tasks, setTasks] = useState([
    { id: 1, label: "Upload blood test", completed: true },
    { id: 2, label: "Schedule checkup", completed: false },
  ]);

  const chartData = [16, 24, 32, 20, 12];

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
      type: "chart",
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
      type: "notifications",
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
      type: "tasks",
      link: "View all →",
    },
  ];

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <section id="features" className="py-20 relative overflow-hidden bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-heading)] mb-4 px-4">
            Powerful Features
          </h2>
          <p className="text-[var(--color-subtle)] text-base sm:text-lg max-w-2xl mx-auto px-4">
            Everything you need to manage your health data effectively
          </p>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--color-card)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 group border border-[var(--color-border)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-heading)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--color-subtle)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              </div>

              {/* Content Area */}
              <div className="mb-6 min-h-[200px]">
                {feature.type === "chart" && (
                  <div className="bg-[var(--color-surface)] rounded-xl p-6 h-full flex items-end border border-[var(--color-border)]">
                    <div className="w-full flex items-end justify-between space-x-2 h-32">
                      {chartData.map((height, idx) => (
                        <div
                          key={idx}
                          onMouseEnter={() => setActiveChart(idx)}
                          className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                            activeChart === idx
                              ? "bg-[var(--color-primary)]"
                              : "bg-[var(--color-border)] hover:bg-[var(--color-primary)]"
                            }`}
                          style={{ height: `${height * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {feature.type === "notifications" && (
                  <div className="space-y-3">
                    {Object.entries(notifications).map(([key, enabled]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
                      >
                        <span className="text-sm text-[var(--color-foreground)] capitalize">
                          {key === "sms"
                            ? "SMS alerts"
                            : `${key} notifications`}
                        </span>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [key]: !enabled,
                            })
                          }
                          className={`w-12 h-6 rounded-full transition-colors ${
                            enabled
                              ? "bg-[var(--color-primary)]"
                              : "bg-[var(--color-border)]"
                          } relative`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              enabled ? "right-1" : "left-1"
                            }`}
                          ></div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {feature.type === "tasks" && (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="w-full flex items-center space-x-3 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.completed
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                              : "border-[var(--color-border)]"
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
                              ? "text-[var(--color-muted)] line-through"
                              : "text-[var(--color-foreground)]"
                          }`}
                        >
                          {task.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Link */}
              <a
                href="#"
                className="text-[var(--color-primary)] font-medium text-sm hover:underline inline-flex items-center space-x-1"
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
