'use client'
import { useState } from "react";
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function Home() {

  console.log(process.env.NEXT_PUBLIC_AWS_S3_URL)

  const [userStream, setUserStream] = useState();

  const streamUser = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
      })
      setUserStream(stream);
  }

  return (
    <>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">

          <div className="text-white text-lg font-semibold">Video Transcoder App</div>


          <div className="flex-1 mx-4">
            <input type="text" placeholder="Search..." className="w-1/3 px-4 py-2 rounded-lg bg-gray-700 text-white outline-none" />
          </div>


          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">
            Upload
          </button>


          <div className="flex items-center">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-2">
              Sign In
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center">

        <div>
          <ReactPlayer url={process.env.NEXT_PUBLIC_AWS_S3_URL}
            width="1080px"
            height="720px"
            controls={true}
          />
        </div>

        <div className="pt-2">
          <ReactPlayer url='https://www.youtube.com/watch?v=3ozvWStqXao&list=PLA3GkZPtsafYd5m2BXmkL9pjsBKy0FQ2X&index=8'
            width="1080px"
            height="720px"
            controls={true}
          />
        </div>

        <button type="button"
          onClick={streamUser}
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10">Stream</button>
        <div className='m-10'>
          <ReactPlayer
            width="1080px"
            height="720px"
            url={userStream}
            controls={true}
          />
        </div>

      </div>
    </>
  );
}
