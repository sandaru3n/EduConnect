import { useState, useEffect } from 'react';
import axios from 'axios';

const EBookUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    status: 'active',
    document: null,
    coverPhoto: null,
    eBookId: null // For editing
  });
  const [eBooks, setEBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchEBooks();
  }, []);

  // Update preview when cover photo changes
  useEffect(() => {
    if (formData.coverPhoto && typeof formData.coverPhoto !== 'string') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(formData.coverPhoto);
    } else {
      setPreviewUrl('');
    }
  }, [formData.coverPhoto]);

  const fetchEBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/ebooks');
      setEBooks(response.data);

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(book => book.category))];
      setCategories(uniqueCategories);

      setError('');
    } catch (error) {
      console.error('Error fetching eBooks:', error);
      setError('Failed to load eBooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      author: '',
      status: 'active',
      document: null,
      coverPhoto: null,
      eBookId: null
    });
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (formData.eBookId) {
        const response = await axios.put(`http://localhost:5000/api/ebooks/edit/${formData.eBookId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Show success message
        setError({ type: 'success', message: 'eBook updated successfully!' });
      } else {
        const response = await axios.post('http://localhost:5000/api/ebooks/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Show success message
        setError({ type: 'success', message: 'eBook uploaded successfully!' });
      }
      resetForm();
      fetchEBooks();
    } catch (error) {
      console.error('Upload/Edit error:', error);
      setError({ type: 'error', message: error.response?.data?.message || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (eBook) => {
    setFormData({
      title: eBook.title,
      category: eBook.category,
      author: eBook.author,
      status: eBook.status,
      document: null,
      coverPhoto: null,
      eBookId: eBook._id
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (eBookId) => {
    if (window.confirm('Are you sure you want to delete this eBook?')) {
      try {
        await axios.delete(`http://localhost:5000/api/ebooks/delete/${eBookId}`);
        setError({ type: 'success', message: 'eBook deleted successfully' });
        fetchEBooks();
      } catch (error) {
        console.error('Delete error:', error);
        setError({ type: 'error', message: error.response?.data?.message || error.message });
      }
    }
  };

  // Filter eBooks based on search term and category
  const filteredEBooks = eBooks.filter((eBook) => {
    const matchesSearch =
      eBook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eBook.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === '' || eBook.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700">
            {formData.eBookId ? 'Update eBook' : 'eBook Management'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {formData.eBookId
              ? 'Update information for the selected eBook'
              : 'Upload new eBooks to the library collection'}
          </p>
        </div>

        {/* Alert Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-md flex items-start max-w-4xl mx-auto ${
            error.type === 'success'
              ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
              : 'bg-red-50 border-l-4 border-red-500 text-red-700'
          }`}>
            <svg
              className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {error.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              )}
            </svg>
            <div>
              <p className="font-medium">{error.type === 'success' ? 'Success' : 'Error'}</p>
              <p>{error.message}</p>
            </div>
            <button
              className="ml-auto text-gray-500 hover:text-gray-700"
              onClick={() => setError('')}
              aria-label="Dismiss message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {formData.eBookId ? 'Update eBook Information' : 'Upload New eBook'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Book Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Author name"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Fiction, Science, History"
                      list="category-suggestions"
                      required
                    />
                    <datalist id="category-suggestions">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Cover Preview */}
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document (PDF) {!formData.eBookId && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                        <input
                          type="file"
                          name="document"
                          onChange={handleChange}
                          accept=".pdf"
                          disabled={formData.eBookId}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          required={!formData.eBookId}
                        />
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">
                            {formData.document ? formData.document.name : formData.eBookId ? 'PDF already uploaded' : 'Click to upload PDF'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">PDF up to 50MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Photo
                      </label>
                      <div
                        className={`relative border-2 ${previewUrl ? 'border-solid' : 'border-dashed'} border-gray-300 rounded-lg ${previewUrl ? 'p-1' : 'p-4'} bg-gray-50 hover:bg-gray-100 transition h-40`}
                      >
                        <input
                          type="file"
                          name="coverPhoto"
                          onChange={handleChange}
                          accept=".jpg,.jpeg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {previewUrl ? (
                          <div className="w-full h-full overflow-hidden rounded">
                            <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="text-center h-full flex flex-col items-center justify-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-600">
                              Click to upload cover image
                            </p>
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {formData.eBookId ? 'Cancel' : 'Reset'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-md shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : formData.eBookId ? 'Update eBook' : 'Upload eBook'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">eBook Library</h2>
              </div>

              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by title or author..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Books List */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-10 w-10 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading eBooks...</p>
                  </div>
                ) : filteredEBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No eBooks found</h3>
                    <p className="mt-1 text-gray-500">
                      {searchTerm || filterCategory ? 'Try adjusting your search or filters.' : 'Start by uploading a new eBook.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredEBooks.map((eBook) => (
                      <div
                        key={eBook._id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Book Cover */}
                          <div className="w-full sm:w-32 h-40 sm:h-auto bg-gray-100 flex-shrink-0">
                            {eBook.coverPhoto ? (
                              <img
                                src={eBook.coverPhoto}
                                alt={`${eBook.title} cover`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{eBook.title}</h3>
                                  <p className="text-sm text-gray-600">By {eBook.author}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  eBook.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {eBook.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {eBook.category}
                                </span>
                              </div>

                              {eBook.documentUrl && (
                                <div className="mt-2">
                                  <a
                                    href={eBook.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View PDF
                                  </a>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(eBook)}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(eBook._id)}
                                className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookUpload;