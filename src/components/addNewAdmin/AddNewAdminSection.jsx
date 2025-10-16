import React, { useState } from 'react';

const AddNewAdminSection = () => {
  const [permissions, setPermissions] = useState({
    viewVendorProfiles: true,
    approveRejectVendorApps: false,
    viewStoreSetup: true,
    approveRejectVendorProducts: true,
    viewVendorProfiles2: true, // Assuming this is a typo and should be unique
    approveRejectDriverApps: false,
    viewDriverApplications: true,
    verifyDriverDocuments: true,
    suspendDriver: true,
    viewDriverProfiles: true,
  });

  const handlePermissionToggle = (permission) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [permission]: !prevPermissions[permission],
    }));
  };

  return (
    <div className="bg-white min-h-screen p-12 rounded-[15px]">
        <h1 className="text-[26px] font-medium mb-6 ">Create New Role</h1>
         {/* new role input fields */}
        <div className="grid grid-cols-3 gap-15 my-5">
          <div className='space-y-1'>
            <label htmlFor="userName" 
            className="block text-lg font-medium text-[#003158]">User Name</label>
            <input
              type="text"
              id="userName"
              className=" block p-10 text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border"
              defaultValue="Nguyen, Shane"
            />
          </div>
          <div className='space-y-1'>
            <label htmlFor="emailAddress" 
            className="block text-lg font-medium text-[#003158]">User Name</label>
            <input
              type="email"
              id="emailAddress"
              name='emailAddress'
              className=" block p-10 text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border"
              defaultValue="sara.cruz@example.com"
            />
          </div>
         
          <div className="relative space-y-1">
            <label htmlFor="accessAction" className="block text-lg font-medium text-[#003158]">Access Action</label>
            <select
              id="accessAction"
              className="block p-10 text-[#0059A0] w-full rounded-[12px] border-[#8AB3D3]
               focus:outline-none px-3 py-2 border"
              defaultValue="Admin"
            >
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
        
        {/* new role permissions */}
        <h2 className="text-2xl font-medium mb-4 ">Assign permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* vendor permissions */}
          <div>
            <h3 className="font-medium text-[#003158] mb-2">Vendor</h3>
            <ul className="space-y-3 text-[#5D768A] font-medium">
              <li className="flex  items-center justify-between">
                <span>View Vendor Profiles</span>
                <div
                  onClick={() => handlePermissionToggle('viewVendorProfiles')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.viewVendorProfiles ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.viewVendorProfiles ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>Approve/Reject Vendor Applications</span>
                <div
                  onClick={() => handlePermissionToggle('approveRejectVendorApps')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.approveRejectVendorApps ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.approveRejectVendorApps ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>View Store Setup</span>
                <div
                  onClick={() => handlePermissionToggle('viewStoreSetup')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.viewStoreSetup ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.viewStoreSetup ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>Approve/Reject Vendor Products</span>
                <div
                  onClick={() => handlePermissionToggle('approveRejectVendorProducts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.approveRejectVendorProducts ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.approveRejectVendorProducts ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>View Vendor Profiles</span>
                <div
                  onClick={() => handlePermissionToggle('viewVendorProfiles2')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.viewVendorProfiles2 ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.viewVendorProfiles2 ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
            </ul>
          </div>
          {/* driver permissions */}
          <div>
            <h3 className="font-medium text-[#003158] mb-2">Driver</h3>
            <ul className="space-y-3 text-[#5D768A] font-medium">
              <li className="flex items-center justify-between">
                <span>Approve/Reject Driver Applications</span>
                <div
                  onClick={() => handlePermissionToggle('approveRejectDriverApps')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.approveRejectDriverApps ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.approveRejectDriverApps ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>View Driver Applications</span>
                <div
                  onClick={() => handlePermissionToggle('viewDriverApplications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.viewDriverApplications ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.viewDriverApplications ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>Verify Driver Documents</span>
                <div
                  onClick={() => handlePermissionToggle('verifyDriverDocuments')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.verifyDriverDocuments ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.verifyDriverDocuments ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>Suspend Driver</span>
                <div
                  onClick={() => handlePermissionToggle('suspendDriver')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.suspendDriver ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.suspendDriver ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span>View Driver Profiles</span>
                <div
                  onClick={() => handlePermissionToggle('viewDriverProfiles')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${permissions.viewDriverProfiles ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${permissions.viewDriverProfiles ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* new role action */}
        <div className="mt-15 flex justify-end">
          <button
            type="button"
            className="rounded-[100px] bg-[#FF8C00] px-6 py-2.5  font-medium cursor-pointer"
          >
            Save
          </button>
        </div>
    </div>
  );
};

export default AddNewAdminSection;