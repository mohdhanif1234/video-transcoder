'use client'
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router=useRouter();
  return (
    <>
       <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">

          <div className="text-white text-lg font-semibold">Video Transcoder App</div>


          <div className="flex-1 mx-4">
            <input type="text" placeholder="Search..." className="w-1/3 px-4 py-2 rounded-lg bg-gray-700 text-white outline-none" />
          </div>


          <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
          onClick={()=>router.push('/upload')}
          >
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

    </>
  )
}

export default Navbar
