import React from "react";
import AvatarImage from "./AvatarImage";

const AboutMe = ({ user }) => {
  if (!user) {
    return (
      <div className="text-sm text-gray-500">
        Profile information not available.
      </div>
    );
  }

  const name = user.name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const role = user.admin?.role || user.user_type || "-";
  const status = user.admin?.status || user.status || "-";

  return (
    <>
      <div className="flex justify-between ">
        <div className="flex gap-8 items-center">
          {/* Profile Picture */}
          <AvatarImage imageUrl={user.image} />

          <div className="space-y-1">
            <h1 className="text-[26px] font-medium text-[#337AB3]">
              {name}
            </h1>
            <p className="text-[#337AB3] text-sm font-normal ">
              {role}
            </p>
            <p className="text-[#337AB3]  font-normal">{email}</p>
            {phone && (
              <p className="text-[#337AB3] font-normal">{phone}</p>
            )}
          </div>
        </div>
        {/* address / meta info */}
        <div className="text-right space-y-1">
          <p className="text-[#232323] font-normal">Role</p>
          <p className="text-[#337AB3] text-sm font-normal">{role}</p>
          <p className="text-[#232323] font-normal mt-3">Status</p>
          <p className="text-[#337AB3] text-sm font-normal">{status}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-medium text-[#000000]">About Me</h2>
        <p className="mt-4 font-normal leading-relaxed">
          This is your admin profile for the Market Jango dashboard. You can
          update your basic information from the <strong>Edit Profile</strong>{" "}
          tab.
        </p>
      </div>
    </>
  );
};

export default AboutMe;
