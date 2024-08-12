"use client";
import { useCSVReader } from "react-papaparse";

const CsvReader = ({ handleUploadAccepted }) => {
  const { CSVReader } = useCSVReader();

  return (
    <div>
      <CSVReader onUploadAccepted={handleUploadAccepted}>
        {({ getRootProps, ProgressBar }) => (
          <>
            <div className="my-5 flex flex-wrap gap-7">
              <button
                className=" rounded-md px-5 py-2 bg-slate-900 text-white font-semibold"
                type="button"
                {...getRootProps()}
              >
                Browse file
              </button>
            </div>
            <ProgressBar />
          </>
        )}
      </CSVReader>
    </div>
  );
};

export default CsvReader;
