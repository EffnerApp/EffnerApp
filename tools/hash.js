import crypto from 'crypto';

export function sha512(data) {
    return crypto.createHash('sha512').update(data, 'utf-8').digest('hex');
}
