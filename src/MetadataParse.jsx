"use client"

import React, { useState } from 'react';
var jsmediatags = require('./jsmediatags.min.js')

const MetadataParse = () => {
    const [file, setFile] = useState(null);
    const [fileMetadata, setFileTags] = useState(null);
    const [fileMetadataError, setFileTagsError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    React.useEffect(() => {
        if(file){
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    setFileTags(tag?.tags);
                    id3TagParse(tag?.tags);
                    document.getElementById('image').src = URL.createObjectURL(new Blob([new Uint8Array(tag?.tags?.picture?.data)], { type: tag?.tags?.picture?.format }))
                },
                onError: function(error) {
                    setFileTagsError(error);
                    setFileTags(null);
                }
            });
        }
    }, [file])

    const id3TagParse = (object, indent = '') => {
	    let result = '';
	    for (const property in object) {
		    if (typeof object[property] === 'object' && object[property] !== null) {
		        if(object[property]?.data?.length > 500){
		            result += `${indent}${property}: ${object[property]}\n`;
		        } 
                else {
		            result += `${indent}${property}:\n`;
		            result += id3TagParse(object[property], indent + '     ');
		        }
		    } 
            else {
		        result += `${indent}${property}: ${object[property]}\n`;
		    }
	    }
	    return result;
	}

    return (
        <div>
            <input
                type="file"
                id="input"
                onChange={handleFileChange}
            />
            
            <h3 key={file?.name}>{file?.name}</h3>
            <img 
                id="image" 
                style={{
                    margin: "auto",
                    textAlign: "center",
                    border: "0",
                    display: fileMetadata ? "block" : "none",
                }}
                height="300px" 
                width="300px" 
            />


            <p>Tags</p>
            <p style={{"white-space":"pre-wrap"}}>{fileMetadata ? id3TagParse(fileMetadata) : "" }</p>
        </div>
    );
};
export default MetadataParse;
