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
