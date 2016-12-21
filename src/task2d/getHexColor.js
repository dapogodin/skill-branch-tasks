import hslToRgb from './hslToRgb';

export default function getHexColor(color) {
    console.log(`"${color}"`);
    let result = 'Invalid color';

    if (!color) {
        return result;
    }
    color = color.toLowerCase().trim();

    const mRgb = color.match(new RegExp('^rgb\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)', 'i'));
    const mHsl = color.match(new RegExp('^hsl\\s*\\(\\s*(\\d+)\\s*,(\\s*|%20)(\\d+)%\\s*,(\\s*|%20)(\\d+)%\\s*\\)', 'i'));
    const regHex = new RegExp('^#?[abcdef0-9]+$');

    // проверяем на ргб
    if (mRgb && mRgb.length > 3 && parseInt(mRgb[1], 10) <= 255 && parseInt(mRgb[2], 10) <= 255 && parseInt(mRgb[3], 10) <= 255) {
        result = '#';
        for (let i = 1; i < 4; i++) {
            let item = parseInt(mRgb[i], 10).toString(16);
            if (item.length < 2) item += item;
            result += item;
        }
    }

    // проверяем на хсл
    else if (mHsl && mHsl.length > 3 && parseInt(mHsl[3], 10) <= 100 && parseInt(mHsl[5], 10) <= 100) {
        const rgb = hslToRgb(parseInt(mHsl[1], 10) / 360, parseInt(mHsl[3], 10) / 100, parseInt(mHsl[5], 10) / 100);
        result = '#';
        for (let i = 0; i < 3; i++) {
            let item = rgb[i].toString(16);
            if (item.length < 2) item += item;
            result += item;
        }
    }

    // хекс
    if (regHex.test(color)) {
        color = color.replace('#', '');
        if (color.length === 3 || color.length === 6) {
            result = color.length === 3 ?
                `#${color.charAt(0)}${color.charAt(0)}${color.charAt(1)}${color.charAt(1)}${color.charAt(2)}${color.charAt(2)}` :
                `#${color}`;
        }
    }

    return result;
}