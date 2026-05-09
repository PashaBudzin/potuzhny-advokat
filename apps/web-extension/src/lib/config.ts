const appUrl =
    process.env.NODE_ENV === "production"
        ? "https://potuzhny-advokat.vercel.app"
        : "http://localhost:3000";

export { appUrl };
