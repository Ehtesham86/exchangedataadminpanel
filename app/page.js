 'use client'
 import { useEffect, useState } from 'react';
 import { FaPlus } from "react-icons/fa";

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'New',
  });
  const [message, setMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
    useEffect(() => {
      const fetchLeads = async () => {
        try {
          const response = await fetch('https://leads-crud-nodejs.vercel.app/leads');
          const data = await response.json();
          console.log('Fetched Leads:', data);
          setLeads(data.leadsCRUDData || []);

        } catch (error) {
          console.error('Error fetching leads:', error);
        }
      };
      fetchLeads();
    }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch('https://leads-crud-nodejs.vercel.app/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Lead added successfully!');
        setFormData({ name: '', email: '', status: 'New' });
      } else {
        setMessage(result.error || 'Failed to add lead');
      }
    } catch (error) {
      setMessage('Error connecting to the server');
    }
  };


  return (
           <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <div className="flex items-center justify-center  bg-gray-100">
                <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg"
      >
        <FaPlus /> Add New Lead
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-none bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Add a New Lead</h2>
      {message && <p className="mb-4 text-center text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="New">New</option>
          <option value="Engaged">Engaged</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Closed-Won">Closed-Won</option>
          <option value="Closed-Lost">Closed-Lost</option>
        </select>
        <div className="flex justify-between mt-4 space-x-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Lead
              </button>
            </div>

      </form>
                
          </div>
        </div>
      )}
    </div>
    <div className="mt-6">
        <h3 className="text-lg font-semibold">Leads List</h3>
        <ul className="mt-2 space-y-2">
          {leads.map((lead) => (
            <li key={lead._id} className="p-2 border rounded">
              <p><strong>Name:</strong> {lead.name}</p>
              <p><strong>Email:</strong> {lead.email}</p>
              <p><strong>Status:</strong> {lead.status}</p>
            </li>
          ))}
        </ul>
      </div>
    
    </div>

   );
}
