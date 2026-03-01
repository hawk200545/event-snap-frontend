import { Code, Brain, Database, QrCode } from "lucide-react";

const techs = [
  { icon: Code, title: "React + Tailwind CSS", description: "Fast, responsive frontend" },
  { icon: Brain, title: "DeepFace + FaceNet", description: "AI facial recognition" },
  { icon: Database, title: "AWS S3 + PostgreSQL", description: "Scalable storage layer" },
  { icon: QrCode, title: "Room-Based Access", description: "QR code authentication" },
];

const tags = ["FastAPI", "Python", "Face Embeddings", "QR Codes", "Real-time Processing"];

const TechStackSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Tech Stack</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
          Built with modern, reliable technology
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {techs.map((tech) => (
            <div key={tech.title} className="bg-surface rounded-xl p-5 border border-border">
              <tech.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{tech.title}</h3>
              <p className="text-sm text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span key={tag} className="px-4 py-2 rounded-full text-sm bg-surface border border-border text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
