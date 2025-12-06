import Spinner from "@/components/spinner";
import React from "react";

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
  );
};

export default Loading;
