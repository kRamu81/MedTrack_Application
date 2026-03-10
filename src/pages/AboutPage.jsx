export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* SECTION 1 */}
      <section className="relative py-28 overflow-hidden">

        {/* Grid Background */}
        <div className="absolute inset-0 opacity-30 
        bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
        bg-[size:60px_60px]"></div>

        <div className="relative max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About MedTrack
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
            We are building Africa's true Health Information System and driving
            universal access by building infrastructure that connects patient
            health data to national biometric IDs.
          </p>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Join the team
          </button>

        </div>
      </section>


      {/* SECTION 2 */}
      <section className="relative py-28 overflow-hidden">

        {/* Grid */}
        <div className="absolute inset-0 opacity-30 
        bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
        bg-[size:60px_60px]"></div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT TEXT */}
          <div>

            <p className="text-sm text-gray-500 mb-2">Mission</p>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our journey towards democratizing health record access
            </h2>

            <p className="text-gray-600 leading-relaxed">
              MedTrack was founded in 2018 in Ghana by a group of physicians,
              designers and engineers with the mission of making health records
              universally accessible to all. We are a globally-distributed
              company that values making high impacts within our community,
              accountability, and integrity.
            </p>

          </div>


          {/* RIGHT IMAGE GRID */}
          <div className="grid grid-cols-2 gap-6">

            <img
              src="https://images.unsplash.com/photo-1581595219315-a187dd40c322"
              className="rounded-xl object-cover w-full h-56"
            />

            <img
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c"
              className="rounded-xl object-cover w-full h-56"
            />

            <img
              src="https://images.unsplash.com/photo-1576765607924-b8c7f62c3f37"
              className="rounded-xl object-cover w-full h-56"
            />

            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54"
              className="rounded-xl object-cover w-full h-56"
            />

          </div>

        </div>

      </section>

    </div>
  );
}