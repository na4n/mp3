import React, { useState } from 'react';
var jsmediatags = require('./jsmediatags.min.js')


/*
    Needs refactoring, recursive JSON object --> JSX representation (core tags vs other tags)
*/
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

const MetadataParse = () => {
    const [file, setFile] = useState(null);
    const [fileMetadataText, setFileMetadataText] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    React.useEffect(() => {
        if(file){
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    setFileMetadataText(tag?.tags);
                    id3TagParse(tag?.tags);
                    
                    document.getElementById('image').src = URL.createObjectURL(new Blob([new Uint8Array(tag?.tags?.picture?.data)], { type: tag?.tags?.picture?.format }))
                   
                    if(tag?.tags?.picture?.data != null){
                        document.getElementById('image').height = 300;
                        document.getElementById('image').width = 300;
                    }
                    else{
                        document.getElementById('image').height = 0;
                        document.getElementById('image').width = 0;
                    }
                },
                onError: function(error) {
                    setFileMetadataText(error);
                    document.getElementById('image').height = 0;
                    document.getElementById('image').width = 0;
            }
            });
        }
    }, [file])

    const handleDrop = (event) => {
        setFile(event?.dataTransfer?.files[0]);
        event.preventDefault();
    }

    const handleDragOver = (event) => {
        console.log('in Drop Zone')
        event.preventDefault();
    }

    return (
        <div 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            style={{marginBottom:"50px",marginLeft:"auto",marginRight:"auto",textAlign:"center", minHeight:"100vh"}}
        >
        
            <input
                type="file"
                id="input"
                onChange={handleFileChange}
            />
            
            {/* <h3 key={file?.name}>{file?.name}</h3> */}
            <img 
                id="image" 
                style={{
                    margin: "auto",
                    textAlign: "center",
                    border: "0",
                    display: fileMetadataText ? "block" : "none",
                }}
                height="300px" 
                width="300px" 
            />

            <p style={{whiteSpace:"pre-wrap",textAlign:"start"}}>{fileMetadataText ? id3TagParse(fileMetadataText) : "" }</p>
        </div>
    );
};
export default MetadataParse;
