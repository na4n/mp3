"use client"

import React, { useState } from 'react';
var jsmediatags = require("jsmediatags");

const MetadataParse = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(file?.text());
  };

  React.useEffect(() => {
    if(file){
      console.log(jsmediatags.read(file));
    }
  }, [file])

  return (
    <>
      <input
        type="file"
        id="input"
        onChange={handleFileChange}
      />

      <p key={file?.name}>{file?.name}</p>
    </>
  );
};

export default MetadataParse;
