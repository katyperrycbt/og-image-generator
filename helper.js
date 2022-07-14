import fetch from 'node-fetch';

export const isValidHttpUrl = (string) => {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
};


export const isURLValidAndExists = async (url) => {
    // check if url is valid
    const valid = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(url);
    if (!valid) {
        return false;
    }

    const response = await fetch(url);
    return response.ok;
}

export  const isValidImageURL = async (url) => {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    return contentType.includes("image");
}
