import { Smartphone, MessageSquare, Eye, Search } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const problems = [
  {
    icon: Smartphone,
    title: "Scattered Across 50 Phones",
    description: "Hundreds of photos are taken at every event, but they live on dozens of different devices you'll never have access to.",
  },
  {
    icon: MessageSquare,
    title: "No Easy Way to Collect",
    description: "Group chats get messy. Shared albums are half-empty. Most photos never leave the phone they were taken on.",
  },
  {
    icon: Eye,
    title: "You'll Never See Most of Them",
    description: "Someone captured your best moment of the night — but you don't know who, and they don't know you want it.",
  },
  {
    icon: Search,
    title: "Google Photos Can't Help",
    description: "Google Photos only indexes your camera. It can't search across everyone else's photos from the event.",
  },
];

const ProblemSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="problem" className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <p className={`text-sm text-primary font-medium mb-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>The Problem</p>
        <h2 className={`text-3xl md:text-4xl font-bold text-foreground mb-16 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Your best photos are on someone else's phone
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className={`bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: isVisible ? `${200 + i * 100}ms` : "0ms" }}
            >
              <problem.icon className="w-6 h-6 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
