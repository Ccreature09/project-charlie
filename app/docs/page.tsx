import { Navbar } from "@/components/functional/navbar";
import React from "react";

export default function Page() {
  const backgroundImageStyle = {
    backgroundImage:
      "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
    backgroundSize: "cover",
    width: "100%",
  };
  return (
    <>
      <div style={backgroundImageStyle} className="h-screen flex-row">
        <Navbar />
        <div className="flex bg-[#121212] text-white min-h-screen">
          {/* Left Sidebar */}
          <div className="bg-gray-800 w-1/6 p-6">
            <h2 className="text-2xl font-semibold mb-4">Statements</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="#if-statement"
                  className="text-blue-500 hover:underline"
                >
                  If Statement
                </a>
              </li>

              {/* Add more categories and subcategories as needed */}
            </ul>
            <h2 className="text-2xl font-semibold mb-4 mt-4">Loops</h2>
            <ul className="space-y-2">
              <li>
                <a href="#while-loop" className="text-blue-500 hover:underline">
                  While Loop
                </a>
              </li>
              <li>
                <a href="#for-loop" className="text-blue-500 hover:underline">
                  For Loop
                </a>
              </li>
              {/* Add more categories and subcategories as needed */}
            </ul>
          </div>

          {/* Main Content */}
          <div className="w-3/4 bg-[#121212] p-8">
            <h1 className="text-white font-bold text-5xl mb-6">
              Documentation
            </h1>
            <hr className="border-t border-gray-600 my-6" />

            {/* If Statement Section */}
            <section id="if-statement" className="py-8">
              <h2 className="text-3xl font-semibold mb-4">If Statement</h2>
              <p className="text-lg leading-7">
                The <code className="bg-gray-800 p-1 rounded">if</code>{" "}
                statement is used to make decisions in your code. It evaluates a
                condition and executes a block of code if the condition is true.
              </p>
            </section>

            {/* While Loop Section */}
            <section id="while-loop" className="py-8">
              <h2 className="text-3xl font-semibold mb-4">While Loop</h2>
              <p className="text-lg leading-7">
                The <code className="bg-gray-800 p-1 rounded">while</code> loop
                repeatedly executes a block of code as long as the specified
                condition is true.
              </p>
              <pre className="bg-gray-800 p-4 rounded mt-4">
                {`while (condition) {
  // code to be executed
}`}
              </pre>
            </section>

            {/* For Loop Section */}
            <section id="for-loop" className="py-8">
              <h2 className="text-3xl font-semibold mb-4">For Loop</h2>
              <p className="text-lg leading-7">
                The <code className="bg-gray-800 p-1 rounded">for</code> loop is
                used to repeatedly execute a block of code a specific number of
                times.
              </p>
              <pre className="bg-gray-800 p-4 rounded mt-4">
                {`for (initialization; condition; iteration) {
  // code to be executed
}`}
              </pre>
            </section>

            {/* Add more sections for other topics */}
          </div>
        </div>
      </div>
    </>
  );
}
