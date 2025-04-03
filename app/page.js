'use client'
import { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert
import Select from "react-select";
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/LoginPage');
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/LoginPage');
      return;
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    discountRate: "",
    supplyPrice: "",
    premium: "",
    basePrice: "",
    country: "",
    salesProfit: "",
  });
  const [message, setMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editId, setEditId] = useState(null); // Track lead being edited

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const countryOptions = data.map((country) => ({
          value: country.cca2,
          label: country.name.common,
          flag: country.flags.svg,
        }));
        setCountries(countryOptions);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  const handleCountryChange = (selected) => {
    setSelectedCountry(selected);
    console.log("Selected Country:", selected); // Show in console

    // Send data to backend (MongoDB)
    axios
      .post("http://localhost:5000/api/countries", selected)
      .then((response) => {
        console.log("Data saved to MongoDB:", response.data);
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  const customSingleValue = ({ data }) => (
    <div className="flex items-center">
      <img src={data.flag} alt={data.label} className="w-5 h-5 mr-2" />
      {data.label}
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center p-2 hover:bg-gray-200">
        <img src={data.flag} alt={data.label} className="w-5 h-5 mr-2" />
        {data.label}
      </div>
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`https://exhcangedata.vercel.app/MarginData/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setLeads(leads.filter((lead) => lead._id !== id)); // Remove from UI
          Swal.fire("Deleted!", "Lead has been deleted.", "success");
        } else {
          Swal.fire("Error!", "Failed to delete lead.", "error");
        }
      } catch (error) {
        console.error("Error deleting lead:", error);
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("https://exhcangedata.vercel.app/MarginData");
        const data = await response.json();
        setLeads(data.marginDataCRUDData || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };
    fetchLeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = editId
      ? `https://exhcangedata.vercel.app/MarginData/${editId}`
      : "https://exhcangedata.vercel.app/MarginData";

    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, // Spread existing form data
          country: selectedCountry?.label || formData.country, // Ensure country is passed
          flag: selectedCountry?.flag || formData.flag, // Ensure flag is passed
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: editId ? "Lead updated successfully" : "Lead added successfully",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Reset form
        setFormData({
          name: "",
          discountRate: "",
          supplyPrice: "",
          premium: "",
          basePrice: "",
          country: "",
          flag: "",
          salesProfit: "",
        });
        setEditId(null);

        // Refresh the leads list
        const updatedLeads = await fetch("https://exhcangedata.vercel.app/MarginData");
        const newLeadsData = await updatedLeads.json();
        setLeads(newLeadsData.marginDataCRUDData || []);
      } else {
        Swal.fire({
          title: "Error!",
          text: result.error || "Failed to submit data",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Server Error!",
        text: "Error connecting to the server",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEdit = (lead) => {
    setEditId(lead._id); // Set the edit ID
    setIsOpen(true);
    setFormData({
      name: lead.name,
      discountRate: lead.discountRate,
      supplyPrice: lead.supplyPrice,
      premium: lead.premium,
      basePrice: lead.basePrice,
      country: lead.country,
      flag: lead.flag,
      salesProfit: lead.salesProfit,
    });
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          <FaPlus /> 마진 DATA 추가
        </button>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >로그아웃Logout
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-20 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Lead" : "Add a New Lead"}</h2>
            {message && <p className="mb-4 text-center text-green-600">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="w-full">
                <Select
                  options={countries}
                  placeholder="Select a country..."
                  onChange={handleCountryChange}
                  components={{ SingleValue: customSingleValue, Option: customOption }}
                />
              </div>
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
                type="number"
                name="discountRate"
                placeholder="Discount Rate"
                value={formData.discountRate}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="supplyPrice"
                placeholder="Supply Price"
                value={formData.supplyPrice}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="premium"
                placeholder="Premium"
                value={formData.premium}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="basePrice"
                placeholder="Base Price"
                value={formData.basePrice}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="salesProfit"
                placeholder="Sales Profit"
                value={formData.salesProfit}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-between items-center mt-4 space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editId ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      name: "",
                      discountRate: "",
                      supplyPrice: "",
                      premium: "",
                      basePrice: "",
                      country: "",
                      salesProfit: "",
                    })
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Leads List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">국가</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">유저 이름</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">할인율</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">공급가</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">프리미엄</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">기준가</th>
              
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">판매수익</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="px-2 py-4   h-[50px]  flex items-center">
                      {lead.country} 
                      <img 
                        src={lead.flag} 
                        alt={lead.country} 
                        className="w-6 h-4 rounded-sm shadow-sm ml-2"
                      />
                    </td>
                    <td className="px-2 h-[50px] py-4  ">{lead.name}</td>
                    <td className="px-2 h-[50px]  py-4  ">{lead.discountRate}%</td>
                    <td className="px-2 h-[50px] py-4  ">${lead.supplyPrice}</td>
                    <td className="px-2 h-[50px] py-4  ">${lead.premium}</td>
                    <td className="px-2 h-[50px] py-4  ">${lead.basePrice}</td>
                    
                    <td className="px-2 h-[50px] py-4  ">${lead.salesProfit}</td>
                    <td className="px-2 h-[50px] py-4   flex space-x-4">
                      <button 
                        onClick={() => handleEdit(lead)} 
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(lead._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button> 
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 whitespace-no-wrap text-center">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}