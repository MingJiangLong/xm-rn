type Options =

    | {
        withPrefix: true;
        imageType: "jpeg" | "png";
    }

    | {
        withPrefix?: false;
        imageType?: "jpeg" | "png";
    };

export default function toStandardDataUrl(
    input: unknown,
    options: Options
): string {
    
    const str = String(input ?? "");
    let cleanStr = str.replace(/[\r\n\s]/g, '');

    if (cleanStr.startsWith("data:")) {
        const parts = cleanStr.split(',');
        if (parts.length > 1) {
            cleanStr = parts[1]; 
        }
    }

    if (options.withPrefix) {
        return `data:image/${options.imageType};base64,${cleanStr}`;
    }

    return cleanStr;
}