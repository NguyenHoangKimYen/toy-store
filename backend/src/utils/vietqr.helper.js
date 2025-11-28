function formatTag(id, value) {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

function generateVietQR({ bankBin, accountNumber, amount, content }) {
    const payloadFormat = formatTag('00', '01');
    const initMethod = formatTag('01', '11');

    const merchantInfo = formatTag(
        '38',
        formatTag('00', 'QRIBFTTA') +
            formatTag('01', bankBin) +
            formatTag('02', accountNumber),
    );

    const transAmount = formatTag('54', amount.toString());
    const nationCode = formatTag('58', 'VN');
    const addInfo = formatTag('62', formatTag('08', content));

    let qrString =
        payloadFormat +
        initMethod +
        merchantInfo +
        transAmount +
        nationCode +
        addInfo +
        '6304'; // Placeholder CRC

    const crcValue = crc16XModem(qrString)
        .toString(16)
        .toUpperCase()
        .padStart(4, '0');

    return qrString + crcValue;
}

function crc16XModem(input) {
    let crc = 0xffff;
    for (let i = 0; i < input.length; i++) {
        crc ^= input.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xffff;
        }
    }
    return crc & 0xffff;
}

module.exports = { generateVietQR };
