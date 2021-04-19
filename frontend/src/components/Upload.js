import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from "react-dropzone-uploader";

// fetchUpload: refetch list of image
const Upload = ({ fetchUploads }) => {

  // specify upload params and url for your files  
  const getUploadParams = ({ file }) => {
    const body = new FormData();
    body.append("image", file);
    return {
      url: "http://localhost:8000/api/uploads",
      body,
    };
  };

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    allFiles.forEach((f) => f.remove());
    fetchUploads();
  };

  return (
    <Dropzone
      getUploadParams={getUploadParams}
      onSubmit={handleSubmit}
      accept="image/*"
      maxFiles={1}
      multiple={false}
      styles={{
        dropzone: { minHeight: 200, maxHeight: 250 },
      }}
    />
  );
};

export default Upload;
