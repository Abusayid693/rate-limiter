import { enqueueSnackbar } from "notistack";
import { useState } from "react";

export const Login = ({ setPhoneNumber }: any) => {
  const [mobile, setMobile] = useState("");

  const handleSubmit = () => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    // Check if the phone number matches the regex
    if (!phoneRegex.test(mobile)) {
      enqueueSnackbar({
        message: "Invalid phone numeber",
        variant: "error",
      });
      return;
    }

    setPhoneNumber(mobile);
  };

  return (
    <div>
      <body className="bg-gray-200 h-[100vh] font-sans text-gray-700">
        <div className="container mx-auto p-8 flex">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-4xl text-center mb-12 font-thin">Company</h1>

            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    name="email"
                    className="block w-full p-3 rounded bg-gray-200 border border-transparent focus:outline-none"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full p-3 mt-4 bg-indigo-600 text-white rounded shadow"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
};
