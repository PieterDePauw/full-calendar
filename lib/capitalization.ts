export function getFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase()
}

export function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1)
}
