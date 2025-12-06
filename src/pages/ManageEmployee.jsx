import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plus, Edit2, Trash2, Users, X, Save, AlertTriangle } from 'lucide-react';
import Toast from '../components/ui/Toast';

// Format phone number to +60 format
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 60, add +
  if (cleaned.startsWith('60')) {
    return '+' + cleaned;
  }
  // If starts with 0, replace with +60
  if (cleaned.startsWith('0')) {
    return '+60' + cleaned.substring(1);
  }
  // If doesn't start with +, add +60
  if (!phone.startsWith('+')) {
    return '+60' + cleaned;
  }
  // If already has +60, return as is
  if (phone.startsWith('+60')) {
    return phone;
  }
  // Otherwise, ensure it starts with +60
  return '+60' + cleaned;
};

export default function ManageEmployee() {
  const employeesData = useQuery(api.employees.get);
  const employees = employeesData || [];
  
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const removeEmployee = useMutation(api.employees.remove);
  const activateEmployee = useMutation(api.employees.activate);
  const deactivateEmployee = useMutation(api.employees.deactivate);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    phoneNumber: '',
    department: '',
    status: 'Active'
  });

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      name: '',
      phoneNumber: '',
      department: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employeeId,
      name: employee.name,
      phoneNumber: employee.phoneNumber || '',
      department: employee.position, // Mapping position to department based on mock data usage
      status: employee.isActive ? 'Active' : 'Inactive'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    try {
      await removeEmployee({ id: employeeToDelete._id });
      setToast({
        message: `Employee ${employeeToDelete.name} has been deleted successfully.`,
        type: 'success'
      });
      setIsDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      setToast({
        message: 'Failed to delete employee: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.name || !formData.department) {
      setToast({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        await updateEmployee({
          id: editingEmployee._id,
          employeeId: formData.employee_id,
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          position: formData.department,
        });

        // Handle status change separately
        const wasActive = editingEmployee.isActive;
        const shouldBeActive = formData.status === 'Active';
        
        if (wasActive !== shouldBeActive) {
          if (shouldBeActive) {
            await activateEmployee({ id: editingEmployee._id });
          } else {
            await deactivateEmployee({ id: editingEmployee._id });
          }
        }

        setToast({
          message: `Employee ${formData.name} has been updated successfully.`,
          type: 'success'
        });
      } else {
        // Add new employee
        await createEmployee({
          employeeId: formData.employee_id,
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          position: formData.department,
        });

        setToast({
          message: `Employee ${formData.name} has been added successfully.`,
          type: 'success'
        });
      }
      
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({
        employee_id: '',
        name: '',
        phoneNumber: '',
        department: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Failed to save employee:', error);
      setToast({
        message: 'Failed to save employee: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      name: '',
      phoneNumber: '',
      department: '',
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Employees</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add, edit, and manage employee information</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Department/Position</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No employees found. Click "Add Employee" to get started.</p>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{employee.employeeId}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{employee.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {employee.phoneNumber ? formatPhoneNumber(employee.phoneNumber) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.position}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-50 transition-opacity animate-fade-in" 
            onClick={handleClose}
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="E-001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+60123456789"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Sales Manager, Engineer, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && employeeToDelete && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-50 transition-opacity animate-fade-in" 
            onClick={handleDeleteCancel}
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Employee</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{employeeToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
              
              <div className="p-6 flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

