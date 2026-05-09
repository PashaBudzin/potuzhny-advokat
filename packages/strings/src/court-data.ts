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
    return text.split(`<meta name="${name}" content="`)[1]?.split('"')[0] ?? "";
}

export function extractCourtData(text: string): CourtData {
    return {
        caseNumber: text.split('name="CAUSENUM" content="')[1]?.split('">')[0] ?? "",
        courtName: text.split('"COURTNAME" content="')[1]?.split('">')[0] ?? "",
        judgeName: text.split('"JUDGENAME1" content="')[1]?.split('">')[0] ?? "",
        plaintiffName: extractMeta(text, "MEMBNAME1"),
        plaintiffCode: extractMeta(text, "MEMBOKPO1"),
        plaintiffAddress: extractMeta(text, "MEMBPOSTADDRESS1"),
        defendantName: extractMeta(text, "MEMBNAME2"),
        defendantCode: extractMeta(text, "MEMBOKPO2"),
        defendantAddress: extractMeta(text, "MEMBPOSTADDRESS2"),
    };
}
