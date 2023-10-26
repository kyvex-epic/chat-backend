/**
 * @name ProfileGenerator
 * @description Generate a profile picture for a user using DiceBear Avatars
 * @module utilities/profileGenerator
 * @requires {@link https://www.dicebear.com/}
 */

require('dotenv').config();
const apiUrl = `${process.env.DICEBEAR_API_URL}:${process.env.DICEBEAR_API_PORT}`;

/**
 * @name generateProfileImg
 * @desc Generates a profile image for a user using DiceBear Avatars
 * @param {String} seed For example, a username or guild name
 * @param {String} style See https://www.dicebear.com/styles/
 * @return {Blob} A Blob object representing the image
 */

async function generateProfileImg(seed, style="bottts-neutral") {

    const reqUrl = `${apiUrl}/7.x/${style}/png`
                    + `?seed=${seed}`
                    + `&radius=10&backgroundType=gradientLinear`
                    + `&backgroundRotation=0,360,-360,-330,-300,-270,-240,-210,-180,-150,-120,-90,-60,-30,30,60,90,120,150,180,210,240,270,300,330`

    const res = await fetch(reqUrl);
    return await res.blob();
}


module.exports = { generateProfileImg }