import React, { useRef, useState } from 'react';
const AvatarImage = () => {
    const [image, setImage] = useState("https://i.ibb.co.com/p66Z5YMH/pexels-christina-morillo-1181690-1.png");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };
  return (
    <div className="relative w-32 h-32">
      <div className="w-32 h-32 rounded-full overflow-hidden">
        <img
          src={image || 'path_to_your_image.jpg'}
          alt="Profile"
          className="w-full h-full object-cover bg-green-400"
        />
      </div>

      {/* Edit Button */}
      <div
        className="absolute z-10 bottom-1 right-1 bg-[#FF8C00] rounded-full p-2 cursor-pointer shadow"
        onClick={handleEditClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 512 512"
          fill="#fff"
        >
          <g>
            <path d="M504.262,66.75L445.226,7.706c-10.291-10.284-26.938-10.267-37.222,0l-38.278,38.278l96.282,96.266 
              l38.254-38.295C514.537,93.672,514.554,77.017,504.262,66.75z" />
            <path d="M32.815,382.921L0.025,512l129.055-32.83l319.398-319.431l-96.249-96.265L32.815,382.921z 
              M93.179,404.792l-21.871-21.871l278.289-278.289l21.887,21.887L93.179,404.792z" />
          </g>
        </svg>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  )
}

export default AvatarImage
