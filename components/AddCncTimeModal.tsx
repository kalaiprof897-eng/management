import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/DataContext';
import { CncTimeLog } from '../types';

interface AddCncTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCncTimeModal: React.FC<AddCncTimeModalProps> = ({ isOpen, onClose }) => {
  const { addCncTimeLog } = useAppData();
  
  const [formData, setFormData] = useState({
    machineName: '',
    workOrderNumber: '',
    workPieceName: '',
    quantity: '',
    siNo: '',
    inTime: '',
    outTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form on close
    if (!isOpen) {
        setError(null);
        setFormData({
            machineName: '',
            workOrderNumber: '',
            workPieceName: '',
            quantity: '',
            siNo: '',
            inTime: '',
            outTime: '',
        });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.machineName || !formData.workOrderNumber || !formData.workPieceName || !formData.quantity || !formData.inTime || !formData.outTime) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    const logData: Omit<CncTimeLog, 'id' | 'userId'> = {
      machineName: formData.machineName,
      workOrderNumber: formData.workOrderNumber,
      workPieceName: formData.workPieceName,
      quantity: parseInt(formData.quantity, 10),
      siNo: formData.siNo,
      inTime: new Date(formData.inTime),
      outTime: new Date(formData.outTime),
    };
    
    const { error: submitError } = await addCncTimeLog(logData);

    if (submitError) {
      setError(`Failed to save: ${submitError.message}`);
    } else {
      onClose(); // Close modal on success
    }
    
    setIsSubmitting(false);
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4"
           onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Add CNC Time Log</h2>

          {/* Form Fields Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="machineName" className="block text-sm font-medium text-gray-300">Machine Name</label>
              <input type="text" id="machineName" name="machineName" value={formData.machineName} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="workOrderNumber" className="block text-sm font-medium text-gray-300">Work Order Number</label>
              <input type="text" id="workOrderNumber" name="workOrderNumber" value={formData.workOrderNumber} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="workPieceName" className="block text-sm font-medium text-gray-300">Work Piece Name</label>
              <input type="text" id="workPieceName" name="workPieceName" value={formData.workPieceName} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="siNo" className="block text-sm font-medium text-gray-300">SI No</label>
              <input type="text" id="siNo" name="siNo" value={formData.siNo} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div></div> {/* Spacer */}
             <div>
              <label htmlFor="inTime" className="block text-sm font-medium text-gray-300">In Time</label>
              <input type="datetime-local" id="inTime" name="inTime" value={formData.inTime} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="outTime" className="block text-sm font-medium text-gray-300">Out Time</label>
              <input type="datetime-local" id="outTime" name="outTime" value={formData.outTime} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCncTimeModal;