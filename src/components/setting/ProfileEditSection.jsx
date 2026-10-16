import ProfileEditForm from "./ProfileEditForm";
import AboutMe from "./AboutMe";
import ChangePasswordForm from "./ChangePasswordForm";
import { useState, useEffect } from "react";
import { getAuthUser } from "../../utils/authUser";

const ProfileEditSection = () => {
  const [tab, setTab] = useState("profile");
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
          onClick={() => setTab("about")}
          className="text-[#0059A0] font-medium  cursor-pointer flex flex-col"
        >
          <p className="px-2"> About me</p>
          <span
            className={`h-1 w-full ${
              tab === "about" && "bg-[#0059A0]"
            } rounded-tl-[10px] rounded-tr-[10px]`}
          ></span>
        </button>
        <button
          onClick={() => setTab("profile")}
          className="text-[#0059A0] font-medium  cursor-pointer flex flex-col"
        >
          <p className="px-2">Edit Profile</p>
          <span
            className={`h-1 w-full ${
              tab === "profile" && "bg-[#0059A0]"
            } rounded-tl-[10px] rounded-tr-[10px]`}
          ></span>
        </button>
        <button
          onClick={() => setTab("password")}
          className="text-[#0059A0] font-medium  cursor-pointer flex flex-col"
        >
          <p className="px-2">Change password</p>
          <span
            className={`h-1 w-full ${
              tab === "password" && "bg-[#0059A0]"
            } rounded-tl-[10px] rounded-tr-[10px]`}
          ></span>
        </button>
      </div>

      <div className="mt-8">
        {tab === "profile" && (
          <ProfileEditForm user={user} onUserUpdate={setUser} />
        )}
        {tab === "about" && <AboutMe user={user} />}
        {tab === "password" && <ChangePasswordForm />}
      </div>
    </div>
  );
};

export default ProfileEditSection;
