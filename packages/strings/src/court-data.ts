export type CourtData = {
    caseNumber: string;
    courtName: string;
    judgeName: string;
    plaintiffName: string;
    plaintiffCode: string;
    plaintiffAddress: string;
    defendantName: string;
    defendantCode: string;
    defendantAddress: string;
};

function extractMeta(text: string, name: string): string {
    return text.split(`<META NAME="${name}" CONTENT="`)[1]?.split('"')[0] ?? "";
}

export function extractCourtData(text: string): CourtData {
    return {
        caseNumber: extractMeta(text, "CAUSENUM"),
        courtName: extractMeta(text, "COURTNAME"),
        judgeName: extractMeta(text, "JUDGENAME1"),
        plaintiffName: extractMeta(text, "MEMBNAME1"),
        plaintiffCode: extractMeta(text, "MEMBOKPO1"),
        plaintiffAddress: extractMeta(text, "MEMBPOSTADDRESS1"),
        defendantName: extractMeta(text, "MEMBNAME2"),
        defendantCode: extractMeta(text, "MEMBOKPO2"),
        defendantAddress: extractMeta(text, "MEMBPOSTADDRESS2"),
    };
}
