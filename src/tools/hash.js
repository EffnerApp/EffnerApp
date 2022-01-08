import sha512 from 'crypto-js/sha512';

export function hash(data) {
    return sha512(data);
}
