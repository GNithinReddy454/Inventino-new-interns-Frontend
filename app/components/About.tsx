export default function About() {
  return (
    <section className="w-full bg-white px-6 md:px-16 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Main 2-column row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-1">
              More Than Just Products,
            </h2>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent mb-5">
              They&apos;re Memories
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Every piece in our collection is carefully handcrafted with passion and dedication.
              We believe that the items you wear and cherish should carry meaning, tell your
              story, and connect you to the artisan who made them.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              From the first sketch to the final polish, every step is a labor of love. We work with
              talented artisans who use traditional techniques passed down through
              generations, combined with contemporary design sensibilities.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "10K+", label: "Happy Customers" },
                { value: "500+", label: "Unique Designs" },
                { value: "50+", label: "Skilled Artisans" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-pink-50 border border-pink-100 rounded-2xl py-4 px-3 text-center"
                >
                  <p className="text-2xl font-black text-pink-600 mb-1">{stat.value}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div>
            <img
              src="/images/diary-charm.jpg"
              alt="Handcrafted jewellery being made"
              className="w-full rounded-2xl shadow-xl object-cover h-72 md:h-[380px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
