'use client';
import { FaRocket, FaUsers, FaChartLine, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleTryFreeClick = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[rgb(127,199,217)] to-[rgb(54,84,134)] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">WorkNest</h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">Get More Done with WorkNest</h2>
              <p className="text-lg mb-8">
                Project management software that enables your teams to collaborate, plan, analyze and manage everyday tasks
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleTryFreeClick}
                  className="bg-white text-[rgb(54,84,134)] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 flex items-center justify-center"
                >
                  Try WorkNest for free <FaArrowRight className="ml-2" />
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[rgb(54,84,134)] transition duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 shadow-2xl">
                <img 
                  src="/dashboard-screenshot.png" 
                  alt="WorkNest Dashboard Preview" 
                  className="rounded-lg border-2 border-white/30 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-[rgb(220,242,241)]">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-center text-[rgb(15,16,53)] mb-8">Trusted by teams at</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['TechCorp', 'InnovateCo', 'DigitalSolutions', 'FutureLabs', 'WebWorks'].map((company) => (
              <div key={company} className="text-2xl font-bold text-[rgb(54,84,134)] opacity-70 hover:opacity-100 transition">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-[rgb(15,16,53)]">Everything your team needs in one place</h2>
          <p className="text-lg text-[rgb(54,84,134)] text-center max-w-2xl mx-auto mb-12">
            WorkNest combines powerful project management with intuitive collaboration tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaRocket className="text-[rgb(127,199,217)] text-3xl" />,
                title: "Fast Setup",
                description: "Get started in minutes with our intuitive interface and ready-to-use templates."
              },
              {
                icon: <FaUsers className="text-[rgb(127,199,217)] text-3xl" />,
                title: "Team Collaboration",
                description: "Real-time updates, comments, and file sharing keep everyone on the same page."
              },
              {
                icon: <FaChartLine className="text-[rgb(127,199,217)] text-3xl" />,
                title: "Powerful Analytics",
                description: "Track progress, identify bottlenecks, and optimize workflows with detailed reports."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-[rgb(220,242,241)]">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-[rgb(15,16,53)]">{feature.title}</h3>
                <p className="text-[rgb(54,84,134)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[rgb(220,242,241)] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[rgb(15,16,53)]">Ready to transform your team's productivity?</h2>
          <p className="text-lg text-[rgb(54,84,134)] mb-8">
            Join thousands of teams who are already working smarter with WorkNest
          </p>
          <button 
            onClick={handleTryFreeClick}
            className="bg-[rgb(127,199,217)] text-[rgb(15,16,53)] px-8 py-4 rounded-lg font-semibold hover:bg-[rgb(54,84,134)] hover:text-white transition duration-300 flex items-center justify-center mx-auto"
          >
            Get Started for Free <FaArrowRight className="ml-2" />
          </button>
          <p className="text-sm text-[rgb(54,84,134)] mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[rgb(15,16,53)] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WorkNest</h3>
            <p className="text-[rgb(220,242,241)]">
              The complete project management platform for modern teams
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Integrations', 'Updates'].map((item) => (
                <li key={item} className="text-[rgb(220,242,241)] hover:text-[rgb(127,199,217)] cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Blog', 'Help Center', 'Tutorials', 'Webinars'].map((item) => (
                <li key={item} className="text-[rgb(220,242,241)] hover:text-[rgb(127,199,217)] cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Contact', 'Legal'].map((item) => (
                <li key={item} className="text-[rgb(220,242,241)] hover:text-[rgb(127,199,217)] cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-[rgb(54,84,134)] text-center text-[rgb(220,242,241)] text-sm">
          © {new Date().getFullYear()} WorkNest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}