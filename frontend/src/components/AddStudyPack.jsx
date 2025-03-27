import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

const AddStudyPack = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Retrieve userInfo from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate authentication
    if (!userInfo || !userInfo.token) {
      setError('You must be logged in to add a study pack');
      setIsSubmitting(false);
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('course', course);
    formData.append('topic', topic);
    if (file) formData.append('file', file); // Only append file if it exists

    try {
      const response = await api.post('/study-packs', formData, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Study pack added successfully:', response.data);
      navigate('/study-packs');
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 403) {
          setError('Forbidden: Invalid or expired token. Please log in again.');
        } else {
          setError(`Error: ${error.response.data.message || 'Something went wrong'}`);
        }
      } else if (error.request) {
        // No response received
        setError('Network error: Could not reach the server.');
      } else {
        // Error setting up the request
        setError('An unexpected error occurred.');
      }
      console.error('Error adding study pack:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/study-packs');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Create New Study Pack
            </h1>
            <p className="text-indigo-100 text-sm md:text-base">
              Share your knowledge with students around the world
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-10">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="E.g., Calculus Fundamentals"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    placeholder="Provide a detailed description of your study pack..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Subject, Course and Topic section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-sm uppercase font-semibold text-gray-600 mb-4">Classification Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject */}
                    <div className="form-group">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="E.g., Mathematics"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      />
                    </div>

                    {/* Course */}
                    <div className="form-group">
                      <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                        placeholder="E.g., Calculus 101"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="form-group mt-6">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      placeholder="E.g., Derivatives"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                      type="file"
                      id="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        {file ? file.name : 'Drag and drop your file here, or click to browse'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">PDF, DOCX, PPTX up to 50MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Create Study Pack'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudyPack;
