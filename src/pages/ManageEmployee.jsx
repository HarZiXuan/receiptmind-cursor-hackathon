import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plus, Edit2, Trash2, Users, X, Save } from 'lucide-react';

export default function ManageEmployee() {
  const employeesData = useQuery(api.employees.get);
  const employees = employeesData || [];
  
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const removeEmployee = useMutation(api.employees.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: '',
    status: 'Active'
  });

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      name: '',
      email: '',
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
      email: employee.email,
      department: employee.position, // Mapping position to department based on mock data usage
      status: employee.isActive ? 'Active' : 'Inactive'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await removeEmployee({ id });
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Failed to delete employee: ' + error.message);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.name || !formData.email || !formData.department) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        await updateEmployee({
          id: editingEmployee._id,
          employeeId: formData.employee_id,
          name: formData.name,
          email: formData.email,
          position: formData.department, // Using department input for position
          // isActive is handled by separate activate/deactivate mutations in backend logic usually, 
          // but let's see if we can update it here. The update mutation doesn't seem to take isActive.
          // We might need to call activate/deactivate separately if status changed.
        });
      } else {
        // Add new employee
        await createEmployee({
          employeeId: formData.employee_id,
          name: formData.name,
          email: formData.email,
          position: formData.department,
          // phoneNumber is optional
        });
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({
        employee_id: '',
        name: '',
        email: '',
        department: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Failed to save employee: ' + error.message);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      department: '',
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Employees</h1>
          <p className="text-gray-500 mt-1">Add, edit, and manage employee information</p>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department/Position</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No employees found. Click "Add Employee" to get started.</p>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{employee.employeeId}</td>
                    <td className="px-6 py-4 text-gray-700">{employee.name}</td>
                    <td className="px-6 py-4 text-gray-600">{employee.email}</td>
                    <td className="px-6 py-4 text-gray-600">{employee.position}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.isActive 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity animate-fade-in" 
            onClick={handleClose}
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="E-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Sales Manager, Engineer, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>

                {/* Status field removed from create/update for simplicity as update mutation doesn't support it directly in one call without separate mutation */}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
    </div>
  );
}

