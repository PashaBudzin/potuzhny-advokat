type FieldType = "string";
type Template = {
    name: string;
    templateUrl: string;
    fields?: {
        name: string;
        title: string;
        type: FieldType;
    }[];
};

const templates = {
    dogovirR: {
        name: "Договір Розлучення",
        templateUrl: "/договір_розлучення.docx",
    },
    dogovirF: {
        name: "Договір ФОП",
        templateUrl: "/договір_ФОП.docx",
    },
    bezUchastiP: {
        name: "Заява без участі позивача",
        templateUrl: "/заява_без_участі_позивача.docx",
    },
    bezUchastiV: {
        name: "Заява без участі відповідача",
        templateUrl: "/заява_без_участі_відповідача.docx",
    },
    vydachaRishennya: {
        name: "Заява про видачу рішення",
        templateUrl: "/заява_про_видачу_копії_рішення.docx",
    },
    sudovyiNakaz: {
        name: "Заява про видачу судового наказу",
        templateUrl: "/заява_про_видачу_судового_наказу.docx",
    },
} as Record<string, Template>;

async function fetchTemplateArrayBuffer(url: string) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }

    console.log("Response ok:", res.ok);
    console.log("Content type:", res.headers.get("content-type"));

    return await res.arrayBuffer();
}

export { templates, type Template, fetchTemplateArrayBuffer };
