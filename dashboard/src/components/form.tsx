import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

export const Form = ({ phoneNumber, reloadData }: any) => {
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // Send SMS function
  const sendSms = async () => {
    if (!message) {
      enqueueSnackbar({
        message: "Please enter a messaage",
        variant: "error",
      });

      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/rate", {
        phoneNumber,
        message,
      });

      enqueueSnackbar({
        message: "Message sent successfully",
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar({
        message: error?.message ?? "bad request",
        variant: "error",
      });
    } finally {
      reloadData();
      setMessage("");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md p-0 ">
      <div className="text-center mb-16">
        <h3 className="text-3xl sm:text-4xl leading-normal font-extrabold tracking-tight text-gray-900">
          Send Message
        </h3>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Your Message
          </label>
          <textarea
            rows={10}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex justify-between w-full px-3">
          <div className="md:flex md:items-center"></div>
          <button
            className="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded"
            onClick={sendSms}
            disabled={loading}
          >
            {loading ? "Loading..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
};
