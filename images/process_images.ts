import {CanvasRenderingContext2D} from "canvas";

const fs = require('fs');
const {createCanvas, loadImage} = require('canvas');


function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const paragraphs = text.split('\n');
    let lowestLineHeight = 0;

    for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                const tempLineHeight =  y + (lineHeight / 2);
                line = words[n] + ' ';
                y += lineHeight;
                if (tempLineHeight > lowestLineHeight) lowestLineHeight = tempLineHeight;
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, y);
        y += lineHeight;
        const tempLineHeight =  y + (lineHeight / 2);
        if (tempLineHeight > lowestLineHeight) lowestLineHeight = tempLineHeight;
    }

    return lowestLineHeight;
}

async function drawOverlayImages(ctx: CanvasRenderingContext2D, canvasWidth: number, userGenerated: boolean) {
    let scaleFactorRight = 0.21;
    let scaleFactorLeft = 0.2;
    let overlayLeftImagePath = `images/overlay/${userGenerated ? "prompt" : "output"}_left.png`;

    const overlayImageLeft = await loadImage(overlayLeftImagePath);

    const scaledWidthLeft = overlayImageLeft.width * scaleFactorLeft;
    const scaledHeightLeft = overlayImageLeft.height * scaleFactorLeft;

    ctx.drawImage(overlayImageLeft, 7, 24, scaledWidthLeft, scaledHeightLeft);

    if (!userGenerated) {
        let overlayRightImagePath =  `images/overlay/${userGenerated ? "prompt" : "output"}_right.png`;
        const overlayImageRight = await loadImage(overlayRightImagePath);
        const scaledWidthRight = overlayImageRight.width * scaleFactorRight;
        const scaledHeightRight = overlayImageRight.height * scaleFactorRight;
        ctx.drawImage(overlayImageRight, canvasWidth - scaledWidthRight, 24, scaledWidthRight, scaledHeightRight);
    }
}

async function createChatImage(text: string, filename: string, userGenerated: boolean): Promise<string> {
    let textColor = userGenerated ? 'rgb(236,236,241)' : 'rgb(209,213,219)';
    let bgColor = userGenerated ? 'rgb(52,53,65)' : 'rgb(68,70,84)';

    let leftPadding = 75;
    let rightPadding = userGenerated ? 20 : 80;
    let topPadding = 30;
    let lineHeight = 28
    const fontSize = 21;
    const fontFamily = 'sans-serif';
    const canvasWidth = 900;


    const canvas = createCanvas(canvasWidth, 1000);
    const ctx = canvas.getContext('2d');

    // const textHeight = measureTextHeight(ctx, text, canvasWidth - leftPadding - rightPadding, lineHeight, userGenerated) + topPadding + bottomPadding;

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lowestText = wrapText(ctx, text, leftPadding, fontSize + topPadding, canvasWidth - leftPadding - rightPadding, lineHeight);

    canvas.height = lowestText;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, lowestText);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    wrapText(ctx, text, leftPadding, fontSize + topPadding, canvasWidth - leftPadding - rightPadding, lineHeight);

    // Draw accents for the image
    await drawOverlayImages(ctx, canvasWidth, userGenerated);

    const outputPath = `./images/output/${filename}`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}


export {createChatImage}
