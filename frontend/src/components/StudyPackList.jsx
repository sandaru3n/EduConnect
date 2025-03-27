import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';

const StudyPacksList = () => {
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchStudyPacks = async () => {
      try {
        const response = await api.get('/study-packs');
        setStudyPacks(response.data);

        // Extract unique subjects for filter dropdown
        const uniqueSubjects = [...new Set(response.data.map(pack => pack.subject))];
        setSubjects(uniqueSubjects);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching study packs:', error);
        setError('Failed to load study packs. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudyPacks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study pack?')) {
      try {
        await api.delete(`/study-packs/${id}`);
        setStudyPacks(studyPacks.filter((studyPack) => studyPack._id !== id));
      } catch (error) {
        console.error('Error deleting study pack:', error);
        setError('Failed to delete the study pack. Please try again.');
      }
    }
  };

  // Filter study packs based on search term and subject filter
  const filteredStudyPacks = studyPacks.filter((pack) => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = filterSubject === '' || pack.subject === filterSubject;

    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl font-medium text-indigo-800">Loading study packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Packs Library</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of study materials created by students and educators
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start max-w-4xl mx-auto">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title, subject, or topic..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <Link
                to="/add-study-pack"
                className="block text-center w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Pack
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="max-w-6xl mx-auto mb-6">
          <p className="text-gray-600">
            {filteredStudyPacks.length === 0
              ? 'No study packs found. Try a different search term or create a new pack.'
              : `Showing ${filteredStudyPacks.length} ${filteredStudyPacks.length === 1 ? 'study pack' : 'study packs'}`
            }
          </p>
        </div>

        {/* Study Packs Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudyPacks.map((studyPack) => (
              <div key={studyPack._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                {/* Color Bar - Different color based on subject */}
                <div className={`h-2 ${getSubjectColor(studyPack.subject)}`}></div>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{studyPack.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {studyPack.subject}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Course:</span> {studyPack.course}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Topic:</span> {studyPack.topic}
                  </p>

                  {studyPack.description && (
                    <p className="mt-2 text-gray-700 line-clamp-3">{studyPack.description}</p>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        to={`/study-pack/${studyPack._id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </Link>
                    </div>

                    <div className="flex space-x-3">
                      <Link to={`/edit-study-pack/${studyPack._id}`} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(studyPack._id)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Delete study pack"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredStudyPacks.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No study packs found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters, or create a new study pack.</p>
              <div className="mt-6">
                <Link
                  to="/add-study-pack"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create New Study Pack
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to assign colors based on subject
const getSubjectColor = (subject) => {
  const subjectMap = {
    'Mathematics': 'bg-blue-500',
    'Physics': 'bg-purple-500',
    'Chemistry': 'bg-green-500',
    'Biology': 'bg-red-500',
    'Computer Science': 'bg-yellow-500',
    'Literature': 'bg-pink-500',
    'History': 'bg-orange-500',
    'Economics': 'bg-indigo-500',
  };

  return subjectMap[subject] || 'bg-gray-500';
};

export default StudyPacksList;
