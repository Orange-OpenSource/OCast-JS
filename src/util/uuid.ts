//  Generate UUID (RFC 4122) in Typescript
export function uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        // tslint:disable-next-line:no-bitwise
        let random = Math.random() * 16 | 0;
        let value = char === "x" ? random : (random % 4 + 8);
        return value.toString(16);
    });
}
