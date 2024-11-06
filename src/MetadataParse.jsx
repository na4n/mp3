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

const averageColor = (data) => {
    var r = 0;
    var g = 0;
    var b = 0;

    for (var i = 0, l = data.length; i < l; i += 3) {
        r += data[i];
        g += data[i+1];
        b += data[i+2];
    }

    r = Math.floor(r / (data.length / 4));
    g = Math.floor(g / (data.length / 4));
    b = Math.floor(b / (data.length / 4));
    function rgbToHex(r, g, b) {
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
    }
    document.getElementById('app').style.backgroundColor = rgbToHex(r,g,b);
}

const MetadataParse = () => {
    const [file, setFile] = useState(null);
    const [fileMetadataText, setFileMetadataText] = useState(null);
    const [fileMetadataError, setFileMetadataError] = useState(null);
    const [fileHasPicture, setFileHasPicture] = useState(false);
    const [audio, setAudio] = useState(null);


    React.useEffect(() => {
        if(file){
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    setFileHasPicture(tag?.tags?.picture?.data ? true : false);

                    setFileMetadataText(tag?.tags);
                    id3TagParse(tag?.tags);
                    
                    document.getElementById('image').src = URL.createObjectURL(new Blob([new Uint8Array(tag?.tags?.picture?.data)], { type: tag?.tags?.picture?.format }))

                    if(tag?.tags?.picture?.data != null){
                        averageColor(tag?.tags?.picture?.data);
                    }
                },
                onError: function(error) {
                    setFileMetadataError(error);
                }
            });
            const audioElement = new Audio(URL.createObjectURL(file));
            setAudio(audioElement);            
        }
    }, [file])

    const handleDrop = (event) => {
        setFile(event?.dataTransfer?.files[0]);
        event.preventDefault();
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };


    const handleClick = () => {
        if(!audio){
            return;
        }

        if(audio.paused){
            audio.play()
                .then(() => {
                    console.log('Audio played fine');
                })
                .catch((error) => {
                    console.error('Error playing audio');
                });
        }
        else if(!audio.paused){
            audio.pause();
        }
    }

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            onClick={handleClick}
            style={{
                marginLeft:"auto",
                marginRight:"auto",
                textAlign:"center", 
                minHeight:"100vh"
            }}
        >
        
            <input
                type="file"
                id="input"
                onChange={handleFileChange}
            />

            <img 
                id="image" 
                style={{
                    display: "block",
                    margin: "auto",
                    textAlign: "center",
                    border: "0",
                    boxShadow: "0 0 10px black",
                    borderRadius: "2%",
                    marginTop: "5%",
                    transition: "height 0.3s ease",
                    transition: "width 0.3s ease",
                }}
                height={fileHasPicture ? "300px" : "0px"}
                width={fileHasPicture ? "300px" : "0px"}
            />

            <p 
                id="title"
                style={{
                    fontFamily:"sans-serif",
                    fontWeight:"bold",
                    fontSize:"18px",
                    paddingBottom: "0"
                }}
            >
                {fileMetadataText?.title}
            </p>
            <p 
                id="artist"
                style={{
                    fontFamily:"sans-serif",
                    fontSize:"16px"
                }}
            >
                {fileMetadataText?.artist}
            </p>

            <p style={{
                whiteSpace: "pre-wrap",
                textAlign: "start",
                opacity: isHovered ? "1" : "0",
                transition: "opacity 0.3s ease"  // for smooth transition
            }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {fileMetadataText ? id3TagParse(fileMetadataText) : ""}
            </p>
        </div>
    );
};
export default MetadataParse;
