"use client";
import React from "react";
import Link from "next/link";

const Error = () => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center font-montserrat">
      <p>We&apos;ve encountered a problem</p>
      <Link
        href="/dashboard"
        className="flex px-4 py-2 bg-slate-300 rounded-lg mt-3"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Error;
