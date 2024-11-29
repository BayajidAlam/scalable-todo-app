import { toast, Bounce } from "react-toastify";

const toastConfig = {
  position: "top-right" as const,
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light" as const,
  transition: Bounce,
};

export const showSuccessToast = (message: string) => {
  return toast.success(message, toastConfig);
};

export const showErrorToast = (message: string) => {
  return toast.error(message, toastConfig);
};