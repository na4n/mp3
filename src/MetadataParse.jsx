import React, { useState } from 'react';
var jsmediatags = require('./jsmediatags.min.js')

/** 
 * Converts id3 object to string
 * @param {object} object - ID3 tags
 * @param {string} [ident=''] - Identation level of line/Depth of value in object
 * @returs {string} A formatted string representation to ID3 tags
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
/**
 * Calculates hex string of image's average color from RGB array
 * @param {int[]} - Array of integers representing RGB data of an image
 * @return {string} hex code of average color
 */
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
    return rgbToHex(r,g,b);
}

/**
 * A React component for parsing and displaying audio file metadata including ID3 tags
 * @component
 * @example
 * return (
 *   <MetadataParse />
 * )
 * 
 * @property {File} file - The audio file to parse
 * @property {Object} fileMetadataText - Parsed metadata from the audio file
 * @property {Error} fileMetadataError - Any errors encountered during parsing
 * @property {boolean} fileHasPicture - Whether the audio file contains album artwork
 * @property {HTMLAudioElement} audio - Audio element for playback
 * 
 * @fires MetadataParse#handleDrop - Handles file drop events
 * @fires MetadataParse#handleDragOver - Handles drag over events
 * @fires MetadataParse#handleFileChange - Handles file input changes
 * @fires MetadataParse#handleClick - Handles click events for play/pause
 * 
 * @returns {React.ReactElement} A component that displays audio metadata and allows playback
 */
const MetadataParse = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [fileMetadataText, setFileMetadataText] = useState(null);
    const [fileMetadataError, setFileMetadataError] = useState(null);
    const [fileHasPicture, setFileHasPicture] = useState(false);
    const [audio, setAudio] = useState(null);
    const [fileImage, setFileImage] = useState(null);

    React.useEffect(() => {
        if(file){
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    setFileHasPicture(tag?.tags?.picture?.data ? true : false);

                    setFileMetadataText(tag?.tags);
                    id3TagParse(tag?.tags);
                    
                    setFileImage(URL.createObjectURL(new Blob([new Uint8Array(tag?.tags?.picture?.data)], { type: tag?.tags?.picture?.format })));

                    if(tag?.tags?.picture?.data != null){
                        document.getElementById('app').style.backgroundColor = averageColor(tag?.tags?.picture?.data);
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
        setFileName(event?.dataTransfer?.files[0]?.name);
        event.preventDefault();
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setFileName(event.target.files[0]?.name);
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
                value={fileName}
                onChange={handleFileChange}
            />

            <img 
                id="image"
                src={fileImage}
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
