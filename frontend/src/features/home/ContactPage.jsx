import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import axios from 'axios';

// ... (Header, HeroSlider, Footer components remain unchanged)

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contact/submit', formData);
      setSuccess('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setSuccess(null);
    }
  };

  return (
    <section className="container mx-auto px-6 py-16 bg-gradient-to-b from-indigo-50 to-white">
      <h2 className="text-4xl font-extrabold text-center mb-8 text-indigo-700 tracking-tight">
        Contact Us
      </h2>
      {success && (
        <p className="text-green-600 bg-green-100 p-3 rounded-md text-center mb-6 shadow-md">
          {success}
        </p>
      )}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-6 shadow-md">
          {error}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-6 bg-white p-6 rounded-xl shadow-lg border border-indigo-200"
      >
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full p-3 border border-indigo-300 rounded-md bg-indigo-50 text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full p-3 border border-teal-300 rounded-md bg-teal-50 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          required
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="w-full p-3 border border-purple-300 rounded-md bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none transition-all duration-300"
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-md font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-md"
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

export default ContactForm;