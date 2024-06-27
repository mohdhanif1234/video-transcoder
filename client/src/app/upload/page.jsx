"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { BASE_URL } from "@/constants"
// import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'

const UploadForm = () => {
    //   const {data} = useSession();

    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [author, setAuthor] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0)
    const router = useRouter()

    const handleFileChange = async (e) => {
        console.log(e.target.files)
        // setSelectedFile(e.target.files[0]);
        if (!title || !author) {
            alert('Title and Author are required fields.');
            return;
        }

        try {
            // initializing multi part upload
            const formData = new FormData();
            formData.append('filename', e.target.files[0].name);
            const initializeRes = await axios.post(`${BASE_URL}/api/v1/initializeMultiPartUpload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            );
            const { uploadId } = initializeRes.data;
            console.log('Upload id is ', uploadId);

            // individual chunks upload

            const chunkSize = 10 * 1024 * 1024; // 10 MB chunks
            const totalChunks = Math.ceil(e.target.files[0].size / chunkSize);

            console.log('chunksize', chunkSize);
            console.log('totalchunks', totalChunks)

            let start = 0;
            const uploadPromises = [];

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {

                const chunk = e.target.files[0].slice(start, start + chunkSize);
                start += chunkSize;
                const chunkFormData = new FormData();
                chunkFormData.append('filename', e.target.files[0].name);
                chunkFormData.append('chunk', chunk);
                chunkFormData.append('totalChunks', totalChunks);
                chunkFormData.append('chunkIndex', chunkIndex);
                chunkFormData.append('uploadId', uploadId);

                const uploadPromise = axios.post(`${BASE_URL}/api/v1/uploadChunk`, chunkFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                uploadPromises.push(uploadPromise);
            }

            await Promise.all(uploadPromises);

            // complete video upload to S3

            const completeRes = await axios.post(`${BASE_URL}/api/v1/completeUpload`, {
                filename: e.target.files[0].name,
                totalChunks,
                uploadId,
                title,
                description,
                author
            });

            console.log('Complete response data', completeRes.data);

            if (completeRes.status === 200) {
                alert(completeRes.data.message);
                router.push('/');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };


    const handleFileUpload = async () => {

        if (!title || !author) {
            alert('Title and Author are required fields.');
        }

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const fileUploadResponse = await axios.post(`${BASE_URL}/api/v1/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (data) => {
                    console.log(data.loaded, data.total)
                    setUploadProgress(Math.round((data.loaded / data.total) * 100))
                }

            }
            )

            console.log(fileUploadResponse)
        } catch (error) {

        }

        // try {
        //   ////////////////////////////////////////////////////
        //   const formData = new FormData();
        //   formData.append('filename', selectedFile.name);
        //   const initializeRes = await axios.post('http://localhost:8080/upload/initialize', formData, {
        //     headers: {
        //       'Content-Type': 'multipart/form-data'
        //     }
        //   }
        //   );
        //   const { uploadId } = initializeRes.data;
        //   console.log('Upload id is ', uploadId);

        //   ////////////////////////////////////////////////////

        //   const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
        //   const totalChunks = Math.ceil(selectedFile.size / chunkSize);

        //   let start = 0;
        //   const uploadPromises = [];

        //   for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {

        //     const chunk = selectedFile.slice(start, start + chunkSize);
        //     start += chunkSize;
        //     const chunkFormData = new FormData();
        //     chunkFormData.append('filename', selectedFile.name);
        //     chunkFormData.append('chunk', chunk);
        //     chunkFormData.append('totalChunks', totalChunks);
        //     chunkFormData.append('chunkIndex', chunkIndex);
        //     chunkFormData.append('uploadId', uploadId);

        //     const uploadPromise = axios.post('http://localhost:8080/upload', chunkFormData, {
        //       headers: {
        //         'Content-Type': 'multipart/form-data'
        //       }
        //     });
        //     uploadPromises.push(uploadPromise);
        //   }

        //   await Promise.all(uploadPromises);

        //   ////////////////////////////////////////////////////


        //   const completeRes = await axios.post('http://localhost:8080/upload/complete', {
        //     filename: selectedFile.name,
        //     totalChunks: totalChunks,
        //     uploadId: uploadId,
        //     title: title,
        //     description: description,
        //     author: author
        //   });

        //   console.log(completeRes.data);
        // } catch (error) {
        //   console.error('Error uploading file:', error);
        // }
    };

    return (

        <div className='container mx-auto max-w-lg p-10'>
            <form encType="multipart/form-data">
                <div className="mb-4">
                    <input type="text"
                        name="title"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div className="mb-4">
                    <input type="text"
                        name="description"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div className="mb-4">
                    <input type="text"
                        name="author"
                        placeholder="Author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div className="mb-4">
                    <input type="file"
                        name="file"
                        onChange={handleFileChange}
                        className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500" />
                </div>

                {/* <button
                    type="button"
                    onClick={handleFileUpload}
                    id='btnUpload'
                    className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Upload
                </button> */}

                {
                    uploadProgress !== 0 &&
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%` }}> {uploadProgress}</div>
                    </div>
                }
            </form>
        </div>
    );
};


export default UploadForm;