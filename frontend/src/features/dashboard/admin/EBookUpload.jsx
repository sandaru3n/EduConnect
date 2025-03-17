//frontend/src/features/dashboard/admin/EBookUpload.jsx
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

  useEffect(() => {
    fetchEBooks();
  }, []);

  const fetchEBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ebooks');
      setEBooks(response.data);
    } catch (error) {
      console.error('Error fetching eBooks:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (formData.eBookId) {
        const response = await axios.put(`http://localhost:5000/api/ebooks/edit/${formData.eBookId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(response.data.message);
      } else {
        const response = await axios.post('http://localhost:5000/api/ebooks/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(`EBook uploaded successfully! File URL: ${response.data.fileUrl || 'Not provided'}`);
      }
      setFormData({ title: '', category: '', author: '', status: 'active', document: null, coverPhoto: null, eBookId: null });
      fetchEBooks();
    } catch (error) {
      console.error('Upload/Edit error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
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
  };

  const handleDelete = async (eBookId) => {
    if (window.confirm('Are you sure you want to delete this eBook?')) {
      try {
        await axios.delete(`http://localhost:5000/api/ebooks/delete/${eBookId}`);
        alert('eBook deleted successfully');
        fetchEBooks();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting eBook: ' + (error.response?.data?.message || error.message));
      }
    }
  };
  

  return (
    <div className="ebook-upload">
      <h2>{formData.eBookId ? 'Edit eBook' : 'Upload New eBook'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Category:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </div>
        <div>
          <label>Author:</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required />
        </div>
        <div>
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label>Document (PDF):</label>
          <input type="file" name="document" onChange={handleChange} accept=".pdf" disabled={formData.eBookId} />
        </div>
        <div>
          <label>Cover Photo (JPG/PNG):</label>
          <input type="file" name="coverPhoto" onChange={handleChange} accept=".jpg,.jpeg,.png" />
        </div>
        <button type="submit">{formData.eBookId ? 'Update eBook' : 'Upload eBook'}</button>
      </form>

      <h3>Existing eBooks</h3>
      <div className="ebook-list">
        {eBooks.map(eBook => (
          <div key={eBook._id} className="ebook-card">
            <h4>{eBook.title}</h4>
            <p>Author: {eBook.author}</p>
            <p>Category: {eBook.category}</p>
            <p>Status: {eBook.status}</p>
            <button onClick={() => handleEdit(eBook)}>Edit</button>
            <button onClick={() => handleDelete(eBook._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EBookUpload;