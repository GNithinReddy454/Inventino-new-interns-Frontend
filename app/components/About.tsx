export default function About() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-pink-50 px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Main About Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Text Content */}
          <div>
            <div className="mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 mb-2">
                More Than Just
              </h2>
              <h2 className="text-3xl md:text-4xl lg:text-4xl font-black bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-6">
                Memories
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full"></div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 leading-relaxed">
              Every piece in our collection is carefully handcrafted with passion and dedication. We believe that the items you wear and cherish should carry meaning, tell your story. From the finest materials to the final polish, we work with talented artisans who use traditional techniques passed down through generations, combined with contemporary design sensibilities.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 my-6 md:my-8">
              <div className="bg-gradient-to-br from-pink-50 to-white p-4 md:p-5 lg:p-6 rounded-2xl text-center border border-pink-200/30 shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-2xl md:text-3xl lg:text-3xl font-black text-pink-600 mb-2">10K+</p>
                <p className="text-gray-600 text-xs font-semibold">Happy Customers</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-white p-4 md:p-5 lg:p-6 rounded-2xl text-center border border-pink-200/30 shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-2xl md:text-3xl lg:text-3xl font-black text-pink-600 mb-2">50+</p>
                <p className="text-gray-600 text-xs font-semibold">Unique Designs</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-white p-4 md:p-5 lg:p-6 rounded-2xl text-center border border-pink-200/30 shadow-sm hover:shadow-md transition-all duration-300">
                <p className="text-2xl md:text-3xl lg:text-3xl font-black text-pink-600 mb-2">50+</p>
                <p className="text-gray-600 text-xs font-semibold">Skilled Artisans</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <img
              src="/images/diary-charm.jpg"
              alt="Handcrafted Diary Charm"
              className="w-full rounded-xl shadow-2xl object-cover h-64 md:h-80 lg:h-96"
            />
          </div>
        </div>

        {/* Memories Through Handcraft - Image Gallery Section */}
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl p-8 md:p-10 lg:p-12 shadow-xl border border-pink-200/30">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-3xl font-black text-gray-900 mb-2">
              Memories Through Handcraft
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full mx-auto mb-3"></div>
            <p className="text-center text-gray-600 text-xs md:text-sm font-medium">
              Each creation tells a unique story of tradition, elegance, and love
            </p>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Charm 1 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/HairAccesories.jpg"
                alt="Golden Bow Hair Accessory"
                className="w-full h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3 md:p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-sm md:text-lg">Hair Accessories</p>
                  <p className="text-xs md:text-sm">Trendy & Elegant</p>
                </div>
              </div>
            </div>

            {/* Charm 2 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/bracelets-charm.jpg"
                alt="Pink Charm Bracelet"
                className="w-full h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3 md:p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-sm md:text-lg">Charming Bracelets</p>
                  <p className="text-xs md:text-sm">Handcrafted Love</p>
                </div>
              </div>
            </div>

            {/* Charm 3 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/bag-charm.jpg"
                alt="Floral Bag Charm"
                className="w-full h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3 md:p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-sm md:text-lg">Bag Charms</p>
                  <p className="text-xs md:text-sm">Perfect Companions</p>
                </div>
              </div>
            </div>

            {/* Charm 4 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/kids-jelwelry.jpg"
                alt="Kids Jewelry Set"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-lg">Kids Jewelry</p>
                  <p className="text-sm">Safe & Adorable</p>
                </div>
              </div>
            </div>

            {/* Charm 5 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/red-charm.jpg"
                alt="Red Shoe Charm"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-lg">Shoe Charms</p>
                  <p className="text-sm">Elegant & Unique</p>
                </div>
              </div>
            </div>

            {/* Charm 6 */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src="/images/diary-charm.jpg"
                alt="Diary Charm Collection"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-bold text-lg">Diary Charms</p>
                  <p className="text-sm">Precious Moments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
