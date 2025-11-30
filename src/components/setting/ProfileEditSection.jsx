import ProfileEditForm from "./ProfileEditForm";
import AboutMe from "./AboutMe";
import { useState, useEffect } from "react";
import { getAuthUser } from "../../utils/authUser"; // 👈 path গুরুত্বপূর্ণ

const ProfileEditSection = () => {
  const [isEdit, setIsEdit] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getAuthUser();
    setUser(u);
  }, []);

  return (
    <div className="bg-[#FFFFFF] rounded-[25px]  p-7">
      {/* header  */}
      <div className="flex gap-4 border-b border-[#F4F5F7]">
        <button
          onClick={() => setIsEdit(false)}
          className="text-[#0059A0] font-medium  cursor-pointer flex flex-col"
        >
          <p className="px-2"> About me</p>
          <span
            className={`h-1 w-full ${
              !isEdit && "bg-[#0059A0]"
            } rounded-tl-[10px] rounded-tr-[10px]`}
          ></span>
        </button>
        <button
          onClick={() => setIsEdit(true)}
          className="text-[#0059A0] font-medium  cursor-pointer flex flex-col"
        >
          <p className="px-2">Edit Profile</p>
          <span
            className={`h-1 w-full ${
              isEdit && "bg-[#0059A0]"
            } rounded-tl-[10px] rounded-tr-[10px]`}
          ></span>
        </button>
      </div>

      <div className="mt-8">
        {isEdit ? (
          <ProfileEditForm user={user} onUserUpdate={setUser} />
        ) : (
          <AboutMe user={user} />
        )}
      </div>
    </div>
  );
};

export default ProfileEditSection;
