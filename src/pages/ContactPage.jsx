export default function ContactPage() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-30
      bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
      bg-[size:60px_60px]"></div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* LEFT SIDE */}
        <div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Speak to an expert
          </h1>

          <p className="text-gray-600 mb-10">
            Looking for more information about MedTrack? Get in touch.
          </p>

          <div className="space-y-8">

            <div>
              <h3 className="font-semibold text-gray-900">
                For general communication
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                For general queries, including partnership opportunities,
                please email
              </p>

              <p className="text-blue-600 mt-2">
                info@medtrack.africa
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                For technical support
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                We're here to help. If you have technical issues,
                contact us at
              </p>

              <p className="text-blue-600 mt-2">
                support@medtrack.africa
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Phone</h3>
              <p className="text-gray-600 mt-2">(+233) 594 40 0814</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Address</h3>

              <p className="text-gray-600 text-sm mt-2">
                Ghana : 10 Paradise Road Asylum Down, Accra
              </p>

              <p className="text-gray-600 text-sm">
                United States : 271 US Route 46, Suite E102,
                Fairfield, NJ 07004 US
              </p>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE FORM */}
        <div className="bg-gray-50 rounded-2xl shadow p-8">

          <h2 className="text-lg font-semibold mb-6">
            Contact us
          </h2>

          <form className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="text"
                placeholder="Last name"
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="border rounded-lg px-3 py-2 w-full"
            />

            <input
              type="text"
              placeholder="Phone number"
              className="border rounded-lg px-3 py-2 w-full"
            />

            <input
              type="text"
              placeholder="Organization"
              className="border rounded-lg px-3 py-2 w-full"
            />

            <input
              type="text"
              placeholder="Organization website"
              className="border rounded-lg px-3 py-2 w-full"
            />

            <textarea
              placeholder="Message"
              rows="4"
              className="border rounded-lg px-3 py-2 w-full"
            ></textarea>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Submit
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}