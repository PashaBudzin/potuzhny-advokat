import { describe, expect, it } from "bun:test";

import { findCourt, getCourtEmail } from "./courts";

function courtId(input: string | null): string | null {
    return findCourt(input)?.publisherId ?? null;
}

describe("findCourt", () => {
    it("returns null for empty input", () => {
        expect(findCourt(null)).toBeNull();
        expect(findCourt("")).toBeNull();
    });

    it("returns null for an unknown court", () => {
        expect(findCourt("Невідомий районний суд")).toBeNull();
    });

    it("resolves an exact unique name", () => {
        expect(courtId("Барський районний суд")).toBe("2894792");
    });

    it("resolves an exact genitive name", () => {
        expect(courtId("Барського районного суду")).toBe("2894792");
    });

    it("resolves a genitive name with a region qualifier", () => {
        expect(courtId("Тростянецького районного суду Сумської області")).toBe("2886491");
    });

    it("resolves names regardless of case and repeated whitespace", () => {
        expect(courtId("  ТРОСТЯНЕЦЬКИЙ   РАЙОННИЙ СУД   СУМСЬКОЇ   ОБЛАСТІ ")).toBe("2886491");
    });
});

describe("ambiguous court names", () => {
    const ambiguous = [
        "Тростянецький районний суд",
        "Ямпільський районний суд",
        "Миколаївський районний суд",
        "Городоцький районний суд",
        "Долинський районний суд",
        "Олександрівський районний суд",
        "Семенівський районний суд",
        "Чернівецький районний суд",
        "Заводський районний суд",
        "Шевченківський районний суд",
        "Дніпровський районний суд",
        "Покровський районний суд",
        "Галицький районний суд",
    ];

    for (const input of ambiguous) {
        it(`returns null for "${input}"`, () => {
            expect(findCourt(input)).toBeNull();
        });
    }
});

describe("region qualifiers", () => {
    const cases: Array<[string, string]> = [
        ["Тростянецький районний суд Сумської області", "2886491"],
        ["Тростянецький районний суд Вінницької області", "2895024"],
        ["Ямпільський районний суд Сумської області", "2886522"],
        ["Ямпільський районний суд Вінницької області", "2895082"],
        ["Миколаївський районний суд Львівської області", "37456868"],
        ["Миколаївський районний суд Миколаївської області", "2892617"],
        ["Миколаївський районний суд Одеської області", "2897833"],
        ["Городоцький районний суд Львівської області", "2897394"],
        ["Городоцький районний суд Хмельницької області", "2886976"],
        ["Долинський районний суд Івано-Франківської області", "2891552"],
        ["Долинський районний суд Кіровоградської області", "2896874"],
        ["Олександрівський районний суд Донецької області", "2895805"],
        ["Олександрівський районний суд Кіровоградської області", "5403464"],
        ["Семенівський районний суд Полтавської області", "2886143"],
        ["Семенівський районний суд Чернігівської області", "2894421"],
        ["Чернівецький районний суд Вінницької області", "14276728"],
        ["Чернівецький районний суд Чернівецької області", "2885592"],
        ["Луцький міськрайонний суд Волинської області", "2890417"],
        ["Прилуцький міськрайонний суд Чернігівської області", "26543620"],
        ["Дніпровський районний суд Дніпропетровської області", "2891233"],
        ["Південний районний суд міста Кам'янського Дніпропетровської області", "2890794"],
    ];

    for (const [input, publisherId] of cases) {
        it(`resolves "${input}"`, () => {
            expect(courtId(input)).toBe(publisherId);
        });
    }
});

describe("region qualifier forms", () => {
    const expected = "2886491";
    const inputs = [
        "Тростянецький районний суд Сумська область",
        "Тростянецький районний суд Сумської області",
        "Тростянецький районний суд Сумська обл.",
        "Тростянецький районний суд Сумської обл.",
        "Тростянецький районний суд Сумщина",
    ];

    for (const input of inputs.slice(0, 4)) {
        it(`resolves "${input}"`, () => {
            expect(courtId(input)).toBe(expected);
        });
    }

    it("does not resolve an unsupported region alias", () => {
        expect(findCourt(inputs[4])).toBeNull();
    });
});

