import eventWedding from "@/assets/event-wedding.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventCorporate from "@/assets/event-corporate.jpg";

const events = [
  {
    image: eventWedding,
    title: "Weddings",
    description: "Capture every guest's perspective of your special day",
  },
  {
    image: eventConcert,
    title: "College Fests",
    description: "Thousands of photos, one room — find yourself instantly",
  },
  {
    image: eventCorporate,
    title: "Corporate Events",
    description: "Professional networking moments, automatically delivered",
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Built For Every Occasion</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
          One platform, every event
        </h2>
        <p className="text-muted-foreground mb-12 -mt-8">
          From intimate gatherings to massive festivals — EventSnap scales to match your moment.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.title} className="group rounded-xl overflow-hidden border border-border bg-surface">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground mb-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
