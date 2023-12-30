// This is a module file solely used for exporting functions that are too messy too be in actual code.

export function makeUsernameSafe(username: string) : string {
    return username.replace(" ", "_").toLowerCase();
}