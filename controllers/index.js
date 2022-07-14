import sharp
    from 'sharp';
import {
    createCanvas,
    loadImage,
    registerFont,
} from 'canvas';

import {
    isValidHttpUrl,
    isURLValidAndExists,
    isValidImageURL
} from '../helper.js';

import fetch from 'node-fetch';

registerFont('fonts/Inter-ExtraLight.ttf', { family: 'Inter', weight: '200' })
registerFont('fonts/Inter-Light.ttf', { family: 'Inter', weight: '300' })
registerFont('fonts/Inter-Regular.ttf', { family: 'Inter', weight: '400' })
registerFont('fonts/Inter-Medium.ttf', { family: 'Inter', weight: '500' })
registerFont('fonts/Inter-SemiBold.ttf', { family: 'Inter', weight: '600' })
registerFont('fonts/Inter-Bold.ttf', { family: 'Inter', weight: '700' })
registerFont('fonts/Inter-ExtraBold.ttf', { family: 'Inter', weight: '800' })

export const create = async (req, res) => {
    const {
        text,
        bg,
        color = '#ffffff',
        uppercase,
        bgcolor,
        fontweight = '400',
        fontsize = '100',
        fontfamily = 'Inter',
        top = '315',
        left = '600',
    } = req.query || {};

    let fallbackfont;

    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    if (JSON.stringify(req.query) === JSON.stringify({})) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1200, 630);
        ctx.textAlign = 'center';
        ctx.font = `400 100px "Inter"`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText("No parameters provided", 600, 351);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        return res.end(canvas.toBuffer('image/png'));
    }

    if (!text) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1200, 630);
        ctx.textAlign = 'center';
        ctx.font = `400 100px "Inter"`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText("Text not found", 600, 351);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        return res.end(canvas.toBuffer('image/png'));
    }

    let tempBG;

    if (bg) {
        if (!(await isURLValidAndExists(bg)) || !(await isValidImageURL(bg))) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 1200, 630);
            ctx.textAlign = 'center';
            ctx.font = `400 100px "Inter"`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText("In valid background URL", 600, 351);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            return res.end(canvas.toBuffer('image/png'));
        } else {
            if (!isValidHttpUrl(bg)) {
                let buffer = Buffer.from(bg.replace(/^data:image\/\w+;base64,/, ""), "base64");
                tempBG = await new Promise((resolve, reject) => {
                    sharp(buffer)
                        .resize(1200, 630, { fit: 'cover' })
                        .toBuffer()
                        .then(async (data) => {
                            resolve(data);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
            } else {
                let response = await fetch(bg)
                let buffer = Buffer.from(await response.arrayBuffer())
                tempBG = await new Promise((resolve, reject) => {
                    sharp(buffer)
                        .resize(1200, 630, { fit: 'cover' })
                        .toBuffer()
                        .then(async (data) => {
                            resolve(data);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
            }
        }
    }


    // Draw cat with lime helmet
    loadImage(
        tempBG || bg || 'https://res.cloudinary.com/katyperrycbt/image/upload/v1657618979/uttlxy8zgp9zyyiwtbu4.png'
    ).then((image) => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // if no bg provided and bgcolor is provided, then fill background with bgcolor
        if (bgcolor && !bg) {
            ctx.fillStyle = bgcolor;
            ctx.fillRect(0, 0, 1200, 630);
        }

        if (!bgcolor) {
            // resize image first
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = color;
        ctx.textAlign = 'center';

        ctx.font = `${fontweight} ${fontsize}px "${fallbackfont || fontfamily}"`;
        // if text is wider 700px, then break it into multiple lines
        const words = text?.split(' ')?.map(i => uppercase ? i.toUpperCase() : i);

        let lines = [];

        lines[0] = words[0];

        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = ctx.measureText(lines[lines.length - 1] + ' ' + word).width;
            if (width > 700) {
                lines.push(word);
            } else {
                lines[lines.length - 1] += ' ' + word;
            }
        }

        let current = {
            x: Number(left),
            // center text vertically depending on number of lines
            y: (Number(top) + Number(fontsize) * 0.876 - ((lines.length) * Number(fontsize)) / 2)
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let width = ctx.measureText(line).width;
            let currentX = current.x;
            let currentY = current.y;

            if (current.x + width + 10 > 700) {
                current.x = Number(left);
                current.y = currentY + Number(fontsize);
            } else {
                current.x = currentX + width + 10;
            }
            ctx.fillText(line, currentX, currentY);
        }

        res.writeHead(200, {
            "Content-Type": "image/png",
        });

        res.end(canvas.toBuffer('image/png'));
    })
}