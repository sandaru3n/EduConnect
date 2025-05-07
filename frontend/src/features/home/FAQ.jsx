import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null); // Track the currently expanded FAQ

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

  const toggleFAQ = (index) => {
    // If the clicked FAQ is already expanded, collapse it; otherwise, expand it and collapse others
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 bg-blue-100 from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Find quick answers to common questions about our platform
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={faq._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-primary/30 cursor-pointer"
                onClick={() => toggleFAQ(index)} // Toggle on click
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary p-2 rounded-lg">
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                      </span>
                      {faq.question}
                    </h3>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedIndex === index ? 'auto' : 0,
                        opacity: expandedIndex === index ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-600 pl-10 border-l-2 border-primary/20">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>
    </section>
  );
};

export default FAQSection;