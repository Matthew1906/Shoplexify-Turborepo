
import { FaRegTimesCircle } from "react-icons/fa";

const BaseModal = (
    { show, onHideModal, className, children } : 
    { show:boolean, onHideModal: ()=>void, className:string, children: React.ReactNode }
) => {
  return (
    show &&
      <dialog
        className="flex items-center justify-center h-full overflow-y-auto w-full bg-transparent fixed top-0 left-0 z-50 "
        open={show}
      >
        <div
          className={`z-50 bg-white rounded-lg p-8 shadow-lg relative max-h-[calc(100vh-60px)] overflow-y-auto ${className} animate-[pop-up_0.1s_ease-in-out] scale-100`}
        >
          <FaRegTimesCircle
            className="absolute right-8 top-8 text-2xl cursor-pointer"
            onClick={onHideModal}
          />
          <div className="mt-10">
          {children}
          </div>
          
        </div>
      </dialog>
  );
};

export default BaseModal;