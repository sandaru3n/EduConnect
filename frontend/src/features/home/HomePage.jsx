import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import axios from 'axios';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed w-full z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">EduConnect</div>
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/login" className="text-gray-700 hover:text-blue-600">Login</a>
            <a href="/register" className="text-gray-700 hover:text-blue-600">Register</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600">Contact</a>
            <a href="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
            <a href="/terms" className="text-gray-700 hover:text-blue-600">Terms</a>
          </div>
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

const HeroSlider = () => {
  return (
    <section className="relative h-[600px]">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="h-full"
      >
        <SwiperSlide>
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full flex items-center">
            <div className="container mx-auto px-6 text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Transform Your Educational Experience</h2>
              <p className="text-xl">Advanced management solutions for modern institutions</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="bg-gradient-to-r from-green-600 to-green-400 h-full flex items-center">
            <div className="container mx-auto px-6 text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Comprehensive Course Management</h2>
              <p className="text-xl">Streamline your academic programs with ease</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
};

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/faqs');
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFAQs();
  }, []);

  return (
    <section className="container mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq._id} className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Q: {faq.question}</p>
            <p className="mt-2">A: {faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="mb-2">Email: contact@edumanage.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:text-blue-400">About Us</a></li>
            <li><a href="/courses" className="hover:text-blue-400">Courses</a></li>
            <li><a href="/privacy" className="hover:text-blue-400">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-400">Facebook</a>
            <a href="#" className="hover:text-blue-400">Twitter</a>
            <a href="#" className="hover:text-blue-400">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        <HeroSlider />
        <section className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add course cards here */}
          </div>
        </section>
        <FAQs />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;