describe("city qualifiers", () => {
    const kharkivCityCourt = "2894036";
    const inputs = [
        "Шевченківський районний суд м. Харків",
        "Шевченківський районний суд м.Харків",
        "Шевченківський районний суд міста Харків",
        "Шевченківський районний суд місто Харків",
    ];

    for (const input of inputs) {
        it(`resolves "${input}"`, () => {
            expect(courtId(input)).toBe(kharkivCityCourt);
        });
    }

    const cities: Array<[string, string]> = [
        ["Шевченківський районний суд м. Дніпро", "2891368"],
        ["Шевченківський районний суд м. Запоріжжя", "37408380"],
        ["Шевченківський районний суд м. Львів", "37444234"],
        ["Шевченківський районний суд м. Полтава", "2886195"],
        ["Шевченківський районний суд м. Чернівці", "2885586"],
        ["Шевченківський районний суд м. Київ", "02896710"],
        ["Дніпровський районний суд міста Києва", "02896696"],
        ["Подільський районний суд міста Києва", "02896727"],
        ["Дарницький районний суд міста Києва", "02896704"],
        ["Голосіївський районний суд міста Києва", "02896756"],
        ["Деснянський районний суд міста Києва", "02896779"],
        ["Оболонський районний суд міста Києва", "02896785"],
        ["Солом'янський районний суд міста Києва", "02896762"],
        ["Дніпровський районний суд м. Київ", "02896696"],
        ["Дніпровський районний суд м. Кам'янське", "2890802"],
        ["Південний районний суд м. Кам'янське", "2890794"],
        ["Заводський районний суд м. Миколаєва", "2892451"],
        ["Заводський районний суд м. Запоріжжя", "37408369"],
        ["Заводський районний суд м. Кам'янського", "2890771"],
        ["Деснянський районний суд м. Київ", "02896779"],
        ["Деснянський районний суд м. Чернігів", "2894483"],
    ];

    for (const [input, publisherId] of cities) {
        it(`resolves "${input}"`, () => {
            expect(courtId(input)).toBe(publisherId);
        });
    }
});

describe("city and region are distinct", () => {
    it("resolves the Kharkiv oblast court by region", () => {
        expect(courtId("Харківський районний суд Харківської області")).toBe("2894007");
    });

    it("does not use the Kharkiv oblast court for Kharkiv city", () => {
        expect(findCourt("Харківський районний суд м. Харків")).toBeNull();
    });

    it("does not use a Kyiv city court for Kyiv oblast", () => {
        expect(findCourt("Шевченківський районний суд Київської області")).toBeNull();
    });

    it("resolves the Kyiv city court by city", () => {
        expect(courtId("Шевченківський районний суд м. Київ")).toBe("02896710");
    });

    it("resolves the Chernihiv city court by city", () => {
        expect(courtId("Деснянський районний суд м. Чернігів")).toBe("2894483");
    });

    it("resolves the Chernihiv oblast court by region", () => {
        expect(courtId("Деснянський районний суд Чернігівської області")).toBe("2894483");
    });
});

describe("mismatched location", () => {
    it("returns null when the region does not contain the court", () => {
        expect(findCourt("Тростянецький районний суд Харківської області")).toBeNull();
    });

    it("returns null when the city does not contain the court", () => {
        expect(findCourt("Тростянецький районний суд м. Харків")).toBeNull();
    });
});

describe("getCourtEmail", () => {
    it("returns the email of a resolved court", () => {
        expect(getCourtEmail("Тростянецький районний суд Сумської області")).toBe(
            "inbox@tr.su.court.gov.ua",
        );
    });

    it("returns null for an ambiguous court", () => {
        expect(getCourtEmail("Тростянецький районний суд")).toBeNull();
    });

    it("returns null for an unknown court", () => {
        expect(getCourtEmail("Невідомий районний суд")).toBeNull();
    });

    it("returns null for empty input", () => {
        expect(getCourtEmail(null)).toBeNull();
    });
});
