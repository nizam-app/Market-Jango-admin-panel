import { useState } from 'react';
import { Link } from 'react-router';

const AdminUserList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, fullName: 'Nguyen, Shane', email: 'sara.cruz@example.com', roles: 'Owner', status: 'Active' },
    { id: 2, fullName: 'Flores, Juanita', email: 'georgia.young@example.com', roles: 'Admin', status: 'Inactive' },
    { id: 3, fullName: 'Cooper, Kristin', email: 'alma.lawson@example.com', roles: 'Super Admin', status: 'Active' },
    { id: 4, fullName: 'Black, Marvin', email: 'tim.jennings@example.com', roles: 'Admin', status: 'Active' },
    { id: 5, fullName: 'Henry, Arthur', email: 'bill.sanders@example.com', roles: 'Admin', status: 'Active' },
    { id: 6, fullName: 'Flores, Juanita', email: 'felicia.reid@example.com', roles: 'Admin', status: 'Inactive' },
    { id: 7, fullName: 'Miles, Esther', email: 'michelle.rivera@example.com', roles: 'Admin', status: 'Active' },
    { id: 8, fullName: 'Cooper, Kristin', email: 'deanna.curtis@example.com', roles: 'Admin', status: 'Active' },
    { id: 9, fullName: 'Miles, Esther', email: 'jackson.graham@example.com', roles: 'Super Admin', status: 'Inactive' },
    { id: 10, fullName: 'Nguyen, Shane', email: 'debra.holt@example.com', roles: 'Admin', status: 'Active' },
    { id: 11, fullName: 'Henry, Arthur', email: 'michael.mitc@example.com', roles: 'Admin', status: 'Active' },
  ]);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const getActionText = (status) => {
    if (status === 'Active') return 'Edit User';
    if (status === 'Inactive') return 'Assign Role';
    return 'Detect User';
  };

  const handleAction = (action, userId) => {
    console.log(`Action: ${action} for user ${userId}`);
    setActiveDropdown(null);
    // Add your action logic here
  };

  return (
    <div className=" bg-white rounded-[12px] border border-[#8AB3D3]">
      <div className="px-5  py-3 border-b border-[#8AB3D3]
       flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin List</h1>
        <Link to='/create-role'> <button className="bg-[#FF8C00] cursor-pointer flex gap-1 items-center text-[#051522] font-medium px-5 py-3  rounded-[12px]   focus:outline-none ">
          Add New <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25px"
    height="25px"
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect width="24" height="24" fill="none" />
    <path
      d="M12 6V18"
      stroke="#000000"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12H18"
      stroke="#000000"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
        </button></Link>
      </div>

      <div className="overflow-x-auto ">
        <table className="min-w-full divide-y divide-[#8AB3D3]">
          
          <thead className="">
            <tr>
              <th className="px-5 py-3 text-left  font-medium text-[#003F72] tracking-wider">Full Name</th>
              <th className="px-5 py-3 text-left  font-medium text-[#003F72] tracking-wider">Email Address</th>
              <th className="px-5 py-3 text-left  font-medium text-[#003F72] tracking-wider">Roles</th>
              <th className="px-5 py-3 text-left  font-medium text-[#003F72] tracking-wider">Status</th>
              <th className="px-7 py-3 text-right  font-medium text-[#003F72] tracking-wider">
                {/* <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#003F72"
    width="15px"
    height="15px"
    viewBox="0 0 32 32"
  >
    <path d="M13,16c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,14.346,13,16z" />
    <path d="M13,26c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,24.346,13,26z" />
    <path d="M13,6c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,4.346,13,6z" />
  </svg> */}
  </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#8AB3D3]">
            {users.map((user) => (
              <tr key={user.id} className="">
                <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">{user.fullName}</td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">{user.email}</td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]">{user.roles}</td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-[#5D768A]"> {user.status}</td>
                <td className="text-right px-6 py-4 whitespace-nowrap 
                text-sm text-gray-500 relative">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="text-[#003F72]  px-1  cursor-pointer font-medium"
                  >
                    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#003F72"
    width="15px"
    height="15px"
    viewBox="0 0 32 32"
  >
    <path d="M13,16c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,14.346,13,16z" />
    <path d="M13,26c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,24.346,13,26z" />
    <path d="M13,6c0,1.654,1.346,3,3,3s3-1.346,3-3s-1.346-3-3-3S13,4.346,13,6z" />
  </svg>
                  </button>

                  {activeDropdown === user.id && (
                    <div className="absolute right-10 mt-2 w-48 bg-[#FFFFFF] 
                    rounded-md shadow-sm shadow-[#00000029] z-10 border border-[#E6EEF6] ">
                   
                      <div >
                        <div className='p-3'>
                            <button
                          onClick={() => handleAction('edit', user.id)}
                          className="block w-full text-left px-4 py-2  text-[#003F72] cursor-pointer hover:bg-gray-100"
                        >
                          Edit User
                        </button>
                        <button
                          onClick={() => handleAction('assign_role', user.id)}
                          className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                        >
                          Assign Role
                        </button>
                        </div>
                        
                        <hr className='w-full border-t border-[#8AB3D3]'/>

                        <div className='p-3'>
                            <button
                          onClick={() => handleAction('toggle_status', user.id)}
                          className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleAction('delete', user.id)}
                          className="block w-full text-left px-4 py-2 text-[#003F72] cursor-pointer hover:bg-gray-100"
                        >
                          Delete User
                        </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserList;