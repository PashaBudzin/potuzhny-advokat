export function includeSkills(prompt: string, includedSkills: string[]) {
  return `
    --- SKILLS SECTOION
    
    --- END SKILLS SECTOION
    ${prompt}
    `;
}
